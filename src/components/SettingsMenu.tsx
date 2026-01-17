"use client"

import React, { useState } from 'react'
import { useSettingsStore, ThemeId } from '@/store/useSettingsStore'
import { Type, Palette, Check, Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SettingsMenu: React.FC = () => {
    const { fontSize, setFontSize, themeId, setTheme } = useSettingsStore()
    const [isOpen, setIsOpen] = useState(false)

    const themes: { id: ThemeId; name: string; bg: string; text: string }[] = [
        { id: 'classic', name: 'Classic', bg: 'bg-[#f8fafc]', text: 'text-[#312e81]' },
        { id: 'sepia', name: 'Sepia', bg: 'bg-[#f4ecd8]', text: 'text-[#5f4b32]' },
        { id: 'night', name: 'Night', bg: 'bg-[#000000]', text: 'text-[#90caf9]' },
        { id: 'mono', name: 'Mono', bg: 'bg-white', text: 'text-black' },
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 hover:bg-muted/80 rounded-xl transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                title="Reader Settings"
            >
                <Palette size={22} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black uppercase tracking-tight text-sm text-muted-foreground">Reader Settings</h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Font Size Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4 text-foreground/80 font-bold text-sm">
                                <Type size={16} />
                                <span>Text Size</span>
                            </div>
                            <div className="flex items-center justify-between bg-muted/40 p-2 rounded-xl">
                                <button
                                    onClick={() => setFontSize(fontSize - 1)}
                                    disabled={fontSize <= 1}
                                    className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <Minus size={18} />
                                </button>
                                <div className="flex gap-1 justify-center items-center w-full">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <div
                                            key={s}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all",
                                                s <= fontSize ? "w-4 bg-primary" : "w-2 bg-border"
                                            )}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setFontSize(fontSize + 1)}
                                    disabled={fontSize >= 5}
                                    className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Themes Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-foreground/80 font-bold text-sm">
                                <Palette size={16} />
                                <span>Theme</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group",
                                            themeId === t.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-muted-foreground/30 bg-card"
                                        )}
                                    >
                                        <div className={cn("w-full h-8 rounded-lg border border-border transition-transform group-hover:scale-105", t.bg)} />
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", themeId === t.id ? "text-primary" : "text-muted-foreground")}>
                                            {t.name}
                                        </span>
                                        {themeId === t.id && (
                                            <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full">
                                                <Check size={10} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
