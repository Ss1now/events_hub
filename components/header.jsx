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
        toast.success('Logged out', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const handlePostEvent = () => {
        if (isLoggedIn) {
            router.push('/me/postevent');
        } else {
            localStorage.setItem('redirectAfterLogin', '/me/postevent');
            router.push('/login');
        }
    };

    return (
        <div className='py-4 px-4 md:py-6 md:px-12 lg:px-28 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 shadow-lg'>
            <div className='flex justify-between items-center mb-6 md:mb-8'>
                <Link href='/' className='flex items-center gap-2 cursor-pointer'>
                    <Image src={assets.logoWhite} width={120} height={40} alt='Rice Party Logo' className='w-20 sm:w-24 md:w-28 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'/>
                </Link>
                <div className='flex items-center gap-1.5 sm:gap-2 md:gap-3'>
                    {isLoggedIn ? (
                        <>
                            <button 
                                onClick={() => router.push('/me')}
                                className='bg-transparent text-orange-400 font-medium py-1.5 px-2 sm:py-2 sm:px-4 md:px-6 rounded-md border-2 border-orange-400 hover:bg-orange-400/10 hover:shadow-[0_0_15px_rgba(255,107,53,0.5)] transition-all text-xs sm:text-sm'
                            >
                                Profile
                            </button>
                            <button 
                                onClick={handleLogout}
                                className='bg-transparent text-purple-400 font-medium py-1.5 px-2 sm:py-2 sm:px-4 md:px-6 rounded-md border-2 border-purple-400 hover:bg-purple-400/10 hover:shadow-[0_0_15px_rgba(176,38,255,0.5)] transition-all text-xs sm:text-sm'
                            >
                                Logout
                            </button>
                            <button 
                                onClick={handlePostEvent}
                                className='bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-1.5 px-2 sm:py-2 sm:px-4 md:px-6 rounded-md hover:from-orange-600 hover:to-pink-600 shadow-[0_0_20px_rgba(255,0,128,0.6)] hover:shadow-[0_0_30px_rgba(255,0,128,0.8)] transition-all text-xs sm:text-sm whitespace-nowrap'
                            >
                                Create
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href='/login'>
                                <button className='bg-transparent text-purple-400 font-medium py-1.5 px-2 sm:py-2 sm:px-4 md:px-6 rounded-md border-2 border-purple-400 hover:bg-purple-400/10 hover:shadow-[0_0_15px_rgba(176,38,255,0.5)] transition-all text-xs sm:text-sm'>
                                    Login
                                </button>
                            </Link>
                            <Link href='/register'>
                                <button className='hidden sm:block bg-purple-600 text-white font-bold py-2 px-4 md:px-6 rounded-md hover:bg-purple-700 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] transition-all text-sm'>
                                    Register
                                </button>
                            </Link>
                            <button 
                                onClick={handlePostEvent}
                                className='bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-1.5 px-2 sm:py-2 sm:px-4 md:px-6 rounded-md hover:from-orange-600 hover:to-pink-600 shadow-[0_0_20px_rgba(255,0,128,0.6)] hover:shadow-[0_0_30px_rgba(255,0,128,0.8)] transition-all text-xs sm:text-sm whitespace-nowrap'
                            >
                                Create
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className='text-center my-6 md:my-12'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 drop-shadow-[0_0_30px_rgba(255,0,128,0.5)]'>What's The Move?</h1>
                <p className='mt-2 md:mt-4 max-w-[800px] m-auto text-xs sm:text-sm md:text-base text-gray-300 px-4'>Discover events</p>
            </div>
        </div>
    )
}

export default Header;