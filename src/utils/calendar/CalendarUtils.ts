import { CALENDAR_CONFIG } from '../../app/model/calendar/CalendarConfig';
import type { CalendarEvent, LayoutEvent } from '../../app/model/calendar/CalendarTypes';

export class CalendarUtils {
	static addDays(d: Date, days: number): Date {
		const newDate = new Date(d);
		newDate.setDate(newDate.getDate() + days);
		return newDate;
	}

	static addHours(d: Date, hours: number): Date {
		const newDate = new Date(d);
		newDate.setHours(newDate.getHours() + hours);
		return newDate;
	}

	static getTimelineStart(now: Date): Date {
		const start = this.addDays(now, -CALENDAR_CONFIG.pastDays);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	static getPosition(date: Date, timelineStart: Date): number {
		const diffTime = date.getTime() - timelineStart.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return diffDays * CALENDAR_CONFIG.pixelsPerDay;
	}

	static getWidth(start: Date, end: Date): number {
		const diffTime = end.getTime() - start.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return Math.max(diffDays * CALENDAR_CONFIG.pixelsPerDay, 20); // Min width 20px
	}

	static isEndingSoon(end: Date, now: Date): boolean {
		const diff = end.getTime() - now.getTime();
		return diff > 0 && diff < 24 * 60 * 60 * 1000;
	}

	static getClampedEventLayout(
		start: Date,
		end: Date,
		timelineStart: Date,
		daysToShow: number,
		pastDays: number
	): { left: number; width: number; isVisible: boolean } {
		const totalDays = daysToShow + pastDays;
		const totalWidth = totalDays * CALENDAR_CONFIG.pixelsPerDay;
		const timelineEnd = this.addDays(timelineStart, totalDays);

		const startTime = start.getTime();
		const endTime = end.getTime();
		const tlStart = timelineStart.getTime();
		const tlEnd = timelineEnd.getTime();

		if (endTime <= tlStart || startTime >= tlEnd) {
			return { left: 0, width: 0, isVisible: false };
		}

		// Calculate positions in pixels relative to timeline start
		const startPixel =
			((startTime - tlStart) / (1000 * 60 * 60 * 24)) * CALENDAR_CONFIG.pixelsPerDay;
		const endPixel = ((endTime - tlStart) / (1000 * 60 * 60 * 24)) * CALENDAR_CONFIG.pixelsPerDay;

		const clampedStart = Math.max(0, startPixel);
		const clampedEnd = Math.min(totalWidth, endPixel);

		const width = Math.max(clampedEnd - clampedStart, 20); // Min visible width? Or maybe min 0 if clamped?
		// If clamped, we just show what fits. If it becomes too small, maybe keep it small.
		// But original getWidth had min 20. Let's respect that min 20 only if it's not totally clipped?
		// Let's use simple math first.

		return {
			left: clampedStart,
			width: Math.max(width, 0),
			isVisible: true
		};
	}

	static getTimeRemaining(end: Date, now: Date): string {
		const diff = end.getTime() - now.getTime();
		if (diff < 0) return 'Ended';
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d left`;
		return `${hours}h left`;
	}

	static resolveEventRows(items: CalendarEvent[]): LayoutEvent[] {
		if (items.length === 0) return [];

		// Sort by start date, then by duration (longer first) to optimize packing
		const sorted = [...items].sort((a, b) => {
			if (a.startDate.getTime() !== b.startDate.getTime()) {
				return a.startDate.getTime() - b.startDate.getTime();
			}
			return (
				b.endDate.getTime() - b.startDate.getTime() - (a.endDate.getTime() - a.startDate.getTime())
			);
		});

		const rows: Date[] = []; // Tracks the end time of the last event in each row
		const result: LayoutEvent[] = [];

		for (const event of sorted) {
			let placed = false;
			for (let i = 0; i < rows.length; i++) {
				// Check if this row is free.
				// existing end time < new event start time
				if (rows[i].getTime() <= event.startDate.getTime()) {
					result.push({ ...event, row: i });
					rows[i] = event.endDate;
					placed = true;
					break;
				}
			}

			if (!placed) {
				// Start a new row
				result.push({ ...event, row: rows.length });
				rows.push(event.endDate);
			}
		}
		return result;
	}
}
