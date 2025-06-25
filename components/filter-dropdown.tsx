'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

interface FilterDropdownProps {
  label: string
  options: string[]
  selectedOptions: string[]
  onSelectionChange: (selected: string[]) => void
  disabled?: boolean
}

export function FilterDropdown({ 
  label, 
  options, 
  selectedOptions, 
  onSelectionChange,
  disabled = false 
}: FilterDropdownProps) {
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

  const handleOptionToggle = (option: string) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option]
    
    onSelectionChange(newSelected)
  }

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return 'All'
    if (selectedOptions.length === 1) return selectedOptions[0]
    return `${selectedOptions.length} selected`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          if (!disabled) {
            console.log('Dropdown clicked, current isOpen:', isOpen)
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
          min-w-[140px]
        `}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-[#A1A1A3]">({getDisplayText()})</span>
        </div>
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
            {/* Clear All Option */}
            {selectedOptions.length > 0 && (
              <>
                <button
                  onClick={() => onSelectionChange([])}
                  className="w-full text-left px-3 py-2 text-sm text-[#FF375F] hover:bg-[#2C2C2E] rounded-md transition-colors"
                >
                  Clear All
                </button>
                <div className="border-t border-[#2C2C2E] my-2" />
              </>
            )}
            
            {/* Options */}
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionToggle(option)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-[#2C2C2E] rounded-md transition-colors"
              >
                <span>{option}</span>
                {selectedOptions.includes(option) && (
                  <Check className="h-4 w-4 text-[#FF375F]" />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}