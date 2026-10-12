"""
ASGI WebSocket bridge and thread-safe InMemoryChannelLayer for Django's WSGI runserver.

Allows standard `python manage.py runserver` (ThreadedWSGIServer) to transparently
accept and serve ASGI WebSocket connections (via wsproto + config.asgi.application)
on the same port (8000) and process as HTTP requests.
"""

import asyncio
import logging
import socket
import threading
from typing import Any
from urllib.parse import unquote, urlsplit

from channels.layers import InMemoryChannelLayer
from wsproto import ConnectionType, WSConnection
from wsproto.events import (
    AcceptConnection,
    BytesMessage,
    CloseConnection,
    Ping,
    Request,
    TextMessage,
)

logger = logging.getLogger(__name__)

_shared_loop: asyncio.AbstractEventLoop | None = None
_loop_lock = threading.Lock()
_bridge_installed = False


def get_shared_asgi_loop() -> asyncio.AbstractEventLoop:
    """
    Returns a singleton background asyncio event loop shared across all WebSocket
    connections and InMemoryChannelLayer operations within the process.
    """
    global _shared_loop
    with _loop_lock:
        if _shared_loop is None or _shared_loop.is_closed():
            loop = asyncio.new_event_loop()
            thread = threading.Thread(
                target=loop.run_forever,
                name="schoolpro-asgi-ws-loop",
                daemon=True,
            )
            thread.start()
            _shared_loop = loop
        return _shared_loop


class ThreadSafeInMemoryChannelLayer(InMemoryChannelLayer):
    """
    InMemoryChannelLayer subclass that routes all queue/group operations onto
    the shared background asyncio loop when called from a different thread/loop
    (e.g. via async_to_sync inside a synchronous HTTP view thread).
    """

    async def _run_on_shared_loop(self, coro: Any) -> Any:
        shared_loop = get_shared_asgi_loop()
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            current_loop = None

        if current_loop is shared_loop:
            return await coro

        future = asyncio.run_coroutine_threadsafe(coro, shared_loop)
        return await asyncio.wrap_future(future)

    async def send(self, channel: str, message: dict[str, Any]) -> None:
        await self._run_on_shared_loop(super().send(channel, message))

    async def receive(self, channel: str) -> dict[str, Any]:
        return await self._run_on_shared_loop(super().receive(channel))

    async def group_add(self, group: str, channel: str) -> None:
        await self._run_on_shared_loop(super().group_add(group, channel))

    async def group_discard(self, group: str, channel: str) -> None:
        await self._run_on_shared_loop(super().group_discard(group, channel))

    async def group_send(self, group: str, message: dict[str, Any]) -> None:
        await self._run_on_shared_loop(super().group_send(group, message))


async def _serve_websocket_over_socket(
    sock: socket.socket,
    raw_http_request: bytes,
    client_address: tuple[str, int],
    server_address: tuple[str, int],
) -> None:
    """
    Bridges a raw client TCP socket with `config.asgi.application` using wsproto.
    """
    from config.asgi import application as asgi_app

    ws = WSConnection(ConnectionType.SERVER)
    ws.receive_data(raw_http_request)

    ws_request: Request | None = None
    for event in ws.events():
        if isinstance(event, Request):
            ws_request = event
            break

    if ws_request is None:
        return

    parsed_url = urlsplit(ws_request.target)
    raw_path = parsed_url.path.encode("ascii", errors="ignore")
    path = unquote(parsed_url.path)
    query_string = parsed_url.query.encode("ascii", errors="ignore")

    headers: list[tuple[bytes, bytes]] = [
        (b"host", ws_request.host.encode("latin-1", errors="ignore")),
    ]
    for name, value in ws_request.extra_headers:
        headers.append((name.lower(), value))

    scope: dict[str, Any] = {
        "type": "websocket",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "scheme": "ws",
        "path": path,
        "raw_path": raw_path,
        "query_string": query_string,
        "root_path": "",
        "headers": headers,
        "client": [str(client_address[0]), int(client_address[1])],
        "server": [str(server_address[0]), int(server_address[1])],
        "subprotocols": list(ws_request.subprotocols),
        "state": {},
    }

    receive_queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    await receive_queue.put({"type": "websocket.connect"})

    closed = False
    loop = asyncio.get_running_loop()

    def _send_raw_bytes(data: bytes) -> None:
        if not data:
            return
        try:
            sock.sendall(data)
        except OSError:
            pass

    async def asgi_receive() -> dict[str, Any]:
        return await receive_queue.get()

    async def asgi_send(message: dict[str, Any]) -> None:
        nonlocal closed
        msg_type = message.get("type")

        if msg_type == "websocket.accept":
            subprotocol = message.get("subprotocol")
            extra_headers = list(message.get("headers") or [])
            out_bytes = ws.send(
                AcceptConnection(subprotocol=subprotocol, extra_headers=extra_headers)
            )
            await loop.run_in_executor(None, _send_raw_bytes, out_bytes)

        elif msg_type == "websocket.send":
            text_data = message.get("text")
            bytes_data = message.get("bytes")
            if text_data is not None:
                out_bytes = ws.send(TextMessage(data=text_data))
                await loop.run_in_executor(None, _send_raw_bytes, out_bytes)
            elif bytes_data is not None:
                out_bytes = ws.send(BytesMessage(data=bytes_data))
                await loop.run_in_executor(None, _send_raw_bytes, out_bytes)

        elif msg_type == "websocket.close":
            if not closed:
                closed = True
                code = int(message.get("code") or 1000)
                reason = str(message.get("reason") or "")
                try:
                    out_bytes = ws.send(CloseConnection(code=code, reason=reason))
                    await loop.run_in_executor(None, _send_raw_bytes, out_bytes)
                except Exception:
                    pass

    async def socket_reader() -> None:
        nonlocal closed
        try:
            while not closed:
                chunk = await loop.run_in_executor(None, sock.recv, 65536)
                if not chunk:
                    closed = True
                    await receive_queue.put({"type": "websocket.disconnect", "code": 1005})
                    break

                ws.receive_data(chunk)
                for event in ws.events():
                    if isinstance(event, TextMessage):
                        await receive_queue.put({"type": "websocket.receive", "text": event.data})
                    elif isinstance(event, BytesMessage):
                        await receive_queue.put(
                            {"type": "websocket.receive", "bytes": bytes(event.data)}
                        )
                    elif isinstance(event, Ping):
                        pong_bytes = ws.send(event.response())
                        await loop.run_in_executor(None, _send_raw_bytes, pong_bytes)
                    elif isinstance(event, CloseConnection):
                        closed = True
                        try:
                            close_bytes = ws.send(event.response())
                            await loop.run_in_executor(None, _send_raw_bytes, close_bytes)
                        except Exception:
                            pass
                        await receive_queue.put(
                            {"type": "websocket.disconnect", "code": event.code or 1000}
                        )
                        return
        except OSError:
            if not closed:
                closed = True
                await receive_queue.put({"type": "websocket.disconnect", "code": 1006})

    reader_task = asyncio.create_task(socket_reader())
    try:
        await asgi_app(scope, asgi_receive, asgi_send)
    except Exception as exc:
        logger.debug("ASGI WebSocket session ended: %s", exc)
    finally:
        closed = True
        reader_task.cancel()
        try:
            await reader_task
        except (asyncio.CancelledError, Exception):
            pass


def install_wsgi_websocket_bridge() -> None:
    """
    Patches Django's `WSGIRequestHandler.handle_one_request` so that incoming
    `Upgrade: websocket` requests on `python manage.py runserver` are bridged to
    `config.asgi.application`.
    """
    global _bridge_installed
    if _bridge_installed:
        return

    from django.core.servers.basehttp import WSGIRequestHandler

    def patched_handle_one_request(self: WSGIRequestHandler) -> None:
        self.raw_requestline = self.rfile.readline(65537)
        if len(self.raw_requestline) > 65536:
            self.requestline = ""
            self.request_version = ""
            self.command = ""
            self.send_error(414)
            return

        if not self.parse_request():
            return

        upgrade_header = (self.headers.get("Upgrade") or "").strip().lower()
        if upgrade_header == "websocket":
            self.close_connection = True
            header_lines = "".join(f"{k}: {v}\r\n" for k, v in self.headers.items())
            raw_http = (
                f"{self.command} {self.path} {self.request_version}\r\n{header_lines}\r\n"
            ).encode("latin-1", errors="ignore")

            server_addr = getattr(self.server, "server_address", ("127.0.0.1", 8000))
            client_addr = getattr(self, "client_address", ("127.0.0.1", 0))

            loop = get_shared_asgi_loop()
            future = asyncio.run_coroutine_threadsafe(
                _serve_websocket_over_socket(
                    sock=self.connection,
                    raw_http_request=raw_http,
                    client_address=(str(client_addr[0]), int(client_addr[1])),
                    server_address=(str(server_addr[0]), int(server_addr[1])),
                ),
                loop,
            )
            try:
                future.result()
            except Exception as exc:
                logger.debug("WebSocket bridge connection closed: %s", exc)
            return

        from django.core.servers.basehttp import ServerHandler

        handler = ServerHandler(self.rfile, self.wfile, self.get_stderr(), self.get_environ())
        handler.request_handler = self  # type: ignore[attr-defined]
        handler.run(self.server.get_app())

    WSGIRequestHandler.handle_one_request = patched_handle_one_request  # type: ignore[method-assign]
    _bridge_installed = True
