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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close if clicking inside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if clicking inside the portaled dropdown
        const portalDropdown = document.querySelector('[style*="position: fixed"]')
        if (portalDropdown && portalDropdown.contains(event.target as Node)) {
          return // Don't close if clicking inside portal dropdown
        }
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


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
          {selectedOptions.length > 0 && (
            <span className="bg-[#FF375F] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {selectedOptions.length}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu - Portal with simple positioning */}
      {isOpen && !disabled && typeof window !== 'undefined' && buttonRef.current && createPortal(
        <div 
          className="fixed bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto min-w-[200px]"
          style={{
            top: buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 8,
            left: buttonRef.current.getBoundingClientRect().left + window.scrollX,
            minWidth: Math.max(buttonRef.current.getBoundingClientRect().width, 200)
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
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleOptionToggle(option)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
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