import { google, calendar_v3 } from "googleapis";
import type { WorkLocation } from "../types";

const LOCATION_LABELS: Record<WorkLocation, string> = {
  office: "出社",
  remote: "在宅ワーク",
  off: "休み",
  undecided: "未定",
};

const LOCATION_COLORS: Record<WorkLocation, string> = {
  office: "9",    // blueberry
  remote: "10",   // basil (green)
  off: "8",       // graphite
  undecided: "5", // banana (yellow)
};

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定です");
  }

  return new google.auth.OAuth2(clientId, clientSecret);
}

function getCalendar(accessToken: string): calendar_v3.Calendar {
  const auth = getAuth();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || "primary";
}

export interface ScheduleEvent {
  date: string;
  location: WorkLocation;
  note: string;
}

export async function syncScheduleToCalendar(
  accessToken: string,
  events: ScheduleEvent[],
  weekStart: string
) {
  const calendar = getCalendar(accessToken);
  const calendarId = getCalendarId();

  const workEvents = events.filter(
    (e) => e.location === "office" || e.location === "remote"
  );

  const existingEvents = await calendar.events.list({
    calendarId,
    timeMin: `${weekStart}T00:00:00+09:00`,
    timeMax: `${events[events.length - 1].date}T23:59:59+09:00`,
    q: "[勤務予定]",
    singleEvents: true,
  });

  const deletePromises = (existingEvents.data.items || []).map((event) =>
    calendar.events.delete({ calendarId, eventId: event.id! }).catch(() => {})
  );
  await Promise.all(deletePromises);

  const createPromises = workEvents.map((event) => {
    const label = LOCATION_LABELS[event.location];
    const colorId = LOCATION_COLORS[event.location];
    const description = event.note
      ? `${event.note}\n\n[勤務予定] Staff Manager から自動登録`
      : "[勤務予定] Staff Manager から自動登録";

    return calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `[勤務予定] ${label}`,
        description,
        start: { date: event.date },
        end: { date: event.date },
        colorId,
        transparency: "transparent",
      },
    });
  });

  const results = await Promise.all(createPromises);
  return results.map((r) => r.data);
}

export async function getCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
) {
  const calendar = getCalendar(accessToken);
  const calendarId = getCalendarId();

  const response = await calendar.events.list({
    calendarId,
    timeMin: `${timeMin}T00:00:00+09:00`,
    timeMax: `${timeMax}T23:59:59+09:00`,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 100,
  });

  return response.data.items || [];
}
