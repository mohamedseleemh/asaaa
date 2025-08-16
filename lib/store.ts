// تبسيط متجر CMS
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CMSState, Locale, Bundle, Design, Service } from "./types/cms"
import { defaultContent, defaultDesign, defaultBlocks } from "./data/default-content"

const defaultState: CMSState = {
  locale: "ar",
  content: defaultContent,
  design: defaultDesign,
  blocks: defaultBlocks,
  adminSettings: {}, // Initialize admin settings
}

interface CMSStore extends CMSState {
  setLocale: (locale: Locale) => void
  setContent: (locale: Locale, updates: Partial<Bundle>) => void
  setDesign: (design: Partial<Design>) => void
  addService: (locale: Locale, service: Service) => void
  updateService: (locale: Locale, index: number, updates: Partial<Service>) => void
  removeService: (locale: Locale, index: number) => void
  reorderServices: (locale: Locale, indices: number[]) => void
  toggleBlock: (blockId: string) => void
  resetToDefaults: () => void
  setAdminSettings: (settings: any) => void
  getAnalytics: () => any
  exportData: () => any
}

export const useCMS = create<CMSStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setLocale: (locale) => set({ locale }),

      setContent: (locale, updates) =>
        set((state) => ({
          content: {
            ...state.content,
            [locale]: {
              ...state.content[locale],
              ...updates,
            },
          },
        })),

      setDesign: (design) =>
        set((state) => ({
          design: {
            ...state.design,
            ...design,
          },
        })),

      addService: (locale, service) =>
        set((state) => ({
          content: {
            ...state.content,
            [locale]: {
              ...state.content[locale],
              services: [...state.content[locale].services, service],
            },
          },
        })),

      updateService: (locale, index, updates) =>
        set((state) => {
          const services = [...state.content[locale].services]
          services[index] = { ...services[index], ...updates }
          return {
            content: {
              ...state.content,
              [locale]: {
                ...state.content[locale],
                services,
              },
            },
          }
        }),

      removeService: (locale, index) =>
        set((state) => {
          const services = state.content[locale].services.filter((_, i) => i !== index)
          return {
            content: {
              ...state.content,
              [locale]: {
                ...state.content[locale],
                services,
              },
            },
          }
        }),

      reorderServices: (locale, indices) =>
        set((state) => {
          const services = indices.map((i) => state.content[locale].services[i])
          return {
            content: {
              ...state.content,
              [locale]: {
                ...state.content[locale],
                services,
              },
            },
          }
        }),

      toggleBlock: (blockId) =>
        set((state) => ({
          blocks: state.blocks.map((block) => (block.id === blockId ? { ...block, enabled: !block.enabled } : block)),
        })),

      resetToDefaults: () => set(defaultState),

      setAdminSettings: (settings) =>
        set((state) => ({
          ...state,
          adminSettings: { ...state.adminSettings, ...settings },
        })),

      getAnalytics: () => {
        const state = get()
        return {
          totalServices: state.content.ar.services.length + state.content.en.services.length,
          enabledBlocks: state.blocks.filter((b) => b.enabled).length,
          lastUpdated: new Date().toISOString(),
        }
      },

      exportData: () => {
        const state = get()
        return {
          content: state.content,
          design: state.design,
          blocks: state.blocks,
          exportedAt: new Date().toISOString(),
        }
      },
    }),
    {
      name: "kyctrust-cms",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
