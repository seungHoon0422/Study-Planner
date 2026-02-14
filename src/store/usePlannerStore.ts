import { create } from 'zustand';

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
  isCompleted: boolean;
  color: string;
  type: string;
}

export interface Feedback {
  date: string;
  mood: string;
  moodScore: number;
  content: string;
}

export interface MonthlyData {
  keyword: string;
  memo: string;
  personalFeedback: string;
  aiReport?: string;
}

interface PlannerState {
  tasks: Task[];
  feedbacks: Record<string, Feedback>;
  taskTypes: string[];
  defaultTaskType: string;
  monthlyData: Record<string, MonthlyData>;
  fetchTasksByDate: () => void;
  addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  fetchFeedback: () => void;
  saveFeedback: (feedback: Feedback) => void;
  getAverageMoodScore: (yearMonth: string) => number;
  addTaskType: (type: string) => void;
  deleteTaskType: (type: string) => void;
  setDefaultTaskType: (type: string) => void;
  updateTask: (task: Task) => void;
  updateMonthlyData: (yearMonth: string, data: Partial<MonthlyData>) => void;
}

const STORAGE_KEY_TASKS = 'study_planner_tasks';
const STORAGE_KEY_FEEDBACKS = 'study_planner_feedbacks';
const STORAGE_KEY_TYPES = 'study_planner_types';
const STORAGE_KEY_DEFAULT_TYPE = 'study_planner_default_type';
const STORAGE_KEY_MONTHLY = 'study_planner_monthly';

const getStoredTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEY_TASKS);
  return data ? JSON.parse(data) : [];
};

const getStoredFeedbacks = (): Record<string, Feedback> => {
  const data = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
  return data ? JSON.parse(data) : {};
};

const getStoredTypes = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEY_TYPES);
  return data ? JSON.parse(data) : ['공부', '운동', '독서', '휴식'];
};

const getStoredDefaultType = (): string => {
  return localStorage.getItem(STORAGE_KEY_DEFAULT_TYPE) || '공부';
};

const getStoredMonthly = (): Record<string, MonthlyData> => {
  const data = localStorage.getItem(STORAGE_KEY_MONTHLY);
  return data ? JSON.parse(data) : {};
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  tasks: getStoredTasks(),
  feedbacks: getStoredFeedbacks(),
  taskTypes: getStoredTypes(),
  defaultTaskType: getStoredDefaultType(),
  monthlyData: getStoredMonthly(),

  fetchTasksByDate: () => {
    const allTasks = getStoredTasks();
    set({ tasks: allTasks });
  },

  addTask: (taskData) => {
    const allTasks = getStoredTasks();
    const isDuplicate = allTasks.some(t => 
      t.date === taskData.date && 
      t.startTime === taskData.startTime && 
      t.title === taskData.title
    );
    if (isDuplicate) return { success: false, message: '이미 등록된 동일한 일정이 있습니다.' };

    const [h, m] = taskData.startTime.split(':').map(Number);
    const newStart = h * 60 + m;
    const hasConflict = allTasks.some(t => {
      if (t.date !== taskData.date) return false;
      const [th, tm] = t.startTime.split(':').map(Number);
      const ts = th * 60 + tm;
      return !(newStart + taskData.duration <= ts || ts + t.duration <= newStart);
    });

    if (hasConflict) {
      return { success: false, conflict: true, message: '시간이 겹치는 다른 일정이 있습니다.' };
    }

    const newTask: Task = {
      ...taskData,
      id: Date.now() + Math.random(),
      isCompleted: false,
    };
    
    const updatedTasks = [...allTasks, newTask];
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
    set({ tasks: updatedTasks });
    return { success: true };
  },

  toggleTask: (id: number) => {
    const allTasks = getStoredTasks();
    const updatedTasks = allTasks.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
    set({ tasks: updatedTasks });
  },

  deleteTask: (id: number) => {
    const allTasks = getStoredTasks();
    const updatedTasks = allTasks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
    set({ tasks: updatedTasks });
  },

  fetchFeedback: () => {
    const feedbacks = getStoredFeedbacks();
    set({ feedbacks });
  },

  saveFeedback: (feedback: Feedback) => {
    const feedbacks = getStoredFeedbacks();
    const updatedFeedbacks = { ...feedbacks, [feedback.date]: feedback };
    localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updatedFeedbacks));
    set({ feedbacks: updatedFeedbacks });
  },

  getAverageMoodScore: (yearMonth: string) => {
    const feedbacks = getStoredFeedbacks();
    const scores = Object.entries(feedbacks)
      .filter(([date]) => date.startsWith(yearMonth))
      .map(([_, f]) => f.moodScore || 0);
    
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  },

  addTaskType: (type: string) => {
    const currentTypes = get().taskTypes;
    if (currentTypes.includes(type)) return;
    const updatedTypes = [...currentTypes, type];
    localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(updatedTypes));
    set({ taskTypes: updatedTypes });
  },

  deleteTaskType: (type: string) => {
    const currentTypes = get().taskTypes;
    const updatedTypes = currentTypes.filter(t => t !== type);
    localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(updatedTypes));
    set({ taskTypes: updatedTypes });
  },

  setDefaultTaskType: (type: string) => {
    localStorage.setItem(STORAGE_KEY_DEFAULT_TYPE, type);
    set({ defaultTaskType: type });
  },

  updateTask: (updatedTask: Task) => {
    const allTasks = getStoredTasks();
    
    // 시간 겹침 검사 (자기 자신 제외)
    const [h, m] = updatedTask.startTime.split(':').map(Number);
    const newStart = h * 60 + m;
    const hasConflict = allTasks.some(t => {
      if (t.id === updatedTask.id || t.date !== updatedTask.date) return false;
      const [th, tm] = t.startTime.split(':').map(Number);
      const ts = th * 60 + tm;
      return !(newStart + updatedTask.duration <= ts || ts + t.duration <= newStart);
    });

    if (hasConflict) {
      return { success: false, conflict: true, message: '수정한 시간이 다른 일정과 겹칩니다.' };
    }

    const updatedTasks = allTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
    set({ tasks: updatedTasks });
    return { success: true };
  },

  updateMonthlyData: (yearMonth: string, data: Partial<MonthlyData>) => {
    const current = get().monthlyData;
    const existing = current[yearMonth] || { keyword: '', memo: '', personalFeedback: '' };
    const updated = { ...current, [yearMonth]: { ...existing, ...data } };
    localStorage.setItem(STORAGE_KEY_MONTHLY, JSON.stringify(updated));
    set({ monthlyData: updated });
  },
}));
