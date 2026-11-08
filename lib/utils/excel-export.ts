import ExcelJS from "exceljs";
import { WEEK_DAY_LABELS, AREA_LABEL } from "@/lib/constants";
import type { DayIndex, DayShift, Staff, WeekDays, WeeklySchedule } from "@/lib/types";
import { dayHeaderNumber, dayISO, isToday } from "@/lib/utils/date";
import { formatTimeAMPM } from "@/lib/utils/shift";
import { weekSiteSummary } from "@/lib/utils/site";

// ─── Color tokens (mirror of globals.css but as ARGB strings for ExcelJS) ──
// 0xFF prefix = full alpha (required by ExcelJS).
const COLOR_PRIMARY = "FF009B4D";         // #009B4D brand green
const COLOR_PRIMARY_FG = "FFFFFFFF";     // white text on primary
const COLOR_SECONDARY_CONTAINER = "FFD9E6DA"; // #d9e6da zebra
const COLOR_GRID = "FFBDCABB";           // #bdcabb cell borders
const COLOR_TERTIARY = "FF805200";       // #805200 night-shift text
const COLOR_TODAY = "FFE8F5E9";          // subtle highlight for today's column

const STYLE_BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: COLOR_GRID } },
  left: { style: "thin", color: { argb: COLOR_GRID } },
  right: { style: "thin", color: { argb: COLOR_GRID } },
  bottom: { style: "thin", color: { argb: COLOR_GRID } },
};

function shiftToCellText(shift: DayShift): string {
  switch (shift.type) {
    case "time":
      if (!shift.start || !shift.end) return "Hora (sin rango)";
      return `${formatTimeAMPM(shift.start)} – ${formatTimeAMPM(shift.end)}`;
    case "rest":
      return "Descanso";
    case "available":
      return "Disponible";
    case "nightIn":
      return "Amanece turno noche";
  }
}

function shiftIsNight(shift: DayShift): boolean {
  if (shift.type !== "time" || !shift.start || !shift.end) return false;
  return shift.start >= "20:00" || shift.end <= "06:00";
}

function triggerDownload(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildWeekSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  weekStart: string,
  staff: Staff[],
  byStaffDays: (staffId: string) => WeekDays | undefined,
  title: string,
): void {
  const sheet = workbook.addWorksheet(sheetName);

  // ── Title row ──
  sheet.mergeCells(1, 1, 9, 1);
  const titleCell = sheet.getCell("A1");
  titleCell.value = `${title} — ${AREA_LABEL}`;
  titleCell.font = { name: "Inter", size: 13, bold: true, color: { argb: "FF111D23" } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 22;

  // ── Header row (day labels) ──
  const headerValues = ["Personal", "Sede"];
  for (const d of WEEK_DAY_LABELS) {
    headerValues.push(`${d.short.toUpperCase()} ${dayHeaderNumber(weekStart, d.index)}`);
  }
  const headerRow = sheet.addRow(headerValues);
  headerRow.eachCell((cell) => {
    cell.font = { name: "Inter", size: 11, bold: true, color: { argb: COLOR_PRIMARY_FG } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_PRIMARY },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = STYLE_BORDER_THIN;
  });
  headerRow.height = 28;

  // ── Data rows ──
  staff.forEach((s, idx) => {
    const days = byStaffDays(s.id) ?? ({} as WeekDays);
    const rowValues: (string | number)[] = [s.fullName, weekSiteSummary(s, byStaffDays(s.id)).label];
    for (const d of WEEK_DAY_LABELS) {
      const shift = days[d.index] ?? { type: "rest" as const };
      rowValues.push(shiftToCellText(shift));
    }
    const dataRow = sheet.addRow(rowValues);
    dataRow.height = 22;

    dataRow.eachCell((cell, colNumber) => {
      cell.border = STYLE_BORDER_THIN;
      cell.alignment = {
        horizontal: colNumber <= 2 ? "left" : "center",
        vertical: "middle",
        wrapText: false,
      };

      // Zebra striping
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_SECONDARY_CONTAINER },
        };
      }

      // Highlight today's column
      const dayIndex = (colNumber - 3) as DayIndex;
      const cellDateISO = dayISO(weekStart, WEEK_DAY_LABELS[dayIndex]?.index ?? 0);
      if (isToday(cellDateISO)) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_TODAY },
        };
        cell.border = {
          ...STYLE_BORDER_THIN,
          bottom: { style: "medium", color: { argb: COLOR_PRIMARY } },
        };
      }

      // Night shift text color
      if (colNumber >= 3) {
        const dayIdx = WEEK_DAY_LABELS[dayIndex]?.index ?? 0;
        const shift = days[dayIdx] ?? { type: "rest" as const };
        if (shiftIsNight(shift)) {
          cell.font = {
            name: "JetBrains Mono, monospace",
            size: 10,
            bold: true,
            color: { argb: COLOR_TERTIARY },
          };
        } else if (shift.type === "time") {
          cell.font = { name: "JetBrains Mono, monospace", size: 10 };
        }
      }

      // Personal/Sede cells
      if (colNumber === 1) {
        cell.font = { name: "Inter", size: 11, bold: true };
      } else if (colNumber === 2) {
        cell.font = { name: "Inter", size: 11, color: { argb: "FF4A5A64" } };
      }
    });
  });

  // ── Column widths ──
  sheet.getColumn(1).width = 26; // Personal
  sheet.getColumn(2).width = 18; // Sede
  for (let i = 3; i <= 9; i++) {
    sheet.getColumn(i).width = 18;
  }

  sheet.views = [{ state: "frozen", xSplit: 2, ySplit: 2 }];
}

// ─── Public API ──────────────────────────────────────────────────────────

export interface ExportWeekArgs {
  weekStart: string;
  staff: Staff[];
  byStaffDays: (staffId: string) => WeekDays | undefined;
  /** Filter label for the title (e.g. "Fontibón" or empty for "Todas"). */
  filterLabel?: string;
}

export async function exportWeekToExcel(args: ExportWeekArgs): Promise<void> {
  const { weekStart, staff, byStaffDays, filterLabel } = args;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Clocky";
  workbook.created = new Date();

  const title = filterLabel
    ? `Malla Horaria — Semana del ${weekStart} (${filterLabel})`
    : `Malla Horaria — Semana del ${weekStart}`;

  buildWeekSheet(workbook, `Semana ${weekStart}`, weekStart, staff, byStaffDays, title);

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, `malla-${weekStart}.xlsx`);
}

export interface ExportMonthArgs {
  /** Any Sunday-anchored weekStart inside the desired month. */
  weekStart: string;
  staff: Staff[];
  byStaffDays: (staffId: string) => WeekDays | undefined;
  /** Days for any week of the month — read after fetchWeek so every sheet gets its own week. */
  daysForWeek?: (weekStart: string, staffId: string) => WeekDays | undefined;
  /** Fetch function for additional weeks (in case the store hasn't pre-loaded them). */
  fetchWeek?: (weekStart: string) => Promise<void>;
  filterLabel?: string;
}

/** Returns all Sunday-anchored weekStart ISO dates that overlap with the given month. */
function getWeeksInMonth(weekStart: string): string[] {
  // weekStart is the Sunday of the current week. Determine the month:
  const ref = new Date(weekStart + "T00:00:00");
  const year = ref.getFullYear();
  const month = ref.getMonth(); // 0-indexed

  // First and last day of the month
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Helper to get Sunday on or before a date
  const dow = (d: Date) => d.getDay();
  const sundayOf = (d: Date) => {
    const out = new Date(d);
    out.setDate(out.getDate() - dow(out));
    out.setHours(0, 0, 0, 0);
    return out;
  };
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Walk weeks from first Sunday on or before the 1st, until first Sunday after the last day
  const firstSunday = sundayOf(firstOfMonth);
  const result: string[] = [];
  const cursor = new Date(firstSunday);
  // Safety cap: 6 weeks max per month
  for (let i = 0; i < 6; i++) {
    result.push(fmt(cursor));
    cursor.setDate(cursor.getDate() + 7);
    if (cursor > lastOfMonth) break;
  }
  return result;
}

export async function exportMonthToExcel(args: ExportMonthArgs): Promise<void> {
  const { weekStart, staff, byStaffDays, daysForWeek, fetchWeek, filterLabel } = args;
  const daysOf = (ws: string) => (sid: string) =>
    daysForWeek ? daysForWeek(ws, sid) : ws === weekStart ? byStaffDays(sid) : undefined;

  // 1) Compute all weeks that overlap with the month
  const weeks = getWeeksInMonth(weekStart);

  // 2) For each week, ensure data is loaded
  if (fetchWeek) {
    await Promise.all(weeks.map((ws) => fetchWeek(ws)));
  }

  // 3) Build workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Clocky";
  workbook.created = new Date();

  const monthLabel = new Date(weekStart + "T00:00:00").toLocaleDateString("es", {
    year: "numeric",
    month: "long",
  });

  // ── Summary sheet (compact month view) ──
  const summary = workbook.addWorksheet("Resumen");
  buildSummarySheet(summary, weeks, staff, (ws, sid) => daysOf(ws)(sid), filterLabel);

  // ── One sheet per week ──
  for (const ws of weeks) {
    const sheetName = `Semana ${ws}`;
    const title = filterLabel
      ? `Malla Horaria — ${sheetName} (${filterLabel})`
      : `Malla Horaria — ${sheetName}`;
    buildWeekSheet(workbook, sheetName, ws, staff, daysOf(ws), title);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fileLabel = weekStart.slice(0, 7); // YYYY-MM
  triggerDownload(buffer, `malla-${fileLabel}.xlsx`);

  // Suppress unused warning
  void monthLabel;
}

/** Compact 1-column-per-day summary sheet (one cell per day of the month). */
function buildSummarySheet(
  sheet: ExcelJS.Worksheet,
  weeks: string[],
  staff: Staff[],
  daysFor: (weekStart: string, staffId: string) => WeekDays | undefined,
  filterLabel: string | undefined,
): void {
  // Title
  sheet.mergeCells(1, 1, 32, 1);
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Resumen mensual — ${filterLabel ? `${filterLabel} · ` : ""}${staff.length} empleado${
    staff.length === 1 ? "" : "s"
  }`;
  titleCell.font = { name: "Inter", size: 13, bold: true, color: { argb: "FF111D23" } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 22;

  // Build header row: Personal + 1 column per day
  const allDays: { dateISO: string; dayNum: number; monthNum: number }[] = [];
  for (const ws of weeks) {
    const start = new Date(ws + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      allDays.push({
        dateISO: `${d.getFullYear()}-${m}-${day}`,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
      });
    }
  }

  const headerValues = ["Personal", ...allDays.map((d) => String(d.dayNum))];
  const headerRow = sheet.addRow(headerValues);
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: "Inter", size: 10, bold: true, color: { argb: COLOR_PRIMARY_FG } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_PRIMARY },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = STYLE_BORDER_THIN;
  });
  headerRow.height = 24;

  // Data rows: each staff, each day = abbreviated cell
  staff.forEach((s, idx) => {
    const rowValues: (string | number)[] = [s.fullName];
    // Compute which date corresponds to each column (colNumber >= 2)
    const columnDateISOs: string[] = allDays.map((ad) => ad.dateISO);
    for (const ad of allDays) {
      // Determine which week's day this date falls in and what dayIndex
      const wkStart = weeks.find((ws) => {
        const start = new Date(ws + "T00:00:00");
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return ad.dateISO >= ws && ad.dateISO < end.toISOString().slice(0, 10);
      });
      let cellText = "";
      if (wkStart) {
        const start = new Date(wkStart + "T00:00:00");
        const target = new Date(ad.dateISO + "T00:00:00");
        const diff = Math.round((target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
        const dayIndex = diff as DayIndex;
        const shift = daysFor(wkStart, s.id)?.[dayIndex] ?? { type: "rest" as const };
        cellText = shiftToAbbreviation(shift);
      }
      rowValues.push(cellText);
    }
    const dataRow = sheet.addRow(rowValues);
    dataRow.height = 18;

    dataRow.eachCell((cell, colNumber) => {
      cell.border = STYLE_BORDER_THIN;
      cell.alignment = {
        horizontal: colNumber === 1 ? "left" : "center",
        vertical: "middle",
      };
      cell.font = { name: "Inter", size: 9 };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_SECONDARY_CONTAINER },
        };
      }
      if (colNumber === 1) {
        cell.font = { name: "Inter", size: 10, bold: true };
      }
      // Column 1 = Personal, columns 2..N+1 = days. Look up the date for this column.
      const dateISO = columnDateISOs[colNumber - 2];
      if (colNumber > 1 && dateISO && isToday(dateISO)) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_TODAY },
        };
        cell.font = { name: "Inter", size: 9, bold: true };
      }
    });
  });

  // Column widths
  sheet.getColumn(1).width = 26;
  for (let i = 2; i <= allDays.length + 1; i++) {
    sheet.getColumn(i).width = 5;
  }

  sheet.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];
}

function shiftToAbbreviation(shift: DayShift): string {
  switch (shift.type) {
    case "time":
      if (!shift.start || !shift.end) return "—";
      return `${shift.start}–${shift.end}`;
    case "rest":
      return "Desc";
    case "available":
      return "Disp";
    case "nightIn":
      return "Aman";
  }
}