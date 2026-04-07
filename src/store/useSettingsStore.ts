import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeId = 'classic' | 'sepia' | 'night' | 'mono'

interface SettingsState {
    fontSize: number // 1 to 5
    themeId: ThemeId
    showTranslation: boolean
    setFontSize: (size: number) => void
    setTheme: (themeId: ThemeId) => void
    setShowTranslation: (showTranslation: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontSize: 3, // Default middle size
            themeId: 'classic',
            showTranslation: true,
            setFontSize: (size) => set({ fontSize: Math.min(Math.max(size, 1), 5) }),
            setTheme: (themeId) => set({ themeId }),
            setShowTranslation: (showTranslation) => set({ showTranslation }),
        }),
        {
            name: 'bila-reader-settings',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
