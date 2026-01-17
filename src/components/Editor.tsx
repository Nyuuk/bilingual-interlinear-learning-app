"use client";

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { InterlinearRenderer } from './InterlinearRenderer';
import { SettingsMenu } from './SettingsMenu';
import { cn } from '@/lib/utils';
import { Plus, Minus, Combine, Download, Upload } from 'lucide-react';

export const Editor: React.FC = () => {
    const { pairs, metadata, updatePair, addPair, removePair, splitPair, mergeWithNext, importJson } = useEditorStore();
    const [jsonInput, setJsonInput] = useState('');
    const [showImport, setShowImport] = useState(true);
    const [mounted, setMounted] = useState(false);

    const { fontSize, themeId } = useSettingsStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleImport = () => {
        importJson(jsonInput);
        setShowImport(false);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata, data: pairs }),
            });
            if (response.ok) {
                alert('Content saved successfully!');
            } else {
                alert('Failed to save content.');
            }
        } catch (error) {
            console.error('Save error:', error);
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
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
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
                            <span>Import JSON</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                        >
                            <Download size={18} />
                            <span>Save Content</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-7xl">
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
                                {pairs.map((pair, index) => (
                                    <div key={index} className="flex gap-3 items-center group">
                                        <div className="flex-1 premium-card p-4 transition-all group-focus-within:border-primary group-focus-within:ring-1 group-focus-within:ring-primary/20 bg-card/40 hover:bg-card">
                                            <div className="space-y-3">
                                                <input
                                                    className="w-full text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-source placeholder:text-source/30"
                                                    value={pair.source}
                                                    onChange={(e) => updatePair(index, e.target.value, pair.target)}
                                                    placeholder="Source language chunk"
                                                />
                                                <div className="h-px w-full bg-border/50" />
                                                <input
                                                    className="w-full text-sm font-semibold bg-transparent border-none focus:ring-0 p-0 text-target placeholder:text-target/30 italic"
                                                    value={pair.target}
                                                    onChange={(e) => updatePair(index, pair.source, e.target.value)}
                                                    placeholder="Target translation"
                                                />
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
                                ))}
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
