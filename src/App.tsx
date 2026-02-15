import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  startOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Sparkles, StickyNote, Target, BarChart3, Quote, CheckCircle2, Edit3, Save, X,
  Download, Upload
} from 'lucide-react';
import { usePlannerStore } from './store/usePlannerStore';
import DayModal from './components/DayModal';
import TaskModal from './components/TaskModal';
import MonthlyFeedback from './components/MonthlyFeedback';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const yearMonth = format(currentMonth, 'yyyy-MM');
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isMonthlyFeedbackOpen, setIsMonthlyFeedbackOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const { tasks, feedbacks, monthlyData, updateMonthlyData } = usePlannerStore();
  const currentMonthly = monthlyData[yearMonth] || { keyword: '', memo: '', personalFeedback: '' };

  const [keywordInput, setKeywordInput] = useState(currentMonthly.keyword);
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);
  const [memoInput, setMemoInput] = useState(currentMonthly.memo);
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  useEffect(() => {
    setKeywordInput(currentMonthly.keyword);
    setMemoInput(currentMonthly.memo);
  }, [yearMonth, monthlyData]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const rowCount = Math.ceil(calendarDays.length / 7);

  const nextMonth = () => {
    if (isScrolling) return;
    setDirection('up');
    setCurrentMonth(addMonths(currentMonth, 1));
    setTimeout(() => setDirection(null), 500);
  };
  const prevMonth = () => {
    if (isScrolling) return;
    setDirection('down');
    setCurrentMonth(subMonths(currentMonth, 1));
    setTimeout(() => setDirection(null), 500);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling || isTaskModalOpen || isDayModalOpen || isMonthlyFeedbackOpen) return;
    
    if (Math.abs(e.deltaY) < 15) return;

    if (e.deltaY > 0) {
      setIsScrolling(true);
      nextMonth();
      setTimeout(() => setIsScrolling(false), 800);
    } else {
      setIsScrolling(true);
      prevMonth();
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  const handleAddTaskClick = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    setSelectedDate(day);
    setIsTaskModalOpen(true);
  };

  const handleKeywordSubmit = () => {
    updateMonthlyData(yearMonth, { keyword: keywordInput });
    setIsEditingKeyword(false);
    showToast('이달의 키워드가 저장되었습니다!');
  };

  const handleMemoSave = () => {
    updateMonthlyData(yearMonth, { memo: memoInput });
    setIsEditingMemo(false);
    showToast('메모가 저장되었습니다!');
  };

  const exportData = () => {
    const data = {
      tasks: localStorage.getItem('study_planner_tasks'),
      feedbacks: localStorage.getItem('study_planner_feedbacks'),
      types: localStorage.getItem('study_planner_types'),
      defaultType: localStorage.getItem('study_planner_default_type'),
      monthly: localStorage.getItem('study_planner_monthly'),
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-planner-backup-${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('데이터 백업 파일이 다운로드되었습니다.');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) localStorage.setItem('study_planner_tasks', data.tasks);
        if (data.feedbacks) localStorage.setItem('study_planner_feedbacks', data.feedbacks);
        if (data.types) localStorage.setItem('study_planner_types', data.types);
        if (data.defaultType) localStorage.setItem('study_planner_default_type', data.defaultType);
        if (data.monthly) localStorage.setItem('study_planner_monthly', data.monthly);
        
        showToast('데이터 복구가 완료되었습니다! 페이지를 새로고침합니다.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast('올바르지 않은 백업 파일입니다.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#FFF5F7] text-gray-800 p-2 md:p-4 flex flex-col font-sans overflow-hidden select-none"
      style={{ fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif" }}
      onWheel={handleWheel}
    >
      <div className="max-w-[1800px] mx-auto w-full flex flex-1 min-h-0 gap-0 relative">
        <div className="flex-1 flex flex-col min-h-0 space-y-3 transition-all duration-500">
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] shadow-sm border border-white/50 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFB6C1] rounded-2xl text-white shadow-lg shadow-pink-100">
                  <CalendarIcon size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-[#FF9EAA] tracking-tighter flex items-baseline gap-1">
                  {format(currentMonth, 'M월', { locale: ko })}
                  <span className="text-sm font-bold text-[#FFB6C1] opacity-70 ml-1">{format(currentMonth, 'yyyy')}</span>
                </h1>
              </div>

              <div className="h-8 w-[2px] bg-[#FFD1DC]/30 mx-2" />

              <div className="relative group">
                {isEditingKeyword ? (
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onBlur={handleKeywordSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleKeywordSubmit()}
                    className="text-sm px-4 py-2 bg-white border-2 border-[#FF9EAA] rounded-full outline-none text-[#FF8E9E] font-black w-64 animate-in zoom-in-95 placeholder:text-gray-200 shadow-lg shadow-pink-100/50"
                    placeholder="이번 달의 한줄 목표"
                    autoFocus
                  />
                ) : (
                  <button 
                    onClick={() => setIsEditingKeyword(true)}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-[#FFB6C1] to-[#FF9EAA] px-5 py-2 rounded-full text-white font-black hover:shadow-lg hover:shadow-pink-200 transition-all border border-white/50 group"
                  >
                    <Quote size={14} className="fill-white/30" />
                    <span className="max-w-[200px] truncate drop-shadow-sm">{currentMonthly.keyword || '한줄 키워드 설정'}</span>
                    <Sparkles size={12} className="animate-pulse opacity-50" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsMonthlyFeedbackOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#FFD1DC] rounded-2xl hover:bg-[#FFD1DC] hover:text-white transition-all text-[#FF9EAA] font-black shadow-sm active:scale-95 group"
              >
                <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />
                월간 리포트
              </button>
              
              <button 
                onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all font-black shadow-sm active:scale-95 border-2 ${
                  isSideBarOpen ? 'bg-[#FF9EAA] border-[#FF9EAA] text-white' : 'bg-white border-[#FFD1DC] text-[#FF9EAA]'
                }`}
              >
                <StickyNote size={18} />
                메모
              </button>

              <div className="flex items-center bg-white border-2 border-[#FFD1DC] rounded-2xl overflow-hidden shadow-sm">
                <button onClick={prevMonth} className="p-2.5 hover:bg-[#FFF5F7] transition-colors text-[#FF9EAA]">
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <div className="w-[2px] h-6 bg-[#FFD1DC]/20"></div>
                <button onClick={nextMonth} className="p-2.5 hover:bg-[#FFF5F7] transition-colors text-[#FF9EAA]">
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-[2.5rem] shadow-2xl border border-white/50 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="grid grid-cols-7 gap-1 mb-2 shrink-0 px-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div key={day} className={`text-center font-black py-2 text-xs uppercase tracking-widest ${i === 0 ? 'text-[#FF8E9E]' : i === 6 ? 'text-[#A0C4FF]' : 'text-[#FFD1DC]'}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="flex-1 min-h-0 relative px-1 pb-1">
              <div 
                key={currentMonth.toISOString()}
                className="grid grid-cols-7 gap-2 h-full transition-all duration-500 ease-out transform"
                style={{
                  gridTemplateRows: `repeat(${rowCount}, 1fr)`,
                  animation: direction === 'up' ? 'slide-in-from-bottom 0.5s ease-out' : direction === 'down' ? 'slide-in-from-top 0.5s ease-out' : 'none'
                }}
              >
                {calendarDays.map((day, idx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayTasks = tasks
                    .filter(t => t.date === dateStr)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const dayOfWeek = getDay(day);
                  const feedback = feedbacks[dateStr];
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className={`group p-3 rounded-[1.8rem] transition-all cursor-pointer flex flex-col border-2 relative overflow-hidden h-full min-h-0
                        ${isCurrentMonth ? 'bg-white border-[#FFF0F3]' : 'bg-white/30 border-transparent opacity-40'}
                        ${isSameDay(day, new Date()) ? 'ring-2 ring-[#FFB6C1] ring-offset-2 z-10 shadow-lg' : 'z-0 shadow-sm'}
                        hover:scale-[1.03] hover:shadow-pink-200/50 hover:shadow-2xl hover:border-[#FFD1DC] hover:z-20
                      `}
                    >
                      <div className="flex justify-between items-start mb-1 shrink-0">
                        <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-colors
                          ${isSameDay(day, new Date()) ? 'bg-[#FF9EAA] text-white shadow-md shadow-pink-100' : 
                            dayOfWeek === 0 ? 'text-[#FF8E9E]' : 
                            dayOfWeek === 6 ? 'text-[#A0C4FF]' : 'text-gray-400 group-hover:text-[#FF9EAA]'}
                        `}>
                          {format(day, 'd')}
                        </span>
                        <button
                          onClick={(e) => handleAddTaskClick(e, day)}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-[#FFF0F3] text-[#FF9EAA] rounded-lg hover:bg-[#FFB6C1] hover:text-white transition-all transform active:scale-90"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-start space-y-0.5 overflow-hidden min-h-0 pt-0.5">
                        {dayTasks.slice(0, 6).map(task => (
                          <div 
                            key={task.id} 
                            className={`text-[9px] md:text-[10px] truncate px-1.5 py-0.5 rounded-lg font-bold border border-black/5 shadow-sm transition-all
                              ${task.isCompleted ? 'opacity-100' : 'opacity-100 hover:translate-x-1'}`}
                            style={{ 
                              backgroundColor: task.color || '#FDF2F4', 
                              color: '#374151' 
                            }}
                          >
                            <span className={task.isCompleted ? 'line-through decoration-black/30 decoration-1' : ''}>
                              {task.title.replace(/\[.*?\]\s*/, '')} <span className="opacity-50 text-[8px] font-medium">[{task.type}]</span> <span className="opacity-40 text-[8px]">{task.startTime}</span>
                            </span>
                          </div>
                        ))}
                        {dayTasks.length > 6 && (
                          <div className="text-[8px] text-[#FFB6C1] font-black pl-1">
                            + {dayTasks.length - 6} items
                          </div>
                        )}
                      </div>

                      {feedback?.moodScore && (
                        <div className="absolute bottom-2 right-3">
                          <div className="text-[10px] font-black text-[#FFB6C1]/50 bg-white/80 px-2 rounded-full border border-[#FFF0F3] shadow-sm italic">Score {feedback.moodScore}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`absolute top-0 right-0 h-full w-80 z-50 transition-all duration-500 ease-in-out transform ${
            isSideBarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none opacity-0'
          }`}
        >
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-l-[2.5rem] shadow-2xl border-l border-white/50 h-full flex flex-col group">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-[#FF9EAA] flex items-center gap-3">
                <div className="p-2 bg-[#FFF0F3] rounded-xl"><StickyNote size={20} className="text-[#FFB6C1]" /></div>
                Month Note
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={isEditingMemo ? handleMemoSave : () => setIsEditingMemo(true)}
                  className="p-2 bg-[#FFF0F3] text-[#FFB6C1] rounded-xl hover:bg-[#FF9EAA] hover:text-white transition-all shadow-sm active:scale-90"
                >
                  {isEditingMemo ? <Save size={18} /> : <Edit3 size={18} />}
                </button>
                <button 
                  onClick={() => setIsSideBarOpen(false)}
                  className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col relative">
              {isEditingMemo ? (
                <textarea
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                  className="flex-1 w-full p-6 bg-white border-4 border-[#FFD1DC] rounded-[2rem] outline-none resize-none text-sm leading-relaxed text-gray-700 font-bold transition-all shadow-inner animate-in zoom-in-95"
                  placeholder="이번 달의 다짐을 남겨보세요."
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => setIsEditingMemo(true)}
                  className="flex-1 w-full p-6 bg-[#FFFBFC] border-2 border-[#FFF0F3] rounded-[2rem] text-sm leading-relaxed text-gray-600 font-bold cursor-pointer hover:border-[#FFD1DC] transition-all relative overflow-hidden group/memo"
                >
                  <div className="absolute top-4 right-4 text-[#FFD1DC] opacity-20"><Quote size={32} /></div>
                  <p className="whitespace-pre-wrap text-sm">
                    {currentMonthly.memo || '이번 달의 다짐을 남겨보세요.'}
                  </p>
                  <div className="absolute inset-0 bg-[#FF9EAA]/5 opacity-0 group-hover/memo:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-[#FF9EAA] bg-white px-3 py-1 rounded-full shadow-sm">클릭하여 수정</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="h-[2px] bg-[#FFF0F3] w-full rounded-full" />
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Data Management</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={exportData}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-[#FFD1DC] rounded-xl text-[#FF9EAA] font-bold text-xs hover:bg-[#FFF0F3] transition-all"
                  >
                    <Download size={14} />
                    백업
                  </button>
                  <label className="flex items-center justify-center gap-2 py-3 bg-white border border-[#FFD1DC] rounded-xl text-[#FF9EAA] font-bold text-xs hover:bg-[#FFF0F3] transition-all cursor-pointer">
                    <Upload size={14} />
                    복구
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/50 p-4 rounded-2xl border border-[#FFF0F3] flex items-center justify-between transition-all hover:bg-white hover:shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 rounded-lg text-[#FFB6C1] group-hover:scale-110 transition-transform"><CheckCircle2 size={16} /></div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Completion</span>
                  </div>
                  <span className="text-xl font-black text-[#FF9EAA]">
                    {tasks.filter(t => t.date.startsWith(yearMonth)).length > 0 
                      ? Math.round((tasks.filter(t => t.date.startsWith(yearMonth) && t.isCompleted).length / tasks.filter(t => t.date.startsWith(yearMonth)).length) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-[#FFF0F3] flex items-center justify-between transition-all hover:bg-white hover:shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-[#A0C4FF] group-hover:scale-110 transition-transform"><Target size={16} /></div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Active Tasks</span>
                  </div>
                  <span className="text-xl font-black text-gray-700">
                    {tasks.filter(t => t.date.startsWith(yearMonth) && !t.isCompleted).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTaskModalOpen && selectedDate && (
        <TaskModal date={selectedDate} onClose={() => setIsTaskModalOpen(false)} onShowToast={showToast} />
      )}
      {isDayModalOpen && selectedDate && (
        <DayModal date={selectedDate} onClose={() => setIsDayModalOpen(false)} onShowToast={showToast} />
      )}
      {isMonthlyFeedbackOpen && (
        <MonthlyFeedback currentMonth={currentMonth} onClose={() => setIsMonthlyFeedbackOpen(false)} />
      )}

      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border-2 border-white/50 flex items-center gap-4 transition-all animate-in slide-in-from-bottom-5
          ${toast.type === 'success' ? 'bg-[#FFB6C1] text-white' : 'bg-red-400 text-white'}`}>
          <Sparkles size={20} className="animate-pulse" />
          <span className="font-black tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
