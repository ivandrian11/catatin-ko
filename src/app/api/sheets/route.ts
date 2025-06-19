import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import credentials from '@/data/google-sheets-api.json'
import { Category } from '@/types'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

async function getDoc(sheetId: string) {
  const serviceAccountAuth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  })

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth)
  await doc.loadInfo()
  return doc
}

// GET - Import data from Google Sheets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetId = searchParams.get('sheetId')

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      )
    }

    const doc = await getDoc(sheetId)

    // Get transactions sheet
    const transactionsSheet = doc.sheetsByTitle['Transactions']
    if (!transactionsSheet) {
      return NextResponse.json({ transactions: [], categories: [] })
    }

    const transactionRows = await transactionsSheet.getRows()
    const transactions = transactionRows.map((row) => ({
      id: row.get('id'),
      amount: parseFloat(row.get('amount')),
      type: row.get('type'),
      categoryId: row.get('categoryId'),
      date: row.get('date'),
      notes: row.get('notes') || '',
    }))

    // Get categories sheet
    const categoriesSheet = doc.sheetsByTitle['Categories']
    let categories: Category[] = []
    if (categoriesSheet) {
      const categoryRows = await categoriesSheet.getRows()
      categories = categoryRows.map((row) => ({
        id: row.get('id'),
        name: row.get('name'),
        emoji: row.get('emoji'),
        type: row.get('type'),
        color: row.get('color'),
      }))
    }

    return NextResponse.json({ transactions, categories })
  } catch (error) {
    console.error('Error importing from Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to import data from Google Sheets' },
      { status: 500 }
    )
  }
}

// POST - Export data to Google Sheets
export async function POST(request: NextRequest) {
  try {
    const { sheetId, transactions, categories } = await request.json()

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      )
    }

    const doc = await getDoc(sheetId)

    // Handle transactions sheet
    let transactionsSheet = doc.sheetsByTitle['Transactions']
    if (!transactionsSheet) {
      transactionsSheet = await doc.addSheet({
        title: 'Transactions',
        headerValues: ['id', 'amount', 'type', 'categoryId', 'date', 'notes'],
      })
    } else {
      await transactionsSheet.clear()
      await transactionsSheet.setHeaderRow([
        'id',
        'amount',
        'type',
        'categoryId',
        'date',
        'notes',
      ])
    }

    if (transactions.length > 0) {
      await transactionsSheet.addRows(transactions)
    }

    // Handle categories sheet
    let categoriesSheet = doc.sheetsByTitle['Categories']
    if (!categoriesSheet) {
      categoriesSheet = await doc.addSheet({
        title: 'Categories',
        headerValues: ['id', 'name', 'emoji', 'type', 'color'],
      })
    } else {
      await categoriesSheet.clear()
      await categoriesSheet.setHeaderRow([
        'id',
        'name',
        'emoji',
        'type',
        'color',
      ])
    }

    if (categories.length > 0) {
      await categoriesSheet.addRows(categories)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to export data to Google Sheets' },
      { status: 500 }
    )
  }
}
