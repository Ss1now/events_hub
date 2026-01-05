import React from 'react'
import Image from 'next/image';
import { assets, blog_data } from '@/assets/assets';
import Link from 'next/link';
import page from '@/app/blogs/[id]/page';

const BlogItem = ({title, description, category, image, id}) => {
    console.log('BlogItem ID:', id);
    return (
        <div className='bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex gap-6 items-start border border-gray-100'>
            {/* Left side - Event info */}
            <div className='flex-1'>
                {/* Event Title */}
                <Link href={`/blogs/${id}`}>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2 hover:text-gray-700 cursor-pointer'>{title}</h3>
                </Link>
                
                {/* Event Description */}
                <p className='text-sm text-gray-600 mb-4'>{description}</p>
                
                {/* Tags/Categories */}
                <div className='flex flex-wrap gap-2 mb-4'>
                    <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>#LIVE</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>{category}</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Verified host</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Theme: Warm neutrals</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Dress: Cozy chic</span>
                </div>
                
                {/* Location & Capacity */}
                <div className='flex gap-6 text-sm text-gray-600 mb-3'>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        <span>Jones College Rooftop</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        <span>64/120 reserved</span>
                    </div>
                </div>
                
                {/* Time & Host Score */}
                <div className='flex gap-6 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>Tue, Dec 30, 4:51 PM → Tue, Dec 30, 7:51 PM</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4 text-yellow-500' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                        </svg>
                        <span>Host score: 54</span>
                    </div>
                </div>

                {/* Hosted by */}
                <p className='text-xs text-gray-500 mt-3'>Hosted by <span className='font-medium'>Howard Zhao</span> · @howard</p>
            </div>
            
            {/* Right side - Date badge and actions */}
            <div className='flex flex-col items-end gap-4'>
                <div className='text-center bg-gray-50 rounded-xl p-3 min-w-[80px]'>
                    <div className='text-xs text-gray-500 uppercase'>Dec</div>
                    <div className='text-3xl font-bold text-gray-900'>30</div>
                </div>
                <div className='flex gap-2'>
                    <Link href={`/blogs/${id}`}>
                        <button className='bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'>Reserve</button>
                    </Link>
                    <Link href={`/blogs/${id}`}>
                        <button className='bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'>View</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BlogItem