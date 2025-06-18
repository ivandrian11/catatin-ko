import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { formatNumber, parseFormattedNumber } from '@/lib/utils'
import { CheckCheck } from 'lucide-react'

interface NumpadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

const OPERATORS = ['+', '-', '×', '÷'] as const
const OPERATOR_MAP = { '*': '×', '/': '÷' } as const

const Numpad = ({ value, onChange, onSubmit }: NumpadProps) => {
  const [hasOperation, setHasOperation] = useState(false)

  const handleInput = useCallback(
    (digit: string) => {
      const unformattedValue = parseFormattedNumber(value)
      const newValue =
        unformattedValue === '0' ? digit : unformattedValue + digit
      onChange(formatNumber(newValue))
    },
    [value, onChange]
  )

  const handleOperator = useCallback(
    (op: string) => {
      if (hasOperation) return

      const unformattedValue = parseFormattedNumber(value)
      const lastChar = unformattedValue.charAt(unformattedValue.length - 1)

      if (OPERATORS.includes(lastChar as (typeof OPERATORS)[number])) return

      const operator = OPERATOR_MAP[op as keyof typeof OPERATOR_MAP] || op
      const newValue = unformattedValue + operator
      onChange(formatNumber(newValue))
      setHasOperation(true)
    },
    [value, onChange, hasOperation]
  )

  const handleBackspace = useCallback(() => {
    const unformattedValue = parseFormattedNumber(value)

    if (unformattedValue.length === 1) {
      onChange('0')
    } else {
      const newValue = unformattedValue.slice(0, -1)
      onChange(formatNumber(newValue))
      setHasOperation(OPERATORS.some((op) => newValue.includes(op)))
    }
  }, [value, onChange])

  const handleClear = useCallback(() => {
    onChange('0')
    setHasOperation(false)
  }, [onChange])

  const calculate = useCallback(() => {
    try {
      const unformattedValue = parseFormattedNumber(value)
      const expression = unformattedValue.replace(/×/g, '*').replace(/÷/g, '/')
      const result = Math.round(eval(expression) * 100) / 100
      return result
    } catch {
      const unformattedValue = parseFormattedNumber(value)
      return parseFloat(unformattedValue) || 0
    }
  }, [value])

  const handleEquals = useCallback(() => {
    const result = calculate()
    onChange(formatNumber(result.toString()))
    setHasOperation(false)
  }, [calculate, onChange])

  const handleSubmit = useCallback(() => {
    handleEquals()
    onSubmit()
  }, [handleEquals, onSubmit])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key)
      } else if (['+', '-', '*', '/'].includes(e.key)) {
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
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInput, handleOperator, handleBackspace, handleClear, onSubmit])

  // Common button class
  const buttonClass =
    'h-12 text-lg border border-border/20 shadow-sm hover:shadow-md hover:border-border/40 transition-all duration-200 active:shadow-none active:scale-95'
  const operatorClass = `text-primary ${buttonClass}`

  const buttons = [
    // Row 1
    [
      { label: 'AC', onClick: handleClear, className: operatorClass },
      {
        label: '×',
        onClick: () => handleOperator('*'),
        className: operatorClass,
      },
      {
        label: '÷',
        onClick: () => handleOperator('/'),
        className: operatorClass,
      },
      { label: '⌫', onClick: handleBackspace, className: operatorClass },
    ],
    // Row 2
    [
      { label: '7', onClick: () => handleInput('7'), className: buttonClass },
      { label: '8', onClick: () => handleInput('8'), className: buttonClass },
      { label: '9', onClick: () => handleInput('9'), className: buttonClass },
      {
        label: '−',
        onClick: () => handleOperator('-'),
        className: operatorClass,
      },
    ],
    // Row 3
    [
      { label: '4', onClick: () => handleInput('4'), className: buttonClass },
      { label: '5', onClick: () => handleInput('5'), className: buttonClass },
      { label: '6', onClick: () => handleInput('6'), className: buttonClass },
      {
        label: '+',
        onClick: () => handleOperator('+'),
        className: operatorClass,
      },
    ],
    // Row 4
    [
      { label: '1', onClick: () => handleInput('1'), className: buttonClass },
      { label: '2', onClick: () => handleInput('2'), className: buttonClass },
      { label: '3', onClick: () => handleInput('3'), className: buttonClass },
    ],
    // Row 5
    [
      { label: '0', onClick: () => handleInput('0'), className: buttonClass },
      {
        label: '000',
        onClick: () => handleInput('000'),
        className: `${buttonClass} col-span-2`,
      },
    ],
  ]

  return (
    <div className='w-full min-h-0'>
      <div className='grid grid-cols-4 gap-3 h-auto'>
        {buttons.map((row, rowIndex) =>
          row.map((button, buttonIndex) => (
            <Button
              key={`${rowIndex}-${buttonIndex}`}
              variant='ghost'
              className={button.className}
              onClick={button.onClick}
              type='button'
            >
              {button.label}
            </Button>
          ))
        )}

        {/* Submit button */}
        <Button
          className='bg-black hover:bg-black/90 text-white text-lg rounded-lg border border-black/20 shadow-lg hover:shadow-xl transition-all duration-200 active:shadow-md active:scale-95 row-span-2 h-[108px] flex items-center justify-center'
          onClick={handleSubmit}
          type='button'
          style={{ gridColumn: '4', gridRow: '4 / 6' }}
        >
          <CheckCheck className='!w-6 !h-6' />
        </Button>
      </div>
    </div>
  )
}

export default Numpad
