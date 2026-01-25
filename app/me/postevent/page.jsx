'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import EventCreatedModal from '@/components/EventCreatedModal';

export default function PostEventPage() {
    const router = useRouter();
    const [images,setImages] = useState([]);
    const [showCreatedModal, setShowCreatedModal] = useState(false);
    const [createdEvent, setCreatedEvent] = useState(null);
    const [data,setData] = useState({
        title:'',
        description:'',
        startDateTime:'',
        endDateTime:'',
        eventType:'',
        location:'',
        needReservation:false,
        capacity:0,
        host:'',
        eventPageType:'party'
    })

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to post an event');
            router.push('/login');
        }
    }, [router]);

    const onChangeHandler = (event) =>{
        const { name, type, value, checked } = event.target;
        const next = type === 'checkbox' ? checked : value;
        setData(prev => ({ ...prev, [name]: next }));
        console.log(data);
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to post an event');
            router.push('/login');
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        
        // Append all images
        images.forEach((image) => {
            formData.append('images', image);
        });
        
        // Convert datetime-local to ISO string to preserve timezone
        // datetime-local gives us "2026-01-12T08:28" (no timezone)
        // We convert it to a Date object (interprets as local time) then to ISO string
        const startDateTimeISO = new Date(data.startDateTime).toISOString();
        const endDateTimeISO = new Date(data.endDateTime).toISOString();
        
        formData.append('startDateTime', startDateTimeISO);
        formData.append('endDateTime', endDateTimeISO);
        formData.append('eventType', data.eventType);
        formData.append('location', data.location);
        formData.append('needReservation', data.needReservation);
        formData.append('capacity', data.capacity);
        formData.append('host', data.host);
        formData.append('eventPageType', data.eventPageType);

        try {
            const response = await axios.post('/api/blog', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.msg);
                // Show the event created modal
                setCreatedEvent(response.data.blog);
                setShowCreatedModal(true);
            } else {
                toast.error('Could not create event');
            }
        } catch (error) {
            console.error(error);
            toast.error('Event creation failed');
        }
    }


    


    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <button
                    onClick={() => router.back()}
                    className='mb-4 text-gray-300 hover:text-orange-400 flex items-center gap-2 transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                    </svg>
                    Back to Home
                </button>
                
                <div className='bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/20 rounded-lg shadow-[0_0_30px_rgba(176,38,255,0.3)] p-8'>
                    <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 mb-6'>Create a New Event</h1>
                    
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Upload Images</p>
                            <div
                                onClick={() => document.getElementById('images')?.click()}
                                className='inline-block cursor-pointer border-2 border-dashed border-purple-500/50 rounded-lg overflow-hidden hover:border-purple-500 transition-colors flex items-center justify-center bg-gray-800/50'
                                style={{ width: 140, height: 70 }}
                            >
                                <span className='text-gray-400 text-sm'>Choose files</span>
                            </div>
                            <input 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files).slice(0, 5);
                                    setImages(files);
                                }} 
                                type="file" 
                                id='images' 
                                multiple 
                                accept='image/*'
                                hidden
                            />
                            {images.length > 0 && (
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {images.map((img, idx) => (
                                        <div key={idx} className='relative'>
                                            <Image 
                                                src={URL.createObjectURL(img)} 
                                                width={100} 
                                                height={100} 
                                                alt={`Preview ${idx + 1}`}
                                                className='rounded border border-purple-500/30 object-cover'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600'
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Event Title</p>
                            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type="text" placeholder="Enter event title" required/>
                        </div>
                        
                        {/* Description */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Description</p>
                            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' rows={4} placeholder="Describe your event" required></textarea>
                        </div>

                        {/* Start Date & Time */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Start Date & Time</p>
                            <input name='startDateTime' onChange={onChangeHandler} value={data.startDateTime} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='datetime-local' required/>
                        </div>

                        {/* End Date & Time */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>End Date & Time</p>
                            <input name='endDateTime' onChange={onChangeHandler} value={data.endDateTime} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='datetime-local' required/>
                        </div>

                        {/* Event Type */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Event Type</p>
                            <input
                                name='eventType'
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                                type='text'
                                value={data.eventType}
                                onChange={onChangeHandler}
                                placeholder="e.g., Party, Networking, Workshop"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Location</p>
                            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type='text' placeholder="Event location" required/>
                        </div>

                        {/* Need RSVP */}
                        <div className='flex items-center gap-2 mb-6'>
                            <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border accent-purple-500' onChange={onChangeHandler} checked={data.needReservation}/>
                            <label htmlFor='needReservation' className='text-base text-white'>Need RSVP</label>
                        </div>

                        {/* Capacity */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Capacity</p>
                            <input name='capacity' onChange={onChangeHandler} value={data.capacity} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='number' min='1' required/>
                        </div>

                        {/* Host */}
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Host</p>
                            <input name='host' onChange={onChangeHandler} value={data.host} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type='text' placeholder="Host name" required/>
                        </div>

                        {/* Event Page Type */}
                        <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/40 rounded-lg p-5'>
                            <p className='text-xl font-medium mb-3 text-white'>Event Category</p>
                            <div className='flex gap-4'>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='eventPageType'
                                        value='party'
                                        checked={data.eventPageType === 'party'}
                                        onChange={onChangeHandler}
                                        className='w-4 h-4 accent-pink-500'
                                    />
                                    <span className='text-white'>Party</span>
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='eventPageType'
                                        value='club_event'
                                        checked={data.eventPageType === 'club_event'}
                                        onChange={onChangeHandler}
                                        className='w-4 h-4 accent-blue-500'
                                    />
                                    <span className='text-white'>Club Event</span>
                                </label>
                            </div>
                            <p className='text-sm text-gray-400 mt-2'>Choose where your event will appear</p>
                        </div>
                        
                        <button type="submit" className='w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-md hover:from-orange-600 hover:to-pink-600 shadow-[0_0_25px_rgba(255,0,128,0.6)] hover:shadow-[0_0_35px_rgba(255,0,128,0.8)] transition-all'>
                            Create Event
                        </button>
                    </form>
                </div>
            </div>

            {/* Event Created Success Modal */}
            <EventCreatedModal
                isOpen={showCreatedModal}
                onClose={() => {
                    setShowCreatedModal(false);
                    router.back();
                }}
                eventData={createdEvent}
            />
        </div>
    )
}
