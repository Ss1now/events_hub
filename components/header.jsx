'use client'

import { assets } from '../assets/assets';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        toast.success('Logged out successfully');
        window.location.reload();
    };

    return (
        <div className='py-6 px-5 md:px-12 lg:px-28 bg-white'>
            <div className='flex justify-between items-center mb-8'>
                <Link href='/' className='flex items-center gap-3 cursor-pointer'>
                    <Image src={assets.logo} width={120} height={40} alt='Rice Party Logo' className='w-24 sm:w-28 h-auto object-contain'/>
                </Link>
                <div className='flex items-center gap-3'>
                    {isLoggedIn ? (
                        <>
                            <button 
                                onClick={handleLogout}
                                className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors text-sm'
                            >
                                Logout
                            </button>
                            <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Post an event</button>
                        </>
                    ) : (
                        <>
                            <Link href='/login'>
                                <button className='bg-white text-black font-medium py-2 px-6 rounded-md border border-black hover:bg-gray-100 transition-colors text-sm'>
                                    Login
                                </button>
                            </Link>
                            <Link href='/register'>
                                <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors text-sm'>
                                    Register
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
            <div className='text-center my-12'>
                <h1 className='text-4xl sm:text-5xl font-bold mb-3'>What's The Move?</h1>
                <p className='mt-4 max-w-[800px] m-auto text-sm sm:text-base text-gray-600'>Rice Events Hub</p>
            </div>
        </div>
    )
}

export default Header