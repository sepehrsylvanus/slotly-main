import {
  format,
  addMinutes,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
  addDays,
  parseISO,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface WorkingHours {
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isAvailable: boolean;
}

export interface BreakPeriodData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface TimeOffData {
  startDate: Date;
  endDate: Date;
}

export interface ExistingAppointment {
  startAt: Date;
  endAt: Date;
  status: string;
}

export interface AvailabilityConfig {
  date: Date; // The date to check in UTC
  timezone: string; // IANA timezone
  serviceDuration: number; // minutes
  bufferBefore: number; // minutes
  bufferAfter: number; // minutes
  slotInterval: number; // minutes
  minBookingNotice: number; // minutes
  maxAdvanceBookingDays: number;
  workingHours: WorkingHours[];
  breaks: BreakPeriodData[];
  timeOffs: TimeOffData[];
  existingAppointments: ExistingAppointment[];
}

export interface TimeSlot {
  start: Date; // UTC
  end: Date; // UTC
  displayTime: string; // formatted in business timezone
}

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getAvailableSlots(config: AvailabilityConfig): TimeSlot[] {
  const {
    date,
    timezone,
    serviceDuration,
    bufferBefore,
    bufferAfter,
    slotInterval,
    minBookingNotice,
    maxAdvanceBookingDays,
    workingHours,
    breaks,
    timeOffs,
    existingAppointments,
  } = config;

  const now = new Date();
  const totalSlotDuration = bufferBefore + serviceDuration + bufferAfter;

  const zonedDate = toZonedTime(date, timezone);
  const dayOfWeek = DAY_MAP[zonedDate.getDay()];

  const maxDate = addDays(now, maxAdvanceBookingDays);
  if (isAfter(date, maxDate)) {
    return [];
  }

  const daySchedule = workingHours.filter(
    (wh) => wh.dayOfWeek === dayOfWeek && wh.isAvailable,
  );

  if (daySchedule.length === 0) {
    return [];
  }

  const dayStart = startOfDay(zonedDate);
  const dayEnd = endOfDay(zonedDate);

  for (const to of timeOffs) {
    const toStart = toZonedTime(to.startDate, timezone);
    const toEnd = toZonedTime(to.endDate, timezone);

    if (
      areIntervalsOverlapping(
        { start: dayStart, end: dayEnd },
        { start: toStart, end: toEnd },
      )
    ) {
      return [];
    }
  }

  const dayBreaks = breaks.filter((b) => b.dayOfWeek === dayOfWeek);

  const activeAppointments = existingAppointments.filter(
    (a) => a.status !== "CANCELLED",
  );

  const slots: TimeSlot[] = [];

  for (const schedule of daySchedule) {
    const scheduleStartMin = parseTimeToMinutes(schedule.startTime);
    const scheduleEndMin = parseTimeToMinutes(schedule.endTime);

    for (
      let slotStart = scheduleStartMin;
      slotStart + totalSlotDuration <= scheduleEndMin;
      slotStart += slotInterval
    ) {
      const serviceStartMin = slotStart + bufferBefore;
      const serviceEndMin = serviceStartMin + serviceDuration;

      const slotStartDate = new Date(dayStart);
      slotStartDate.setHours(
        Math.floor(serviceStartMin / 60),
        serviceStartMin % 60,
        0,
        0,
      );

      const slotEndDate = new Date(dayStart);
      slotEndDate.setHours(
        Math.floor(serviceEndMin / 60),
        serviceEndMin % 60,
        0,
        0,
      );

      const bufferStartDate = new Date(dayStart);
      bufferStartDate.setHours(
        Math.floor(slotStart / 60),
        slotStart % 60,
        0,
        0,
      );

      const bufferEndDate = new Date(dayStart);
      const totalEndMin = slotStart + totalSlotDuration;

      bufferEndDate.setHours(
        Math.floor(totalEndMin / 60),
        totalEndMin % 60,
        0,
        0,
      );

      const utcStart = fromZonedTime(slotStartDate, timezone);
      const utcEnd = fromZonedTime(slotEndDate, timezone);
      const utcBufferStart = fromZonedTime(bufferStartDate, timezone);
      const utcBufferEnd = fromZonedTime(bufferEndDate, timezone);

      const minNoticeTime = addMinutes(now, minBookingNotice);
      if (isBefore(utcStart, minNoticeTime)) {
        continue;
      }

      // Check past dates
      if (isBefore(utcStart, now)) {
        continue;
      }

      let overlapsBreak = false;
      for (const brk of dayBreaks) {
        const breakStartMin = parseTimeToMinutes(brk.startTime);
        const breakEndMin = parseTimeToMinutes(brk.endTime);
        if (
          slotStart < breakEndMin &&
          slotStart + totalSlotDuration > breakStartMin
        ) {
          overlapsBreak = true;
          break;
        }
      }

      if (overlapsBreak) {
        continue;
      }

      let overlapsAppointment = false;
      for (const apt of activeAppointments) {
        if (
          areIntervalsOverlapping(
            { start: utcBufferStart, end: utcBufferEnd },
            { start: apt.startAt, end: apt.endAt },
          )
        ) {
          overlapsAppointment = true;
          break;
        }
      }

      if (overlapsAppointment) continue;

      const displayTime = format(slotStartDate, "h:mm a");

      slots.push({
        start: utcStart,
        end: utcEnd,
        displayTime,
      });
    }
  }

  return slots;
}

export function isSlotAvailable(
  requestStart: Date,
  requestEnd: Date,
  config: Omit<AvailabilityConfig, "date">,
): boolean {
  const configWithDate: AvailabilityConfig = {
    ...config,
    date: requestStart,
  };

  const slots = getAvailableSlots(configWithDate);

  return slots.some(
    (slot) =>
      slot.start.getTime() === requestStart.getTime() &&
      slot.end.getTime() === requestEnd.getTime(),
  );
}
