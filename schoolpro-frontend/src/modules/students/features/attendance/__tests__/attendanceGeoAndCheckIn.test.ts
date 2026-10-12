import { describe, expect, it } from "vitest";
import { attendanceService } from "@/modules/students/features/attendance/services/attendanceService";
import {
  calculateHaversineDistanceMeters,
  computeRemainingSeconds,
  formatCountdownMmSs,
  generateSessionQrSvgDataUrl,
  generateSixDigitPin,
  getPresetStudentCoordinates,
} from "@/modules/students/features/attendance/utils";

describe("Attendance Geo Anti-Cheat, 6-Digit PIN, QR & Expiration Logic", () => {
  it("generates strictly 6-digit numeric PIN codes", () => {
    for (let i = 0; i < 20; i += 1) {
      const pin = generateSixDigitPin();
      expect(pin).toMatch(/^\d{6}$/);
    }
  });

  it("calculates exact Haversine distance in meters between teacher and student coordinates", () => {
    const teacherLat = 10.779785;
    const teacherLng = 106.693182;

    // Identical coordinates -> 0m
    expect(
      calculateHaversineDistanceMeters(
        teacherLat,
        teacherLng,
        teacherLat,
        teacherLng,
      ),
    ).toBe(0);

    // In-classroom preset (~8.5m away) -> <= 50m radius
    const inClass = getPresetStudentCoordinates(
      teacherLat,
      teacherLng,
      50,
      "in_classroom",
    );
    const distInClass = calculateHaversineDistanceMeters(
      inClass.latitude,
      inClass.longitude,
      teacherLat,
      teacherLng,
    );
    expect(distInClass).toBeGreaterThan(5);
    expect(distInClass).toBeLessThanOrEqual(50);

    // Outside-school preset (~245m away) -> > 50m radius
    const outSchool = getPresetStudentCoordinates(
      teacherLat,
      teacherLng,
      50,
      "outside_school",
    );
    const distOut = calculateHaversineDistanceMeters(
      outSchool.latitude,
      outSchool.longitude,
      teacherLat,
      teacherLng,
    );
    expect(distOut).toBeGreaterThan(200);
  });

  it("formats countdown seconds and generates valid SVG QR data URL with embedded token", () => {
    expect(formatCountdownMmSs(300)).toBe("05:00");
    expect(formatCountdownMmSs(59)).toBe("00:59");
    expect(computeRemainingSeconds(null, 0)).toBe(0);

    const qrDataUrl = generateSessionQrSvgDataUrl(
      "SP_ATT_MATH11_849201",
      "849201",
      "MATH11",
    );
    expect(qrDataUrl.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(qrDataUrl)).toContain(
      'data-qr-token="SP_ATT_MATH11_849201"',
    );
  });

  it("rejects check-in when student GPS coordinates are outside teacher allowedRadiusMeters", async () => {
    // Open a fresh teacher session with 50m radius
    const opened = await attendanceService.openOrUpdateTeacherSession({
      recordId: "att-today-01",
      date: "2026-09-29",
      pinCode: "849201",
      allowedRadiusMeters: 50,
      durationSeconds: 300,
      teacherLatitude: 10.779785,
      teacherLongitude: 106.693182,
    });

    const farCoords = getPresetStudentCoordinates(
      opened.teacherLatitude,
      opened.teacherLongitude,
      opened.allowedRadiusMeters,
      "outside_school",
    );

    const res = await attendanceService.submitCheckIn({
      recordId: opened.id,
      method: "code",
      code: "849201",
      latitude: farCoords.latitude,
      longitude: farCoords.longitude,
    });

    expect(res.success).toBe(false);
    expect(res.distanceMeters).toBeGreaterThan(50);
  });

  it("accepts 6-digit PIN check-in when student is inside allowedRadiusMeters and session is active", async () => {
    const opened = await attendanceService.openOrUpdateTeacherSession({
      recordId: "att-today-02",
      date: "2026-09-29",
      pinCode: "652194",
      allowedRadiusMeters: 50,
      durationSeconds: 300,
      teacherLatitude: 10.77992,
      teacherLongitude: 106.69341,
    });

    const nearCoords = getPresetStudentCoordinates(
      opened.teacherLatitude,
      opened.teacherLongitude,
      opened.allowedRadiusMeters,
      "in_classroom",
    );

    const res = await attendanceService.submitCheckIn({
      recordId: opened.id,
      method: "code",
      code: "652194",
      latitude: nearCoords.latitude,
      longitude: nearCoords.longitude,
    });

    expect(res.success).toBe(true);
    expect(res.record?.status).toBe("present");
    expect(res.record?.isWithinRadius).toBe(true);
    expect(res.record?.studentLatitude).toBeCloseTo(nearCoords.latitude, 5);
    expect(res.record?.studentLongitude).toBeCloseTo(nearCoords.longitude, 5);
  });

  it("rejects check-in immediately once session is expired", async () => {
    const opened = await attendanceService.openOrUpdateTeacherSession({
      recordId: "att-today-01",
      date: "2026-09-29",
      pinCode: "123456",
      allowedRadiusMeters: 50,
      durationSeconds: 300,
      teacherLatitude: 10.779785,
      teacherLongitude: 106.693182,
    });

    await attendanceService.expireSessionNow(opened.id, "2026-09-29");

    const nearCoords = getPresetStudentCoordinates(
      opened.teacherLatitude,
      opened.teacherLongitude,
      opened.allowedRadiusMeters,
      "in_classroom",
    );

    const res = await attendanceService.submitCheckIn({
      recordId: opened.id,
      method: "qr_scan",
      qrData: opened.qrToken,
      latitude: nearCoords.latitude,
      longitude: nearCoords.longitude,
    });

    expect(res.success).toBe(false);
  });
});
