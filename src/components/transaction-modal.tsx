import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  getTodayString,
  getYesterdayString,
  formatNumber,
  parseFormattedNumber,
} from '@/lib/utils'
import { Transaction } from '@/types'
import { useApp } from '@/contexts/app-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import CategoryModal from './category-modal'
import CategorySelector from './transactions/category-selector'
import Numpad from './transactions/numpad'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { addTransaction, updateTransaction } = useApp()

  const [amount, setAmount] = useState('0')
  const [displayAmount, setDisplayAmount] = useState('0')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(getTodayString())
  const [notes, setNotes] = useState('')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // Edit mode
        const formattedAmount = formatNumber(transaction.amount.toString())
        setAmount(transaction.amount.toString())
        setDisplayAmount(formattedAmount)
        setType(transaction.type)
        setCategoryId(transaction.categoryId)
        setDate(transaction.date)
        setNotes(transaction.notes || '')
      } else {
        // Add mode
        setAmount('0')
        setDisplayAmount('0')
        setType('expense')
        setCategoryId('')
        setDate(getTodayString())
        setNotes('')
      }
    }
  }, [isOpen, transaction])

  const handleNumpadChange = (value: string) => {
    setDisplayAmount(value)

    // Extract numeric value for saving
    try {
      const unformattedValue = parseFormattedNumber(value)
      const numericValue = eval(
        unformattedValue.replace(/×/g, '*').replace(/÷/g, '/')
      )
      setAmount(numericValue.toString())
    } catch {
      const unformattedValue = parseFormattedNumber(value)
      setAmount(unformattedValue)
    }
  }

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount) || 0

    if (numericAmount <= 0) {
      alert('Amount must be greater than zero')
      return
    }

    if (!categoryId) {
      alert('Please select a category')
      return
    }

    const transactionData = {
      amount: numericAmount,
      type,
      categoryId,
      date,
      notes: notes.trim() || undefined,
    }

    if (transaction) {
      // Update existing transaction
      updateTransaction({
        ...transactionData,
        id: transaction.id,
      })
    } else {
      // Add new transaction
      addTransaction(transactionData)
    }

    onClose()
  }

  const setYesterdayDate = () => {
    setDate(getYesterdayString())
  }

  const title = transaction ? 'Edit Transaksi' : 'Tambah Transaksi'

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side='bottom' className='h-[90vh] pt-6 px-4'>
          <div className='flex justify-between items-center mb-4'>
            <div className='lg:flex-1 lg:block hidden'></div>
            <SheetTitle className='text-lg'>{title}</SheetTitle>
            <div className='flex-1 flex justify-end items-center space-x-2'>
              <Switch
                id='transaction-type'
                checked={type === 'income'}
                onCheckedChange={(checked) =>
                  setType(checked ? 'income' : 'expense')
                }
              />
              <Label htmlFor='transaction-type' className='text-sm lg:pr-12'>
                {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Label>
            </div>
          </div>

          <div className='flex flex-col h-full pb-14'>
            <div className='text-center mb-6'>
              <h2 className='text-3xl font-bold'>Rp {displayAmount}</h2>
            </div>

            <CategorySelector
              type={type}
              selectedCategoryId={categoryId}
              onSelect={setCategoryId}
              onEdit={() => setIsCategoryModalOpen(true)}
            />

            <div className='flex space-x-2 mb-4'>
              <div className='flex-1'>
                <Label
                  htmlFor='transaction-date'
                  className='text-sm font-medium text-muted-foreground mb-2 block'
                >
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id='transaction-date'
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {date ? (
                        format(new Date(date), 'PPP', { locale: id })
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={new Date(date)}
                      onSelect={(date: Date | undefined) =>
                        setDate(
                          date?.toISOString().split('T')[0] || getTodayString()
                        )
                      }
                      initialFocus
                      className='pointer-events-auto'
                    />
                    <div className='p-2 border-t'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start'
                        onClick={setYesterdayDate}
                      >
                        Kemarin?
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex items-end'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-10'
                  onClick={setYesterdayDate}
                >
                  Kemarin?
                </Button>
              </div>
            </div>

            <div className='mb-4'>
              <Label
                htmlFor='transaction-notes'
                className='text-sm font-medium text-muted-foreground mb-2 block'
              >
                Notes (Optional)
              </Label>
              <Input
                id='transaction-notes'
                placeholder='Tambahkan catatan'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className='mt-auto'>
              <Numpad
                value={displayAmount}
                onChange={handleNumpadChange}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        activeTab={type}
      />
    </>
  )
}

export default TransactionModal
