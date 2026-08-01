import { useState, useMemo } from 'react';
import { Lead } from '@/types/lead';
import { LeadEvent, LEAD_EVENT_TYPES, isEventToday, isEventPast, formatEventTime } from '@/types/leadEvent';
import { CalendarWeekView } from '@/components/CalendarWeekView';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, AlertCircle, Plus, Trash2, ExternalLink } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  leads: Lead[];
  events: LeadEvent[];
  onAddEvent: (date?: Date, leadId?: string) => void;
  onToggleComplete: (eventId: string, completed: boolean) => void;
  onDeleteEvent: (eventId: string) => void;
  onLeadClick: (lead: Lead) => void;
}

export function CalendarView({ leads, events, onAddEvent, onToggleComplete, onDeleteEvent, onLeadClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, LeadEvent[]> = {};
    events.forEach((event) => {
      const date = parseISO(event.scheduled_at);
      const key = format(date, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDay[key] || [];
  }, [selectedDate, eventsByDay]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => !e.completed && new Date(e.scheduled_at) >= now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      .slice(0, 5);
  }, [events]);

  const overdueEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => !e.completed && new Date(e.scheduled_at) < now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [events]);

  const getLeadById = (leadId: string) => leads.find((l) => l.id === leadId);

  const getEventType = (type: LeadEvent['type']) => LEAD_EVENT_TYPES.find((t) => t.id === type) || LEAD_EVENT_TYPES[4];

  const renderEventItem = (event: LeadEvent, compact = false) => {
    const lead = getLeadById(event.lead_id);
    const type = getEventType(event.type);
    const isPast = isEventPast(event.scheduled_at, event.completed);
    const isToday = isEventToday(event.scheduled_at);

    return (
      <Card
        key={event.id}
        className={`p-3 mb-2 glass-card border-marroc-dourado/10 hover:border-marroc-dourado/25 transition-colors ${
          event.completed ? 'opacity-60' : ''
        } ${isPast ? 'border-l-2 border-l-red-400/60' : ''} ${isToday ? 'border-l-2 border-l-marroc-esmeralda' : ''}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={event.completed}
            onCheckedChange={(checked) => onToggleComplete(event.id, checked as boolean)}
            className="mt-0.5 border-marroc-esmeralda/50 data-[state=checked]:bg-marroc-esmeralda data-[state=checked]:text-marroc-muscgo"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className={`text-sm font-medium truncate ${event.completed ? 'line-through text-marroc-salvia/50' : 'text-marroc-texto'}`}>
                  {event.title}
                </h4>
                {lead && (
                  <button
                    onClick={() => onLeadClick(lead)}
                    className="text-xs text-marroc-esmeralda hover:text-marroc-dourado truncate flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {lead.name} {lead.company && `· ${lead.company}`}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] border ${type.color}`}>
                  {type.icon} {type.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-marroc-salvia/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatEventTime(event.scheduled_at)}
              </span>
              {event.duration_minutes && (
                <span>{event.duration_minutes}min</span>
              )}
              {isToday && (
                <Badge variant="outline" className="text-[10px] border-marroc-esmeralda/50 text-marroc-esmeralda">
                  Hoje
                </Badge>
              )}
              {isPast && !event.completed && (
                <Badge variant="outline" className="text-[10px] border-red-400/50 text-red-300">
                  Atrasado
                </Badge>
              )}
            </div>

            {event.notes && !compact && (
              <p className="text-xs text-marroc-salvia/60 mt-2 line-clamp-2">{event.notes}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-marroc-salvia/50 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
            onClick={() => onDeleteEvent(event.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-marroc-esmeralda" />
          <h2 className="text-lg font-display font-semibold text-marroc-dourado">
            Calendário de Leads
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-marroc-dourado/5 rounded-lg p-1 border border-marroc-dourado/15">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-marroc-esmeralda/20 text-marroc-esmeralda' : 'text-marroc-salvia/70'}
            >
              Mês
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-marroc-esmeralda/20 text-marroc-esmeralda' : 'text-marroc-salvia/70'}
            >
              Semana
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-marroc-esmeralda/20 text-marroc-esmeralda' : 'text-marroc-salvia/70'}
            >
              Lista
            </Button>
          </div>
          <Button
            size="sm"
            className="btn-marroc"
            onClick={() => onAddEvent(selectedDate)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agendar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3 glass-card border-marroc-dourado/10">
          <div className="flex items-center gap-2 text-marroc-esmeralda mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total no mês</span>
          </div>
          <p className="text-2xl font-display text-marroc-texto">{events.length}</p>
        </Card>
        <Card className="p-3 glass-card border-marroc-dourado/10">
          <div className="flex items-center gap-2 text-marroc-dourado mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Próximos</span>
          </div>
          <p className="text-2xl font-display text-marroc-texto">{upcomingEvents.length}</p>
        </Card>
        <Card className="p-3 glass-card border-marroc-dourado/10">
          <div className="flex items-center gap-2 text-red-300 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Atrasados</span>
          </div>
          <p className="text-2xl font-display text-marroc-texto">{overdueEvents.length}</p>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueEvents.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/20">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Eventos atrasados</span>
          </div>
          <div className="space-y-2">
            {overdueEvents.slice(0, 3).map((event) => renderEventItem(event, true))}
          </div>
          {overdueEvents.length > 3 && (
            <p className="text-xs text-marroc-salvia/60 mt-2">+{overdueEvents.length - 3} atrasados</p>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <CalendarWeekView
          currentDate={currentMonth}
          events={events}
          leads={leads}
          onChangeWeek={setCurrentMonth}
          onAddEvent={onAddEvent}
          onLeadClick={onLeadClick}
          onToggleComplete={onToggleComplete}
          onDeleteEvent={onDeleteEvent}
        />
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 glass-card border-marroc-dourado/10 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-marroc-salvia hover:text-marroc-dourado"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-marroc-salvia hover:text-marroc-dourado"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <h3 className="text-sm font-display text-marroc-dourado capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="border-marroc-dourado/15 text-marroc-esmeralda hover:bg-marroc-esmeralda/10"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Hoje
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs text-marroc-salvia/60 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay[key] || [];
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const hasEvents = dayEvents.length > 0;
                const pendingEvents = dayEvents.filter((e) => !e.completed).length;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (!isCurrentMonth) {
                        setCurrentMonth(day);
                      }
                      setSelectedDate(day);
                    }}
                    className={`
                      min-h-[80px] p-1.5 rounded-lg border text-left transition-all relative
                      ${isSelected ? 'bg-marroc-esmeralda/10 border-marroc-esmeralda/60' : 'border-marroc-dourado/10 hover:border-marroc-dourado/30'}
                      ${!isCurrentMonth ? 'opacity-50 bg-marroc-dourado/5' : ''}
                      ${isToday && !isSelected ? 'ring-1 ring-marroc-esmeralda/60' : ''}
                      ${hasEvents ? 'hover:bg-marroc-dourado/5' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${isToday ? 'text-marroc-esmeralda font-semibold' : 'text-marroc-salvia/80'}`}>
                        {format(day, 'd')}
                      </span>
                      {hasEvents && (
                        <span className="flex h-2 w-2 rounded-full bg-marroc-esmeralda" />
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {dayEvents.slice(0, 4).map((event, idx) => {
                        const type = getEventType(event.type);
                        return (
                          <div
                            key={idx}
                            className={`h-2 w-2 rounded-full ${type.color.split(' ')[0].replace('/20', '').replace('/15', '')}`}
                            title={`${event.title} · ${formatEventTime(event.scheduled_at)}`}
                          />
                        );
                      })}
                      {dayEvents.length > 4 && (
                        <span className="text-[9px] leading-none text-marroc-salvia/70 ml-0.5">+{dayEvents.length - 4}</span>
                      )}
                    </div>

                    {pendingEvents > 0 && (
                      <div className="absolute bottom-1 right-1.5 text-[9px] font-medium text-marroc-esmeralda/80">
                        {pendingEvents}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 glass-card border-marroc-dourado/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-display text-marroc-dourado">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-marroc-esmeralda hover:text-marroc-dourado"
                onClick={() => onAddEvent(selectedDate)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-marroc-salvia/50">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum evento nesta data</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-marroc-dourado/15"
                  onClick={() => onAddEvent(selectedDate)}
                >
                  Agendar evento
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {selectedDateEvents.map((event) => renderEventItem(event))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="p-4 glass-card border-marroc-dourado/10">
          <h3 className="text-sm font-display text-marroc-dourado mb-3">Próximos eventos</h3>
          {events.length === 0 ? (
            <div className="text-center py-12 text-marroc-salvia/50">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum evento agendado</p>
              <Button
                size="sm"
                className="mt-4 btn-marroc"
                onClick={() => onAddEvent()}
              >
                Agendar primeiro evento
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {events
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                .map((event) => renderEventItem(event))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
