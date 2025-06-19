import React, { useState, useRef, useEffect } from 'react'
import { Transaction } from '@/types'
import { useApp } from '@/contexts/app-context'
import {
  formatCurrency,
  formatShortDate,
  isToday,
  isYesterday,
} from '@/lib/utils'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  hideDate?: boolean
  isGrouped?: boolean
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  hideDate = false,
  isGrouped = false,
}) => {
  const { getCategory, settings, showMaskedValue, isRevealed } = useApp()
  const category = getCategory(transaction.categoryId)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const formatDateString = (dateString: string) => {
    if (isToday(dateString)) return 'Today'
    if (isYesterday(dateString)) return 'Yesterday'
    return formatShortDate(dateString)
  }

  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.maskValues) showMaskedValue()
  }

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleMenuClick =
    (action: 'edit' | 'delete') => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowMenu(false)
      if (action === 'edit') {
        onEdit(transaction)
      } else {
        onDelete(transaction.id)
      }
    }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const isExpense = transaction.type === 'expense'
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600'
  const amountPrefix = isExpense ? '- ' : '+ '
  const formattedAmount = formatCurrency(transaction.amount, false, false)

  return (
    <>
      <div
        className={`transaction-item w-full relative ${
          !isGrouped
            ? 'bg-background rounded-lg border border-border/30 shadow-sm mb-2'
            : ''
        }`}
      >
        <div
          className={`flex items-center py-3 px-4 w-full cursor-pointer hover:bg-muted/30 transition-colors ${
            !isGrouped ? 'rounded-lg' : ''
          }`}
          onClick={handleItemClick}
        >
          <div
            className='h-10 w-10 rounded-full flex items-center justify-center mr-3'
            style={{ backgroundColor: `${category?.color}20` }}
          >
            <span className='text-lg'>{category?.emoji}</span>
          </div>

          <div className='flex-1 flex items-center justify-between'>
            <div className='flex flex-col'>
              <h3 className='font-medium'>{category?.name}</h3>
              {transaction.notes && (
                <p className='text-sm text-muted-foreground truncate max-w-[200px]'>
                  {transaction.notes}
                </p>
              )}
              {!hideDate && (
                <p className='text-xs text-muted-foreground mt-1'>
                  {formatDateString(transaction.date)}
                </p>
              )}
            </div>

            <div
              className={`flex items-center gap-1 font-medium ${amountColor} group relative`}
              onClick={handleValueClick}
            >
              {settings.maskValues && !isRevealed ? (
                <>
                  <Eye size={14} />
                  <span className='group-hover:hidden'>•••</span>
                  <span className='hidden group-hover:inline'>
                    {amountPrefix}
                    {formattedAmount}
                  </span>
                </>
              ) : (
                <>
                  {amountPrefix}
                  {formattedAmount}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className='fixed z-[9999] bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]'
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <button
            onClick={handleMenuClick('edit')}
            className='w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer text-left'
          >
            <Edit className='h-4 w-4' />
            Ubah
          </button>
          <button
            onClick={handleMenuClick('delete')}
            className='w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer text-destructive text-left'
          >
            <Trash2 className='h-4 w-4' />
            Hapus
          </button>
        </div>
      )}
    </>
  )
}

export default TransactionItem
