'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { assets, blog_data } from '@/assets/assets';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import SuccessModal from './SuccessModal';
import StarRating from './StarRating';
import LiveRatingButton from './LiveRatingButton';

const BlogItem = ({title, description, category, images, id, status, eventType, location, needReservation, reserved, capacity, startDateTime, endDateTime, host, cohosts = [], interestedUsers = [], reservedUsers = [], reservationDeadline, averageLiveRating, totalLiveRatings, eventCategory, organizer}) => {
    console.log('BlogItem ID:', id);
    const router = useRouter();
    const [interestedCount, setInterestedCount] = useState(interestedUsers?.length || 0);
    const [isInterested, setIsInterested] = useState(false);
    const [reservedCount, setReservedCount] = useState(reserved || 0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalActionType, setModalActionType] = useState('');
    const [eventData, setEventData] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [ratingImages, setRatingImages] = useState([]);
    const [submittingRating, setSubmittingRating] = useState(false);
    
    // Check if current user is interested in this event
    useEffect(() => {
        const checkIfInterested = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            try {
                const response = await axios.get('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.data.success) {
                    const userId = response.data.user._id;
                    // Check if user ID is in interestedUsers array
                    const userIsInterested = interestedUsers.some(user => 
                        (typeof user === 'string' ? user : user._id || user) === userId
                    );
                    setIsInterested(userIsInterested);
                }
            } catch (error) {
                console.error('Error checking interested status:', error);
            }
        };
        
        checkIfInterested();
    }, [id, interestedUsers]);
    
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
                return { bg: 'bg-green-500', text: '#HAPPENING NOW' };
            case 'future':
                return { bg: 'bg-orange-500', text: '#UPCOMING' };
            case 'past':
                return { bg: 'bg-gray-500', text: '#PAST' };
            default:
                return { bg: 'bg-pink-500', text: '#HAPPENING NOW' };
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
                        host
                    });
                    setModalActionType('interested');
                    setShowSuccessModal(true);
                } else {
                    toast.success(response.data.msg);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not mark as interested');
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
                    host
                });
                setModalActionType('reserve');
                setShowSuccessModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not reserve');
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
        const eventDescription = `${description}\n\nEvent Type: ${eventType}\nHosted by: ${host}`;
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;
        window.open(googleCalendarUrl, '_blank');
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to rate events');
            router.push('/login');
            return;
        }

        setSubmittingRating(true);

        try {
            const formData = new FormData();
            formData.append('eventId', id);
            formData.append('rating', rating);
            formData.append('comment', comment);
            
            ratingImages.forEach((image) => {
                formData.append('images', image);
            });

            const response = await axios.post('/api/rating', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Rating submitted');
                setShowRatingModal(false);
                setRating(0);
                setComment('');
                setRatingImages([]);
                // Refresh page to show updated rating
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    // Check if RSVP deadline has passed
    const isRSVPDeadlinePassed = reservationDeadline && new Date() > new Date(reservationDeadline);
    const isCapacityReached = needReservation && reservedCount >= capacity;
    
    return (
        <>
        <div className='bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 items-start border border-gray-100'>
            {/* Left side - Event info */}
            <div className='flex-1 w-full'>
                {/* Event Title */}
                <Link href={`/blogs/${id}`}>
                    <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2 hover:text-gray-700 cursor-pointer'>{title}</h3>
                </Link>
                
                {/* Event Description */}
                <p className='text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none'>{description}</p>
                
                {/* Tags/Categories */}
                <div className='flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4'>
                    {/* Official Event Badge */}
                    {eventCategory === 'residential_college' && (
                        <span className='bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1'>
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'/>
                            </svg>
                            {organizer || 'Residential College'}
                        </span>
                    )}
                    {eventCategory === 'university' && (
                        <span className='bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1'>
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                            </svg>
                            {organizer || 'Rice University'}
                        </span>
                    )}
                    <span className={`${statusBadge.bg} text-white text-xs px-3 py-1 rounded-full font-medium`}>{statusBadge.text}</span>
                    <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer transition-colors'>{eventType}</span>
                    {isCapacityReached && (
                        <span className='bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium'>FULL</span>
                    )}
                    {isRSVPDeadlinePassed && needReservation && (
                        <span className='bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium'>RSVP Closed</span>
                    )}
                </div>

                {/* Live Rating Display - only for live events */}
                {status === 'live' && (
                    <div className='mb-4'>
                        <LiveRatingButton 
                            eventId={id}
                            averageLiveRating={averageLiveRating}
                            totalLiveRatings={totalLiveRatings}
                            needReservation={needReservation}
                            hasReservation={reservedUsers?.some(userId => userId === localStorage.getItem('userId'))}
                        />
                    </div>
                )}
                
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
                                    <span className='text-xs'>RSVP by: {new Date(reservationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                            )}
                        </>
                    )}
                    {!needReservation && (status === 'future' || status === 'live') && (
                        <div className='flex items-center gap-1.5 text-xs sm:text-sm'>
                            <svg className='w-4 h-4 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                            <span className='text-orange-500 font-medium'>{interestedCount} interested</span>
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
                <div className='text-xs text-gray-500 mt-3'>
                    Hosted by <span className='font-medium text-gray-700'>{host}</span>
                    {cohosts && cohosts.length > 0 && (
                        <>
                            <span className='mx-1.5 text-gray-400'>•</span>
                            <span className='text-gray-600'>
                                Co-hosts: {cohosts.map((cohost, index) => (
                                    <span key={cohost.userId} className='font-medium text-purple-700'>
                                        @{cohost.username}{index < cohosts.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Right side - Date badge and actions */}
            <div className='flex sm:flex-col items-center sm:items-end gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start'>
                <button 
                    onClick={handleAddToGoogleCalendar}
                    className='text-center bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 min-w-[60px] sm:min-w-[80px] hover:bg-gray-100 transition-colors cursor-pointer group'
                    title='Add to Google Calendar'
                >
                    <div className='text-[10px] sm:text-xs text-gray-500 uppercase group-hover:text-orange-500 transition-colors'>{eventDate?.month || 'Jan'}</div>
                    <div className='text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors'>{eventDate?.day || '1'}</div>
                    <div className='text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>Add Cal</div>
                </button>
                <div className='flex gap-1.5 sm:gap-2'>
                    {(status === 'future' || status === 'live') && (
                        <>
                            {needReservation ? (
                                <button 
                                    onClick={handleReserve}
                                    disabled={isCapacityReached || isRSVPDeadlinePassed}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition-colors text-xs sm:text-sm ${
                                        isCapacityReached || isRSVPDeadlinePassed
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isCapacityReached ? 'Full' : isRSVPDeadlinePassed ? 'Closed' : 'RSVP'}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleInterested}
                                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                        isInterested 
                                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                    }`}
                                >
                                    {isInterested ? 'Going!' : "I'm going"}
                                </button>
                            )}
                        </>
                    )}
                    {status === 'past' && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowRatingModal(true);
                            }}
                            className='px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors flex items-center gap-1'
                        >
                            <svg className='w-3 h-3 sm:w-4 sm:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                            </svg>
                            <span className='hidden sm:inline'>Rate</span>
                        </button>
                    )}
                    <Link href={`/blogs/${id}`}>
                        <button className='bg-white border border-gray-300 text-gray-700 px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap'>View</button>
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

        {/* Rating Modal */}
        {showRatingModal && (
            <div 
                className='fixed inset-0 flex items-center justify-center z-50 p-4'
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowRatingModal(false);
                }}
            >
                <div 
                    className='bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto'
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='flex justify-between items-start mb-4'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900'>Rate Event</h3>
                            <p className='text-sm text-gray-600 mt-1'>{title}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowRatingModal(false);
                            }}
                            className='text-gray-400 hover:text-gray-600'
                        >
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmitRating}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Your Rating</label>
                            <StarRating rating={rating} onRatingChange={setRating} size='lg' />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                rows={3}
                                placeholder='Share your experience...'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Photos</label>
                            <input
                                type='file'
                                accept='image/*'
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files).slice(0, 5);
                                    setRatingImages(files);
                                }}
                                className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                            />
                            {ratingImages.length > 0 && (
                                <div className='mt-2 flex flex-wrap gap-2'>
                                    {ratingImages.map((img, idx) => (
                                        <div key={idx} className='relative'>
                                            <Image
                                                src={URL.createObjectURL(img)}
                                                width={60}
                                                height={60}
                                                alt={`Preview ${idx + 1}`}
                                                className='rounded object-cover'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setRatingImages(ratingImages.filter((_, i) => i !== idx))}
                                                className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className='flex gap-2'>
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRatingModal(false);
                                }}
                                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={submittingRating || rating === 0}
                                className='flex-1 px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#001840] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                            >
                                {submittingRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}

export default BlogItem