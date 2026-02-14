import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import DayModal from './DayModal';
import TaskModal from './TaskModal';
import MonthlyFeedback from './MonthlyFeedback';

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isMonthlyFeedbackOpen, setIsMonthlyFeedbackOpen] = useState(false);
  
  const tasks = usePlannerStore((state) => state.tasks);
  const fetchTasksByDate = usePlannerStore((state) => state.fetchTasksByDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  useEffect(() => {
    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
    calendarDays.forEach(day => {
      fetchTasksByDate(format(day, 'yyyy-MM-dd'));
    });
  }, [currentMonth, fetchTasksByDate, startDate, endDate]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  const handleAddTaskClick = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    setSelectedDate(day);
    setIsTaskModalOpen(true);
  };

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="flex flex-col h-full bg-[#FFF5F7] text-gray-800 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#FF9EAA] flex items-center gap-2">
          <CalendarIcon size={32} />
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsMonthlyFeedbackOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#FFD1DC] rounded-xl hover:bg-[#FFD1DC] transition-colors text-[#FF9EAA] font-semibold"
          >
            <TrendingUp size={20} />
            Monthly Review
          </button>
          <div className="flex items-center bg-white border border-[#FFD1DC] rounded-xl overflow-hidden">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-[#FFD1DC] transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-[1px] h-6 bg-[#FFD1DC]"></div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-[#FFD1DC] transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-[#FF9EAA] py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`min-h-[100px] p-2 border border-[#FFD1DC] rounded-lg transition-all cursor-pointer flex flex-col
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                hover:shadow-md hover:border-[#FFB6C1]
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-[#FFB6C1] text-white px-2 py-0.5 rounded-full' : ''}`}>
                  {format(day, 'd')}
                </span>
                <button
                  onClick={(e) => handleAddTaskClick(e, day)}
                  className="p-1 text-[#FF9EAA] hover:bg-[#FFD1DC] rounded transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    className="text-[10px] truncate px-1.5 py-0.5 bg-[#E6E6FA] rounded text-gray-700"
                  >
                    {task.startTime} {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-gray-400 pl-1">
                    + {dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isTaskModalOpen && selectedDate && (
        <TaskModal 
          date={selectedDate} 
          onClose={() => setIsTaskModalOpen(false)} 
        />
      )}
      
      {isDayModalOpen && selectedDate && (
        <DayModal 
          date={selectedDate} 
          onClose={() => setIsDayModalOpen(false)} 
        />
      )}

      {isMonthlyFeedbackOpen && (
        <MonthlyFeedback
          currentMonth={currentMonth}
          onClose={() => setIsMonthlyFeedbackOpen(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
