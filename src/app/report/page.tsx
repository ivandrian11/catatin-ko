'use client'

import SettingsModal from '@/components/modal/settings-modal'
import MonthNavigation from '@/components/month-navigation'
import { Button } from '@/components/ui/button'
import { useApp } from '@/contexts/app-context'
import {
  calculateTotalByType,
  formatCurrency,
  groupTransactionsByCategory,
  groupTransactionsByDay,
} from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { Eye, Settings } from 'lucide-react'
import { useState } from 'react'
import { BarChart, LineChart, PieChart } from 'reaviz'

export default function Report() {
  const {
    filteredTransactions,
    categories,
    selectedMonth,
    setSelectedMonth,
    settings,
    showMaskedValue,
    isRevealed,
  } = useApp()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const handleMaskedValueClick = () => {
    if (settings.maskValues) {
      showMaskedValue()
    }
  }

  const byCategoryTransactions = groupTransactionsByCategory(
    filteredTransactions,
    categories
  )
  const byDayTransactions = groupTransactionsByDay(filteredTransactions)
  const totalExpenses = calculateTotalByType(filteredTransactions, 'expense')
  const totalIncome = calculateTotalByType(filteredTransactions, 'income')
  const shouldUsePieChart = byCategoryTransactions.length <= 5

  return (
    <>
      <div className='sticky top-0 bg-background z-10 px-4 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>Report</h1>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className='!h-5 !w-5' />
        </Button>
      </div>

      <div className='bg-background px-4 py-4 border-b'>
        <MonthNavigation
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          className='mb-3'
        />

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div
            className='bg-red-50 dark:bg-red-950/20 p-4 rounded-lg group'
            onClick={handleMaskedValueClick}
          >
            <p className='text-sm text-muted-foreground mb-1'>
              Total Pengeluaran
            </p>
            <div className='text-xl font-bold text-expense flex items-center text-red-600'>
              {settings.maskValues && !isRevealed && (
                <>
                  <Eye className='mr-1 h-4 w-4' />
                  <span className='group-hover:hidden'>•••</span>
                  <span className='hidden group-hover:inline'>
                    {formatCurrency(totalExpenses, false, false)}
                  </span>
                </>
              )}
              {(!settings.maskValues || isRevealed) &&
                formatCurrency(totalExpenses, false, false)}
            </div>
          </div>

          <div
            className='bg-green-50 dark:bg-green-950/20 p-4 rounded-lg group'
            onClick={handleMaskedValueClick}
          >
            <p className='text-sm text-muted-foreground mb-1'>
              Total Pemasukan
            </p>
            <div className='text-xl font-bold text-income flex items-center text-green-600'>
              {settings.maskValues && !isRevealed && (
                <>
                  <Eye className='mr-1 h-4 w-4' />
                  <span className='group-hover:hidden'>•••</span>
                  <span className='hidden group-hover:inline'>
                    {formatCurrency(totalIncome, false, false)}
                  </span>
                </>
              )}
              {(!settings.maskValues || isRevealed) &&
                formatCurrency(totalIncome, false, false)}
            </div>
          </div>
        </div>
      </div>

      <div className='px-4'>
        <Tabs defaultValue='by-category' className='mt-4'>
          <TabsList className='grid w-full grid-cols-2 mb-4 bg-muted p-1 rounded-lg'>
            <TabsTrigger
              value='by-category'
              className='data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all'
            >
              By Category
            </TabsTrigger>
            <TabsTrigger
              value='by-daily'
              className='data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 text-sm font-medium transition-all'
            >
              By Daily
            </TabsTrigger>
          </TabsList>

          <TabsContent value='by-category' className='mt-6'>
            <div className='w-full h-96'>
              {shouldUsePieChart ? (
                <PieChart
                  data={byCategoryTransactions}
                  width={undefined}
                  height={undefined}
                />
              ) : (
                <BarChart
                  data={byCategoryTransactions}
                  width={undefined}
                  height={undefined}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value='by-daily' className='mt-6'>
            <div className='w-full h-96'>
              <LineChart
                data={byDayTransactions}
                width={undefined}
                height={undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
