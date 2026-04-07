import { create } from 'zustand';
import { InterlinearPair, InterlinearContent } from '@/types';
import { parseImportedContent } from '@/lib/contentValidation';

interface ImportJsonResult {
    ok: boolean;
    error?: string;
}

interface EditorState {
    currentContentId: string | null;
    pairs: InterlinearPair[];
    metadata: InterlinearContent['metadata'];
    resetEditor: () => void;
    loadContent: (contentId: string | null, content: InterlinearContent) => void;
    setPairs: (pairs: InterlinearPair[]) => void;
    setMetadata: (metadata: InterlinearContent['metadata']) => void;
    updatePair: (index: number, source: string, target: string) => void;
    addPair: (index: number) => void;
    removePair: (index: number) => void;
    splitPair: (index: number, sourceSplitAt: number, targetSplitAt: number) => void;
    mergeWithNext: (index: number) => void;
    importJson: (json: string) => ImportJsonResult;
}

export const useEditorStore = create<EditorState>((set) => ({
    currentContentId: null,
    pairs: [],
    metadata: {
        title: '',
        source_lang: '',
        target_lang: '',
        status: 'DRAFT',
    },
    resetEditor: () => set({
        currentContentId: null,
        pairs: [],
        metadata: {
            title: '',
            source_lang: '',
            target_lang: '',
            status: 'DRAFT',
        },
    }),
    loadContent: (contentId, content) => set({
        currentContentId: contentId,
        pairs: content.data,
        metadata: {
            ...content.metadata,
            status: content.metadata.status ?? 'DRAFT',
        },
    }),
    setPairs: (pairs) => set({ pairs }),
    setMetadata: (metadata) => set({ metadata }),
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
            const parsed = parseImportedContent(json);
            set({
                currentContentId: null,
                pairs: parsed.data || [],
                metadata: {
                    ...(parsed.metadata || { title: '', source_lang: '', target_lang: '' }),
                    status: parsed.metadata?.status ?? 'DRAFT',
                },
            });
            return { ok: true };
        } catch (e) {
            console.error("Failed to parse JSON", e);
            return {
                ok: false,
                error: e instanceof Error ? e.message : 'Failed to import JSON.',
            };
        }
    },
}));
