import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { Transaction } from '@/types'
import CategoryModal from './category-modal'
import { useApp } from '@/contexts/app-context'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, transactions, updateSettings, resetData } = useApp()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['id', 'amount', 'type', 'categoryId', 'date', 'notes']
    const csvContent = [
      headers.join(','),
      ...transactions.map((transaction) => {
        return headers
          .map((header) => {
            const value = transaction[header as keyof Transaction]
            // Handle quotes in strings and undefined values
            if (value === undefined) return ''
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`
            }
            return value
          })
          .join(',')
      }),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `catatin-ko-export-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('CSV exported successfully')
  }

  const handleCopyToClipboard = () => {
    const jsonData = JSON.stringify(transactions)
    navigator.clipboard
      .writeText(jsonData)
      .then(() => toast.success('Data copied to clipboard'))
      .catch(() => toast.error('Failed to copy data'))
  }

  const handleImportFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const parsedData = JSON.parse(clipboardText)

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Simple validation
        if (
          'id' in parsedData[0] &&
          'amount' in parsedData[0] &&
          'type' in parsedData[0] &&
          'categoryId' in parsedData[0] &&
          'date' in parsedData[0]
        ) {
          localStorage.setItem('catatinko_transactions', clipboardText)
          toast.success(
            'Data imported successfully. Refresh the page to see changes.'
          )
        } else {
          toast.error('Invalid data format')
        }
      } else {
        toast.error('No valid data found in clipboard')
      }
    } catch (error) {
      toast.error('Failed to import data')
      console.error('Import error:', error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>

          <div className='space-y-6 px-4'>
            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              className='w-full'
            >
              Manage Categories
            </Button>

            <div>
              <h3 className='text-lg font-medium mb-4'>Export & Import</h3>
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleExportCSV}
                >
                  Download CSV
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleCopyToClipboard}
                >
                  Copy to Clipboard
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleImportFromClipboard}
                >
                  Import from Clipboard
                </Button>
              </div>
            </div>

            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='advanced-settings'>
                <AccordionTrigger>Advanced Settings</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='dark-mode'>Dark Mode</Label>
                      <Switch
                        id='dark-mode'
                        checked={settings.darkMode}
                        onCheckedChange={(checked) =>
                          updateSettings({ darkMode: checked })
                        }
                      />
                    </div>

                    <Button
                      variant='destructive'
                      className='w-full'
                      onClick={resetData}
                    >
                      Reset All Data
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='data-sync'>
                <AccordionTrigger>Data Sync</AccordionTrigger>
                <AccordionContent>
                  <p className='text-muted-foreground text-sm mb-4'>
                    Future integrations will be available here.
                  </p>
                  <Button variant='outline' className='w-full' disabled>
                    Connect Account
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div>
              <h3 className='text-lg font-medium mb-4'>Privacy Options</h3>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='mask-values' className='block mb-1'>
                    Mask Values
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Hide amounts until tapped
                  </p>
                </div>
                <Switch
                  id='mask-values'
                  checked={settings.maskValues}
                  onCheckedChange={(checked) =>
                    updateSettings({ maskValues: checked })
                  }
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  )
}

export default SettingsModal
