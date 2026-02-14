import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, TrendingUp, CheckCircle2, BarChart3, BrainCircuit, Edit3, Save, Sparkles, Trophy, AlertCircle, Quote } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';

interface MonthlyFeedbackProps {
  currentMonth: Date;
  onClose: () => void;
}

const MonthlyFeedback: React.FC<MonthlyFeedbackProps> = ({ currentMonth, onClose }) => {
  const yearMonth = format(currentMonth, 'yyyy-MM');
  const { tasks, monthlyData, updateMonthlyData, getAverageMoodScore } = usePlannerStore();
  const currentMonthly = monthlyData[yearMonth] || { keyword: '', memo: '', personalFeedback: '', aiReport: '' };

  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState(currentMonthly.personalFeedback);
  const [aiResponse, setAiResponse] = useState<string | null>(currentMonthly.aiReport || null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const monthTasks = tasks.filter(t => t.date.startsWith(yearMonth));
  const completedTasks = monthTasks.filter(t => t.isCompleted);
  const completionRate = monthTasks.length > 0 ? (completedTasks.length / monthTasks.length) * 100 : 0;
  const avgMood = getAverageMoodScore(yearMonth);

  const categoryStats = monthTasks.reduce((acc, task) => {
    const type = task.type || '미분류';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveFeedback = () => {
    updateMonthlyData(yearMonth, { personalFeedback: feedbackInput });
    setIsEditingFeedback(false);
  };

  const handleAiFeedback = async () => {
    setIsAiLoading(true);
    setTimeout(() => {
      let response = `🌟 ${format(currentMonth, 'M월')} 자갓 어드바이저의 뼈 때리는 분석 🌟\n\n`;
      
      if (completionRate >= 80) {
        response += `[인간 승리!] 야... 너 진짜 독하다? 달성률 ${completionRate.toFixed(1)}%라니! 🥳 이 정도면 거의 AI 아냐? \n`;
        response += `이번 달은 진짜 스스로 머리 쓰다듬어줘도 돼. 완전 갓생 살았잖아! 이 텐션 그대로 다음 달도 씹어 먹자고. 넌 할 수 있어, 아니 이미 해냈어! ✨🔥\n`;
      } else if (completionRate >= 50) {
        response += `[나쁘지 않은데?] ${completionRate.toFixed(1)}%... 음, 절반은 했네! 고생했어. 근데 나머지 절반은 어디 가서 간식 까먹고 있었어? 🧐 \n`;
        response += `너의 잠재력은 이게 끝이 아니잖아. '내일부터' 말고 '지금부터' 조금만 더 엉덩이 붙여보자. 다음 달엔 80% 찍고 나한테 자랑하러 와야 돼? 약속! 💪🔥\n`;
      } else {
        response += `[야, 정신 안 차려?!] 달성률 ${completionRate.toFixed(1)}%... 실화야? 우리 솔직해지자. 이번 달 공부보다 유튜브 쇼츠랑 더 친했지? 😤 \n`;
        response += `계획만 세우는 건 누구나 해. '지키는 것'이 진짜 네 실력이야. 너 이대로 포기할 거야? 아니지? 자, 침대에서 일어나서 당장 책상 앞으로 가! 내가 지켜보고 있다. 다시 가보자고! 👊🔥\n`;
      }

      if (Object.keys(categoryStats).length > 0) {
        const top = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
        response += `\n현재 "${top[0]}"에 몰빵 중인데, 밸런스 게임 아니니까 다른 것도 좀 챙기자? 😉`;
      }
      
      setAiResponse(response);
      updateMonthlyData(yearMonth, { aiReport: response });
      setIsAiLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(255,182,193,0.3)] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border-4 border-white transform animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
        <div className="bg-[#FFB6C1] p-8 flex justify-between items-center text-white shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Trophy size={120} /></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-[1.5rem]"><TrendingUp size={32} strokeWidth={3} /></div>
            <div>
              <h2 className="font-black text-4xl tracking-tighter">Monthly Report</h2>
              <p className="text-pink-50 font-bold text-sm opacity-80">{format(currentMonth, 'MMMM yyyy', { locale: ko })} 분석</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors relative z-10">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#FFFBFC] no-scrollbar">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-[#FFF0F3] flex flex-col items-center group hover:border-[#FFD1DC] transition-all">
              <div className="text-[#FFB6C1] mb-2 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
              <div className="text-3xl font-black text-[#FF9EAA] tracking-tighter">{avgMood.toFixed(1)}</div>
              <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Mood Avg</div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-[#FFF0F3] flex flex-col items-center group hover:border-[#FFD1DC] transition-all">
              <div className="text-[#FFB6C1] mb-2 group-hover:scale-110 transition-transform"><CheckCircle2 size={24} /></div>
              <div className="text-3xl font-black text-[#FF9EAA] tracking-tighter">{completionRate.toFixed(1)}%</div>
              <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Task Done</div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-[#FFF0F3] flex flex-col items-center group hover:border-[#FFD1DC] transition-all">
              <div className="text-[#FFB6C1] mb-2 group-hover:scale-110 transition-transform"><Trophy size={24} /></div>
              <div className="text-3xl font-black text-[#FF9EAA] tracking-tighter">{monthTasks.length}</div>
              <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Total Plans</div>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#FFD1DC] rounded-full" />
              Category Stats
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFF0F3] flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
                  <span className="text-[10px] font-black text-[#FFB6C1] uppercase tracking-widest">{category}</span>
                  <div className="w-[1px] h-3 bg-gray-100" />
                  <span className="text-sm font-black text-gray-700">{count}</span>
                </div>
              ))}
              {Object.keys(categoryStats).length === 0 && (
                <div className="w-full py-6 text-center bg-white/50 rounded-3xl border-2 border-dashed border-[#FFF0F3]">
                  <AlertCircle size={24} className="mx-auto text-gray-200 mb-1" />
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Data Found</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#FFD1DC] rounded-full" />
                Personal Note
              </h3>
              <button 
                onClick={isEditingFeedback ? handleSaveFeedback : () => setIsEditingFeedback(true)}
                className="bg-[#FFF0F3] text-[#FFB6C1] p-2.5 rounded-xl hover:bg-[#FF9EAA] hover:text-white transition-all shadow-sm active:scale-90"
              >
                {isEditingFeedback ? <Save size={18}/> : <Edit3 size={18}/>}
              </button>
            </div>
            <div className="relative group">
              {isEditingFeedback ? (
                <textarea
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  className="w-full h-40 p-6 bg-white border-4 border-[#FFD1DC] rounded-[2.5rem] outline-none text-gray-700 leading-relaxed font-bold shadow-2xl shadow-pink-100/50 animate-in zoom-in-95 transition-all"
                  placeholder="이번 달은 스스로에게 어떤 점수를 주고 싶나요?"
                  autoFocus
                />
              ) : (
                <div 
                  onClick={() => setIsEditingFeedback(true)}
                  className="w-full min-h-[8rem] p-6 bg-white border-2 border-[#FFF0F3] rounded-[2.5rem] text-gray-600 leading-relaxed font-bold cursor-pointer hover:border-[#FFD1DC] transition-all shadow-sm hover:shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-4 right-6 text-gray-50 opacity-20"><Quote size={48} /></div>
                  <p className="relative z-10 whitespace-pre-wrap text-sm">
                    {currentMonthly.personalFeedback || '이곳을 터치하여 이번 달의 성취와 아쉬움을 기록해보세요.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4 pb-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#FF9EAA] rounded-full" />
                AI Advisor
              </h3>
              <button 
                onClick={handleAiFeedback}
                disabled={isAiLoading}
                className="bg-[#FF9EAA] text-white px-5 py-2 rounded-xl font-black text-xs shadow-xl shadow-pink-100 hover:bg-[#FF8E9E] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 group"
              >
                {isAiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />}
                {isAiLoading ? 'Analyzing...' : 'AI 피드백 요청하기'}
              </button>
            </div>
            
            {aiResponse ? (
              <div className="p-8 bg-[#2D2D2D] text-white rounded-[2.5rem] leading-relaxed font-bold whitespace-pre-wrap shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                <div className="absolute top-0 left-0 w-2.5 h-full bg-[#FF9EAA]"></div>
                <div className="absolute top-4 right-8 opacity-10"><BrainCircuit size={60} /></div>
                <p className="relative z-10 text-pink-50/90 tracking-tight text-sm">{aiResponse}</p>
              </div>
            ) : (
              <div className="p-8 bg-[#FFF0F3] rounded-[2.5rem] border-2 border-dashed border-[#FFD1DC] text-center space-y-2">
                <BrainCircuit className="mx-auto text-[#FFB6C1]" size={32} />
                <p className="text-[#FF9EAA] font-black text-base">AI가 당신의 한 달을 분석할 준비가 되었습니다.</p>
                <p className="text-gray-400 text-xs font-bold">위 버튼을 눌러 피드백을 받아보세요.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFeedback;
