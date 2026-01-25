'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }) {
    const router = useRouter();
    const [eventId, setEventId] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [eventTypeOption, setEventTypeOption] = useState('Socializing');
    const [customEventType, setCustomEventType] = useState('');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        eventType: eventTypeOption,
        theme: '',
        dressCode: '',
        location: '',
        needReservation: false,
        capacity: 0,
        reservationDeadline: '',
        host: ''
    })

    useEffect(() => {
        const fetchEventData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to edit events');
                router.push('/login');
                return;
            }

            const resolvedParams = await params;
            setEventId(resolvedParams.id);

            try {
                // Fetch event data
                const response = await axios.get(`/api/blog?id=${resolvedParams.id}`);
                const eventData = response.json ? await response.json() : response.data;

                // Check if event has ended (can edit future or live events)
                const now = new Date();
                const endTime = new Date(eventData.endDateTime);
                
                if (now > endTime) {
                    toast.error('Cannot edit events that have already ended');
                    router.back();
                    return;
                }

                // Verify user is the author
                const userResponse = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userResponse.data.success) {
                    const userId = userResponse.data.user.id || userResponse.data.user._id;
                    const authorId = typeof eventData.authorId === 'object' 
                        ? (eventData.authorId._id || eventData.authorId.id)?.toString()
                        : eventData.authorId?.toString();
                    
                    if (authorId !== userId.toString()) {
                        toast.error('You are not authorized to edit this event');
                        router.back();
                        return;
                    }
                }

                // Format datetime for input (convert to local timezone properly)
                const formatDateTimeLocal = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    // Get local timezone offset and adjust
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                    return localDate.toISOString().slice(0, 16);
                };

                // Set form data
                setData({
                    title: eventData.title || '',
                    description: eventData.description || '',
                    startDateTime: formatDateTimeLocal(eventData.startDateTime),
                    endDateTime: formatDateTimeLocal(eventData.endDateTime),
                    eventType: eventData.eventType || 'Party',
                    location: eventData.location || '',
                    needReservation: eventData.needReservation || false,
                    capacity: eventData.capacity || 0,
                    reservationDeadline: eventData.reservationDeadline ? formatDateTimeLocal(eventData.reservationDeadline) : '',
                    host: eventData.host || ''
                });

                setExistingImages(eventData.images || []);
                
                // Check if event type is custom
                const standardTypes = ['Private Party', 'Socializing', 'Gathering', 'Entertainment', 'Workshop', 'Game Night'];
                if (!standardTypes.includes(eventData.eventType)) {
                    setEventTypeOption('Other');
                    setCustomEventType(eventData.eventType);
                } else {
                    setEventTypeOption(eventData.eventType);
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Could not load event');
                router.back();
            }
        };

        fetchEventData();
    }, [params, router]);

    const onChangeHandler = (event) => {
        const { name, type, value, checked } = event.target;
        const next = type === 'checkbox' ? checked : value;
        setData(prev => ({ ...prev, [name]: next }));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to edit event');
            router.push('/login');
            return;
        }

        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('title', data.title);
        formData.append('description', data.description);
        
        // Append new images if any
        if (newImages.length > 0) {
            newImages.forEach((image) => {
                formData.append('images', image);
            });
        }
        
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
        formData.append('reservationDeadline', data.reservationDeadline || '');
        formData.append('host', data.host);

        try {
            const response = await axios.put('/api/blog', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.msg);
                setTimeout(() => {
                    router.back();
                }, 1500);
            } else {
                toast.error(response.data.msg || 'Could not update event');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || 'Update failed');
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto'></div>
                    <p className='mt-4 text-gray-300'>Loading event data...</p>
                </div>
            </div>
        );
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
                    Back to My Events
                </button>
                
                <div className='bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-purple-500/20 rounded-lg shadow-[0_0_30px_rgba(176,38,255,0.3)] p-8 backdrop-blur-sm'>
                    <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 mb-2'>Edit Event</h1>
                    <p className='text-gray-300 mb-6'>Update your event details</p>
                    
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Event Images</p>
                            {existingImages.length > 0 && newImages.length === 0 && (
                                <div className='mb-3'>
                                    <p className='text-sm text-gray-400 mb-2'>Current images:</p>
                                    <div className='flex flex-wrap gap-2'>
                                        {existingImages.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Current ${idx + 1}`} className='w-24 h-24 object-cover rounded border border-purple-500/30' />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className='text-sm text-gray-400 mb-2'>Upload new images (optional, will replace existing, Max 5):</p>
                            <div
                                onClick={() => document.getElementById('images')?.click()}
                                className='inline-flex items-center justify-center cursor-pointer border-2 border-dashed border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-800/50'
                                style={{ width: 140, height: 70 }}
                            >
                                <span className='text-gray-400 text-sm'>Click to upload</span>
                            </div>
                            <input 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files).slice(0, 5);
                                    setNewImages(files);
                                }} 
                                type="file" 
                                id='images' 
                                multiple 
                                accept='image/*'
                                hidden 
                            />
                            {newImages.length > 0 && (
                                <div className='mt-4 flex flex-wrap gap-2'>
                                    {newImages.map((img, idx) => (
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
                                                onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
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
                            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type="text" placeholder='Type here' required />
                        </div>
                        
                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Description</p>
                            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' rows={4} placeholder='Describe your event' required></textarea>
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Start Date & Time</p>
                            <input name='startDateTime' onChange={onChangeHandler} value={data.startDateTime} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='datetime-local' required />
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>End Date & Time</p>
                            <input name='endDateTime' onChange={onChangeHandler} value={data.endDateTime} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='datetime-local' required />
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Event Type</p>
                            <select
                                name='eventType'
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                value={eventTypeOption}
                                onChange={(e) => {
                                    setEventTypeOption(e.target.value);
                                    if (e.target.value !== 'Other') {
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
                                    className='w-full mt-4 px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                                    type='text'
                                    placeholder='Type event type'
                                    value={data.eventType}
                                    onChange={onChangeHandler}
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Location</p>
                            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type='text' placeholder='Jones College Rooftop' required />
                        </div>

                        <div className='flex items-center gap-3'>
                            <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border accent-purple-500' onChange={onChangeHandler} checked={data.needReservation} />
                            <label htmlFor='needReservation' className='text-base text-white'>Need RSVP</label>
                        </div>

                        {data.needReservation && (
                            <div>
                                <p className='text-xl font-medium mb-2 text-white'>RSVP Deadline (Optional)</p>
                                <input name='reservationDeadline' onChange={onChangeHandler} value={data.reservationDeadline} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent' type='datetime-local' />
                            </div>
                        )}

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Capacity (Optional)</p>
                            <input name='capacity' onChange={onChangeHandler} value={data.capacity} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type='number' min='0' placeholder='Leave empty or 0 if not applicable' />
                        </div>

                        <div>
                            <p className='text-xl font-medium mb-2 text-white'>Host</p>
                            <input name='host' onChange={onChangeHandler} value={data.host} className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400' type='text' placeholder='Howard Zhao' required />
                        </div>
                        
                        <div className='flex gap-3'>
                            <button 
                                type="button" 
                                onClick={() => router.back()}
                                className='flex-1 bg-gray-700 text-white font-medium py-3 rounded-md hover:bg-gray-600 transition-colors border border-purple-500/30'
                            >
                                Cancel
                            </button>
                            <button type="submit" className='flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium py-3 rounded-md hover:from-orange-600 hover:to-pink-600 transition-colors shadow-[0_0_25px_rgba(255,0,128,0.6)]'>
                                Update Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
