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
                                    <span>Tue, Dec 30, 4:51 PM → 7:51 PM</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    <span>Jones College Rooftop</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                                    <span>64/120 reserved</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className='flex flex-wrap gap-2 mb-4'>
                                <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>#LIVE</span>
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>{data.category}</span>
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Verified host</span>
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Theme: Warm neutrals</span>
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>Dress: Cozy chic</span>
                            </div>

                            <p className='text-sm text-gray-500'>Hosted by <span className='font-semibold'>{data.author || 'Howard Zhao'}</span> · @howard</p>
                        </div>

                        {/* Date Badge */}
                        <div className='text-center bg-gray-50 rounded-xl p-4 ml-6'>
                            <div className='text-sm text-gray-500 uppercase'>Dec</div>
                            <div className='text-4xl font-bold text-gray-900'>30</div>
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
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>What to Expect</h3>
                    <p className='text-gray-700 leading-relaxed mb-4'>Minimal lights, maximal vibes. Bring a friend, bring a sweater. This rooftop gathering is all about cozy conversations under the winter sky.</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>Details</h3>
                    <p className='text-gray-700 leading-relaxed mb-4'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis.</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>Location Info</h3>
                    <p className='text-gray-700 leading-relaxed mb-4'>Jones College Rooftop - Access through the main entrance. Take the stairs to the top floor and follow the signs. Please be respectful of the space and neighbors.</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>Important Notes</h3>
                    <p className='text-gray-700 leading-relaxed'>Please RSVP in advance as space is limited to 120 people. Feel free to bring friends but make sure they also reserve a spot. Looking forward to seeing you there!</p>
                </div>
            </div>
        </div>
        <Footer />
        </>:<></>
    )
}

export default page