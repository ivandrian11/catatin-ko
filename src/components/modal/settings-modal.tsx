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
import { Input } from '@/components/ui/input'
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
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Loader2 } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    transactions,
    categories,
    updateSettings,
    resetData,
    setTransactions,
    setCategories,
  } = useApp()
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [sheetId, setSheetId] = useLocalStorage('catatinko_sheet_id', '')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

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

  const handleExportToSheets = async () => {
    if (!sheetId.trim()) {
      toast.error('Please enter a Sheet ID')
      return
    }

    setIsExporting(true)
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId: sheetId.trim(),
          transactions,
          categories,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Data exported to Google Sheets successfully!')
      } else {
        toast.error(result.error || 'Failed to export data')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data to Google Sheets')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportFromSheets = async () => {
    if (!sheetId.trim()) {
      toast.error('Please enter a Sheet ID')
      return
    }

    setIsImporting(true)
    try {
      const response = await fetch(
        `/api/sheets?sheetId=${encodeURIComponent(sheetId.trim())}`
      )
      const result = await response.json()

      if (response.ok) {
        // Update local storage and state with imported data
        if (result.transactions && result.transactions.length > 0) {
          setTransactions(result.transactions)
          toast.success(`Imported ${result.transactions.length} transactions`)
        }

        if (result.categories && result.categories.length > 0) {
          setCategories(result.categories)
          toast.success(`Imported ${result.categories.length} categories`)
        }

        if (
          result.transactions.length === 0 &&
          result.categories.length === 0
        ) {
          toast.info('No data found in the spreadsheet')
        }
      } else {
        toast.error(result.error || 'Failed to import data')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import data from Google Sheets')
    } finally {
      setIsImporting(false)
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
              <AccordionItem value='data-sync'>
                <AccordionTrigger>Data Sync</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='sheet-id' className='block mb-2'>
                        Google Sheet ID
                      </Label>
                      <Input
                        id='sheet-id'
                        placeholder='Enter your Google Sheet ID'
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        Get the ID from your Google Sheet URL
                      </p>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        variant='outline'
                        onClick={handleExportToSheets}
                        disabled={isExporting || !sheetId.trim()}
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Exporting...
                          </>
                        ) : (
                          'Export to Sheets'
                        )}
                      </Button>

                      <Button
                        variant='outline'
                        onClick={handleImportFromSheets}
                        disabled={isImporting || !sheetId.trim()}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Importing...
                          </>
                        ) : (
                          'Import from Sheets'
                        )}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

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
