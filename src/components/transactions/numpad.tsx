import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn, formatNumber, parseFormattedNumber } from '@/lib/utils'

interface NumpadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

const Numpad = ({ value, onChange, onSubmit }: NumpadProps) => {
  const [hasOperation, setHasOperation] = useState(false)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key)
      } else if (
        e.key === '+' ||
        e.key === '-' ||
        e.key === '*' ||
        e.key === '/'
      ) {
        handleOperator(e.key)
      } else if (e.key === 'Enter') {
        onSubmit()
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Escape') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [value, onSubmit])

  const handleInput = (digit: string) => {
    const unformattedValue = parseFormattedNumber(value)
    let newValue

    if (unformattedValue === '0') {
      newValue = digit
    } else {
      newValue = unformattedValue + digit
    }

    const formattedValue = formatNumber(newValue)
    onChange(formattedValue)
  }

  const handleOperator = (op: string) => {
    if (hasOperation) return

    const unformattedValue = parseFormattedNumber(value)
    // Don't add operator if value ends with an operator
    if (
      ['+', '-', '×', '÷'].includes(
        unformattedValue.charAt(unformattedValue.length - 1)
      )
    ) {
      return
    }

    const operator = op === '*' ? '×' : op === '/' ? '÷' : op
    const newValue = unformattedValue + operator
    const formattedValue = formatNumber(newValue)
    onChange(formattedValue)
    setHasOperation(true)
  }

  const handleBackspace = () => {
    const unformattedValue = parseFormattedNumber(value)

    if (unformattedValue.length === 1) {
      onChange('0')
    } else {
      const newValue = unformattedValue.slice(0, -1)
      const formattedValue = formatNumber(newValue)
      onChange(formattedValue)

      // Check if operation was removed
      setHasOperation(['+', '-', '×', '÷'].some((op) => newValue.includes(op)))
    }
  }

  const handleClear = () => {
    onChange('0')
    setHasOperation(false)
  }

  const calculate = () => {
    try {
      const unformattedValue = parseFormattedNumber(value)
      // Replace × with * and ÷ with / for evaluation
      const expression = unformattedValue.replace(/×/g, '*').replace(/÷/g, '/')
      const result = Math.round(eval(expression) * 100) / 100 // Round to 2 decimal places
      const formattedResult = formatNumber(result.toString())
      onChange(formattedResult)
      setHasOperation(false)
      return result
    } catch {
      const unformattedValue = parseFormattedNumber(value)
      return parseFloat(unformattedValue) || 0
    }
  }

  const handleEquals = () => {
    const result = calculate()
    const formattedResult = formatNumber(result.toString())
    onChange(formattedResult)
  }

  // New button layout as requested
  const buttons = [
    { label: 'AC', action: handleClear, className: 'text-primary' },
    {
      label: '×',
      action: () => handleOperator('×'),
      className: 'text-primary',
    },
    {
      label: '÷',
      action: () => handleOperator('÷'),
      className: 'text-primary',
    },
    { label: '⌫', action: handleBackspace, className: 'text-primary' },

    { label: '7', action: () => handleInput('7') },
    { label: '8', action: () => handleInput('8') },
    { label: '9', action: () => handleInput('9') },
    {
      label: '−',
      action: () => handleOperator('-'),
      className: 'text-primary',
    },

    { label: '4', action: () => handleInput('4') },
    { label: '5', action: () => handleInput('5') },
    { label: '6', action: () => handleInput('6') },
    {
      label: '+',
      action: () => handleOperator('+'),
      className: 'text-primary',
    },

    { label: '1', action: () => handleInput('1') },
    { label: '2', action: () => handleInput('2') },
    { label: '3', action: () => handleInput('3') },
    { label: '', action: () => {}, className: 'opacity-0' },

    { label: '0', action: () => handleInput('0') },
    { label: '000', action: () => handleInput('000') },
    { label: '', action: () => {}, className: 'col-span-2 opacity-0' },
  ]

  return (
    <div className='w-full'>
      <div className='grid grid-cols-4 gap-2'>
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant='ghost'
            className={cn('numpad-button', button.className)}
            onClick={button.action}
            type='button'
            disabled={button.label === ''}
          >
            {button.label}
          </Button>
        ))}
      </div>
      <Button
        className='fixed bottom-24 md:bottom-32 right-6 h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary hover:bg-primary/90 text-white text-xl'
        onClick={() => {
          handleEquals()
          onSubmit()
        }}
      >
        ✓
      </Button>
    </div>
  )
}

export default Numpad
