import React from 'react'
import Image from 'next/image';
import { assets, blog_data } from '@/assets/assets';
import Link from 'next/link';
import page from '@/app/blogs/[id]/page';

const BlogItem = ({title, description, category, image, id, status, eventType, theme, dressCode, location, needReservation, reserved, capacity, time, host, hostUsername, eventDate}) => {
    console.log('BlogItem ID:', id);
    
    // Determine status badge color and text
    const getStatusBadge = () => {
        switch(status) {
            case 'live':
                return { bg: 'bg-green-500', text: '#LIVE' };
            case 'future':
                return { bg: 'bg-blue-500', text: '#FUTURE' };
            case 'past':
                return { bg: 'bg-gray-500', text: '#PAST' };
            default:
                return { bg: 'bg-black', text: '#LIVE' };
        }
    };
    
    const statusBadge = getStatusBadge();
    
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
                    <span className={`${statusBadge.bg} text-white text-xs px-3 py-1 rounded-full font-medium`}>{statusBadge.text}</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors'>{eventType}</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors'>Theme: {theme}</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors'>Dress: {dressCode}</span>
                </div>
                
                {/* Location & Capacity */}
                <div className='flex gap-6 text-sm text-gray-600 mb-3 flex-wrap'>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        <span>{location}</span>
                    </div>
                    {needReservation && (
                        <div className='flex items-center gap-1'>
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                            <span>{reserved}/{capacity} reserved</span>
                        </div>
                    )}
                    {!needReservation && (
                        <div className='flex items-center gap-1'>
                            <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            <span className='text-green-600 font-medium'>No reservation needed</span>
                        </div>
                    )}
                </div>
                
                {/* Time */}
                <div className='flex gap-6 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>{time}</span>
                    </div>
                </div>

                {/* Hosted by */}
                <p className='text-xs text-gray-500 mt-3'>Hosted by <span className='font-medium'>{host}</span> · {hostUsername}</p>
            </div>
            
            {/* Right side - Date badge and actions */}
            <div className='flex flex-col items-end gap-4'>
                <div className='text-center bg-gray-50 rounded-xl p-3 min-w-[80px]'>
                    <div className='text-xs text-gray-500 uppercase'>{eventDate?.month || 'Jan'}</div>
                    <div className='text-3xl font-bold text-gray-900'>{eventDate?.day || '1'}</div>
                </div>
                <div className='flex gap-2'>
                    {needReservation ? (
                        <Link href={`/blogs/${id}`}>
                            <button className='bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'>Reserve</button>
                        </Link>
                    ) : (
                        <Link href={`/blogs/${id}`}>
                            <button className='bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'>I&apos;m going</button>
                        </Link>
                    )}
                    <Link href={`/blogs/${id}`}>
                        <button className='bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'>View</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BlogItem