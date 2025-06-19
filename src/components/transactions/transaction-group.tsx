import React from 'react'
import { Transaction } from '@/types'
import {
  formatCurrency,
  formatShortDate,
  isToday,
  isYesterday,
} from '@/lib/utils'
import TransactionItem from './transaction-item'

interface TransactionGroupProps {
  date: string
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  date,
  transactions,
  onEdit,
  onDelete,
}) => {
  const formatDateString = (dateString: string) => {
    if (isToday(dateString)) return 'Today'
    if (isYesterday(dateString)) return 'Yesterday'
    return formatShortDate(dateString)
  }

  const totalAmount = transactions.reduce(
    (sum, transaction) =>
      sum +
      (transaction.type === 'expense'
        ? -transaction.amount
        : transaction.amount),
    0
  )

  const isMultipleTransactions = transactions.length > 1

  return (
    <div className='mb-4'>
      <div className='bg-background border border-border/30 rounded-lg shadow-sm overflow-hidden'>
        {/* Date Header */}
        <div className='flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/30'>
          <h3 className='font-medium text-sm text-muted-foreground'>
            {formatDateString(date)}
          </h3>
          {isMultipleTransactions && (
            <span
              className={`text-sm font-medium ${
                totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalAmount >= 0 ? '+' : '-'}
              {formatCurrency(Math.abs(totalAmount), false, false)}
            </span>
          )}
        </div>

        {/* Transactions List */}
        <div>
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={
                index < transactions.length - 1
                  ? 'border-b border-border/30'
                  : ''
              }
            >
              <TransactionItem
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
                hideDate={true}
                isGrouped={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TransactionGroup
