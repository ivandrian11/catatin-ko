'use client'

import SettingsModal from '@/components/modal/settings-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/app-context'
import { useModal } from '@/hooks/use-modal'
import { calculateTotalByType, formatCurrency } from '@/lib/utils'
import { Eye, Search, Settings } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Transaction } from '@/types'
import TransactionModal from '@/components/modal/transaction-modal'
import { usePageState } from '@/hooks/use-page-state'
import TransactionGroup from '@/components/transactions/transaction-group'
import MonthNavigation from '@/components/month-navigation'

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
    deleteTransaction,
  } = useApp()

  const { isHydrated, isDeleting, setIsDeleting } = usePageState()
  const transactionModal = useModal<Transaction>()
  const settingsModal = useModal()

  const totalExpenses = calculateTotalByType(filteredTransactions, 'expense')

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = filteredTransactions.reduce((acc, transaction) => {
      const dateKey = transaction.date
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(transaction)
      return acc
    }, {} as Record<string, Transaction[]>)

    return Object.entries(groups)
      .map(([date, transactions]) => ({ date, transactions }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filteredTransactions])

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      if (
        isDeleting ||
        !window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')
      )
        return

      try {
        setIsDeleting(true)
        deleteTransaction(id)
      } catch (error) {
        console.error('Error deleting transaction:', error)
        alert('Gagal menghapus transaksi. Silakan coba lagi.')
      } finally {
        setIsDeleting(false)
      }
    },
    [isDeleting, deleteTransaction, setIsDeleting]
  )

  const handleMaskedValueClick = useCallback(() => {
    if (settings.maskValues) showMaskedValue()
  }, [settings.maskValues, showMaskedValue])

  if (!isHydrated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='sticky top-0 bg-background z-10 px-4 py-4 flex items-center gap-3 border-b'>
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
          onClick={settingsModal.open}
        >
          <Settings className='!h-5 !w-5' />
        </Button>
      </div>

      {/* Month Navigation */}
      <div className='bg-background px-4 py-4 border-b'>
        <MonthNavigation
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          className='mb-3'
        />

        {/* Total Expenses */}
        <div className='bg-accent p-4 rounded-lg'>
          <p className='text-sm text-muted-foreground mb-1'>
            Total Pengeluaran
          </p>
          <div
            className='text-2xl font-bold flex items-center group relative cursor-pointer'
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

      {/* Transaction List */}
      <div className='flex-1 overflow-y-auto pb-20'>
        <div className='px-4 py-4'>
          {filteredTransactions.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Image
                src='/no-data.png'
                alt='No expenses yet'
                className='w-56 h-56 mb-4 pointer-events-none'
                width={224}
                height={224}
              />
              <p className='text-muted-foreground max-w-xs mb-4'>
                Tap &apos;+&apos; to record your first transaction and start
                managing your spending.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {groupedTransactions.map(({ date, transactions }) => (
                <TransactionGroup
                  key={date}
                  date={date}
                  transactions={transactions}
                  onEdit={transactionModal.open}
                  onDelete={handleDeleteTransaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isDeleting && (
        <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-[10000]'>
          <div className='bg-background p-4 rounded-lg shadow-lg flex items-center gap-3'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary' />
            <span className='text-sm'>Menghapus transaksi...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={transactionModal.close}
        transaction={transactionModal.data}
      />
      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.close}
      />
    </div>
  )
}
