import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  CalendarOff,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

interface Booking {
  id: string;
  user_id: string;
  session_type: string;
  session_date: string;
  duration_minutes: number;
  price_paid: number;
  status: string;
  booking_notes: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-700',
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form states
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAvailability(),
      fetchBlockedDates(),
      fetchBookings(),
    ]);
    setLoading(false);
  };

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_availability')
        .select('*')
        .order('day_of_week');

      if (error) throw error;

      // If no data, create defaults
      if (!data || data.length === 0) {
        const defaults: Availability[] = DAYS_OF_WEEK.slice(0, 5).map((day, i) => ({
          id: `default-${i}`,
          day_of_week: day,
          start_time: '09:00:00',
          end_time: '17:00:00',
          is_active: true,
        }));
        setAvailability(defaults);
      } else {
        setAvailability(data);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      // Use defaults
      const defaults: Availability[] = DAYS_OF_WEEK.slice(0, 5).map((day, i) => ({
        id: `default-${i}`,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_active: true,
      }));
      setAvailability(defaults);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_blocked_dates')
        .select('*')
        .order('blocked_date');

      if (!error && data) {
        setBlockedDates(data);
      }
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('session_bookings')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('session_date', { ascending: false })
        .limit(50);

      if (!error && data) {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const toggleDayAvailability = async (day: string, isActive: boolean) => {
    setSavingAvailability(true);

    try {
      const existing = availability.find(a => a.day_of_week === day);

      if (existing && !existing.id.startsWith('default-')) {
        // Update existing
        const { error } = await supabase
          .from('coach_availability')
          .update({ is_active: isActive })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('coach_availability')
          .upsert({
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_active: isActive,
          }, { onConflict: 'day_of_week,start_time' });

        if (error) throw error;
      }

      // Update local state
      setAvailability(prev =>
        prev.map(a =>
          a.day_of_week === day ? { ...a, is_active: isActive } : a
        )
      );

      toast({
        title: 'Availability Updated',
        description: `${DAY_LABELS[day]} is now ${isActive ? 'available' : 'unavailable'}.`,
      });
    } catch (err) {
      console.error('Error updating availability:', err);
      toast({
        title: 'Error',
        description: 'Failed to update availability.',
        variant: 'destructive',
      });
    } finally {
      setSavingAvailability(false);
    }
  };

  const updateAvailabilityTime = async (day: string, field: 'start_time' | 'end_time', value: string) => {
    const existing = availability.find(a => a.day_of_week === day);
    if (!existing) return;

    try {
      if (!existing.id.startsWith('default-')) {
        const { error } = await supabase
          .from('coach_availability')
          .update({ [field]: value })
          .eq('id', existing.id);

        if (error) throw error;
      }

      setAvailability(prev =>
        prev.map(a =>
          a.day_of_week === day ? { ...a, [field]: value } : a
        )
      );
    } catch (err) {
      console.error('Error updating time:', err);
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate) return;

    try {
      const { data, error } = await supabase
        .from('coach_blocked_dates')
        .insert({
          blocked_date: newBlockedDate,
          reason: newBlockedReason || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedDates(prev => [...prev, data].sort((a, b) =>
        a.blocked_date.localeCompare(b.blocked_date)
      ));
      setNewBlockedDate('');
      setNewBlockedReason('');

      toast({
        title: 'Date Blocked',
        description: `${format(parseISO(newBlockedDate), 'MMMM d, yyyy')} has been blocked.`,
      });
    } catch (err) {
      console.error('Error blocking date:', err);
      toast({
        title: 'Error',
        description: 'Failed to block date.',
        variant: 'destructive',
      });
    }
  };

  const removeBlockedDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coach_blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlockedDates(prev => prev.filter(d => d.id !== id));

      toast({
        title: 'Date Unblocked',
        description: 'The date is now available for bookings.',
      });
    } catch (err) {
      console.error('Error removing blocked date:', err);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status } : b))
      );

      toast({
        title: 'Booking Updated',
        description: `Booking marked as ${status}.`,
      });
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-cream/50 mb-6">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-gold data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="blocked" className="data-[state=active]:bg-gold data-[state=active]:text-white">
            <CalendarOff className="h-4 w-4 mr-2" />
            Blocked Dates
          </TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="font-serif">Upcoming & Recent Bookings</CardTitle>
              <CardDescription>Manage session bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {booking.profiles?.full_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.profiles?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium capitalize">
                              {booking.session_type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.duration_minutes} min • €{booking.price_paid}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(booking.session_date), 'MMM d, yyyy')}
                          <br />
                          <span className="text-muted-foreground">
                            {format(parseISO(booking.session_date), 'HH:mm')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[booking.status] || ''}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {booking.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  title="Mark as completed"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  title="Cancel booking"
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="font-serif">Weekly Availability</CardTitle>
              <CardDescription>Set your available hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const dayAvailability = availability.find(a => a.day_of_week === day) || {
                    day_of_week: day,
                    start_time: '09:00',
                    end_time: '17:00',
                    is_active: false,
                  };

                  return (
                    <div
                      key={day}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        dayAvailability.is_active
                          ? 'border-gold/30 bg-gold/5'
                          : 'border-border bg-muted/50'
                      }`}
                    >
                      <Switch
                        checked={dayAvailability.is_active}
                        onCheckedChange={(checked) => toggleDayAvailability(day, checked)}
                        disabled={savingAvailability}
                      />
                      <div className="w-24 font-medium">{DAY_LABELS[day]}</div>

                      {dayAvailability.is_active && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={dayAvailability.start_time?.slice(0, 5) || '09:00'}
                            onChange={(e) => updateAvailabilityTime(day, 'start_time', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={dayAvailability.end_time?.slice(0, 5) || '17:00'}
                            onChange={(e) => updateAvailabilityTime(day, 'end_time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}

                      {!dayAvailability.is_active && (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Dates Tab */}
        <TabsContent value="blocked">
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="font-serif">Blocked Dates</CardTitle>
              <CardDescription>Block specific dates (holidays, vacations, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add blocked date form */}
              <div className="flex gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="blocked-date">Date</Label>
                  <Input
                    id="blocked-date"
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="blocked-reason">Reason (optional)</Label>
                  <Input
                    id="blocked-reason"
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="e.g., Holiday, Vacation"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addBlockedDate}
                    disabled={!newBlockedDate}
                    className="bg-gradient-gold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Block Date
                  </Button>
                </div>
              </div>

              {/* Blocked dates list */}
              {blockedDates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No blocked dates</p>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map((blocked) => (
                    <div
                      key={blocked.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarOff className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">
                            {format(parseISO(blocked.blocked_date), 'EEEE, MMMM d, yyyy')}
                          </div>
                          {blocked.reason && (
                            <div className="text-sm text-muted-foreground">
                              {blocked.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlockedDate(blocked.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBookings;
