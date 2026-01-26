'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AdminEditEventPage({ params }) {
    const router = useRouter();
    const [eventId, setEventId] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        eventType: '',
        location: '',
        needReservation: false,
        capacity: 0,
        reservationDeadline: '',
        host: '',
        instagram: ''
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
                // Verify user is admin
                const userResponse = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!userResponse.data.success || !userResponse.data.user.isAdmin) {
                    toast.error('Admin privileges required');
                    router.push('/');
                    return;
                }

                // Fetch event data
                const response = await axios.get(`/api/blog?id=${resolvedParams.id}`);
                const eventData = response.json ? await response.json() : response.data;

                // Format datetime for input (convert to local timezone properly)
                const formatDateTimeLocal = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    // datetime-local input expects format: YYYY-MM-DDTHH:MM
                    // The Date object already represents the UTC time, we need to format it as local time
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
                    host: eventData.host || '',
                    instagram: eventData.instagram || ''
                });

                setExistingImages(eventData.images || []);

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
        
        const startDateTimeISO = new Date(data.startDateTime).toISOString();
        const endDateTimeISO = new Date(data.endDateTime).toISOString();
        const reservationDeadlineISO = data.reservationDeadline ? new Date(data.reservationDeadline).toISOString() : '';
        
        console.log('[Admin Frontend] Submitting datetime update:');
        console.log('[Admin Frontend] data.startDateTime (local input):', data.startDateTime);
        console.log('[Admin Frontend] startDateTimeISO (sending to API):', startDateTimeISO);
        console.log('[Admin Frontend] data.endDateTime (local input):', data.endDateTime);
        console.log('[Admin Frontend] endDateTimeISO (sending to API):', endDateTimeISO);
        
        formData.append('startDateTime', startDateTimeISO);
        formData.append('endDateTime', endDateTimeISO);
        formData.append('eventType', data.eventType);
        formData.append('theme', data.theme || '');
        formData.append('dressCode', data.dressCode || '');
        formData.append('location', data.location);
        formData.append('needReservation', data.needReservation);
        formData.append('capacity', data.capacity);
        formData.append('reservationDeadline', reservationDeadlineISO);
        formData.append('host', data.host);
        formData.append('instagram', data.instagram || '');

        try {
            const response = await axios.put('/api/blog', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.msg);
                setTimeout(() => {
                    router.push('/admin/bloglist');
                    router.refresh();
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
            <div className='min-h-screen flex items-center justify-center bg-gray-900'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto'></div>
                    <p className='mt-4 text-gray-300'>Loading event data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto'>
                <button
                    onClick={() => router.push('/admin/bloglist')}
                    className='mb-6 text-gray-300 hover:text-pink-400 flex items-center gap-2 transition-colors'
                >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                    </svg>
                    Back to Event List
                </button>

                <div className='bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-lg shadow-[0_0_30px_rgba(176,38,255,0.3)] p-8'>
                    <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 mb-8'>
                        Admin Edit Event
                    </h1>
                    
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        {/* Event Title */}
                        <div>
                            <label htmlFor='title' className='block text-sm font-medium text-gray-300 mb-2'>
                                Event Title *
                            </label>
                            <input
                                onChange={onChangeHandler}
                                value={data.title}
                                type='text'
                                name='title'
                                placeholder='Enter event title'
                                required
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                            />
                        </div>

                        {/* Event Description */}
                        <div>
                            <label htmlFor='description' className='block text-sm font-medium text-gray-300 mb-2'>
                                Event Description *
                            </label>
                            <textarea
                                onChange={onChangeHandler}
                                value={data.description}
                                name='description'
                                placeholder='Describe your event'
                                rows={6}
                                required
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400 resize-none'
                            />
                        </div>

                        {/* Host Name */}
                        <div>
                            <label htmlFor='host' className='block text-sm font-medium text-gray-300 mb-2'>
                                Host Name *
                            </label>
                            <input
                                onChange={onChangeHandler}
                                value={data.host}
                                type='text'
                                name='host'
                                placeholder='Enter host name'
                                required
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                            />
                        </div>

                        {/* Instagram Handle */}
                        <div>
                            <label htmlFor='instagram' className='block text-sm font-medium text-gray-300 mb-2'>
                                Instagram Handle (Optional)
                            </label>
                            <div className='flex items-center'>
                                <span className='text-gray-400 mr-2 text-lg'>@</span>
                                <input
                                    onChange={(e) => {
                                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
                                        setData(prev => ({ ...prev, instagram: value }));
                                    }}
                                    value={data.instagram}
                                    type='text'
                                    name='instagram'
                                    placeholder='username'
                                    maxLength={30}
                                    className='flex-1 px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                                />
                            </div>
                            <p className='text-xs text-gray-400 mt-1'>This will be displayed on the event detail page</p>
                        </div>

                        {/* Date and Time */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <label htmlFor='startDateTime' className='block text-sm font-medium text-gray-300 mb-2'>
                                    Start Date & Time *
                                </label>
                                <input
                                    onChange={onChangeHandler}
                                    value={data.startDateTime}
                                    type='datetime-local'
                                    name='startDateTime'
                                    required
                                    className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                />
                            </div>
                            <div>
                                <label htmlFor='endDateTime' className='block text-sm font-medium text-gray-300 mb-2'>
                                    End Date & Time *
                                </label>
                                <input
                                    onChange={onChangeHandler}
                                    value={data.endDateTime}
                                    type='datetime-local'
                                    name='endDateTime'
                                    required
                                    className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                />
                            </div>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label htmlFor='eventType' className='block text-sm font-medium text-gray-300 mb-2'>
                                Event Type *
                            </label>
                            <input
                                name='eventType'
                                type='text'
                                value={data.eventType}
                                onChange={onChangeHandler}
                                placeholder=''
                                required
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor='location' className='block text-sm font-medium text-gray-300 mb-2'>
                                Location *
                            </label>
                            <input
                                onChange={onChangeHandler}
                                value={data.location}
                                type='text'
                                name='location'
                                placeholder='Event location'
                                required
                                className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400'
                            />
                        </div>

                        {/* Reservation Options */}
                        <div className='border-2 border-purple-500/20 rounded-lg p-6 bg-gray-800/30'>
                            <div className='flex items-center mb-4'>
                                <input
                                    onChange={onChangeHandler}
                                    checked={data.needReservation}
                                    type='checkbox'
                                    name='needReservation'
                                    id='needReservation'
                                    className='h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded'
                                />
                                <label htmlFor='needReservation' className='ml-2 block text-sm text-gray-300'>
                                    Requires Reservation
                                </label>
                            </div>

                            {data.needReservation && (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                                    <div>
                                        <label htmlFor='capacity' className='block text-sm font-medium text-gray-300 mb-2'>
                                            Capacity
                                        </label>
                                        <input
                                            onChange={onChangeHandler}
                                            value={data.capacity}
                                            type='number'
                                            name='capacity'
                                            min='0'
                                            className='w-full px-4 py-2 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor='reservationDeadline' className='block text-sm font-medium text-gray-300 mb-2'>
                                            Reservation Deadline
                                        </label>
                                        <input
                                            onChange={onChangeHandler}
                                            value={data.reservationDeadline}
                                            type='datetime-local'
                                            name='reservationDeadline'
                                            className='w-full px-4 py-2 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                Event Images
                            </label>
                            
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className='mb-4'>
                                    <p className='text-sm text-gray-400 mb-2'>Current Images:</p>
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                        {existingImages.map((img, index) => (
                                            <div key={index} className='relative group'>
                                                <Image 
                                                    src={img} 
                                                    alt={`Event ${index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className='w-full h-32 object-cover rounded-lg border-2 border-purple-500/30'
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Upload */}
                            <label htmlFor='images' className='cursor-pointer'>
                                <div className='border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-pink-500/50 transition-colors bg-gray-800/30'>
                                    <svg className='mx-auto h-12 w-12 text-gray-400' stroke='currentColor' fill='none' viewBox='0 0 48 48'>
                                        <path d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                    </svg>
                                    <p className='mt-2 text-sm text-gray-300'>Click to upload new images</p>
                                    <p className='text-xs text-gray-400'>PNG, JPG up to 10MB</p>
                                </div>
                                <input
                                    onChange={(e) => setNewImages(Array.from(e.target.files))}
                                    type='file'
                                    id='images'
                                    accept='image/*'
                                    multiple
                                    hidden
                                />
                            </label>

                            {newImages.length > 0 && (
                                <div className='mt-4'>
                                    <p className='text-sm text-gray-300 mb-2'>New Images to Upload: {newImages.length}</p>
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                        {Array.from(newImages).map((img, index) => (
                                            <div key={index} className='relative'>
                                                <Image 
                                                    src={URL.createObjectURL(img)} 
                                                    alt={`New ${index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className='w-full h-32 object-cover rounded-lg border-2 border-pink-500/50'
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className='flex gap-4 pt-6'>
                            <button
                                type='button'
                                onClick={() => router.push('/admin/bloglist')}
                                className='flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium py-3 px-6 rounded-md hover:from-orange-600 hover:to-pink-600 transition-colors shadow-[0_0_20px_rgba(255,0,128,0.5)]'
                            >
                                Update Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
