'use client'

import SettingsModal from '@/components/modal/settings-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/app-context'
import { useModal } from '@/hooks/use-modal'
import { calculateTotalByType, formatCurrency, formatMonth } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Eye, Search, Settings } from 'lucide-react'
import { useCallback } from 'react'
import Image from 'next/image'
import TransactionItem from '@/components/transactions/transaction-item'
import { Transaction } from '@/types'
import TransactionModal from '@/components/modal/transaction-modal'
import { usePageState } from '@/hooks/use-page-state'

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

  const handleMonthNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      const newMonth = new Date(selectedMonth)
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1))
      setSelectedMonth(newMonth)
    },
    [selectedMonth, setSelectedMonth]
  )

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      if (isDeleting) return

      const confirmed = window.confirm(
        'Apakah Anda yakin ingin menghapus transaksi ini?'
      )
      if (!confirmed) return

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
    [isDeleting, deleteTransaction]
  )

  const handleMaskedValueClick = useCallback(() => {
    if (settings.maskValues) showMaskedValue()
  }, [settings.maskValues, showMaskedValue])

  if (!isHydrated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
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
          onClick={settingsModal.open}
        >
          <Settings className='!h-5 !w-5' />
        </Button>
      </div>

      {/* Month Navigation */}
      <div className='px-4 mb-6'>
        <div className='flex items-center justify-between mb-3'>
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

        {/* Total Expenses */}
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

      {/* Transaction List */}
      <div className='flex-1 px-4'>
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
          <div className='space-y-1'>
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={transactionModal.open}
                onDelete={handleDeleteTransaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isDeleting && (
        <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-[10000]'>
          <div className='bg-background p-4 rounded-lg shadow-lg flex items-center gap-3'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
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
    </>
  )
}
