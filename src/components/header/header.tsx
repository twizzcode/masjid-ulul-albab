"use client"

import { usePathname } from 'next/navigation'
import React from 'react'

const HeaderComponent = () => {
  const pathname = usePathname();

  return (
    <header className='fixed top-0 w-full h-15 flex px-6 items-center border-b border-border bg-background'>
      {pathname === '/' && (
        <h1 className='text-lg font-semibold'>Masjid Ulul Albab.</h1>
      )}
      {pathname === '/jadwal' && (
        <h1 className='text-lg font-semibold'>Calendar</h1>
      )}
    </header>
  )
}

export default HeaderComponent
