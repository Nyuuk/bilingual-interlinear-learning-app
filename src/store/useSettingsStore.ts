import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeId = 'classic' | 'sepia' | 'night' | 'mono'

interface SettingsState {
    fontSize: number // 1 to 5
    themeId: ThemeId
    setFontSize: (size: number) => void
    setTheme: (themeId: ThemeId) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontSize: 3, // Default middle size
            themeId: 'classic',
            setFontSize: (size) => set({ fontSize: Math.min(Math.max(size, 1), 5) }),
            setTheme: (themeId) => set({ themeId }),
        }),
        {
            name: 'bila-reader-settings',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
