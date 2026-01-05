import React from 'react'
import { blog_data } from '@/assets/assets';
import Image from 'next/image';
import { assets } from '@/assets/assets';


const page = async ({ params }) => {
    const { id } = await params;
    
    const data = blog_data.find(item => item.id === Number(id));

    return (data?<>
        <div className ='bg-gray-200 py-5 px-5 md:px-12 lg:px-28'>
            <div className='flex justify-between items-center'>
            <Image src={assets.logo} width={180} alt='' className= 'w-[130px] sm:w-auto'/>
            <button className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black'>Get Started</button>
            </div>
            <div className='text-center my-24'>
                <h1>{data.title}</h1>
            </div>
        </div>
        </>:<></>
    )
}

export default page