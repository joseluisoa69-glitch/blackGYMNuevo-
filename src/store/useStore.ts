import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeWorkout: { id: number; startTime: Date; routineName?: string; diaNombre?: string } | null;
  setActiveWorkout: (workout: AppState["activeWorkout"]) => void;
  selectedMuscle: string | null;
  setSelectedMuscle: (muscle: string | null) => void;
  muscleView: "front" | "back";
  setMuscleView: (view: "front" | "back") => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeWorkout: null,
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
  selectedMuscle: null,
  setSelectedMuscle: (muscle) => set({ selectedMuscle: muscle }),
  muscleView: "front",
  setMuscleView: (view) => set({ muscleView: view }),
}));
