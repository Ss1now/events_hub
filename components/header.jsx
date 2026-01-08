import { assets } from '../assets/assets';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

const Header = () => {
    const [email, setEmail] = useState('');

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        console.log('Email subscribed:', email);
        setEmail('');
    };

    return (
        <div className='py-6 px-5 md:px-12 lg:px-28 bg-white'>
            <div className='flex justify-between items-center mb-8'>
                <Link href='/' className='flex items-center gap-3 cursor-pointer'>
                    <Image src={assets.logo} width={120} height={40} alt='Rice Party Logo' className='w-24 sm:w-28 h-auto object-contain'/>
                </Link>
                <div className='flex items-center gap-3'>
                    <form onSubmit={handleEmailSubmit} className='flex items-center'>
                        <input 
                            type='email' 
                            placeholder='Enter your email' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='px-4 py-2 rounded-l-md border border-gray-300 border-r-0 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm'
                            required
                        />
                        <button type='submit' className='bg-black text-white font-medium py-2 px-6 rounded-r-md hover:bg-gray-800 transition-colors text-sm'>Subscribe</button>
                    </form>
                    <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Post an event</button>  
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