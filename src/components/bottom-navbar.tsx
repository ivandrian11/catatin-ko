'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import TransactionModal from './modal/transaction-modal'

export const BottomNavbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddTransaction = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around'>
        <Button
          variant='ghost'
          className={`nav-tab flex-1 h-full hover:text-yellow-700 ${
            pathname === '/'
              ? 'border-t-2 border-yellow-600 text-yellow-700'
              : ''
          }`}
          onClick={() => router.push('/')}
        >
          Transactions
        </Button>

        <Button
          variant='ghost'
          className='border-2 border-white w-14 h-14 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-700 hover:bg-yellow-800 hover:text-white text-white flex items-center justify-center'
          onClick={handleAddTransaction}
        >
          <Plus className='!w-6 !h-6' />
        </Button>

        <Button
          variant='ghost'
          className={`nav-tab flex-1 h-full hover:text-yellow-700 ${
            pathname === '/report'
              ? 'border-t-2 border-yellow-600 text-yellow-700'
              : ''
          }`}
          onClick={() => router.push('/report')}
        >
          Report
        </Button>
      </div>
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={undefined}
      />
    </>
  )
}
