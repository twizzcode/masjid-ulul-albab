"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'


import { House } from 'lucide-react';
import { NotebookPen } from 'lucide-react';
import { CalendarCheck2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navbarComponents = () => {
    const pathname = usePathname();
    return (
        <nav className='fixed bottom-0 w-full h-18 rounded-t-2xl border-t border-border bg-background shadow-lg z-100'>
            {/* Navbar content */}
            <div className='flex justify-around items-center h-full px-6 py-2 space-x-2'>
                <Link href="/" className={`${pathname === '/' ? 'bg-foreground rounded-xl' : ''} transition size-full flex flex-col gap-1 justify-center items-center`}>
                    <House className={`${pathname === '/' ? 'text-background' : 'text-foreground'} transition`} />
                    <h3 className={`${pathname === '/' ? 'text-background' : 'text-foreground'} transition text-xs`}>Home</h3>
                </Link>
                <Link href="/booking" className={`${pathname === '/booking' ? 'bg-foreground rounded-xl' : ''} transition size-full flex flex-col gap-1 justify-center items-center`}>
                    <CalendarCheck2 className={`${pathname === '/booking' ? 'text-background' : 'text-foreground'} transition`} />
                    <h3 className={`${pathname === '/booking' ? 'text-background' : 'text-foreground'} transition text-xs`}>Booking</h3>
                </Link>
                <Link href="/jadwal" className={`${pathname === '/jadwal' ? 'bg-foreground rounded-xl' : ''} transition size-full flex flex-col gap-1 justify-center items-center`}>
                    <NotebookPen className={`${pathname === '/jadwal' ? 'text-background' : 'text-foreground'} transition`} />
                    <h3 className={`${pathname === '/jadwal' ? 'text-background' : 'text-foreground'} transition text-xs`}>Jadwal</h3>
                </Link>
                <Link href="/profile" className={`${pathname === '/profile' ? 'bg-foreground rounded-xl' : ''} transition size-full flex flex-col gap-1 justify-center items-center`}>
                    <Avatar className='w-6 h-6'>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className={`${pathname === '/profile' ? 'text-background' : 'text-foreground'} transition`}>CN</AvatarFallback>
                    </Avatar>
                    <h3 className={`${pathname === '/profile' ? 'text-background' : 'text-foreground'} transition text-xs`}>Profile</h3>
                </Link>
            </div>
        </nav>
    )
}

export default navbarComponents