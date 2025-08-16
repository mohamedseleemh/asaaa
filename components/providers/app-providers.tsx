"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { NetworkAdapter } from "@/components/network/network-adapter"
import { AccessibilityToolbar } from "@/components/ux/accessibility-toolbar"
import { Toaster } from "@/components/ui/toaster"

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <NetworkAdapter>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster />
          <AccessibilityToolbar />
        </ThemeProvider>
      </NetworkAdapter>
    </ErrorBoundary>
  )
}
