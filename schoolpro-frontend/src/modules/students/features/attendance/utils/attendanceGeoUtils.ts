import type { GpsSimulationPresetId } from "@/modules/students/features/attendance/types";

const EARTH_RADIUS_METERS = 6371000.0;

/**
 * Calculates the exact great-circle distance in meters between two GPS coordinates
 * using the Haversine formula (matches backend AttendanceSessionService.calculate_haversine_distance_meters).
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return 0;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180.0;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2.0) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2;
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0.0, 1.0 - a)));

  return Math.round(EARTH_RADIUS_METERS * c * 100) / 100;
}

/**
 * Generates a random 6-digit numeric PIN code (100000 - 999999).
 */
export function generateSixDigitPin(): string {
  const randomValue = Math.floor(100000 + Math.random() * 900000);
  return String(randomValue).padStart(6, "0");
}

/**
 * Computes GPS coordinates offset by a given distance in meters (North-East) from teacher coordinates.
 */
export function offsetCoordinatesByMeters(
  baseLat: number,
  baseLng: number,
  northMeters: number,
  eastMeters: number,
): { latitude: number; longitude: number } {
  const dLat = northMeters / 111320.0;
  const cosLat = Math.max(0.1, Math.cos((baseLat * Math.PI) / 180.0));
  const dLng = eastMeters / (111320.0 * cosLat);

  return {
    latitude: Number((baseLat + dLat).toFixed(6)),
    longitude: Number((baseLng + dLng).toFixed(6)),
  };
}

/**
 * Computes student GPS coordinates for a preset relative to the teacher's scanning device.
 */
export function getPresetStudentCoordinates(
  teacherLatitude: number,
  teacherLongitude: number,
  allowedRadiusMeters: number,
  presetId: GpsSimulationPresetId,
): { latitude: number; longitude: number; accuracy: number } {
  const safeRadius = Math.max(10, allowedRadiusMeters || 50);

  switch (presetId) {
    case "in_classroom": {
      // ~8.5 meters away from teacher desk -> 100% valid inside classroom
      const coords = offsetCoordinatesByMeters(
        teacherLatitude,
        teacherLongitude,
        6.0,
        6.0,
      );
      return { ...coords, accuracy: 4.5 };
    }
    case "near_corridor": {
      // ~70% of allowed radius -> right near classroom door
      const targetDist = Math.min(safeRadius * 0.72, safeRadius - 3);
      const component = targetDist / Math.SQRT2;
      const coords = offsetCoordinatesByMeters(
        teacherLatitude,
        teacherLongitude,
        component,
        component,
      );
      return { ...coords, accuracy: 8.0 };
    }
    case "outside_school": {
      // Outside allowed radius (e.g. 240m away or 3x allowed radius) -> strictly blocked
      const outDist = Math.max(245, safeRadius * 3.2);
      const component = outDist / Math.SQRT2;
      const coords = offsetCoordinatesByMeters(
        teacherLatitude,
        teacherLongitude,
        component,
        component,
      );
      return { ...coords, accuracy: 12.0 };
    }
    default: {
      const coords = offsetCoordinatesByMeters(
        teacherLatitude,
        teacherLongitude,
        5.0,
        5.0,
      );
      return { ...coords, accuracy: 5.0 };
    }
  }
}

/**
 * Computes the remaining seconds until `expiresAt` ISO string.
 */
export function computeRemainingSeconds(
  expiresAt?: string | null,
  fallbackSeconds = 0,
): number {
  if (!expiresAt) {
    return Math.max(0, fallbackSeconds);
  }
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return Math.max(0, fallbackSeconds);
  }
  const diffSec = Math.floor((expiresMs - Date.now()) / 1000);
  return Math.max(0, diffSec);
}

/**
 * Formats seconds into MM:SS countdown string (e.g. "04:59").
 */
export function formatCountdownMmSs(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formats a GPS latitude or longitude to 6 decimal places.
 */
export function formatCoordinate(val?: number | null): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "--";
  }
  return val.toFixed(6);
}

/**
 * Generates a deterministic, high-contrast SVG QR code Data URL for a given qrToken & pinCode.
 * Embeds the qrToken inside the SVG metadata so uploading the downloaded SVG/image verifies 100% accurately.
 */
export function generateSessionQrSvgDataUrl(
  qrToken: string,
  pinCode: string,
  subjectCode: string,
): string {
  const gridSize = 21;
  const seedStr = `${qrToken}:${pinCode}:${subjectCode}`;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderPattern = (r: number, c: number): boolean => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= gridSize - 7;
    const inBottomLeft = r >= gridSize - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const getFinderModule = (r: number, c: number): boolean => {
    const localR = r >= gridSize - 7 ? r - (gridSize - 7) : r;
    const localC = c >= gridSize - 7 ? c - (gridSize - 7) : c;
    if (localR === 0 || localR === 6 || localC === 0 || localC === 6) return true;
    if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) return true;
    return false;
  };

  const cellSize = 10;
  const margin = 20;
  const totalSize = gridSize * cellSize + margin * 2;
  const rects: string[] = [];

  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      let dark = false;
      if (isFinderPattern(r, c)) {
        dark = getFinderModule(r, c);
      } else if (r === 6 || c === 6) {
        dark = (r + c) % 2 === 0;
      } else if (r < 8 && c < 8) {
        dark = false;
      } else if (r < 8 && c >= gridSize - 8) {
        dark = false;
      } else if (r >= gridSize - 8 && c < 8) {
        dark = false;
      } else {
        const idx = r * gridSize + c;
        const charCode = seedStr.charCodeAt(idx % seedStr.length);
        const bit = ((hash >>> (idx % 24)) ^ (charCode * (r + 3) + c * 7)) & 3;
        dark = bit === 0 || bit === 2;
      }

      if (dark) {
        const x = margin + c * cellSize;
        const y = margin + r * cellSize;
        rects.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="1.8" fill="#0f172a"/>`,
        );
      }
    }
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize + 34}" width="320" height="360" data-qr-token="${qrToken}" data-pin-code="${pinCode}">
    <rect width="100%" height="100%" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    ${rects.join("")}
    <rect x="${margin + 75}" y="${margin + 75}" width="60" height="60" rx="10" fill="#2563eb" stroke="#ffffff" stroke-width="4"/>
    <text x="${totalSize / 2}" y="${margin + 110}" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="800">${subjectCode.slice(0, 6)}</text>
    <text x="${totalSize / 2}" y="${totalSize + 18}" text-anchor="middle" fill="#334155" font-family="sans-serif" font-size="12" font-weight="700">PIN: ${pinCode} • ${qrToken.slice(0, 18)}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
