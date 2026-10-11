import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLeaveRequestRealtime } from "@/modules/students/features/leave-requests/hooks/useLeaveRequestRealtime";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type { LeaveRequestRealtimePayload } from "@/modules/students/features/leave-requests/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue || key,
  }),
}));

describe("useLeaveRequestRealtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("triggers initial sync check and invokes onSyncChange when syncVersion changes", async () => {
    const getSnapshotSpy = vi
      .spyOn(leaveRequestsService, "getRealtimeSyncSnapshot")
      .mockResolvedValueOnce({
        syncVersion: "v1",
        lastUpdatedAt: "2026-10-12 08:00:00",
        autoApprovedNowCount: 0,
        counts: {
          total: 2,
          pendingCount: 1,
          approvedCount: 1,
          rejectedCount: 0,
          cancelledCount: 0,
          eventLogsCount: 4,
        },
        serverTime: "2026-10-12 08:00:00",
      })
      .mockResolvedValueOnce({
        syncVersion: "v2",
        lastUpdatedAt: "2026-10-12 08:01:00",
        autoApprovedNowCount: 1,
        counts: {
          total: 2,
          pendingCount: 0,
          approvedCount: 2,
          rejectedCount: 0,
          cancelledCount: 0,
          eventLogsCount: 6,
        },
        serverTime: "2026-10-12 08:01:00",
      });

    const onSyncChange = vi.fn();

    const { result } = renderHook(() =>
      useLeaveRequestRealtime({
        enabled: true,
        pollIntervalMs: 0,
        showToastOnExternalUpdate: false,
        onSyncChange,
      }),
    );

    await waitFor(() => {
      expect(getSnapshotSpy).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.triggerSyncCheck();
    });

    expect(getSnapshotSpy).toHaveBeenCalledTimes(2);
    expect(onSyncChange).toHaveBeenCalledTimes(1);
    expect(onSyncChange).toHaveBeenCalledWith(
      expect.objectContaining({
        syncVersion: "v2",
        autoApprovedNowCount: 1,
      }),
    );
  });

  it("receives local realtime events emitted via leaveRequestsService.emitLocalRealtimeEvent", async () => {
    vi.spyOn(leaveRequestsService, "getRealtimeSyncSnapshot").mockResolvedValue(
      null,
    );

    const onEvent = vi.fn();

    renderHook(() =>
      useLeaveRequestRealtime({
        leaveRequestId: "leave-123",
        enabled: true,
        pollIntervalMs: 0,
        showToastOnExternalUpdate: false,
        onEvent,
      }),
    );

    const payload: LeaveRequestRealtimePayload = {
      eventType: "LEAVE_REQUEST_REVIEWED",
      leaveRequestId: "leave-123",
      code: "123456789012",
      status: "approved",
      timestamp: "2026-10-12T08:05:00Z",
    };

    act(() => {
      leaveRequestsService.emitLocalRealtimeEvent(payload);
    });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "LEAVE_REQUEST_REVIEWED",
        leaveRequestId: "leave-123",
        status: "approved",
      }),
    );
  });
});
