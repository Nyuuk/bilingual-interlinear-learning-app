"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, ChevronRight, Pencil, Trash2, Eye, Send } from 'lucide-react';

type ContentStatus = 'DRAFT' | 'PUBLISHED';

interface LibraryContentItem {
    id: string;
    title: string;
    source_lang: string;
    target_lang: string;
    status?: ContentStatus;
    createdAt: string;
}

export default function LibraryPage() {
    const [contents, setContents] = useState<LibraryContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadContents = () => {
        setLoading(true);
        setError(null);
        fetch('/api/content')
            .then(res => res.json())
            .then(data => {
                setContents(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load library.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadContents();
    }, []);

    const handleDelete = async (id: string) => {
        setBusyId(id);
        setError(null);

        try {
            const response = await fetch(`/api/content/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Delete failed');
            }

            setContents((current) => current.filter((item) => item.id !== id));
        } catch {
            setError('Failed to delete lesson.');
        } finally {
            setBusyId(null);
        }
    };

    const handleStatusChange = async (id: string, status: ContentStatus) => {
        setBusyId(id);
        setError(null);

        try {
            const response = await fetch(`/api/content/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            const updated = await response.json();
            setContents((current) => current.map((item) => (
                item.id === id ? updated : item
            )));
        } catch {
            setError('Failed to update lesson status.');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading library...</div>;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass py-12 mb-8">
                <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Your Library
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">
                            Explore your collection of bilingual interlinear lessons.
                        </p>
                    </div>
                    <Link
                        href="/editor"
                        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center gap-2"
                    >
                        <span>New Lesson</span>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto pb-20 px-4 max-w-6xl">
                {error && (
                    <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {error}
                    </div>
                )}

                {contents.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl bg-card/50">
                        <div className="mb-6 bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No lessons yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Start your language journey by creating your first interactive lesson.</p>
                        <Link
                            href="/editor"
                            className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                        >
                            Create now <ChevronRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contents.map((item) => (
                            <div
                                key={item.id}
                                className="premium-card p-6 flex flex-col justify-between group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-all group-hover:scale-150 group-hover:bg-primary/10" />

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-0.5 bg-source/10 text-source text-[10px] font-black rounded uppercase tracking-wider">
                                            {item.source_lang}
                                        </span>
                                        <div className="h-px w-4 bg-border" />
                                        <span className="px-2 py-0.5 bg-target/10 text-target text-[10px] font-black rounded uppercase tracking-wider">
                                            {item.target_lang}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider border ${
                                                item.status === 'PUBLISHED'
                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                                                    : 'border-amber-500/20 bg-amber-500/10 text-amber-700'
                                            }`}
                                        >
                                            {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <Link href={`/reader/${item.id}`} className="block">
                                        <h2 className="text-xl font-extrabold group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2">
                                            {item.title}
                                        </h2>
                                    </Link>
                                    {item.status === 'DRAFT' && (
                                        <p className="text-xs text-muted-foreground">
                                            Draft saved. Re-open it in editor any time before publishing.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 space-y-4 border-t border-border/50 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                            <Calendar size={14} className="opacity-60" />
                                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <Link href={`/reader/${item.id}`} className="flex items-center gap-1 text-primary font-bold text-sm">
                                            Read <ChevronRight size={16} />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleStatusChange(item.id, item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                                            disabled={busyId === item.id}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                                        >
                                            {item.status === 'PUBLISHED' ? <Eye size={16} /> : <Send size={16} />}
                                            {item.status === 'PUBLISHED' ? 'Move to Draft' : 'Publish'}
                                        </button>
                                        <Link
                                            href={`/editor?id=${item.id}`}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={busyId === item.id}
                                            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                        >
                                            <Trash2 size={16} />
                                            Delete Lesson
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
