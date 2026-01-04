import React from 'react';
import { assets } from '../assets/assets';
import Image from 'next/image';

const Footer = () => {
    return (
        <div className='flex justify-around flex-col gap-2 sm:gap-0 sm:flex-row bg-black py-5 items-center'>
            <Image src={assets.logo} alt='' width={120} />
            <p className='text-sm text-white'>All right reserved. Copyright @blogger</p>
        </div>
    )
}

export default Footer