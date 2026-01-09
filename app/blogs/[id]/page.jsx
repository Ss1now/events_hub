import React from 'react'
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Footer from '@/components/footer';
import Link from 'next/link';


const page = async ({ params }) => {
    const { id } = await params;
    
    // Fetch blog data from API
    const response = await fetch(`http://localhost:3000/api/blog?id=${id}`, {
        cache: 'no-store'
    });
    const data = await response.json();

    return (data?<>
        <div className='bg-white py-6 px-5 md:px-12 lg:px-28 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
            <Link href='/'>
                <div className='flex items-center gap-3 cursor-pointer hover:opacity-80'>
                    <Image src={assets.logo} width={50} height={50} alt='Rice Party Logo' className='w-12 h-12 object-contain'/>
                    <div>
                        <h2 className='text-xl font-semibold'>Rice Party</h2>
                        <p className='text-xs text-gray-500'>minimal + playful</p>
                    </div>
                </div>
            </Link>
            <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Post a party</button>
            </div>
        </div>
        <div className='bg-gray-50 min-h-screen py-12'>
            <div className='max-w-4xl mx-auto px-5 md:px-12'>
                {/* Event Header */}
                <div className='bg-white rounded-2xl shadow-sm p-8 mb-6'>
                    <div className='flex justify-between items-start mb-6'>
                        <div className='flex-1'>
                            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>{data.title}</h1>
                            <p className='text-lg text-gray-600 mb-4'>{data.description}</p>
                            
                            {/* Event Meta Info */}
                            <div className='flex flex-wrap gap-4 text-sm text-gray-600 mb-4'>
                                <div className='flex items-center gap-2'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    <span>{new Date(data.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {new Date(data.startDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {new Date(data.endDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    <span>{data.location}</span>
                                </div>
                                {data.needReservation && (
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                        <span>{data.reserved || 0}/{data.capacity} reserved</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {data.status === 'live' && <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>#LIVE</span>}
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>{data.eventType}</span>
                                {data.theme && <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Theme: {data.theme}</span>}
                                {data.dressCode && <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Dress: {data.dressCode}</span>}
                            </div>

                            <p className='text-sm text-gray-500'>Hosted by <span className='font-semibold'>{data.host}</span></p>
                        </div>

                        {/* Date Badge */}
                        <div className='text-center bg-gray-50 rounded-xl p-4 ml-6'>
                            <div className='text-sm text-gray-500 uppercase'>{new Date(data.startDateTime).toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className='text-4xl font-bold text-gray-900'>{new Date(data.startDateTime).getDate()}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 pt-6 border-t border-gray-200'>
                        <button className='flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors'>Reserve Spot</button>
                        <button className='px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors'>Share</button>
                    </div>
                </div>

                {/* Event Details */}
                <div className='bg-white rounded-2xl shadow-sm p-8'>
                    <Image className='w-full rounded-lg mb-8' src={data.image} width={800} height={500} alt=''/>
                    
                    <h2 className='text-2xl font-bold mb-4 text-gray-900'>About this Event</h2>
                    <p className='text-gray-700 leading-relaxed mb-6'>{data.description}</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>Event Details</h3>
                    <div className='space-y-3 text-gray-700'>
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Event Type:</span>
                            <span>{data.eventType}</span>
                        </div>
                        {data.theme && (
                            <div className='flex gap-2'>
                                <span className='font-semibold min-w-[120px]'>Theme:</span>
                                <span>{data.theme}</span>
                            </div>
                        )}
                        {data.dressCode && (
                            <div className='flex gap-2'>
                                <span className='font-semibold min-w-[120px]'>Dress Code:</span>
                                <span>{data.dressCode}</span>
                            </div>
                        )}
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Location:</span>
                            <span>{data.location}</span>
                        </div>
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Date & Time:</span>
                            <span>{new Date(data.startDateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Time:</span>
                            <span>{new Date(data.startDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(data.endDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                        {data.needReservation && (
                            <div className='flex gap-2'>
                                <span className='font-semibold min-w-[120px]'>Capacity:</span>
                                <span>{data.reserved || 0} reserved out of {data.capacity} spots</span>
                            </div>
                        )}
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Hosted by:</span>
                            <span>{data.host}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>:<></>
    )
}

export default page