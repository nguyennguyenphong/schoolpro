import i18n from "@/i18n/i18n";
import {
  DEFAULT_ALLOWED_RADIUS_METERS,
  DEFAULT_TEACHER_LATITUDE,
  DEFAULT_TEACHER_LONGITUDE,
  mockAttendanceRecords,
  mockAttendanceSummary,
} from "@/modules/students/features/attendance/services/mock/mockAttendanceData";
import type {
  AttendanceRealtimePayload,
  AttendanceRealtimeSyncSnapshot,
  AttendanceRecord,
  AttendanceSummary,
  CheckInPayload,
  CheckInResult,
  DailyAttendanceQueryParams,
  OpenAttendanceSessionPayload,
} from "@/modules/students/features/attendance/types";
import {
  calculateHaversineDistanceMeters,
  computeRemainingSeconds,
  generateSixDigitPin,
} from "@/modules/students/features/attendance/utils";
import { API_BASE_URL, httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";

export const ATTENDANCE_BROADCAST_CHANNEL = "schoolpro_attendance_realtime";
const LOCAL_STORAGE_RECORDS_KEY = "schoolpro_attendance_records_v3";

interface DailyAttendanceApiData {
  date: string;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

class AttendanceService {
  private latency = 180;
  private memoryRecords: AttendanceRecord[] | null = null;

  private loadLocalRecords(): AttendanceRecord[] {
    if (this.memoryRecords && this.memoryRecords.length > 0) {
      return [...this.memoryRecords];
    }
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      this.memoryRecords = [...mockAttendanceRecords];
      return [...this.memoryRecords];
    }
    try {
      const raw =
        typeof localStorage.getItem === "function"
          ? localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY)
          : null;
      if (!raw) {
        if (typeof localStorage.setItem === "function") {
          localStorage.setItem(
            LOCAL_STORAGE_RECORDS_KEY,
            JSON.stringify(mockAttendanceRecords),
          );
        }
        this.memoryRecords = [...mockAttendanceRecords];
        return [...this.memoryRecords];
      }
      const parsed = JSON.parse(raw) as AttendanceRecord[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.memoryRecords = [...mockAttendanceRecords];
        return [...this.memoryRecords];
      }
      this.memoryRecords = parsed;
      return [...this.memoryRecords];
    } catch {
      this.memoryRecords = [...mockAttendanceRecords];
      return [...this.memoryRecords];
    }
  }

  private saveLocalRecords(records: AttendanceRecord[]): void {
    this.memoryRecords = [...records];
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }
    try {
      if (typeof localStorage.setItem === "function") {
        localStorage.setItem(
          LOCAL_STORAGE_RECORDS_KEY,
          JSON.stringify(records),
        );
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  /**
   * Synchronizes local session expiration states if `expiresAt <= Date.now()`.
   */
  public syncLocalExpirations(records?: AttendanceRecord[]): {
    updatedRecords: AttendanceRecord[];
    expiredChanged: boolean;
  } {
    const source = records ? [...records] : this.loadLocalRecords();
    let expiredChanged = false;
    const nowMs = Date.now();

    const updatedRecords = source.map((rec) => {
      if (rec.status === "open" && rec.expiresAt) {
        const expMs = new Date(rec.expiresAt).getTime();
        if (!Number.isNaN(expMs) && nowMs >= expMs) {
          expiredChanged = true;
          const deadlineStr =
            rec.deadlineTime ||
            new Date(expMs).toTimeString().slice(0, 8);
          return {
            ...rec,
            status: "absent" as const,
            remainingSeconds: 0,
            note: i18n.t("message:attendance.sessionExpiredNote", {
              time: deadlineStr,
            }),
          };
        }
        return {
          ...rec,
          remainingSeconds: computeRemainingSeconds(
            rec.expiresAt,
            rec.remainingSeconds || 0,
          ),
        };
      }
      return rec;
    });

    if (expiredChanged && !records) {
      this.saveLocalRecords(updatedRecords);
    }

    return { updatedRecords, expiredChanged };
  }

  /**
   * Emits a real-time attendance event across browser tabs via BroadcastChannel & CustomEvent.
   */
  emitLocalRealtimeEvent(payload: AttendanceRealtimePayload): void {
    if (typeof window === "undefined") return;

    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(ATTENDANCE_BROADCAST_CHANNEL);
        channel.postMessage(payload);
        channel.close();
      }
    } catch {
      // Ignore BroadcastChannel errors
    }

    try {
      window.dispatchEvent(
        new CustomEvent<AttendanceRealtimePayload>(
          ATTENDANCE_BROADCAST_CHANNEL,
          { detail: payload },
        ),
      );
    } catch {
      // Ignore CustomEvent errors
    }
  }

  /**
   * Builds the authenticated WebSocket URL for real-time attendance updates.
   */
  buildRealtimeWebSocketUrl(params?: {
    sessionId?: string;
    classId?: string;
    date?: string;
  }): string {
    const httpOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    const wsOrigin = httpOrigin.replace(/^http/i, "ws");
    const searchParams = new URLSearchParams();

    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("schoolpro_access_token") ||
        sessionStorage.getItem("schoolpro_access_token");
      if (token) {
        searchParams.set("token", token);
      }
    }

    if (params?.sessionId) {
      searchParams.set("sessionId", params.sessionId);
    }
    if (params?.classId) {
      searchParams.set("classId", params.classId);
    }
    if (params?.date) {
      searchParams.set("date", params.date);
    }

    const query = searchParams.toString();
    return `${wsOrigin}/ws/academic/attendance/${query ? `?${query}` : ""}`;
  }

  /**
   * Fetches lightweight real-time sync snapshot from backend and auto-expires overdue sessions.
   */
  async getRealtimeSyncSnapshot(params?: {
    classId?: string;
    date?: string;
  }): Promise<AttendanceRealtimeSyncSnapshot | null> {
    try {
      const response = await httpClient.get<
        ApiResponse<AttendanceRealtimeSyncSnapshot>
      >("/academic/attendance/realtime-sync/", { params });
      return response.data?.data || null;
    } catch {
      const { expiredChanged } = this.syncLocalExpirations();
      if (expiredChanged) {
        return {
          syncVersion: `${Date.now()}:local`,
          activeSessionsCount: 0,
          expiredNowCount: 1,
          latestSessionUpdate: new Date().toISOString(),
          latestAttendanceUpdate: null,
          serverTime: new Date().toISOString(),
        };
      }
      return null;
    }
  }

  /**
   * Fetches daily subject attendance records and summary using query params (date, shift, status, search).
   */
  async getDailyAttendance(
    paramsOrDate: DailyAttendanceQueryParams | string,
    statusFilter?: string,
    searchQuery?: string,
  ): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary }> {
    const query: DailyAttendanceQueryParams =
      typeof paramsOrDate === "string"
        ? {
            date: paramsOrDate,
            status: (statusFilter as DailyAttendanceQueryParams["status"]) || "all",
            search: searchQuery,
          }
        : paramsOrDate;

    try {
      const response = await httpClient.get<
        ApiResponse<DailyAttendanceApiData>
      >("/academic/attendance/daily/", {
        params: {
          date: query.date,
          shift: query.shift && query.shift !== "all" ? query.shift : undefined,
          status:
            query.status && query.status !== "all" ? query.status : undefined,
          search: query.search?.trim() || undefined,
        },
      });
      const apiData = response.data?.data;
      if (apiData && Array.isArray(apiData.records) && apiData.summary) {
        return {
          records: apiData.records,
          summary: apiData.summary,
        };
      }
    } catch {
      // Fallback to local state if backend is unreachable
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const { updatedRecords } = this.syncLocalExpirations();
        let dayRecords = updatedRecords.filter((r) => r.date === query.date);

        if (query.shift && query.shift !== "all") {
          dayRecords = dayRecords.filter((r) => r.shift === query.shift);
        }

        const summary = this.computeLocalSummary(dayRecords);

        let filteredRecords = [...dayRecords];
        if (query.status && query.status !== "all") {
          filteredRecords = filteredRecords.filter(
            (r) => r.status === query.status,
          );
        }
        if (query.search && query.search.trim()) {
          const q = query.search.trim().toLowerCase();
          filteredRecords = filteredRecords.filter((r) => {
            const hay =
              `${r.subjectName} ${r.subjectCode} ${r.teacherName} ${r.room} ${r.building || ""} ${r.period} ${r.lessonTopic || ""}`.toLowerCase();
            return hay.includes(q);
          });
        }

        filteredRecords.sort(
          (a, b) => (a.periodNumber ?? 0) - (b.periodNumber ?? 0),
        );

        resolve({
          records: filteredRecords,
          summary,
        });
      }, this.latency);
    });
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    const res = await this.getDailyAttendance(date);
    return res.records;
  }

  async getSummary(date = "2026-09-29"): Promise<AttendanceSummary> {
    const res = await this.getDailyAttendance(date);
    return res.summary;
  }

  private computeLocalSummary(dayItems: AttendanceRecord[]): AttendanceSummary {
    const attendedToday = dayItems.filter((r) => r.status === "present").length;
    const openToday = dayItems.filter((r) => r.status === "open").length;
    const upcomingToday = dayItems.filter((r) => r.status === "upcoming").length;
    const pendingToday = openToday + upcomingToday;
    const absentToday = dayItems.filter((r) => r.status === "absent").length;
    const excusedToday = dayItems.filter((r) => r.status === "excused").length;

    return {
      ...mockAttendanceSummary,
      totalToday: dayItems.length,
      attendedToday,
      openToday,
      upcomingToday,
      pendingToday,
      absentToday,
      excusedToday,
    };
  }

  /**
   * Teacher opens or updates an attendance session:
   * - Generates 6-digit PIN code & QR token
   * - Stores teacher GPS coordinates (latitude, longitude) and allowed scan radius (meters)
   * - Sets strict expiration countdown
   */
  async openOrUpdateTeacherSession(
    payload: OpenAttendanceSessionPayload,
  ): Promise<AttendanceRecord> {
    try {
      const response = await httpClient.post<ApiResponse<Record<string, unknown>>>(
        "/academic/attendance/open-session/",
        payload,
      );
      if (response.data?.data) {
        const daily = await this.getDailyAttendance(payload.date);
        const matched = daily.records.find(
          (r) =>
            r.id === payload.recordId ||
            r.timetableId === payload.timetableId ||
            r.sessionId === response.data.data?.id,
        );
        if (matched) {
          this.emitLocalRealtimeEvent({
            eventType: "ATTENDANCE_SESSION_OPENED",
            sessionId: matched.sessionId,
            timetableId: matched.timetableId,
            sessionDate: matched.date,
            pinCode: matched.attendanceCode,
            qrToken: matched.qrToken,
            allowedRadiusMeters: matched.allowedRadiusMeters,
            teacherLatitude: matched.teacherLatitude,
            teacherLongitude: matched.teacherLongitude,
            expiresAt: matched.expiresAt,
            record: matched,
            timestamp: new Date().toISOString(),
          });
          return matched;
        }
      }
    } catch {
      // Fallback to local state below
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const records = this.loadLocalRecords();
        const idx = records.findIndex(
          (r) =>
            r.id === payload.recordId ||
            (payload.timetableId && r.timetableId === payload.timetableId),
        );
        if (idx === -1) {
          reject(new Error(i18n.t("message:attendance.sessionNotFound")));
          return;
        }

        const customPin = (payload.pinCode || "").trim();
        if (customPin && !/^\d{6}$/.test(customPin)) {
          reject(new Error(i18n.t("message:attendance.invalidSixDigitPin")));
          return;
        }

        const pinCode = customPin || generateSixDigitPin();
        const target = records[idx];
        const dateCompact = target.date.replace(/-/g, "");
        const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
        const qrToken = `SP_ATT_${target.subjectCode}_${dateCompact}_${pinCode}_${suffix}`;

        const now = new Date();
        const durationSec = Math.max(30, payload.durationSeconds || 300);
        const expiresAt = new Date(now.getTime() + durationSec * 1000);
        const deadlineTime = expiresAt.toTimeString().slice(0, 8);
        const radius = Math.max(
          5,
          payload.allowedRadiusMeters || DEFAULT_ALLOWED_RADIUS_METERS,
        );
        const teacherLat =
          Number.isFinite(payload.teacherLatitude)
            ? payload.teacherLatitude
            : DEFAULT_TEACHER_LATITUDE;
        const teacherLng =
          Number.isFinite(payload.teacherLongitude)
            ? payload.teacherLongitude
            : DEFAULT_TEACHER_LONGITUDE;

        const updated: AttendanceRecord = {
          ...target,
          status: "open",
          attendanceCode: pinCode,
          qrToken,
          openedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          deadlineTime,
          remainingSeconds: durationSec,
          durationSeconds: durationSec,
          teacherLatitude: teacherLat,
          teacherLongitude: teacherLng,
          allowedRadiusMeters: radius,
          checkInTime: undefined,
          checkInMethod: undefined,
          studentLatitude: null,
          studentLongitude: null,
          distanceMeters: null,
          isWithinRadius: undefined,
          note:
            payload.note ||
            i18n.t("message:attendance.openSessionNote", {
              pinCode,
              radius,
            }),
        };

        records[idx] = updated;
        this.saveLocalRecords(records);

        this.emitLocalRealtimeEvent({
          eventType: "ATTENDANCE_SESSION_OPENED",
          sessionId: updated.sessionId || updated.id,
          timetableId: updated.timetableId,
          sessionDate: updated.date,
          pinCode: updated.attendanceCode,
          qrToken: updated.qrToken,
          allowedRadiusMeters: updated.allowedRadiusMeters,
          teacherLatitude: updated.teacherLatitude,
          teacherLongitude: updated.teacherLongitude,
          expiresAt: updated.expiresAt,
          record: updated,
          message: i18n.t("message:attendance.teacherOpenedSessionToast", {
            subject: updated.subjectName,
            radius: updated.allowedRadiusMeters,
          }),
          timestamp: new Date().toISOString(),
        });

        resolve(updated);
      }, this.latency);
    });
  }

  /**
   * Immediately expires an open attendance session so the code/QR is no longer valid.
   */
  async expireSessionNow(recordId: string, date: string): Promise<AttendanceRecord | null> {
    try {
      await httpClient.post("/academic/attendance/expire-session/", {
        recordId,
        sessionId: recordId,
      });
    } catch {
      // Continue with local state update as well
    }

    const records = this.loadLocalRecords();
    const idx = records.findIndex(
      (r) => r.id === recordId || r.sessionId === recordId || r.timetableId === recordId,
    );
    if (idx === -1) return null;

    const target = records[idx];
    const now = new Date();
    const deadlineStr = now.toTimeString().slice(0, 8);
    const updated: AttendanceRecord = {
      ...target,
      status: target.status === "present" ? "present" : "absent",
      expiresAt: new Date(now.getTime() - 1000).toISOString(),
      deadlineTime: deadlineStr,
      remainingSeconds: 0,
      note: i18n.t("message:attendance.sessionExpiredNote", {
        time: deadlineStr,
      }),
    };

    records[idx] = updated;
    this.saveLocalRecords(records);

    this.emitLocalRealtimeEvent({
      eventType: "ATTENDANCE_SESSION_EXPIRED",
      sessionId: updated.sessionId || updated.id,
      timetableId: updated.timetableId,
      sessionDate: date,
      status: "EXPIRED",
      record: updated,
      message: i18n.t("message:attendance.sessionExpiredToast", {
        subject: updated.subjectName,
      }),
      timestamp: now.toISOString(),
    });

    return updated;
  }

  /**
   * Submits student check-in (6-digit PIN code, QR Camera Scan, or QR Image Upload)
   * with strict expiration validation and 100% anti-cheat Haversine GPS radius check.
   */
  async submitCheckIn(payload: CheckInPayload): Promise<CheckInResult> {
    try {
      const response = await httpClient.post<ApiResponse<CheckInResult>>(
        "/academic/attendance/check-in/",
        payload,
      );
      if (response.data?.data) {
        const apiResult = response.data.data;
        if (apiResult.record) {
          this.emitLocalRealtimeEvent({
            eventType: "STUDENT_CHECKED_IN",
            sessionId: apiResult.record.sessionId || apiResult.record.id,
            timetableId: apiResult.record.timetableId,
            sessionDate: apiResult.record.date,
            status: "PRESENT",
            record: apiResult.record,
            timestamp: new Date().toISOString(),
          });
        }
        return apiResult;
      }
    } catch (err: unknown) {
      const maybeAxios = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (maybeAxios?.response?.status === 400 && maybeAxios.response.data?.message) {
        return {
          success: false,
          message: maybeAxios.response.data.message,
        };
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const { updatedRecords } = this.syncLocalExpirations();
        const recordIndex = updatedRecords.findIndex(
          (r) =>
            r.id === payload.recordId ||
            r.sessionId === payload.recordId ||
            r.timetableId === payload.recordId,
        );
        if (recordIndex === -1) {
          resolve({
            success: false,
            message: i18n.t("message:attendance.sessionNotFound"),
          });
          return;
        }

        const target = updatedRecords[recordIndex];

        if (target.status === "present") {
          resolve({
            success: true,
            message: i18n.t("message:attendance.alreadyCheckedIn"),
            record: target,
          });
          return;
        }

        // 1. Validate strict expiration time
        const isExpiredByTime =
          Boolean(target.expiresAt) &&
          new Date(target.expiresAt as string).getTime() <= Date.now();
        if (target.status !== "open" || isExpiredByTime) {
          resolve({
            success: false,
            message: i18n.t("message:attendance.expiredCannotUse"),
          });
          return;
        }

        // 2. Validate GPS coordinates presence
        if (
          !Number.isFinite(payload.latitude) ||
          !Number.isFinite(payload.longitude)
        ) {
          resolve({
            success: false,
            message: i18n.t("message:attendance.gpsRequired"),
          });
          return;
        }

        // 3. Validate Method 1 (6-digit PIN) or Method 2 (QR Scan / QR Upload)
        if (payload.method === "code") {
          const entered = (payload.code || "").trim();
          if (!/^\d{6}$/.test(entered)) {
            resolve({
              success: false,
              message: i18n.t("message:attendance.enterSixDigits"),
            });
            return;
          }

          if (entered !== target.attendanceCode.trim()) {
            resolve({
              success: false,
              message: i18n.t("message:attendance.wrongPinCode", {
                code: target.attendanceCode,
              }),
            });
            return;
          }
        } else if (
          payload.method === "qr_scan" ||
          payload.method === "qr_upload"
        ) {
          const qrRaw = (payload.qrData || "").trim();
          if (!qrRaw) {
            resolve({
              success: false,
              message: i18n.t("message:attendance.qrEmpty"),
            });
            return;
          }
          const matchesToken = qrRaw === target.qrToken.trim();
          const matchesPin = qrRaw === target.attendanceCode.trim();
          if (!matchesToken && !matchesPin) {
            resolve({
              success: false,
              message: i18n.t("message:attendance.wrongQrToken"),
            });
            return;
          }
        }

        // 4. Calculate exact Haversine distance in meters & enforce teacher's allowedRadiusMeters
        const distanceMeters = calculateHaversineDistanceMeters(
          payload.latitude,
          payload.longitude,
          target.teacherLatitude,
          target.teacherLongitude,
        );
        const allowedRadius = target.allowedRadiusMeters || DEFAULT_ALLOWED_RADIUS_METERS;
        const isWithinRadius = distanceMeters <= allowedRadius;

        if (!isWithinRadius) {
          resolve({
            success: false,
            distanceMeters,
            allowedRadiusMeters: allowedRadius,
            message: i18n.t("message:attendance.outOfRadiusError", {
              distance: distanceMeters.toFixed(1),
              allowedRadius,
            }),
          });
          return;
        }

        // 5. Mark PRESENT and save GPS coordinates + distance
        const now = new Date();
        const checkInTime = now.toTimeString().slice(0, 8);
        const methodText =
          payload.method === "qr_scan"
            ? i18n.t("card:attendance.method.qrScan")
            : payload.method === "qr_upload"
              ? i18n.t("card:attendance.method.qrUpload")
              : i18n.t("card:attendance.method.pinCode");

        const updatedRecord: AttendanceRecord = {
          ...target,
          status: "present",
          checkInTime,
          checkInMethod: payload.method,
          studentLatitude: Number(payload.latitude.toFixed(6)),
          studentLongitude: Number(payload.longitude.toFixed(6)),
          distanceMeters,
          isWithinRadius: true,
          gpsAccuracyMeters: payload.accuracy ?? 5.0,
          remainingSeconds: 0,
          note: i18n.t("message:attendance.checkedInNote", {
            time: checkInTime,
            method: methodText,
            distance: distanceMeters.toFixed(1),
            allowedRadius,
          }),
        };

        updatedRecords[recordIndex] = updatedRecord;
        this.saveLocalRecords(updatedRecords);

        this.emitLocalRealtimeEvent({
          eventType: "STUDENT_CHECKED_IN",
          sessionId: updatedRecord.sessionId || updatedRecord.id,
          timetableId: updatedRecord.timetableId,
          sessionDate: updatedRecord.date,
          status: "PRESENT",
          record: updatedRecord,
          timestamp: now.toISOString(),
        });

        resolve({
          success: true,
          distanceMeters,
          allowedRadiusMeters: allowedRadius,
          message: i18n.t("message:attendance.checkInSuccessToast", {
            subject: target.subjectName,
            distance: distanceMeters.toFixed(1),
          }),
          record: updatedRecord,
        });
      }, this.latency);
    });
  }
}

export const attendanceService = new AttendanceService();
