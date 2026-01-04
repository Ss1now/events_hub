import React from 'react'
import Image from 'next/image';
import { blog_data } from '@/assets/assets';

const BlogItem = () => {
    return (
        <div className='max-w-[330px] sm:max-w-[300px] bg-white border border-black'>
            <Image src={blog_data[0].image} width={300} alt='' height={400} className='border-b border-black'/>
            <p className='ml-5 mt-5 px-1 inline-block bg-black text-white text-sm'>{blog_data[0].category}</p>
            <div className="p-5">
                <h5 className='mb-2 text-lg font-medium tracking-tight text-gray-900'>{blog_data[0].title}</h5>
                <p className='mb-3 text-sm tracking-tight text-gray-700'>{blog_data[0].description}</p>
                <div className='inline-flex items-center py-2 font-semibold text-center'>
                    Read more
                </div>
            </div>
        </div>
    )
}

export default BlogItem