"use client"

import { usePathname } from 'next/navigation'
import React from 'react'

const HeaderComponent = () => {
  const pathname = usePathname();

  return (
    <header className='fixed top-0 w-full h-15 flex px-6 items-center border-b border-border bg-background lg:left-64'>
      {/* Mobile: show title */}
      <div className='lg:hidden'>
        {pathname === '/' && (
          <h1 className='text-lg font-semibold'>Masjid Ulul Albab.</h1>
        )}
        {pathname === '/jadwal' && (
          <h1 className='text-lg font-semibold'>Calendar</h1>
        )}
      </div>
      
      {/* Desktop: empty header for now */}
      <div className='hidden lg:block'>
        {/* Content akan diisi nanti */}
      </div>
    </header>
  )
}

export default HeaderComponent
