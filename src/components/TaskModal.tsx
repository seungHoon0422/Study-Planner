import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import type { Task } from '../store/usePlannerStore';

interface TaskModalProps {
  date: Date;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  editTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ date, onClose, onShowToast, editTask }) => {
  const { addTask, updateTask, taskTypes, addTaskType, defaultTaskType, setDefaultTaskType, deleteTaskType } = usePlannerStore();
  const [title, setTitle] = useState(editTask ? editTask.title.replace(/\[.*?\]\s*/, '') : '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [startTime, setStartTime] = useState(editTask?.startTime || '18:00');
  const [duration, setDuration] = useState(editTask?.duration || 60);
  const [selectedColor, setSelectedColor] = useState(editTask?.color || '#FEE2E2');
  const [selectedType, setSelectedType] = useState(editTask?.type || defaultTaskType);
  const [newTypeName, setNewTypeName] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ active: boolean; message: string; payload: any } | null>(null);

  const pastelColors = [
    '#FEE2E2',
    '#FFEDD5',
    '#FEF9C3',
    '#DCFCE7',
    '#DBEAFE',
    '#E0E7FF',
    '#F3E8FF',
    '#FAE8FF',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const taskPayload = {
      title: title.startsWith('[') ? title : `[${selectedType}] ${title}`,
      description,
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      duration,
      color: selectedColor,
      type: selectedType,
    };

    const result = editTask 
      ? updateTask({ ...taskPayload, id: editTask.id, isCompleted: editTask.isCompleted })
      : addTask(taskPayload) as any;

    if (!result.success) {
      if (result.conflict) {
        setShowConfirm({ 
          active: true, 
          message: result.message, 
          payload: taskPayload 
        });
        return;
      }
      onShowToast(result.message, 'error');
      return;
    }

    onShowToast(editTask ? '일정이 수정되었습니다!' : '일정이 성공적으로 등록되었습니다!');
    onClose();
  };

  const handleForceSubmit = () => {
    if (!showConfirm) return;
    
    const allTasks = usePlannerStore.getState().tasks;
    const newTask = { ...showConfirm.payload, id: Date.now() + Math.random(), isCompleted: false };
    
    localStorage.setItem('study_planner_tasks', JSON.stringify([...allTasks, newTask]));
    usePlannerStore.setState({ tasks: [...allTasks, newTask] });
    
    onShowToast('일정이 중복 등록되었습니다.');
    onClose();
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    addTaskType(newTypeName.trim());
    setSelectedType(newTypeName.trim());
    setNewTypeName('');
    setIsAddingType(false);
    onShowToast('새로운 카테고리가 추가되었습니다!');
  };

  const handleSetDefaultType = (type: string) => {
    setDefaultTaskType(type);
    onShowToast(`기본 카테고리가 "${type}"으로 변경되었습니다.`);
  };

  const durationOptions = [
    { label: '30분', value: 30 },
    { label: '1시간', value: 60 },
    { label: '1시간 30분', value: 90 },
    { label: '2시간', value: 120 },
    { label: '2시간 30분', value: 150 },
    { label: '3시간', value: 180 },
    { label: '3시간 30분', value: 210 },
    { label: '4시간', value: 240 },
  ];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return {
      value: `${hours.toString().padStart(2, '0')}:${minutes}`,
      label: `${period} ${displayHours}:${minutes}`
    };
  });

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-white transition-all transform animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FFB6C1] p-8 flex justify-between items-center text-white">
          <h2 className="font-extrabold text-3xl tracking-tight">
            {editTask ? '과제 수정' : '과제 등록'}
          </h2>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-[#FFFBFC] max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-base font-bold text-[#FFB6C1] ml-1">카테고리</label>
              <div className="flex gap-2">
                {!isAddingType && (
                  <button 
                    type="button" 
                    onClick={() => handleSetDefaultType(selectedType)}
                    className="text-[10px] font-bold text-[#FFB6C1] hover:text-[#FF9EAA]"
                  >
                    {defaultTaskType === selectedType ? '★ 기본값' : '기본값 설정'}
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsAddingType(!isAddingType)}
                  className="text-xs font-bold text-[#FF9EAA] hover:underline"
                >
                  {isAddingType ? '취소' : '+ 신규 추가'}
                </button>
              </div>
            </div>

            {isAddingType ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#FFD1DC] rounded-xl outline-none text-[#FF9EAA] font-bold"
                  placeholder="카테고리명 입력"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddType}
                  className="px-6 bg-[#FFB6C1] text-white rounded-xl font-bold hover:bg-[#FF9EAA]"
                >
                  추가
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFB6C1] focus:ring-0 outline-none appearance-none cursor-pointer font-bold text-[#FF9EAA] transition-all"
                  >
                    {taskTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFB6C1]">
                    <ChevronRight className="rotate-90" size={18} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onShowToast(`"${selectedType}" 카테고리를 삭제했습니다.`, 'success');
                    deleteTaskType(selectedType);
                    const remaining = taskTypes.filter(t => t !== selectedType);
                    setSelectedType(remaining[0] || '');
                  }}
                  className="px-4 bg-white border-2 border-red-50 rounded-2xl text-red-300 hover:text-red-400 hover:border-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-base font-bold text-[#FFB6C1] ml-1">제목</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-5 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFB6C1] focus:ring-0 outline-none transition-all placeholder:text-gray-200 text-lg font-bold text-[#FF9EAA]"
              placeholder="무엇을 공부하실 건가요?"
            />
          </div>
          <div className="space-y-3">
            <label className="text-base font-bold text-[#FFB6C1] ml-1">상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-6 py-5 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFB6C1] focus:ring-0 outline-none h-32 resize-none transition-all placeholder:text-gray-200 text-base leading-relaxed"
              placeholder="자세한 내용을 적어주세요 (선택 사항)"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-base font-bold text-[#FFB6C1] ml-1">시작 시간</label>
              <div className="relative group">
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-6 py-5 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFB6C1] focus:ring-0 outline-none appearance-none cursor-pointer font-extrabold text-[#FF9EAA] text-lg transition-all"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFB6C1] group-hover:text-[#FF9EAA] transition-colors">
                  <ChevronRight className="rotate-90" size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-base font-bold text-[#FFB6C1] ml-1">소요 시간</label>
              <div className="relative group">
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-6 py-5 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem] focus:border-[#FFB6C1] focus:ring-0 outline-none appearance-none cursor-pointer font-extrabold text-[#FF9EAA] text-lg transition-all"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFB6C1] group-hover:text-[#FF9EAA] transition-colors">
                  <ChevronRight className="rotate-90" size={24} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-base font-bold text-[#FFB6C1] ml-1">테마 색상</label>
            <div className="flex flex-wrap gap-3 p-4 bg-white border-2 border-[#FFF0F3] rounded-[1.5rem]">
              {pastelColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 active:scale-95 border-2 ${
                    selectedColor === color ? 'border-[#FF9EAA] scale-110 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF9EAA] hover:bg-[#FF8E9E] text-white font-black py-6 rounded-[2rem] shadow-xl shadow-pink-100 transition-all transform active:scale-[0.97] text-xl mt-6 flex items-center justify-center gap-2"
          >
            {editTask ? '플랜 수정하기' : '플랜 등록하기'}
          </button>
        </form>
      </div>

      {/* 커스텀 컨펌 모달 */}
      {showConfirm?.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full border-4 border-[#FFD1DC] text-center space-y-6">
            <div className="w-16 h-16 bg-[#FFF0F3] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-[#FF9EAA]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-800">시간 중복 경고</h3>
              <p className="text-sm font-bold text-gray-400 leading-relaxed">
                {showConfirm.message}<br/>그래도 등록하시겠습니까?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleForceSubmit}
                className="flex-1 py-3 rounded-xl font-bold bg-[#FF9EAA] text-white hover:bg-[#FF8E9E] shadow-lg shadow-pink-100 transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModal;
