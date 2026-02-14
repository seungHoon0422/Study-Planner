import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, CheckCircle2, Circle, Trash2, Heart } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import type { Task } from '../store/usePlannerStore';
import TaskModal from './TaskModal';

interface DayModalProps {
  date: Date;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

const DayModal: React.FC<DayModalProps> = ({ date, onClose, onShowToast }) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { tasks, feedbacks, toggleTask, deleteTask, saveFeedback, fetchFeedback } = usePlannerStore();
  const dayTasks = tasks.filter((t) => t.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const feedback = feedbacks[dateStr];

  const [moodScore, setMoodScore] = useState(feedback?.moodScore || 5);
  const [content, setContent] = useState(feedback?.content || '');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchFeedback();
    
    if (dayTasks.length > 0) {
      const timelineElement = document.getElementById('timeline-container');
      if (timelineElement) {
        const [hours, minutes] = dayTasks[0].startTime.split(':').map(Number);
        const scrollPosition = (hours * 60 + minutes) * 1.5 - 20; 
        timelineElement.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }
  }, [fetchFeedback]);

  const handleSaveFeedback = () => {
    saveFeedback({ 
      date: dateStr, 
      mood: moodScore > 7 ? 'Happy' : moodScore > 4 ? 'Neutral' : 'Sad', 
      moodScore, 
      content 
    });
    onShowToast('오늘의 기록이 저장되었습니다. 고생하셨어요!');
  };

  const getTaskPosition = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const startOffset = startMinutes * 1.5;
    const height = duration * 1.5;
    return { top: `${startOffset}px`, height: `${height}px` };
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div 
      className="fixed inset-0 bg-pink-100/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border-4 border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FFB6C1] p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="font-extrabold text-2xl tracking-tight">
              {format(date, 'M월 d일 eeee', { locale: ko })}
            </h2>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 border-r-2 border-[#FFF0F3] flex flex-col overflow-hidden bg-[#FFFBFC]">
            <div className="p-5 border-b-2 border-[#FFF0F3] bg-white">
              <h3 className="font-bold text-[#FF9EAA]">Daily Timeline</h3>
            </div>
            <div id="timeline-container" className="flex-1 overflow-y-auto p-6 relative">
              <div className="relative" style={{ height: '2160px' }}>
                {hours.map((h) => (
                  <div key={h} className="absolute w-full border-t-2 border-[#FFF0F3] flex items-start" style={{ top: `${h * 90}px`, height: '90px' }}>
                    <span className="text-[11px] font-bold text-[#FFB6C1] -mt-2.5 pr-3 w-12 text-right">
                      {h.toString().padStart(2, '0')}:00
                    </span>
                    <div className="flex-1 border-t border-dashed border-[#FFD1DC]/40 mt-[45px]"></div>
                  </div>
                ))}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setEditingTask(task)}
                    className={`absolute left-16 right-4 rounded-2xl p-3 shadow-md transition-all border-2 cursor-pointer
                      ${task.isCompleted ? 'opacity-40 border-transparent' : 'border-black/5'}
                    `}
                    style={{ 
                      ...getTaskPosition(task.startTime, task.duration),
                      backgroundColor: task.color || 'white'
                    }}
                  >
                    <div className="flex justify-between items-center h-full">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className={`font-extrabold text-gray-800 text-base truncate ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }} 
                          className={`p-1 rounded-full transition-all ${task.isCompleted ? 'bg-green-100 text-green-500' : 'bg-white/50 text-gray-700 hover:scale-110 shadow-sm'}`}
                        >
                          {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }} 
                          className="p-1 rounded-full bg-white/50 text-gray-300 hover:text-red-400 transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-80 md:w-96 flex flex-col p-8 space-y-8 overflow-y-auto bg-white">
            <section className="space-y-6">
              <h3 className="text-xl font-extrabold text-[#FF9EAA] flex items-center gap-2">
                <Heart className="fill-[#FFB6C1] text-[#FFB6C1]" />
                데일리 피드백
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-[#FFB6C1]">오늘의 만족도</label>
                  <span className="text-3xl font-black text-[#FF9EAA]">{moodScore}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full h-3 bg-[#FFF0F3] rounded-full appearance-none cursor-pointer accent-[#FF9EAA]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#FFD1DC]">
                  <span>시작이 반!</span>
                  <span>보통이에요</span>
                  <span>최고의 하루!</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#FFB6C1]">오늘의 한 줄 기록</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="오늘 무엇을 배웠나요? 스스로를 칭찬해 주세요!"
                  className="w-full h-48 p-4 bg-[#FFFBFC] border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFD1DC] focus:ring-0 outline-none resize-none text-sm leading-relaxed"
                />
              </div>

              <button
                onClick={handleSaveFeedback}
                className="w-full bg-[#FF9EAA] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-100 hover:bg-[#FF8E9E] transition-all active:scale-95"
              >
                피드백 저장하기
              </button>
            </section>

            <section className="pt-8 border-t-2 border-[#FFF0F3]">
              <h3 className="font-extrabold text-gray-800 mb-4">오늘의 달성 항목</h3>
              <div className="space-y-3">
                {dayTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 bg-[#FFFBFC] p-3 rounded-xl border border-[#FFF0F3]">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${t.isCompleted ? 'bg-green-400' : 'bg-[#FFD1DC]'}`}></div>
                    <span className={`text-sm font-bold ${t.isCompleted ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">등록된 일정이 없어요</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {editingTask && (
        <TaskModal 
          date={date} 
          onClose={() => setEditingTask(null)} 
          onShowToast={onShowToast}
          editTask={editingTask}
        />
      )}
    </div>
  );
};

export default DayModal;
