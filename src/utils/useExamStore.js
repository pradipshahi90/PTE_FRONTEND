import { create } from 'zustand';

const useExamStore = create((set) => ({
    currentExam: null,

    setCurrentExam: (exam) => set({ currentExam: exam }),

    clearExam: () => set({ currentExam: null }),
}));

export default useExamStore;
