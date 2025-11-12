"use client"

import { usePathname } from 'next/navigation'
import React from 'react'
import { Button } from '../ui/button'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

const HeaderComponent = () => {
  const pathname = usePathname();

  return (
    <header className='fixed top-0 left-0 right-0 h-15 flex px-6 items-center justify-between border-b border-border bg-background lg:left-64'>
      {/* Mobile: show title */}
      <div className='lg:hidden'>
        {pathname === '/' && (
          <h1 className='text-lg font-semibold'>Masjid Ulul Albab.</h1>
        )}
        {pathname === '/jadwal' && (
          <h1 className='text-lg font-semibold'>Calendar</h1>
        )}
      </div>
      
      {/* Feedback button - Both Mobile & Desktop */}
      <div className='flex items-center gap-3 ml-auto'>
        <Link href="/feedback">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Beri Masukan</span>
            <span className="sm:hidden">Masukan</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default HeaderComponent
