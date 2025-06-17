import { Category, AppSettings } from '@/types'

export const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Makanan',
    emoji: '🍔',
    type: 'expense',
    color: '#F97316',
  },
  {
    id: '2',
    name: 'Transportasi',
    emoji: '🚗',
    type: 'expense',
    color: '#3B82F6',
  },
  {
    id: '3',
    name: 'Belanja',
    emoji: '🛍️',
    type: 'expense',
    color: '#EC4899',
  },
  {
    id: '4',
    name: 'Kesehatan',
    emoji: '💊',
    type: 'expense',
    color: '#10B981',
  },
  {
    id: '5',
    name: 'Hiburan',
    emoji: '🎬',
    type: 'expense',
    color: '#8B5CF6',
  },
  {
    id: '6',
    name: 'Lainnya',
    emoji: '📦',
    type: 'expense',
    color: '#6B7280',
  },
  {
    id: '7',
    name: 'Gaji',
    emoji: '💰',
    type: 'income',
    color: '#10B981',
  },
  {
    id: '8',
    name: 'Bonus',
    emoji: '🎁',
    type: 'income',
    color: '#F59E0B',
  },
  {
    id: '9',
    name: 'Investasi',
    emoji: '📈',
    type: 'income',
    color: '#3B82F6',
  },
  {
    id: '10',
    name: 'Lainnya',
    emoji: '💵',
    type: 'income',
    color: '#6B7280',
  },
]

export const defaultSettings: AppSettings = {
  maskValues: false,
  darkMode: false,
}
