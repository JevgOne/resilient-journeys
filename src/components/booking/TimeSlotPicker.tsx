import { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TimeSlot {
  slot_start: string;
  slot_end: string;
}

interface TimeSlotPickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  sessionDuration: number;
}

export const TimeSlotPicker = ({
  selectedDate,
  selectedTime,
  onSelectTime,
  sessionDuration,
}: TimeSlotPickerProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    } else {
      setSlots([]);
    }
  }, [selectedDate, sessionDuration]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Call the database function to get available slots
      const { data, error: fnError } = await supabase.rpc('get_available_slots', {
        target_date: dateStr,
        session_duration: sessionDuration,
      });

      if (fnError) {
        // If function doesn't exist yet, generate slots client-side
        console.warn('get_available_slots function not available, using fallback');
        const fallbackSlots = generateFallbackSlots(selectedDate, sessionDuration);
        setSlots(fallbackSlots);
      } else {
        setSlots(data || []);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      // Use fallback slots
      const fallbackSlots = generateFallbackSlots(selectedDate, sessionDuration);
      setSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  // Fallback slot generation when database function is not available
  const generateFallbackSlots = (date: Date, duration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotEnd = hour * 60 + minute + duration;
        if (slotEnd <= endHour * 60) {
          const startTime = new Date(date);
          startTime.setHours(hour, minute, 0, 0);

          const endTime = new Date(date);
          endTime.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

          slots.push({
            slot_start: startTime.toISOString(),
            slot_end: endTime.toISOString(),
          });
        }
      }
    }

    return slots;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (!selectedDate) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gold" />
          <h3 className="font-serif font-semibold">Available Times</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">
          Please select a date first
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gold" />
          <h3 className="font-serif font-semibold">Available Times</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gold" />
        <h3 className="font-serif font-semibold">Available Times</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {slots.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No available times for this date
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
          {slots.map((slot, index) => (
            <button
              key={index}
              onClick={() => onSelectTime(slot.slot_start)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                selectedTime === slot.slot_start
                  ? 'bg-gradient-gold text-white shadow-gold'
                  : 'bg-secondary hover:bg-gold/20 text-foreground'
              )}
            >
              {formatTime(slot.slot_start)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
