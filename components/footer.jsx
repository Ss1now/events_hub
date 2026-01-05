import React from 'react';
import { assets } from '../assets/assets';
import Image from 'next/image';

const Footer = () => {
    return (
        <div className='bg-white border-t border-gray-200 py-8 mt-12'>
            <div className='max-w-6xl mx-auto px-5 flex justify-between items-center flex-col sm:flex-row gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-black rounded-full flex items-center justify-center'>
                        <span className='text-white text-lg'>🎉</span>
                    </div>
                    <div>
                        <h3 className='font-semibold text-sm'>Rice Party</h3>
                        <p className='text-xs text-gray-500'>minimal + playful</p>
                    </div>
                </div>
                <p className='text-sm text-gray-500'>All rights reserved. Copyright @riceparty 2026</p>
            </div>
        </div>
    )
}

export default Footer