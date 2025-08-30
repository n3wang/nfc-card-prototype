'use client'

import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'default' ? 'Academia' : 'Default'} theme`}
    >
      <span className="theme-toggle-icon">
        {theme === 'default' ? '🎨' : '🎓'}
      </span>
      <span>
        {theme === 'default' ? 'Creative' : 'Academia'}
      </span>
    </button>
  )
}