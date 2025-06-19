'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '@/lib/utils'

interface MonthNavigationProps {
  selectedMonth: Date
  onMonthChange: (date: Date) => void
  className?: string
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  selectedMonth,
  onMonthChange,
  className = '',
}) => {
  const handleMonthNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      const newMonth = new Date(selectedMonth)
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1))
      onMonthChange(newMonth)
    },
    [selectedMonth, onMonthChange]
  )

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant='outline'
        size='icon'
        onClick={() => handleMonthNavigation('prev')}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      <h2 className='text-lg font-medium'>{formatMonth(selectedMonth)}</h2>

      <Button
        variant='outline'
        size='icon'
        onClick={() => handleMonthNavigation('next')}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default MonthNavigation
