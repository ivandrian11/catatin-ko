import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApp } from '@/contexts/app-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2 } from 'lucide-react'
import { Category } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab?: 'expense' | 'income'
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'expense',
}) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp()

  const [tab, setTab] = useState<'expense' | 'income'>(activeTab)
  const [categoryName, setCategoryName] = useState('')
  const [categoryEmoji, setCategoryEmoji] = useState('📋')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleTabChange = (value: string) => {
    setTab(value as 'expense' | 'income')
  }

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      alert('Please enter a category name')
      return
    }

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: categoryName,
        emoji: categoryEmoji,
      })
    } else {
      addCategory({
        name: categoryName,
        emoji: categoryEmoji,
        type: tab,
        color: getRandomColor(),
      })
    }

    resetForm()
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryEmoji(category.emoji)
  }

  const handleDeleteCategory = () => {
    if (editingCategory) {
      deleteCategory(editingCategory.id)
      resetForm()
      setShowDeleteDialog(false)
    }
  }

  const resetForm = () => {
    setEditingCategory(null)
    setCategoryName('')
    setCategoryEmoji('📋')
  }

  const getRandomColor = () => {
    const colors = [
      '#F97316', // Orange
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#F59E0B', // Amber
      '#6B7280', // Gray
    ]

    return colors[Math.floor(Math.random() * colors.length)]
  }

  const filteredCategories = categories.filter((cat) => cat.type === tab)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='px-4'>
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue={tab} onValueChange={handleTabChange}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='expense'>Pengeluaran</TabsTrigger>
              <TabsTrigger value='income'>Pemasukan</TabsTrigger>
            </TabsList>

            <TabsContent value='expense' className='mt-4'>
              <CategoryList
                categories={filteredCategories}
                onEdit={handleEditCategory}
              />
            </TabsContent>

            <TabsContent value='income' className='mt-4'>
              <CategoryList
                categories={filteredCategories}
                onEdit={handleEditCategory}
              />
            </TabsContent>
          </Tabs>

          <div className='mt-6 border-t pt-4'>
            <h3 className='text-sm font-medium mb-2'>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <div className='flex items-center space-x-2 mb-4'>
              <Input
                className='w-14 text-center text-xl'
                value={categoryEmoji}
                onChange={(e) => setCategoryEmoji(e.target.value)}
              />
              <Input
                placeholder='Category name'
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className='flex justify-between'>
              {editingCategory ? (
                <>
                  <Button variant='outline' onClick={resetForm}>
                    Cancel
                  </Button>
                  <div className='space-x-2'>
                    <Button
                      variant='destructive'
                      onClick={() => setShowDeleteDialog(true)}
                      size='icon'
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button onClick={handleAddCategory}>Save</Button>
                  </div>
                </>
              ) : (
                <Button onClick={handleAddCategory} className='ml-auto'>
                  Add Category
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category. This action cannot be undone if the
              category is not being used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit }) => {
  return (
    <div className='grid grid-cols-3 gap-2'>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant='outline'
          className='flex flex-col items-center p-3 h-auto'
          onClick={() => onEdit(category)}
        >
          <span className='text-2xl mb-1'>{category.emoji}</span>
          <span className='text-xs'>{category.name}</span>
        </Button>
      ))}
      {categories.length === 0 && (
        <div className='col-span-3 py-8 text-center text-muted-foreground'>
          No categories found. Add one below.
        </div>
      )}
    </div>
  )
}

export default CategoryModal
