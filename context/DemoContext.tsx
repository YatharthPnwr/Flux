'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface DemoContextType {
  isDemo: boolean
  enterDemo: () => void
  exitDemo: () => void
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
})

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false)
  return (
    <DemoContext.Provider value={{ isDemo, enterDemo: () => setIsDemo(true), exitDemo: () => setIsDemo(false) }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoMode() {
  return useContext(DemoContext)
}
