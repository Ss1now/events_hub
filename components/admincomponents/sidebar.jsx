import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
    return(
        <div className='flex flex-col bg-white border-r border-gray-200 shadow-sm w-64'>
            <Link href='/' className='px-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center gap-3'>
                    <Image src={assets.logo} width={40} height={40} alt='Logo' className='w-10 h-10'/>
                    <div>
                        <h2 className='text-lg font-bold text-gray-900'>Rice Parties</h2>
                        <p className='text-xs text-gray-500'>Admin Dashboard</p>
                    </div>
                </div>
            </Link>
            
            <nav className='flex-1 px-4 py-6'>
                <div className='space-y-1'>
                    <Link href='/admin/bloglist' className='flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-50 border-l-4 border-[#00205B] font-medium rounded-r-lg hover:bg-blue-100 transition-colors group'>
                        <svg className='w-5 h-5 text-[#00205B]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
                        </svg>
                        <span className='text-sm'>Manage All Events</span>
                    </Link>
                    
                    <Link href='/admin/feedback' className='flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'>
                        <svg className='w-5 h-5 text-gray-500 group-hover:text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                        </svg>
                        <span className='text-sm'>User Feedback</span>
                    </Link>
                    
                    <Link href='/admin/patchnotes' className='flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'>
                        <svg className='w-5 h-5 text-gray-500 group-hover:text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                        <span className='text-sm'>Patch Notes Subscribers</span>
                    </Link>
                    
                    <div className='my-2 border-t border-gray-200'></div>
                    
                    <Link href='/admin/postevent' className='flex items-center gap-3 px-4 py-3 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-200'>
                        <svg className='w-5 h-5 text-blue-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                        </svg>
                        <span className='text-sm font-medium'>Post Official Event</span>
                    </Link>
                    
                    <Link href='/me/postevent' className='flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'>
                        <svg className='w-5 h-5 text-gray-500 group-hover:text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                        <span className='text-sm'>Create Personal Event</span>
                    </Link>
                    
                    <div className='my-2 border-t border-gray-200'></div>
                    
                    <Link href='/' className='flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors group'>
                        <svg className='w-5 h-5 text-gray-500 group-hover:text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                        </svg>
                        <span className='text-sm'>Back to Website</span>
                    </Link>
                </div>
            </nav>
            
            <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <span>Admin Panel v1.0</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;
