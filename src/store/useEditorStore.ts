import { create } from 'zustand';
import { InterlinearPair, InterlinearContent } from '@/types';

interface EditorState {
    pairs: InterlinearPair[];
    metadata: InterlinearContent['metadata'];
    setPairs: (pairs: InterlinearPair[]) => void;
    updatePair: (index: number, source: string, target: string) => void;
    addPair: (index: number) => void;
    removePair: (index: number) => void;
    splitPair: (index: number, sourceSplitAt: number, targetSplitAt: number) => void;
    mergeWithNext: (index: number) => void;
    importJson: (json: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    pairs: [],
    metadata: {
        title: '',
        source_lang: '',
        target_lang: '',
    },
    setPairs: (pairs) => set({ pairs }),
    updatePair: (index, source, target) => set((state) => {
        const newPairs = [...state.pairs];
        newPairs[index] = { source, target };
        return { pairs: newPairs };
    }),
    addPair: (index) => set((state) => {
        const newPairs = [...state.pairs];
        newPairs.splice(index + 1, 0, { source: '', target: '' });
        return { pairs: newPairs };
    }),
    removePair: (index) => set((state) => {
        const newPairs = [...state.pairs];
        newPairs.splice(index, 1);
        return { pairs: newPairs };
    }),
    splitPair: (index, sourceSplitAt, targetSplitAt) => set((state) => {
        const pair = state.pairs[index];
        const newPairs = [...state.pairs];

        const p1 = {
            source: pair.source.substring(0, sourceSplitAt).trim(),
            target: pair.target.substring(0, targetSplitAt).trim(),
        };
        const p2 = {
            source: pair.source.substring(sourceSplitAt).trim(),
            target: pair.target.substring(targetSplitAt).trim(),
        };

        newPairs.splice(index, 1, p1, p2);
        return { pairs: newPairs };
    }),
    mergeWithNext: (index) => set((state) => {
        if (index >= state.pairs.length - 1) return state;
        const newPairs = [...state.pairs];
        const current = newPairs[index];
        const next = newPairs[index + 1];

        newPairs.splice(index, 2, {
            source: (current.source + " " + next.source).trim(),
            target: (current.target + " " + next.target).trim(),
        });

        return { pairs: newPairs };
    }),
    importJson: (json) => {
        try {
            const parsed = JSON.parse(json) as InterlinearContent;
            set({
                pairs: parsed.data || [],
                metadata: parsed.metadata || { title: '', source_lang: '', target_lang: '' }
            });
        } catch (e) {
            console.error("Failed to parse JSON", e);
        }
    },
}));
