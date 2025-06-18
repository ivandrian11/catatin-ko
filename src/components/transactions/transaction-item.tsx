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
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const { getCategory, settings, showMaskedValue, isRevealed } = useApp()
  const category = getCategory(transaction.categoryId)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const formatDateString = (dateString: string) => {
    if (isToday(dateString)) {
      return 'Today'
    } else if (isYesterday(dateString)) {
      return 'Yesterday'
    } else {
      return formatShortDate(dateString)
    }
  }

  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.maskValues) {
      showMaskedValue()
    }
  }

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Calculate position relative to viewport
    const x = e.clientX
    const y = e.clientY

    setMenuPosition({ x, y })
    setShowMenu(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    onDelete(transaction.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu(false)
    onEdit(transaction)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <>
      <div className='bg-background transaction-item w-full relative'>
        <div
          className='flex items-center py-3 px-4 w-full cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={handleItemClick}
        >
          <div
            className='h-10 w-10 rounded-full flex items-center justify-center mr-3'
            style={{ backgroundColor: `${category?.color}20` }}
          >
            <span className='text-lg'>{category?.emoji}</span>
          </div>
          <div className='flex-1'>
            <div className='flex justify-between'>
              <h3 className='font-medium'>{category?.name}</h3>
              <div
                className={`flex items-center gap-1 font-medium ${
                  transaction.type === 'expense'
                    ? 'text-expense'
                    : 'text-income'
                } group relative`}
                onClick={handleValueClick}
              >
                {settings.maskValues && !isRevealed && (
                  <>
                    <Eye size={14} />
                    <span className='group-hover:hidden'>•••</span>
                    <span className='hidden group-hover:inline'>
                      {transaction.type === 'expense' ? '- ' : '+ '}
                      {formatCurrency(transaction.amount, false, false)}
                    </span>
                  </>
                )}
                {(!settings.maskValues || isRevealed) && (
                  <>
                    {transaction.type === 'expense' ? '- ' : '+ '}
                    {formatCurrency(transaction.amount, false, false)}
                  </>
                )}
              </div>
            </div>
            {transaction.notes && (
              <p className='text-sm text-muted-foreground truncate max-w-[200px]'>
                {transaction.notes}
              </p>
            )}
            <p className='text-xs text-muted-foreground mt-1'>
              {formatDateString(transaction.date)}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Context Menu - Rendered as portal */}
      {showMenu && (
        <div
          ref={menuRef}
          className='fixed z-[9999] bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]'
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
        >
          <button
            onClick={handleEdit}
            className='w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer text-left'
          >
            <Edit className='h-4 w-4' />
            Ubah
          </button>
          <button
            onClick={handleDelete}
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
