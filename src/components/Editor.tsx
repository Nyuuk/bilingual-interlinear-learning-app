"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { validateContent } from '@/lib/contentValidation';
import { InterlinearRenderer } from './InterlinearRenderer';
import { SettingsMenu } from './SettingsMenu';
import { cn } from '@/lib/utils';
import { Plus, Minus, Combine, Download, Upload } from 'lucide-react';

export const Editor: React.FC = () => {
    const {
        currentContentId,
        pairs,
        metadata,
        resetEditor,
        loadContent,
        setMetadata,
        updatePair,
        addPair,
        removePair,
        mergeWithNext,
        importJson,
    } = useEditorStore();
    const [jsonInput, setJsonInput] = useState('');
    const [showImport, setShowImport] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { fontSize, themeId } = useSettingsStore();
    const validation = validateContent(metadata, pairs);
    const pairIssueMap = new Map(validation.pairs.map((issue) => [issue.index, issue]));
    const contentId = searchParams.get('id');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!contentId) {
            if (currentContentId) {
                resetEditor();
                setShowImport(true);
                setImportError(null);
                setSaveError(null);
                setSaveSuccess(null);
            }
            return;
        }

        if (currentContentId === contentId) {
            setShowImport(false);
            return;
        }

        let cancelled = false;

        const fetchLesson = async () => {
            setIsLoadingLesson(true);
            setSaveError(null);
            setSaveSuccess(null);
            setImportError(null);

            try {
                const response = await fetch(`/api/content/${contentId}`);
                if (!response.ok) {
                    throw new Error('Failed to load lesson.');
                }

                const lesson = await response.json();
                if (cancelled) return;

                loadContent(contentId, {
                    metadata: {
                        title: lesson.title ?? '',
                        source_lang: lesson.source_lang ?? '',
                        target_lang: lesson.target_lang ?? '',
                        status: lesson.status ?? 'DRAFT',
                    },
                    data: Array.isArray(lesson.data) ? lesson.data : [],
                });
                setShowImport(false);
            } catch (error) {
                if (cancelled) return;
                console.error('Load lesson error:', error);
                setSaveError('Failed to load lesson into editor.');
            } finally {
                if (!cancelled) {
                    setIsLoadingLesson(false);
                }
            }
        };

        void fetchLesson();

        return () => {
            cancelled = true;
        };
    }, [contentId, currentContentId, loadContent, mounted, resetEditor]);

    const handleImport = () => {
        const result = importJson(jsonInput);

        if (!result.ok) {
            setImportError(result.error ?? 'Failed to import JSON.');
            return;
        }

        setImportError(null);
        setSaveError(null);
        setSaveSuccess(null);
        setIsLoadingLesson(false);
        setShowImport(false);
    };

    const handleSave = async () => {
        if (!validation.isValid) {
            setSaveSuccess(null);
            setSaveError(validation.formError ?? 'Fix validation errors before saving.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(null);

        try {
            const payload = currentContentId
                ? {
                    title: metadata.title,
                    source_lang: metadata.source_lang,
                    target_lang: metadata.target_lang,
                    status: metadata.status,
                    data: pairs,
                }
                : { metadata, data: pairs };

            const response = await fetch(currentContentId ? `/api/content/${currentContentId}` : '/api/content', {
                method: currentContentId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const data = await response.json().catch(() => null);
                const savedContentId = data?.id as string | undefined;
                const successMessage = currentContentId
                    ? 'Lesson updated successfully.'
                    : 'Lesson saved successfully.';

                if (!currentContentId && savedContentId) {
                    loadContent(savedContentId, { metadata, data: pairs });
                    router.replace(`/editor?id=${savedContentId}`);
                }

                setSaveSuccess(successMessage);
            } else {
                const data = await response.json().catch(() => null);
                setSaveError(data?.error ?? 'Failed to save content.');
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveError('Network error while saving content.');
        } finally {
            setIsSaving(false);
        }
    };

    const fontSizeScale = 0.7 + (fontSize * 0.15);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
            {/* Editor Header */}
            <header className="glass mb-8 py-6 sticky top-0 z-20">
                <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            {metadata.title || "Untitled Lesson"}
                            {!metadata.title && <span className="text-muted-foreground font-normal text-sm italic">(Untitled)</span>}
                            {currentContentId && (
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-primary">
                                    Editing
                                </span>
                            )}
                        </h1>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <label className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Title
                                </span>
                                <input
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                    placeholder="Lesson title"
                                    className={cn(
                                        "w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium outline-none transition-all",
                                        validation.metadata.title
                                            ? "border-destructive/50 focus:ring-2 focus:ring-destructive/20"
                                            : "border-border focus:ring-2 focus:ring-primary/20"
                                    )}
                                />
                                {validation.metadata.title && (
                                    <p className="text-xs font-medium text-destructive">{validation.metadata.title}</p>
                                )}
                            </label>
                            <label className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Source Language
                                </span>
                                <input
                                    value={metadata.source_lang}
                                    onChange={(e) => setMetadata({ ...metadata, source_lang: e.target.value })}
                                    placeholder="en"
                                    className={cn(
                                        "w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium outline-none transition-all",
                                        validation.metadata.source_lang
                                            ? "border-destructive/50 focus:ring-2 focus:ring-destructive/20"
                                            : "border-border focus:ring-2 focus:ring-primary/20"
                                    )}
                                />
                                {validation.metadata.source_lang && (
                                    <p className="text-xs font-medium text-destructive">{validation.metadata.source_lang}</p>
                                )}
                            </label>
                            <label className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Target Language
                                </span>
                                <input
                                    value={metadata.target_lang}
                                    onChange={(e) => setMetadata({ ...metadata, target_lang: e.target.value })}
                                    placeholder="id"
                                    className={cn(
                                        "w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium outline-none transition-all",
                                        validation.metadata.target_lang
                                            ? "border-destructive/50 focus:ring-2 focus:ring-destructive/20"
                                            : "border-border focus:ring-2 focus:ring-primary/20"
                                    )}
                                />
                                {validation.metadata.target_lang && (
                                    <p className="text-xs font-medium text-destructive">{validation.metadata.target_lang}</p>
                                )}
                            </label>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="px-2 py-0.5 bg-source/10 text-source text-[10px] font-black rounded uppercase tracking-wider border border-source/20">
                                {metadata.source_lang || "Source"}
                            </span>
                            <div className="h-px w-3 bg-border" />
                            <span className="px-2 py-0.5 bg-target/10 text-target text-[10px] font-black rounded uppercase tracking-wider border border-target/20">
                                {metadata.target_lang || "Target"}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all border border-border"
                        >
                            <Upload size={18} />
                            <span>{showImport ? 'Hide Import' : 'Import JSON'}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!validation.isValid || isSaving || isLoadingLesson}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                        >
                            <Download size={18} />
                            <span>
                                {isLoadingLesson ? 'Loading...' : isSaving ? 'Saving...' : currentContentId ? 'Update Lesson' : 'Save Lesson'}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-7xl">
                {(saveError || saveSuccess || validation.formError || isLoadingLesson) && (
                    <div className="mb-6 space-y-3">
                        {isLoadingLesson && (
                            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                                Loading lesson into editor...
                            </div>
                        )}
                        {saveError && (
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                                {saveError}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700">
                                {saveSuccess}
                            </div>
                        )}
                        {!saveError && validation.formError && (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700">
                                {validation.formError}
                            </div>
                        )}
                    </div>
                )}

                {/* JSON Import Section */}
                {showImport && (
                    <div className="premium-card p-6 mb-12 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                            <Upload size={20} />
                            <h2>Import from content generator</h2>
                        </div>
                        <textarea
                            className="w-full h-48 p-4 font-mono text-sm bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder='Paste the JSON from the "BILA Content Generator" prompt here...'
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                        {importError && (
                            <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                                {importError}
                            </div>
                        )}
                        <button
                            onClick={handleImport}
                            className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                        >
                            Load into Editor
                        </button>
                    </div>
                )}

                {!showImport && pairs.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border mb-8">
                        <p className="text-muted-foreground mb-4 font-medium">No content loaded yet.</p>
                        <button
                            onClick={() => setShowImport(true)}
                            className="text-primary font-bold hover:underline"
                        >
                            Open Import Tool
                        </button>
                    </div>
                )}

                {pairs.length > 0 && (
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        {/* Editor Section */}
                        <div className="w-full lg:w-1/2 space-y-6">
                            <div className="flex items-center justify-between sticky top-32 z-10 bg-background/80 backdrop-blur-sm py-2">
                                <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground">
                                    Editor Panel
                                </h3>
                                <div className="text-xs font-bold text-muted-foreground/60 px-2 py-1 bg-muted rounded border border-border">
                                    {pairs.length} PAIRS
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-border">
                                {pairs.map((pair, index) => {
                                    const pairIssue = pairIssueMap.get(index);

                                    return (
                                    <div key={index} className="flex gap-3 items-center group">
                                        <div
                                            className={cn(
                                                "flex-1 premium-card p-4 transition-all group-focus-within:ring-1 bg-card/40 hover:bg-card",
                                                pairIssue
                                                    ? "border-destructive/50 group-focus-within:border-destructive group-focus-within:ring-destructive/20"
                                                    : "group-focus-within:border-primary group-focus-within:ring-primary/20"
                                            )}
                                        >
                                            <div className="space-y-3">
                                                <input
                                                    className={cn(
                                                        "w-full text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-source placeholder:text-source/30",
                                                        pairIssue?.source && "text-destructive placeholder:text-destructive/40"
                                                    )}
                                                    value={pair.source}
                                                    onChange={(e) => updatePair(index, e.target.value, pair.target)}
                                                    placeholder="Source language chunk"
                                                />
                                                <div className="h-px w-full bg-border/50" />
                                                <input
                                                    className={cn(
                                                        "w-full text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 text-target placeholder:text-target/30 italic",
                                                        pairIssue?.target && "text-destructive placeholder:text-destructive/40"
                                                    )}
                                                    value={pair.target}
                                                    onChange={(e) => updatePair(index, pair.source, e.target.value)}
                                                    placeholder="Target translation"
                                                />
                                                {(pairIssue?.source || pairIssue?.target) && (
                                                    <div className="space-y-1 rounded-xl bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
                                                        {pairIssue.source && <p>{pairIssue.source}</p>}
                                                        {pairIssue.target && <p>{pairIssue.target}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => addPair(index)}
                                                className="p-2.5 bg-card hover:bg-source hover:text-white border border-border rounded-xl text-source transition-all active:scale-90"
                                                title="Add pair below"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => mergeWithNext(index)}
                                                className="p-2.5 bg-card hover:bg-primary hover:text-white border border-border rounded-xl text-primary transition-all active:scale-90"
                                                title="Merge with next"
                                            >
                                                <Combine size={16} />
                                            </button>
                                            <button
                                                onClick={() => removePair(index)}
                                                className="p-2.5 bg-card hover:bg-destructive hover:text-white border border-border rounded-xl text-destructive transition-all active:scale-90"
                                                title="Remove pair"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="w-full lg:w-1/2 sticky top-32">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black uppercase tracking-tight text-muted-foreground">
                                    Real-time Preview
                                </h3>
                                <SettingsMenu />
                            </div>
                            <div className={cn("premium-card p-8 md:p-12 min-h-[400px] relative overflow-hidden transition-colors duration-300", `theme-${themeId}`, themeId === 'classic' ? 'bg-white/50' : 'bg-[var(--background)]')}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-10 -mb-10 blur-2xl" />
                                <div className="relative z-10">
                                    <InterlinearRenderer
                                        pairs={pairs}
                                        fontSizeScale={fontSizeScale}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
