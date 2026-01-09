'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function PostEventPage() {
    const router = useRouter();
    const [image,setImage] = useState(false);
    const [eventTypeOption, setEventTypeOption] = useState('Socializing');
    const [customEventType, setCustomEventType] = useState('');
    const [data,setData] = useState({
        title:'',
        description:'',
        startDateTime:'',
        endDateTime:'',
        eventType:eventTypeOption,
        theme:'',
        dressCode:'',
        location:'',
        needReservation:false,
        reserved:0,
        capacity:0,
        host:''
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
        formData.append('image', image);
        formData.append('startDateTime', data.startDateTime);
        formData.append('endDateTime', data.endDateTime);
        formData.append('eventType', data.eventType);
        formData.append('theme', data.theme);
        formData.append('dressCode', data.dressCode);
        formData.append('location', data.location);
        formData.append('needReservation', data.needReservation);
        formData.append('reserved', data.reserved);
        formData.append('capacity', data.capacity);
        formData.append('host', data.host);

        try {
            const response = await axios.post('/api/blog', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.msg);
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                toast.error("Error occurred! Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error posting event");
        }
    }


    


    return (
        <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <button
                    onClick={() => router.push('/')}
                    className='mb-4 text-gray-600 hover:text-black flex items-center gap-2 transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                    </svg>
                    Back to Home
                </button>
                
                <div className='bg-white rounded-lg shadow-md p-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-6'>Post a New Event</h1>
                    
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        <div>
                            <p className='text-xl font-medium mb-2'>Upload Image</p>
                            <div
                                onClick={() => document.getElementById('image')?.click()}
                                className='inline-block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors'
                                style={{ width: 140, height: 70 }}
                            >
                                <Image src={!image?assets.upload:URL.createObjectURL(image)} width={140} height={70} alt='upload image' />
                            </div>
                            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden />
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2'>Event Title</p>
                            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type="text" placeholder='Type here' required/>
                        </div>
                        
                        {/* Description */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Description</p>
                            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' rows={4} placeholder='Describe your event' required></textarea>
                        </div>

                        {/* Start Date & Time */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Start Date & Time</p>
                            <input name='startDateTime' onChange={onChangeHandler} value={data.startDateTime} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='datetime-local' required/>
                        </div>

                        {/* End Date & Time */}
                        <div>
                            <p className='text-xl font-medium mb-2'>End Date & Time</p>
                            <input name='endDateTime' onChange={onChangeHandler} value={data.endDateTime} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='datetime-local' required/>
                        </div>

                        {/* Event Type */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Event Type</p>
                            <select
                                name='eventType'
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                value={eventTypeOption}
                                onChange={(e)=> { 
                                    setEventTypeOption(e.target.value); 
                                    if(e.target.value !== 'Other'){ 
                                        setData(prev => ({ ...prev, eventType: e.target.value }));
                                    } 
                                }}
                                required
                            >
                                <option value='Private Party'>Private Party</option>
                                <option value='Socializing'>Socializing</option>
                                <option value='Gathering'>Gathering</option>
                                <option value='Entertainment'>Entertainment</option>
                                <option value='Workshop'>Workshop</option>
                                <option value='Game Night'>Game Night</option>
                                <option value='Other'>Other (type manually)</option>
                            </select>
                            {eventTypeOption === 'Other' && (
                                <input
                                    name='eventType'
                                    className='w-full mt-4 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                    type='text'
                                    placeholder='Type event type'
                                    value={data.eventType}
                                    onChange={onChangeHandler}
                                    required
                                />
                            )}
                        </div>

                        {/* Theme */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Theme</p>
                            <input name='theme' onChange={onChangeHandler} value={data.theme} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='Warm Neutrals' required/>
                        </div>

                        {/* Dress Code */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Dress Code</p>
                            <input name='dressCode' onChange={onChangeHandler} value={data.dressCode} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='Cozy Chic' required/>
                        </div>

                        {/* Location */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Location</p>
                            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='Jones College Rooftop' required/>
                        </div>

                        {/* Need Reservation */}
                        <div className='flex items-center gap-3'>
                            <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border' onChange={onChangeHandler} checked={data.needReservation}/>
                            <label htmlFor='needReservation' className='text-base'>Need Reservation</label>
                        </div>

                        {/* Reserved & Capacity */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <p className='text-xl font-medium mb-2'>Reserved</p>
                                <input name='reserved' onChange={onChangeHandler} value={data.reserved} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='number' min='0' placeholder='64'/>
                            </div>
                            <div>
                                <p className='text-xl font-medium mb-2'>Capacity</p>
                                <input name='capacity' onChange={onChangeHandler} value={data.capacity} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='number' min='1' placeholder='120' required/>
                            </div>
                        </div>

                        {/* Host */}
                        <div>
                            <p className='text-xl font-medium mb-2'>Host</p>
                            <input name='host' onChange={onChangeHandler} value={data.host} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black' type='text' placeholder='Howard Zhao' required/>
                        </div>
                        
                        <button type="submit" className='w-full bg-black text-white font-medium py-3 rounded-md hover:bg-gray-800 transition-colors'>
                            Post Event
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
