import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  blockedDates?: string[];
  availableDays?: string[]; // e.g., ['monday', 'tuesday', ...]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const BookingCalendar = ({
  selectedDate,
  onSelectDate,
  blockedDates = [],
  availableDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
}: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.includes(dateStr);
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past dates are not available
    if (date < today) return false;

    // Check if day of week is available
    const dayOfWeek = DAY_MAP[date.getDay()];
    if (!availableDays.includes(dayOfWeek)) return false;

    // Check if date is blocked
    if (isDateBlocked(date)) return false;

    return true;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="hover:bg-gold/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-serif font-semibold text-lg">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="hover:bg-gold/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                onClick={() => isDateAvailable(date) && onSelectDate(date)}
                disabled={!isDateAvailable(date)}
                className={cn(
                  'w-full h-full rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                  isDateAvailable(date)
                    ? 'hover:bg-gold/20 cursor-pointer'
                    : 'text-muted-foreground/40 cursor-not-allowed',
                  isSameDay(date, selectedDate) &&
                    'bg-gradient-gold text-white hover:bg-gold shadow-gold',
                  isSameDay(date, new Date()) &&
                    !isSameDay(date, selectedDate) &&
                    'border border-gold/50'
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-gold" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gold/50" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
