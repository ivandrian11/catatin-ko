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
      <h3 className='text-sm font-medium mb-3 text-muted-foreground'>
        Category
      </h3>
      <ScrollArea className='w-full pb-2'>
        <div className='flex space-x-3 p-1'>
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                flex flex-col items-center justify-center
                min-w-[60px] h-[60px] p-2 rounded-xl
                border border-transparent
                transition-all duration-200 ease-in-out
                active:scale-95 cursor-pointer
                ${
                  selectedCategoryId === category.id
                    ? 'bg-primary/15 border-primary/30 ring-2 ring-primary/50 shadow-sm'
                    : 'bg-background hover:bg-muted hover:border-border/20 hover:shadow-sm'
                }
              `}
            >
              <span className='text-lg mb-1'>{category.emoji}</span>
              <span className='text-xs font-medium leading-tight text-center'>
                {category.name}
              </span>
            </button>
          ))}
          <Button
            variant='ghost'
            onClick={onEdit}
            className='
              flex flex-col items-center justify-center
              min-w-[60px] h-[60px] p-2 rounded-xl
              border border-dashed border-border/40
              hover:border-border/60 hover:bg-muted/50
              transition-all duration-200 ease-in-out
              active:scale-95 cursor-pointer
            '
          >
            <Pencil size={18} className='mb-1 text-muted-foreground' />
            <span className='text-xs font-medium text-muted-foreground'>
              Edit
            </span>
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}

export default CategorySelector
