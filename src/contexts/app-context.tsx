'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Transaction, Category, AppSettings } from '@/types'
import { defaultCategories, defaultSettings } from '@/data/constants'
import { toast } from 'sonner'

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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealTimer, setRevealTimer] = useState<NodeJS.Timeout | null>(null)

  // Define getCategory function before it's used in filteredTransactions
  const getCategory = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  // Load data from localStorage on initialization
  useEffect(() => {
    const storedTransactions = localStorage.getItem('catatinko_transactions')
    const storedCategories = localStorage.getItem('catatinko_categories')
    const storedSettings = localStorage.getItem('catatinko_settings')

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories))
    } else {
      setCategories(defaultCategories)
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    } else {
      setSettings(defaultSettings)
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('catatinko_transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('catatinko_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('catatinko_settings', JSON.stringify(settings))

    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings])

  const showMaskedValue = (timeout = 3000) => {
    setIsRevealed(true)

    if (revealTimer) {
      clearTimeout(revealTimer)
    }

    const timer = setTimeout(() => {
      setIsRevealed(false)
    }, timeout)

    setRevealTimer(timer)
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      // Filter by month
      const transactionDate = new Date(transaction.date)
      const isCurrentMonth =
        transactionDate.getMonth() === selectedMonth.getMonth() &&
        transactionDate.getFullYear() === selectedMonth.getFullYear()

      // Filter by search query
      const matchesSearch = searchQuery
        ? transaction.notes
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getCategory(transaction.categoryId)
            ?.name.toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true

      return isCurrentMonth && matchesSearch
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    }
    setTransactions((prev) => [...prev, newTransaction])
    toast.success('Transaction added successfully')
  }

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction.id ? transaction : t))
    )
    toast.success('Transaction updated successfully')
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success('Transaction deleted successfully', {
      action: {
        label: 'Undo',
        onClick: () => {
          const deletedTransaction = transactions.find((t) => t.id === id)
          if (deletedTransaction) {
            setTransactions((prev) => [...prev, deletedTransaction])
          }
        },
      },
    })
  }

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: crypto.randomUUID(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (category: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    )
  }

  const deleteCategory = (id: string) => {
    // Check if category is being used
    const isUsed = transactions.some((t) => t.categoryId === id)

    if (isUsed) {
      toast.error(
        'Category is being used in transactions and cannot be deleted'
      )
      return
    }

    setCategories((prev) => prev.filter((c) => c.id !== id))
    toast.success('Category deleted successfully')
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev: AppSettings) => ({ ...prev, ...newSettings }))
  }

  const resetData = () => {
    if (
      confirm('Are you sure you want to reset all data? This cannot be undone.')
    ) {
      setTransactions([])
      setCategories(defaultCategories)
      setSettings(defaultSettings)
      toast.success('All data has been reset')
    }
  }

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        settings,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
