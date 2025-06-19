'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { Transaction, Category, AppSettings } from '@/types'
import { defaultCategories, defaultSettings } from '@/data/constants'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface AppContextProps {
  transactions: Transaction[]
  categories: Category[]
  settings: AppSettings
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  getCategory: (id: string) => Category | undefined
  resetData: () => void
  selectedMonth: Date
  setSelectedMonth: (date: Date) => void
  filteredTransactions: Transaction[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  showMaskedValue: (timeout?: number) => void
  isRevealed: boolean
  setTransactions: (transactions: Transaction[]) => void
  setCategories: (categories: Category[]) => void
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [transactions, setStoredTransactions] = useLocalStorage<Transaction[]>(
    'catatinko_transactions',
    []
  )
  const [categories, setStoredCategories] = useLocalStorage<Category[]>(
    'catatinko_categories',
    defaultCategories
  )
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'catatinko_settings',
    defaultSettings
  )

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealTimer, setRevealTimer] = useState<NodeJS.Timeout | null>(null)

  // Apply dark mode when settings change
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  // Direct setters for external updates (like Google Sheets sync)
  const setTransactions = useCallback(
    (newTransactions: Transaction[]) => {
      setStoredTransactions(newTransactions)
    },
    [setStoredTransactions]
  )

  const setCategories = useCallback(
    (newCategories: Category[]) => {
      setStoredCategories(newCategories)
    },
    [setStoredCategories]
  )

  // Memoized utility functions
  const getCategory = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  )

  const showMaskedValue = useCallback(
    (timeout = 3000) => {
      setIsRevealed(true)
      if (revealTimer) clearTimeout(revealTimer)
      const timer = setTimeout(() => setIsRevealed(false), timeout)
      setRevealTimer(timer)
    },
    [revealTimer]
  )

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    const monthFilter = (transaction: Transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transactionDate.getMonth() === selectedMonth.getMonth() &&
        transactionDate.getFullYear() === selectedMonth.getFullYear()
      )
    }

    const searchFilter = (transaction: Transaction) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        transaction.notes?.toLowerCase().includes(query) ||
        getCategory(transaction.categoryId)?.name.toLowerCase().includes(query)
      )
    }

    return transactions
      .filter(
        (transaction) => monthFilter(transaction) && searchFilter(transaction)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, selectedMonth, searchQuery, getCategory])

  // Transaction operations with undo functionality
  const transactionOperations = useMemo(
    () => ({
      add: (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID() }
        setStoredTransactions((prev) => [...prev, newTransaction])
        toast.success('Transaction added successfully')
      },

      update: (transaction: Transaction) => {
        setStoredTransactions((prev) =>
          prev.map((t) => (t.id === transaction.id ? transaction : t))
        )
        toast.success('Transaction updated successfully')
      },

      delete: (id: string) => {
        const transactionToDelete = transactions.find((t) => t.id === id)
        setStoredTransactions((prev) => prev.filter((t) => t.id !== id))

        toast.success('Transaction deleted successfully', {
          action: {
            label: 'Undo',
            onClick: () =>
              transactionToDelete &&
              setStoredTransactions((prev) => [...prev, transactionToDelete]),
          },
        })
      },
    }),
    [transactions, setStoredTransactions]
  )

  // Category operations
  const categoryOperations = useMemo(
    () => ({
      add: (category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: crypto.randomUUID() }
        setStoredCategories((prev) => [...prev, newCategory])
      },

      update: (category: Category) => {
        setStoredCategories((prev) =>
          prev.map((c) => (c.id === category.id ? category : c))
        )
      },

      delete: (id: string) => {
        const isUsed = transactions.some((t) => t.categoryId === id)
        if (isUsed) {
          toast.error(
            'Category is being used in transactions and cannot be deleted'
          )
          return
        }
        setStoredCategories((prev) => prev.filter((c) => c.id !== id))
        toast.success('Category deleted successfully')
      },
    }),
    [transactions, setStoredCategories]
  )

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))
    },
    [setSettings]
  )

  const resetData = useCallback(() => {
    if (
      confirm('Are you sure you want to reset all data? This cannot be undone.')
    ) {
      setStoredTransactions([])
      setStoredCategories(defaultCategories)
      setSettings(defaultSettings)
      toast.success('All data has been reset')
    }
  }, [setStoredTransactions, setStoredCategories, setSettings])

  const contextValue = useMemo(
    () => ({
      transactions,
      categories,
      settings,
      addTransaction: transactionOperations.add,
      updateTransaction: transactionOperations.update,
      deleteTransaction: transactionOperations.delete,
      addCategory: categoryOperations.add,
      updateCategory: categoryOperations.update,
      deleteCategory: categoryOperations.delete,
      updateSettings,
      getCategory,
      resetData,
      selectedMonth,
      setSelectedMonth,
      filteredTransactions,
      searchQuery,
      setSearchQuery,
      showMaskedValue,
      isRevealed,
      setTransactions,
      setCategories,
    }),
    [
      transactions,
      categories,
      settings,
      selectedMonth,
      filteredTransactions,
      searchQuery,
      isRevealed,
      transactionOperations,
      categoryOperations,
      updateSettings,
      getCategory,
      resetData,
      showMaskedValue,
      setTransactions,
      setCategories,
    ]
  )

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}
