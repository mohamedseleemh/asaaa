export type PaletteType = "violet-emerald" | "blue-purple" | "teal-indigo"

export interface PaletteConfig {
  primary: string
  secondary: string
  accent: string
  range: string
}

export function paletteGrad(palette: PaletteType): PaletteConfig {
  const palettes: Record<PaletteType, PaletteConfig> = {
    "violet-emerald": {
      primary: "from-violet-600 to-emerald-600",
      secondary: "from-emerald-500 to-violet-500",
      accent: "from-violet-500 to-emerald-500",
      range: "from-violet-600 via-purple-600 to-emerald-600",
    },
    "blue-purple": {
      primary: "from-blue-600 to-purple-600",
      secondary: "from-purple-500 to-blue-500",
      accent: "from-blue-500 to-purple-500",
      range: "from-blue-600 via-indigo-600 to-purple-600",
    },
    "teal-indigo": {
      primary: "from-teal-600 to-indigo-600",
      secondary: "from-indigo-500 to-teal-500",
      accent: "from-teal-500 to-indigo-500",
      range: "from-teal-600 via-cyan-600 to-indigo-600",
    },
  }

  return palettes[palette] || palettes["violet-emerald"]
}
