import { create } from "zustand";
import type {
  UserInput,
  LayoutSkeleton,
  GenerationResult,
} from "@/lib/types";

// ------------------------------------------------------------------ Interface

export interface LandingStore {
  // ---- State
  userInput: UserInput;
  selectedSkeleton: LayoutSkeleton | null;
  temperature: number;
  generationResult: GenerationResult | null;

  // ---- Actions
  setUserInput: (input: Partial<UserInput>) => void;
  setSkeleton: (skeleton: LayoutSkeleton) => void;
  setTemperature: (temp: number) => void;
  resetGeneration: () => void;
  setGenerationResult: (result: Partial<GenerationResult>) => void;
  reset: () => void;
}

// --------------------------------------------------------------- Initial state

const initialUserInput: UserInput = {
  productName: "",
  description: "",
  targetAudience: "",
  sellingPoints: [],
};

const initialState = {
  userInput: initialUserInput,
  selectedSkeleton: null as LayoutSkeleton | null,
  temperature: 0.7,
  generationResult: null as GenerationResult | null,
};

// --------------------------------------------------------------------- Store

export const useLandingStore = create<LandingStore>()((set) => ({
  ...initialState,

  setUserInput: (input) =>
    set((s) => ({ userInput: { ...s.userInput, ...input } })),

  setSkeleton: (skeleton) => set({ selectedSkeleton: skeleton }),

  setTemperature: (temp) => set({ temperature: temp }),

  resetGeneration: () => set({ generationResult: null }),

  setGenerationResult: (result) => set((s) => ({ generationResult: { ...s.generationResult, ...result } as GenerationResult })),

  reset: () => set(initialState),
}));
