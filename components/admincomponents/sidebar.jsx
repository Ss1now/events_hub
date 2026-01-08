import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
    return(
        <div className='flex flex-col bg-slate-100'>
            <Link href='/' className='px-2 sm:pl-14 py-3 border border-black cursor-pointer'>
                <Image src={assets.logo} width={120} alt=''/>
            </Link>
            <div className='w-28 sm:w-80 h-[100vh] relative py-12 border border-black'>
                <div className='w-[50%] sm:w-[80%] absolute right-0'>
                    <Link href='/admin/addproduct' className='flex items-center border border-black gap-3 font-medium px-3 py-2 bg-white'>
                        <Image src={assets.post_icon} alt='post' width={28} /><p>Post Events</p>
                    </Link>
                    <Link href='/admin/bloglist' className='mt-5 flex items-center border border-black gap-3 font-medium px-3 py-2 bg-white'>
                        <Image src={assets.post_icon} alt='post' width={28} /><p>Blog lists</p>
                    </Link>
                    <Link href='/admin/subscription'className='mt-5 flex items-center border border-black gap-3 font-medium px-3 py-2 bg-white'>
                        <Image src={assets.post_icon} alt='post' width={28} /><p>Subscription</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;
