'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import EventCreatedModal from '@/components/EventCreatedModal';

export default function AdminPostEventPage() {
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
        eventCategory:'residential_college',
        organizer:'',
        isRecurring:false,
        recurrencePattern:'none',
        weeklyTheme:''
    })

    useEffect(() => {
        // Check if user is admin
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Admin access required');
            router.push('/login');
        }
    }, [router]);

    const onChangeHandler = (event) =>{
        const { name, type, value, checked } = event.target;
        const next = type === 'checkbox' ? checked : value;
        setData(prev => ({ ...prev, [name]: next }));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Admin access required');
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
        const startDateTimeISO = new Date(data.startDateTime).toISOString();
        const endDateTimeISO = new Date(data.endDateTime).toISOString();
        
        formData.append('startDateTime', startDateTimeISO);
        formData.append('endDateTime', endDateTimeISO);
        formData.append('eventType', data.eventType);
        formData.append('location', data.location);
        formData.append('needReservation', data.needReservation);
        formData.append('capacity', data.capacity);
        formData.append('host', data.host);
        formData.append('eventCategory', data.eventCategory);
        formData.append('organizer', data.organizer);
        formData.append('isRecurring', data.isRecurring);
        formData.append('recurrencePattern', data.recurrencePattern);
        formData.append('weeklyTheme', data.weeklyTheme);

        try {
            const response = await axios.post('/api/blog', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success('Official event created successfully!');
                setCreatedEvent(response.data.blog);
                setShowCreatedModal(true);
            } else {
                toast.error('Could not create event');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || 'Event creation failed');
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <button
                    onClick={() => router.push('/admin')}
                    className='mb-4 text-gray-600 hover:text-black flex items-center gap-2 transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                    </svg>
                    Back to Admin Panel
                </button>
                
                <div className='bg-white rounded-lg shadow-md p-8'>
                    <div className='mb-6'>
                        <h1 className='text-3xl font-bold text-gray-900'>Create Official Event</h1>
                        <p className='text-gray-600 mt-2'>Post events for residential colleges or university-wide events</p>
                    </div>
                    
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        {/* Event Category */}
                        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded'>
                            <p className='text-lg font-medium mb-2 text-blue-900'>Event Category</p>
                            <select 
                                name='eventCategory' 
                                onChange={onChangeHandler} 
                                value={data.eventCategory}
                                className='w-full px-4 py-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                                required
                            >
                                <option value='residential_college'>Residential College Event</option>
                                <option value='university'>University-Wide Event</option>
                            </select>
                        </div>

                        {/* Organizer */}
                        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded'>
                            <p className='text-lg font-medium mb-2 text-blue-900'>Organizer Name</p>
                            <input 
                                name='organizer' 
                                onChange={onChangeHandler} 
                                value={data.organizer} 
                                className='w-full px-4 py-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                type='text'
                                placeholder='e.g., Baker College, Wiess College, Rice University'
                                required
                            />
                            <p className='text-sm text-gray-600 mt-1'>This will be displayed as the official organizer</p>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Upload Images</p>
                            <div
                                onClick={() => document.getElementById('images')?.click()}
                                className='inline-block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors flex items-center justify-center'
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
                                                className='rounded border object-cover'
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
                            <p className='text-xl font-medium mb-2'>Event Title</p>
                            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type="text" placeholder='e.g., Baker College Spring Party' required/>
                        </div>
                        
                        <div>
                            <p className='text-xl font-medium mb-2'>Description</p>
                            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' rows={4} required></textarea>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Start Date & Time</p>
                            <input name='startDateTime' onChange={onChangeHandler} value={data.startDateTime} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='datetime-local' required/>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>End Date & Time</p>
                            <input name='endDateTime' onChange={onChangeHandler} value={data.endDateTime} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='datetime-local' required/>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Event Type</p>
                            <input
                                name='eventType'
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                type='text'
                                value={data.eventType}
                                onChange={onChangeHandler}
                                placeholder='e.g., Party, Concert, Social'
                                required
                            />
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Location</p>
                            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='e.g., Baker Commons' required/>
                        </div>

                        <div className='flex items-center gap-2 mb-6'>
                            <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border' onChange={onChangeHandler} checked={data.needReservation}/>
                            <label htmlFor='needReservation' className='text-base'>Need RSVP</label>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Capacity</p>
                            <input name='capacity' onChange={onChangeHandler} value={data.capacity} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='number' min='1' required/>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Host (Display Name)</p>
                            <input name='host' onChange={onChangeHandler} value={data.host} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='e.g., Baker Social Team' required/>
                        </div>

                        {/* Recurring Event Section */}
                        <div className='bg-purple-50 border-l-4 border-purple-500 p-4 rounded'>
                            <div className='flex items-center gap-2 mb-3'>
                                <input 
                                    name='isRecurring' 
                                    id='isRecurring' 
                                    type='checkbox' 
                                    className='w-4 h-4 border' 
                                    onChange={onChangeHandler} 
                                    checked={data.isRecurring}
                                />
                                <label htmlFor='isRecurring' className='text-lg font-medium text-purple-900'>Recurring Event</label>
                            </div>
                            <p className='text-sm text-gray-600 mb-3'>Use this for weekly events like Pub nights or monthly college events</p>
                            
                            {data.isRecurring && (
                                <>
                                    <div className='mb-3'>
                                        <p className='text-base font-medium mb-2 text-purple-900'>Recurrence Pattern</p>
                                        <select 
                                            name='recurrencePattern' 
                                            onChange={onChangeHandler} 
                                            value={data.recurrencePattern}
                                            className='w-full px-4 py-3 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white'
                                        >
                                            <option value='none'>None</option>
                                            <option value='weekly'>Weekly</option>
                                            <option value='monthly'>Monthly</option>
                                        </select>
                                    </div>
                                    
                                    {data.recurrencePattern === 'weekly' && (
                                        <div>
                                            <p className='text-base font-medium mb-2 text-purple-900'>Weekly Theme</p>
                                            <input 
                                                name='weeklyTheme' 
                                                onChange={onChangeHandler} 
                                                value={data.weeklyTheme} 
                                                className='w-full px-4 py-3 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                type='text'
                                                placeholder='e.g., Theme TBA - Announced Monday, or specific theme like "80s Night"'
                                            />
                                            <p className='text-xs text-gray-600 mt-1'>For Pub: Use "Theme TBA - Announced Monday" until the theme is revealed</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <button type="submit" className='w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors'>
                            Create Official Event
                        </button>
                    </form>
                </div>
            </div>

            {/* Event Created Success Modal */}
            <EventCreatedModal
                isOpen={showCreatedModal}
                onClose={() => {
                    setShowCreatedModal(false);
                    router.push('/admin');
                }}
                eventData={createdEvent}
            />
        </div>
    )
}
