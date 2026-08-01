import { useMemo } from 'react';
import { Lead } from '@/types/lead';
import { LeadEvent, LEAD_EVENT_TYPES, formatEventTime, isEventPast } from '@/types/leadEvent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: LeadEvent[];
  leads: Lead[];
  onChangeWeek: (date: Date) => void;
  onAddEvent: (date?: Date, leadId?: string) => void;
  onLeadClick: (lead: Lead) => void;
  onToggleComplete: (eventId: string, completed: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 ~ 21:00

export function CalendarWeekView({
  currentDate,
  events,
  leads,
  onChangeWeek,
  onAddEvent,
  onLeadClick,
  onToggleComplete,
  onDeleteEvent,
}: CalendarWeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const eventsByDayAndHour = useMemo(() => {
    const grouped: Record<string, LeadEvent[]> = {};
    events.forEach((event) => {
      const date = parseISO(event.scheduled_at);
      const dayKey = format(date, 'yyyy-MM-dd');
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(event);
    });
    return grouped;
  }, [events]);

  const getLeadById = (leadId: string) => leads.find((l) => l.id === leadId);

  const handleCellClick = (day: Date, hour: number) => {
    const date = setMinutes(setHours(day, hour), 0);
    onAddEvent(date);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeek(subWeeks(currentDate, 1))}
            className="text-marroc-salvia hover:text-marroc-dourado"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-sm font-display text-marroc-dourado capitalize min-w-[160px] text-center">
            {format(weekDays[0], "dd 'de' MMMM", { locale: ptBR })} —{' '}
            {format(weekDays[6], "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeek(addWeeks(currentDate, 1))}
            className="text-marroc-salvia hover:text-marroc-dourado"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-marroc-dourado/15 text-marroc-esmeralda hover:bg-marroc-esmeralda/10"
          onClick={() => onChangeWeek(new Date())}
        >
          Hoje
        </Button>
      </div>

      {/* Week grid */}
      <Card className="glass-card border-marroc-dourado/10 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-marroc-dourado/15">
          <div className="p-3 text-xs text-marroc-salvia/60 border-r border-marroc-dourado/15 bg-marroc-dourado/5">
            Horário
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-3 text-center ${isToday ? 'bg-marroc-esmeralda/10' : ''}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-marroc-salvia/60">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div
                  className={`text-sm font-display mt-0.5 ${
                    isToday ? 'text-marroc-esmeralda font-semibold' : 'text-marroc-dourado'
                  }`}
                >
                  {format(day, 'dd')}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[72px] border-b border-marroc-dourado/10 last:border-0">
              <div className="p-2 text-[11px] text-marroc-salvia/60 border-r border-marroc-dourado/15 bg-marroc-dourado/5 flex items-start justify-center pt-2">
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDayAndHour[dayKey]?.filter((event) => {
                  const date = parseISO(event.scheduled_at);
                  return date.getHours() === hour;
                }) || [];
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString() + hour}
                    onClick={() => handleCellClick(day, hour)}
                    className={`p-1 border-r border-marroc-dourado/10 last:border-0 relative transition-colors cursor-pointer hover:bg-marroc-dourado/5 ${
                      isToday ? 'bg-marroc-esmeralda/5' : ''
                    }`}
                  >
                    {dayEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-marroc-esmeralda/50" />
                      </div>
                    )}
                    <div className="space-y-1">
                      {dayEvents.map((event) => {
                        const lead = getLeadById(event.lead_id);
                        const type = LEAD_EVENT_TYPES.find((t) => t.id === event.type) || LEAD_EVENT_TYPES[4];
                        const isPastEvent = isEventPast(event.scheduled_at, event.completed);

                        return (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (lead) onLeadClick(lead);
                            }}
                            className={`w-full text-left px-1.5 py-1 rounded text-[10px] leading-tight border ${
                              type.color
                            } ${event.completed ? 'opacity-50 line-through' : ''} ${
                              isPastEvent ? 'border-l-2 border-l-red-400/60' : ''
                            }`}
                            title={`${event.title} — ${formatEventTime(event.scheduled_at)}${
                              event.duration_minutes ? ` (${event.duration_minutes}min)` : ''
                            }`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="truncate opacity-80">{formatEventTime(event.scheduled_at)}</div>
                            {lead && <div className="truncate opacity-70">{lead.name}</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
