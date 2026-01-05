import { assets } from '../assets/assets';
import Image from 'next/image';
import React from 'react';

const Header = () => {
    return (
        <div className='py-6 px-5 md:px-12 lg:px-28 bg-white'>
            <div className='flex justify-between items-center mb-8'>
                <div className='flex items-center gap-3'>
                    <Image src={assets.logo} width={120} height={40} alt='Rice Party Logo' className='w-24 sm:w-28 h-auto object-contain'/>
                </div>
                <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Post an event</button>  
            </div>
            <div className='text-center my-12'>
                <h1 className='text-4xl sm:text-5xl font-bold mb-3'>What's The Move?</h1>
                <p className='mt-4 max-w-[800px] m-auto text-sm sm:text-base text-gray-600'>Rice Events Hub</p>
            </div>
        </div>
    )
}

export default Header