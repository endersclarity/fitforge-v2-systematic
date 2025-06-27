'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SimpleDropdownProps {
  label: string
  options: string[]
  selectedOptions: string[]
  onSelectionChange: (selected: string[]) => void
}

export function SimpleDropdown({ 
  label, 
  options, 
  selectedOptions, 
  onSelectionChange 
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionClick = (option: string) => {
    console.log('🔥 SIMPLE DROPDOWN - Option clicked:', option)
    
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option]
    
    console.log('🔥 SIMPLE DROPDOWN - New selection:', newSelected)
    onSelectionChange(newSelected)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Button */}
      <button
        onClick={() => {
          console.log('🔥 SIMPLE DROPDOWN - Button clicked, isOpen:', isOpen)
          setIsOpen(!isOpen)
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#1C1C1E',
          border: '1px solid #2C2C2E',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '140px'
        }}
      >
        <span>{label}</span>
        {selectedOptions.length > 0 && (
          <span style={{
            backgroundColor: '#FF375F',
            color: 'white',
            fontSize: '12px',
            padding: '2px 6px',
            borderRadius: '12px',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            {selectedOptions.length}
          </span>
        )}
        <ChevronDown 
          style={{ 
            width: '16px', 
            height: '16px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '4px',
          backgroundColor: '#1C1C1E',
          border: '1px solid #2C2C2E',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 1000,
          minWidth: '200px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #2C2C2E',
                color: 'white',
                backgroundColor: selectedOptions.includes(option) ? '#2C2C2E' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2C2C2E'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selectedOptions.includes(option) ? '#2C2C2E' : 'transparent'
              }}
            >
              {option}
              {selectedOptions.includes(option) && (
                <span style={{ float: 'right', color: '#FF375F' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}