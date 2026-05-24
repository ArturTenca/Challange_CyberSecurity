import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChallengeType } from '../constants/challenges';

interface ChallengeStore {
  // State
  selectedChallenge: ChallengeType | null;
  completedTutorial: boolean;
  userProgress: {
    challengeId: ChallengeType;
    completedFeatures: string[];
    score: number;
    lastUpdated: number;
  }[];

  // Actions
  setSelectedChallenge: (challenge: ChallengeType) => void;
  setCompletedTutorial: (completed: boolean) => void;
  addCompletedFeature: (challengeId: ChallengeType, feature: string) => void;
  updateScore: (challengeId: ChallengeType, points: number) => void;
  resetProgress: () => void;
}

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set) => ({
      selectedChallenge: null,
      completedTutorial: false,
      userProgress: [],

      setSelectedChallenge: (challenge) =>
        set({ selectedChallenge: challenge }),

      setCompletedTutorial: (completed) =>
        set({ completedTutorial: completed }),

      addCompletedFeature: (challengeId, feature) =>
        set((state) => {
          const existingProgress = state.userProgress.find(
            (p) => p.challengeId === challengeId
          );

          if (existingProgress) {
            if (!existingProgress.completedFeatures.includes(feature)) {
              existingProgress.completedFeatures.push(feature);
            }
            existingProgress.lastUpdated = Date.now();
          } else {
            state.userProgress.push({
              challengeId,
              completedFeatures: [feature],
              score: 0,
              lastUpdated: Date.now(),
            });
          }

          return { userProgress: [...state.userProgress] };
        }),

      updateScore: (challengeId, points) =>
        set((state) => {
          const progress = state.userProgress.find(
            (p) => p.challengeId === challengeId
          );

          if (progress) {
            progress.score += points;
            progress.lastUpdated = Date.now();
          } else {
            state.userProgress.push({
              challengeId,
              completedFeatures: [],
              score: points,
              lastUpdated: Date.now(),
            });
          }

          return { userProgress: [...state.userProgress] };
        }),

      resetProgress: () =>
        set({
          selectedChallenge: null,
          userProgress: [],
          completedTutorial: false,
        }),
    }),
    {
      name: 'challenge-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
