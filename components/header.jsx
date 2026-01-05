import { assets } from '../assets/assets';
import Image from 'next/image';
import React from 'react';

const Header = () => {
    return (
        <div className='py-6 px-5 md:px-12 lg:px-28 bg-white'>
            <div className='flex justify-between items-center mb-8'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-black rounded-full flex items-center justify-center'>
                        <span className='text-white text-xl'>🎉</span>
                    </div>
                    <div>
                        <h2 className='text-xl font-semibold'>Rice Party</h2>
                        <p className='text-xs text-gray-500'>minimal + playful</p>
                    </div>
                </div>
                <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Post a party</button>  
            </div>
            <div className='text-center my-12'>
                <h1 className='text-4xl sm:text-5xl font-bold mb-3'>Event / Party Hub</h1>
                <p className='mt-4 max-w-[800px] m-auto text-sm sm:text-base text-gray-600'>Post future parties. When the time comes → it becomes LIVE. After it ends → it lands in Past for ratings.</p>
            </div>
        </div>
    )
}

export default Header