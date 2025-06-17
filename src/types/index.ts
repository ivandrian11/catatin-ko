export interface Transaction {
  id: string
  amount: number
  type: 'expense' | 'income'
  categoryId: string
  date: string
  notes?: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  type: 'expense' | 'income'
  color?: string
}

export interface AppSettings {
  maskValues: boolean
  darkMode: boolean
}

export interface DateRange {
  start: string
  end: string
}
