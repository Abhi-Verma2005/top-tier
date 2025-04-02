import { create } from "zustand";

interface FocusState {
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
}

const useFocusStore = create<FocusState>((set) => ({
  isFocused: false,
  setIsFocused: (value) => set({ isFocused: value }),
}));

export default useFocusStore;

