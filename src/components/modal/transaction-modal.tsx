import React, { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { getYesterdayString } from '@/lib/utils'
import { Transaction } from '@/types'
import { useApp } from '@/contexts/app-context'
import { useTransactionForm } from '@/hooks/use-transaction-form'
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
import CategorySelector from '../transactions/category-selector'
import Numpad from '../transactions/numpad'
import CategoryModal from './category-modal'

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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const {
    formData,
    updateField,
    handleNumpadChange,
    validate,
    getTransactionData,
    resetForm,
  } = useTransactionForm(transaction)

  // Reset form ketika modal dibuka untuk transaksi baru
  useEffect(() => {
    if (isOpen && !transaction) {
      resetForm()
    }
  }, [isOpen, transaction, resetForm])

  const handleSubmit = () => {
    if (!validate()) return

    const transactionData = getTransactionData()

    if (transaction) {
      updateTransaction({ ...transactionData, id: transaction.id })
    } else {
      addTransaction(transactionData)
    }

    // Reset form setelah submit jika bukan edit
    if (!transaction) {
      resetForm()
    }

    onClose()
  }

  const handleClose = () => {
    // Reset form ketika modal ditutup untuk transaksi baru
    if (!transaction) {
      resetForm()
    }
    onClose()
  }

  const setYesterdayDate = () => updateField('date', getYesterdayString())

  const title = transaction ? 'Edit Transaksi' : 'Tambah Transaksi'

  // Get current selected date for calendar
  const currentSelectedDate = new Date(formData.date)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side='bottom' className='h-[90vh] pt-6 px-4'>
          <div className='flex justify-between items-center mb-4'>
            <div className='lg:flex-1 lg:block hidden'></div>
            <SheetTitle className='text-lg'>{title}</SheetTitle>
            <div className='flex-1 flex justify-end items-center space-x-2'>
              <Switch
                id='transaction-type'
                checked={formData.type === 'income'}
                onCheckedChange={(checked) =>
                  updateField('type', checked ? 'income' : 'expense')
                }
              />
              <Label htmlFor='transaction-type' className='text-sm lg:pr-12'>
                {formData.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </Label>
            </div>
          </div>

          <div className='flex flex-col h-full pb-14'>
            <div className='text-center mb-6'>
              <h2 className='text-3xl font-bold'>
                Rp {formData.displayAmount}
              </h2>
            </div>

            <CategorySelector
              type={formData.type}
              selectedCategoryId={formData.categoryId}
              onSelect={(categoryId) => updateField('categoryId', categoryId)}
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
                        'w-full justify-start text-left font-normal h-10'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.date ? (
                        format(currentSelectedDate, 'PPP', { locale: id })
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={currentSelectedDate}
                      defaultMonth={currentSelectedDate}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            '0'
                          )
                          const day = String(date.getDate()).padStart(2, '0')
                          updateField('date', `${year}-${month}-${day}`)
                        }
                      }}
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
                  className='h-10 px-3'
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
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>

            <div className='mt-auto'>
              <Numpad
                value={formData.displayAmount}
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
        activeTab={formData.type}
      />
    </>
  )
}

export default TransactionModal
