'use client'

import SettingsModal from '@/components/settings-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/app-context'
import { calculateTotalByType, formatCurrency, formatMonth } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Eye, Search, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const {
    filteredTransactions,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    settings,
    showMaskedValue,
    isRevealed,
  } = useApp()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const totalExpenses = calculateTotalByType(filteredTransactions, 'expense')

  const handlePreviousMonth = () => {
    const prevMonth = new Date(selectedMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setSelectedMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setSelectedMonth(nextMonth)
  }

  const handleMaskedValueClick = () => {
    if (settings.maskValues) {
      showMaskedValue()
    }
  }

  return (
    <>
      <div className='sticky top-0 bg-background z-10 px-4 py-4 flex items-center gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by notes, category...'
            className='pl-9'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='shrink-0'
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className='!h-5 !w-5' />
        </Button>
      </div>

      <div className='px-4 mb-6'>
        <div className='flex items-center justify-between mb-3'>
          <Button variant='outline' size='icon' onClick={handlePreviousMonth}>
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <h2 className='text-lg font-medium'>{formatMonth(selectedMonth)}</h2>

          <Button variant='outline' size='icon' onClick={handleNextMonth}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <div className='bg-accent p-4 rounded-lg'>
          <p className='text-sm text-muted-foreground mb-1'>
            Total Pengeluaran
          </p>
          <div
            className='text-2xl font-bold flex items-center group relative'
            onClick={handleMaskedValueClick}
          >
            {settings.maskValues && !isRevealed ? (
              <>
                <Eye className='mr-2 h-5 w-5' />
                <span className='group-hover:hidden'>•••</span>
                <span className='hidden group-hover:inline'>
                  {formatCurrency(totalExpenses, false, false)}
                </span>
              </>
            ) : (
              formatCurrency(totalExpenses, false, false)
            )}
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
