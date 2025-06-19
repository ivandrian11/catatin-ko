import { useState, useEffect, useCallback } from 'react'
import { Transaction } from '@/types'
import { getTodayString, formatNumber, parseFormattedNumber } from '@/lib/utils'

export const useTransactionForm = (transaction?: Transaction) => {
  const [formData, setFormData] = useState({
    amount: '0',
    displayAmount: '0',
    type: 'expense' as 'expense' | 'income',
    categoryId: '',
    date: getTodayString(),
    notes: '',
  })

  useEffect(() => {
    if (transaction) {
      const formattedAmount = formatNumber(transaction.amount.toString())
      setFormData({
        amount: transaction.amount.toString(),
        displayAmount: formattedAmount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: transaction.date,
        notes: transaction.notes || '',
      })
    } else {
      setFormData({
        amount: '0',
        displayAmount: '0',
        type: 'expense',
        categoryId: '',
        date: getTodayString(),
        notes: '',
      })
    }
  }, [transaction])

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumpadChange = (value: string) => {
    updateField('displayAmount', value)

    try {
      const unformattedValue = parseFormattedNumber(value)
      const numericValue = eval(
        unformattedValue.replace(/×/g, '*').replace(/÷/g, '/')
      )
      updateField('amount', numericValue.toString())
    } catch {
      const unformattedValue = parseFormattedNumber(value)
      updateField('amount', unformattedValue)
    }
  }

  const validate = () => {
    const numericAmount = parseFloat(formData.amount) || 0

    if (numericAmount <= 0) {
      alert('Amount must be greater than zero')
      return false
    }

    if (!formData.categoryId) {
      alert('Please select a category')
      return false
    }

    return true
  }

  const getTransactionData = () => ({
    amount: parseFloat(formData.amount) || 0,
    type: formData.type,
    categoryId: formData.categoryId,
    date: formData.date,
    notes: formData.notes.trim() || undefined,
  })

  // Tambahkan di hook useTransactionForm
  const resetForm = useCallback(() => {
    setFormData({
      amount: '0',
      displayAmount: '0',
      type: 'expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }, [])

  // Tambahkan resetForm ke return statement
  return {
    formData,
    updateField,
    handleNumpadChange,
    validate,
    getTransactionData,
    resetForm, // Tambahkan ini
  }
}
