'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

interface SortOption {
  value: string
  label: string
}

interface SortDropdownProps {
  label: string
  options: SortOption[]
  selectedValue: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function SortDropdown({ 
  label, 
  options, 
  selectedValue, 
  onValueChange,
  disabled = false 
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === selectedValue)
  const displayText = selectedOption?.label || 'All'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
          }
        }}
        disabled={disabled}
        className={`
          flex items-center justify-between px-4 py-2 rounded-lg border transition-all
          ${disabled 
            ? 'bg-[#2C2C2E] border-[#3C3C3E] text-[#666] cursor-not-allowed' 
            : 'bg-[#1C1C1E] border-[#2C2C2E] text-white hover:border-[#FF375F] hover:bg-[#2C2C2E]'
          }
          ${isOpen ? 'border-[#FF375F] bg-[#2C2C2E]' : ''}
          ${selectedValue !== 'all' ? 'border-[#FF375F]' : ''}
          min-w-[140px]
        `}
      >
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu - Portaled to document body */}
      {isOpen && !disabled && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto min-w-[200px]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            minWidth: Math.max(dropdownPosition.width, 200)
          }}
        >
          <div className="p-2">
            {/* Options */}
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                  ${selectedValue === option.value 
                    ? 'bg-[#FF375F] text-white' 
                    : 'text-white hover:bg-[#2C2C2E]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}