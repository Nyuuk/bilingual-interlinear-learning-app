"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterlinearRenderer } from '@/components/InterlinearRenderer';
import { SettingsMenu } from '@/components/SettingsMenu';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReaderPage() {
    const params = useParams();
    const router = useRouter();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const { fontSize, themeId } = useSettingsStore();

    useEffect(() => {
        setMounted(true);
        if (params.id) {
            fetch(`/api/content/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    setContent(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }

        // Apply theme to body
        const themeClass = `theme-${themeId}`;
        document.body.classList.add(themeClass);

        return () => {
            document.body.classList.remove(themeClass);
        };
    }, [params.id, themeId]);

    if (!mounted) return null; // Avoid hydration mismatch
    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading lesson...</div>;
    if (!content) return <div className="p-8 text-center text-destructive">Lesson not found.</div>;

    const fontSizeScale = 0.7 + (fontSize * 0.15);

    return (
        <div className={cn("min-h-screen pb-20 transition-colors duration-300", `theme-${themeId}`)}>

            {/* Premium Sticky Header */}
            <header className="sticky top-0 z-10 glass">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/library')}
                            className="p-3 hover:bg-muted/80 rounded-xl transition-all duration-200 border border-transparent hover:border-border active:scale-95"
                        >
                            <ArrowLeft size={24} className="text-foreground/80" />
                        </button>
                        <div>
                            <h1 className="font-extrabold text-2xl tracking-tight text-foreground">{content.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-source/10 text-source text-xs font-bold rounded uppercase">
                                    {content.source_lang}
                                </span>
                                <span className="text-muted-foreground text-xs">to</span>
                                <span className="px-2 py-0.5 bg-target/10 text-target text-xs font-bold rounded uppercase">
                                    {content.target_lang}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <SettingsMenu />
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="premium-card p-10 md:p-16 relative overflow-hidden transition-colors duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-source via-primary to-target opacity-80" />
                    <InterlinearRenderer
                        pairs={content.data}
                        fontSizeScale={fontSizeScale}
                    />
                </div>
            </main>
        </div>
    );
}
