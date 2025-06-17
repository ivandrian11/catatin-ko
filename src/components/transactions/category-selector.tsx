import React from 'react'
import { useApp } from '@/contexts/app-context'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CategorySelectorProps {
  type: 'expense' | 'income'
  selectedCategoryId: string
  onSelect: (categoryId: string) => void
  onEdit: () => void
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  selectedCategoryId,
  onSelect,
  onEdit,
}) => {
  const { categories } = useApp()

  const filteredCategories: Category[] = categories.filter(
    (category: Category) => category.type === type
  )

  return (
    <div className='my-4'>
      <h3 className='text-sm font-medium mb-2 text-muted-foreground'>
        Category
      </h3>
      <ScrollArea className='w-full pb-2'>
        <div className='flex space-x-3 p-1'>
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`category-item ${
                selectedCategoryId === category.id
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : ''
              }`}
            >
              <span className='category-emoji'>{category.emoji}</span>
              <span className='text-xs'>{category.name}</span>
            </button>
          ))}
          <Button variant='ghost' onClick={onEdit} className='category-item'>
            <Pencil size={24} className='mb-1' />
            <span className='text-xs'>Edit</span>
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}

export default CategorySelector
