import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Transaction } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  mask = false,
  revealed = false
): string {
  if (mask && !revealed) {
    return '•••'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: string): string {
  // Remove all non-digit characters except operators
  const cleanValue = value.replace(/[^\d+\-×÷]/g, '')

  // Split by operators to format each number part
  const parts = cleanValue.split(/([+\-×÷])/)

  return parts
    .map((part) => {
      // If it's an operator, return as is
      if (['+', '-', '×', '÷'].includes(part)) {
        return part
      }

      // If it's a number, format it
      if (part && /^\d+$/.test(part)) {
        return new Intl.NumberFormat('id-ID').format(parseInt(part))
      }

      return part
    })
    .join('')
}

export function parseFormattedNumber(formattedValue: string): string {
  // Remove dots used for thousands separator
  return formattedValue.replace(/\./g, '')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getWeekNumber(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDayOfMonth.getDay()

  // Calculate days from the first day of the month to the input date
  const days = date.getDate() - 1

  // Calculate the week number
  return Math.floor((days + dayOfWeek) / 7) + 1
}

export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    const amount = t.type === 'income' ? t.amount : -t.amount
    return sum + amount
  }, 0)
}

export function calculateTotalByType(
  transactions: Transaction[],
  type: 'expense' | 'income'
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export function groupTransactionsByCategory(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce((grouped, transaction) => {
    const categoryId = transaction.categoryId

    if (!grouped[categoryId]) {
      grouped[categoryId] = []
    }

    grouped[categoryId].push(transaction)
    return grouped
  }, {} as Record<string, Transaction[]>)
}

export function groupTransactionsByWeek(
  transactions: Transaction[]
): Record<number, Transaction[]> {
  return transactions.reduce((grouped, transaction) => {
    const date = new Date(transaction.date)
    const weekNumber = getWeekNumber(date)

    if (!grouped[weekNumber]) {
      grouped[weekNumber] = []
    }

    grouped[weekNumber].push(transaction)
    return grouped
  }, {} as Record<number, Transaction[]>)
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function isYesterday(dateString: string): boolean {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}
