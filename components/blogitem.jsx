import React from 'react'
import Image from 'next/image';

const BlogItem = ({title, description, category, image, author, date}) => {
    return (
        <div className='max-w-[330px] sm:max-w-[300px] bg-white border border-black'>
            <Image src={image} width={300} alt={title} height={400} className='border-b border-black'/>
            <p className='ml-5 mt-5 px-1 inline-block bg-black text-white text-sm'>{category}</p>
            <div className="p-5">
                <h5 className='mb-2 text-lg font-medium tracking-tight text-gray-900'>{title}</h5>
                <p className='mb-3 text-sm tracking-tight text-gray-700'>{description}</p>
                <div className='text-xs text-gray-600 mb-3 flex justify-between'>
                    <span>{author}</span>
                    <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className='inline-flex items-center py-2 font-semibold text-center'>
                    Read more
                </div>
            </div>
        </div>
    )
}

export default BlogItem