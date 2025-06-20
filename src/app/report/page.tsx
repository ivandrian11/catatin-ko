'use client'

import SettingsModal from '@/components/modal/settings-modal'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { useState } from 'react'

export default function Report() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <div className='sticky top-0 bg-background z-10 px-4 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>Report</h1>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className='!h-5 !w-5' />
        </Button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
