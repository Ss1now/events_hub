'use client'
import React, { useState } from 'react'
import Image from 'next/image';
import { assets, blog_data } from '@/assets/assets';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import SuccessModal from './SuccessModal';

const BlogItem = ({title, description, category, image, id, status, eventType, theme, dressCode, location, needReservation, reserved, capacity, startDateTime, endDateTime, host, interestedUsers = [], reservedUsers = [], reservationDeadline}) => {
    console.log('BlogItem ID:', id);
    const router = useRouter();
    const [interestedCount, setInterestedCount] = useState(interestedUsers?.length || 0);
    const [isInterested, setIsInterested] = useState(false);
    const [reservedCount, setReservedCount] = useState(reserved || 0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalActionType, setModalActionType] = useState('');
    const [eventData, setEventData] = useState(null);
    
    // Format date and time from startDateTime and endDateTime
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options);
    };
    
    const formatDateBadge = (dateString) => {
        if (!dateString) return { month: 'Jan', day: '1' };
        const date = new Date(dateString);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        return { month, day };
    };
    
    const timeDisplay = startDateTime && endDateTime 
        ? `${formatDateTime(startDateTime)} → ${formatDateTime(endDateTime)}`
        : '';
    
    const eventDate = formatDateBadge(startDateTime);
    
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
    
    const handleInterested = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to mark as interested');
            router.push('/login');
            return;
        }

        try {
            const response = await axios.patch('/api/blog', 
                { action: 'interested', eventId: id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setInterestedCount(response.data.interestedCount);
                setIsInterested(response.data.isInterested);
                
                // Show success modal only when marking as interested (not removing)
                if (response.data.isInterested) {
                    setEventData({
                        _id: id,
                        title,
                        description,
                        startDateTime,
                        endDateTime,
                        location,
                        eventType,
                        theme,
                        dressCode,
                        host
                    });
                    setModalActionType('interested');
                    setShowSuccessModal(true);
                } else {
                    toast.success(response.data.msg);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error marking as interested');
        }
    };

    const handleReserve = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to reserve');
            router.push('/login');
            return;
        }

        try {
            const response = await axios.patch('/api/blog', 
                { action: 'reserve', eventId: id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setReservedCount(response.data.reserved);
                
                // Show success modal
                setEventData({
                    _id: id,
                    title,
                    description,
                    startDateTime,
                    endDateTime,
                    location,
                    eventType,
                    theme,
                    dressCode,
                    host
                });
                setModalActionType('reserve');
                setShowSuccessModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error reserving event');
        }
    };

    const handleAddToGoogleCalendar = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const formatGoogleDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = formatGoogleDate(startDateTime);
        const endDate = formatGoogleDate(endDateTime);
        const eventDescription = `${description}\n\nEvent Type: ${eventType}\nTheme: ${theme}\nDress Code: ${dressCode}\nHosted by: ${host}`;
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;
        window.open(googleCalendarUrl, '_blank');
    };

    // Check if reservation deadline has passed
    const isReservationDeadlinePassed = reservationDeadline && new Date() > new Date(reservationDeadline);
    const isCapacityReached = needReservation && reservedCount >= capacity;
    
    return (
        <>
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
                    {isCapacityReached && (
                        <span className='bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium'>FULL</span>
                    )}
                    {isReservationDeadlinePassed && needReservation && (
                        <span className='bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium'>Reservation Closed</span>
                    )}
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
                        <>
                            <div className='flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                </svg>
                                <span>{reservedCount}/{capacity} reserved</span>
                            </div>
                            {reservationDeadline && (
                                <div className='flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    <span className='text-xs'>Reserve by: {new Date(reservationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                            )}
                        </>
                    )}
                    {!needReservation && (status === 'future' || status === 'live') && (
                        <div className='flex items-center gap-1'>
                            <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                            <span className='text-blue-600 font-medium'>{interestedCount} interested</span>
                        </div>
                    )}
                </div>
                
                {/* Time */}
                <div className='flex gap-6 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>{timeDisplay}</span>
                    </div>
                </div>

                {/* Hosted by */}
                <p className='text-xs text-gray-500 mt-3'>Hosted by <span className='font-medium'>{host}</span></p>
            </div>
            
            {/* Right side - Date badge and actions */}
            <div className='flex flex-col items-end gap-4'>
                <button 
                    onClick={handleAddToGoogleCalendar}
                    className='text-center bg-gray-50 rounded-xl p-3 min-w-[80px] hover:bg-gray-100 transition-colors cursor-pointer group'
                    title='Add to Google Calendar'
                >
                    <div className='text-xs text-gray-500 uppercase group-hover:text-blue-600 transition-colors'>{eventDate?.month || 'Jan'}</div>
                    <div className='text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>{eventDate?.day || '1'}</div>
                    <div className='text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>Add to Cal</div>
                </button>
                <div className='flex gap-2'>
                    {(status === 'future' || status === 'live') && (
                        <>
                            {needReservation ? (
                                <button 
                                    onClick={handleReserve}
                                    disabled={isCapacityReached || isReservationDeadlinePassed}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isCapacityReached || isReservationDeadlinePassed
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isCapacityReached ? 'Full' : isReservationDeadlinePassed ? 'Closed' : 'Reserve'}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleInterested}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isInterested 
                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                            : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isInterested ? 'Going!' : "I'm going"}
                                </button>
                            )}
                        </>
                    )}
                    <Link href={`/blogs/${id}`}>
                        <button className='bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'>View</button>
                    </Link>
                </div>
            </div>
        </div>
        
        {/* Success Modal */}
        <SuccessModal 
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            eventData={eventData}
            actionType={modalActionType}
        />
        </>
    )
}

export default BlogItem