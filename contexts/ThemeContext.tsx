'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeType = 'default' | 'academia'

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('default')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'academia')) {
      setThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'default' ? 'academia' : 'default')
  }

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}