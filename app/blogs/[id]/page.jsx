'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Footer from '@/components/footer';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import SuccessModal from '@/components/SuccessModal';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import StarRating from '@/components/StarRating';
import LiveRatingButton from '@/components/LiveRatingButton';
import ShareModal from '@/components/ShareModal';


const Page = ({ params }) => {
    const router = useRouter();
    const [id, setId] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInterested, setIsInterested] = useState(false);
    const [isReserved, setIsReserved] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalActionType, setModalActionType] = useState('');
    const [reviews, setReviews] = useState([]);
    const [hasRated, setHasRated] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
            
            // Fetch blog data
            const response = await fetch(`/api/blog?id=${resolvedParams.id}`, {
                cache: 'no-store'
            });
            const blogData = await response.json();
            setData(blogData);
            
            // Fetch reviews
            await fetchReviews(resolvedParams.id);
            
            // Check if user is logged in and get their status
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userResponse = await axios.get('/api/user', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (userResponse.data.success) {
                        const userId = userResponse.data.user._id || userResponse.data.user.id;
                        const ratedEvents = userResponse.data.user.ratedEvents || [];
                        setIsInterested(blogData.interestedUsers?.includes(userId) || false);
                        setIsReserved(blogData.reservedUsers?.includes(userId) || false);
                        setHasRated(ratedEvents.includes(resolvedParams.id));
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
            
            setLoading(false);
        };
        
        fetchData();
    }, [params]);

    const fetchReviews = async (eventId) => {
        try {
            const response = await axios.get(`/api/rating?eventId=${eventId}`);
            if (response.data.success) {
                setReviews(response.data.ratings || []);
                if (data) {
                    setData(prev => ({
                        ...prev,
                        averageRating: response.data.averageRating,
                        totalRatings: response.data.totalRatings
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleReviewSubmitted = () => {
        fetchReviews(id);
        setHasRated(true);
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleInterested = async () => {
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
                setIsInterested(response.data.isInterested);
                setData(prev => ({
                    ...prev,
                    interestedUsers: response.data.isInterested 
                        ? [...(prev.interestedUsers || []), 'currentUser']
                        : (prev.interestedUsers || []).filter(u => u !== 'currentUser')
                }));
                
                // Show success modal only when marking as interested (not removing)
                if (response.data.isInterested) {
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

    const handleReserve = async () => {
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
                setIsReserved(true);
                setData(prev => ({
                    ...prev,
                    reserved: response.data.reserved
                }));
                
                // Show success modal
                setModalActionType('reserve');
                setShowSuccessModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error reserving event');
        }
    };

    const handleCancelRSVP = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login first');
            return;
        }

        try {
            const response = await axios.patch('/api/blog', 
                { action: 'cancel-rsvp', eventId: id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsReserved(false);
                setData(prev => ({
                    ...prev,
                    reserved: response.data.reserved
                }));
                toast.success(response.data.msg);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error cancelling RSVP');
        }
    };

    if (loading) {
        return <div className='min-h-screen flex items-center justify-center'>
            <p className='text-xl'>Loading...</p>
        </div>;
    }

    if (!data) {
        return <div className='min-h-screen flex items-center justify-center'>
            <p className='text-xl'>Event not found</p>
        </div>;
    }

    const isRSVPDeadlinePassed = data.reservationDeadline && new Date() > new Date(data.reservationDeadline);
    const isCapacityReached = data.needReservation && data.reserved >= data.capacity;
    
    return (
        <>
        <div className='bg-white py-6 px-5 md:px-12 lg:px-28 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
            <Link href='/'>
                <div className='flex items-center gap-3 cursor-pointer hover:opacity-80'>
                    <Image src={assets.logo} width={50} height={50} alt='Rice Party Logo' className='w-12 h-12 object-contain'/>
                    <div>
                        <h2 className='text-xl font-semibold'>Rice Events</h2>
                    </div>
                </div>
            </Link>
            <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>Create an event</button>
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
                                {!data.needReservation && (data.status === 'future' || data.status === 'live') && (
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                        <span className='text-blue-600 font-medium'>{data.interestedUsers?.length || 0} interested</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {data.status === 'live' && <span className='bg-black text-white text-xs px-3 py-1 rounded-full'>#HAPPENING NOW</span>}
                                {data.status === 'future' && <span className='bg-blue-500 text-white text-xs px-3 py-1 rounded-full'>#UPCOMING</span>}
                                <span className='bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full'>{data.eventType}</span>
                                {isCapacityReached && <span className='bg-red-500 text-white text-xs px-3 py-1 rounded-full'>FULL</span>}
                                {isRSVPDeadlinePassed && data.needReservation && <span className='bg-orange-500 text-white text-xs px-3 py-1 rounded-full'>RSVP Closed</span>}
                            </div>

                            {/* Live Rating Display - prominent placement for live events */}
                            {data.status === 'live' && (
                                <div className='mb-4'>
                                    <LiveRatingButton 
                                        eventId={id}
                                        averageLiveRating={data.averageLiveRating}
                                        totalLiveRatings={data.totalLiveRatings}
                                        needReservation={data.needReservation}
                                        hasReservation={isReserved}
                                    />
                                </div>
                            )}

                            <p className='text-sm text-gray-500'>Hosted by <span className='font-semibold'>{data.host}</span></p>
                        </div>

                        {/* Date Badge */}
                        <button 
                            onClick={() => {
                                const formatGoogleDate = (dateString) => {
                                    const date = new Date(dateString);
                                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                };
                                const startDate = formatGoogleDate(data.startDateTime);
                                const endDate = formatGoogleDate(data.endDateTime);
                                const eventDescription = `${data.description}\n\nEvent Type: ${data.eventType}\nHosted by: ${data.host}`;
                                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(data.location)}`;
                                window.open(googleCalendarUrl, '_blank');
                            }}
                            className='text-center bg-gray-50 rounded-xl p-4 ml-6 hover:bg-gray-100 transition-colors cursor-pointer group'
                            title='Add to Google Calendar'
                        >
                            <div className='text-sm text-gray-500 uppercase group-hover:text-blue-600 transition-colors'>{new Date(data.startDateTime).toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className='text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>{new Date(data.startDateTime).getDate()}</div>
                            <div className='text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>Add to Cal</div>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 pt-6 border-t border-gray-200'>
                        {(data.status === 'future' || data.status === 'live') && (
                            <>
                                {data.needReservation ? (
                                    <>
                                        {!isReserved ? (
                                            <button 
                                                onClick={handleReserve}
                                                disabled={isCapacityReached || isRSVPDeadlinePassed}
                                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                                    isCapacityReached || isRSVPDeadlinePassed
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {isCapacityReached ? 'Event Full' : isRSVPDeadlinePassed ? 'RSVP Closed' : 'RSVP'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleCancelRSVP}
                                                className='flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors'
                                            >
                                                Cancel RSVP
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button 
                                        onClick={handleInterested}
                                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                            isInterested 
                                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {isInterested ? "I'm Going!" : "I'm Going"}
                                    </button>
                                )}
                            </>
                        )}
                        <button 
                            onClick={() => setShowShareModal(true)}
                            className='px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                            </svg>
                            Share
                        </button>
                    </div>
                    
                    {/* RSVP deadline info */}
                    {data.needReservation && data.reservationDeadline && (
                        <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                            <p className='text-sm text-blue-800'>
                                <span className='font-semibold'>RSVP Deadline:</span> {new Date(data.reservationDeadline).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    )}
                    
                    {/* Add to Calendar Section */}
                    {(isInterested || isReserved) && (
                        <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm font-semibold text-gray-700 mb-3'>Add to Calendar</p>
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => {
                                        const formatGoogleDate = (dateString) => {
                                            const date = new Date(dateString);
                                            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                        };
                                        const startDate = formatGoogleDate(data.startDateTime);
                                        const endDate = formatGoogleDate(data.endDateTime);
                                        const description = `${data.description}\n\nEvent Type: ${data.eventType}\nHosted by: ${data.host}`;
                                        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(data.location)}`;
                                        window.open(googleCalendarUrl, '_blank');
                                    }}
                                    className='flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
                                >
                                    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                                        <path d='M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m15 0h-15' />
                                    </svg>
                                    Google Calendar
                                </button>
                                <button
                                    onClick={() => {
                                        const formatDate = (dateString) => {
                                            const date = new Date(dateString);
                                            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                                        };
                                        const startDate = formatDate(data.startDateTime);
                                        const endDate = formatDate(data.endDateTime);
                                        const now = formatDate(new Date());
                                        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rice Party//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${data._id}@riceparty.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${data.title}
DESCRIPTION:${data.description}\\n\\nEvent Type: ${data.eventType}\\nHosted by: ${data.host}
LOCATION:${data.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
                                        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.setAttribute('download', `${data.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className='flex-1 bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' />
                                    </svg>
                                    Download .ics
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Details */}
                <div className='bg-white rounded-2xl shadow-sm p-8'>
                    {/* Image Gallery - Only show if images exist */}
                    {data.images && data.images.length > 0 && (
                        <div className='mb-8'>
                            {data.images.length === 1 ? (
                                <Image className='w-full rounded-lg' src={data.images[0]} width={800} height={500} alt='Event image'/>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {data.images.map((img, idx) => (
                                        <Image key={idx} className='w-full rounded-lg object-cover h-64' src={img} width={400} height={300} alt={`Event image ${idx + 1}`}/>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <h2 className='text-2xl font-bold mb-4 text-gray-900'>About this Event</h2>
                    <p className='text-gray-700 leading-relaxed mb-6'>{data.description}</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-gray-900'>Event Details</h3>
                    <div className='space-y-3 text-gray-700'>
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Event Type:</span>
                            <span>{data.eventType}</span>
                        </div>
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
                        {data.needReservation && data.reservationDeadline && (
                            <div className='flex gap-2'>
                                <span className='font-semibold min-w-[120px]'>Reserve By:</span>
                                <span>{new Date(data.reservationDeadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                        )}
                        <div className='flex gap-2'>
                            <span className='font-semibold min-w-[120px]'>Hosted by:</span>
                            <div className='flex flex-wrap gap-2 items-center'>
                                <span>{data.host}</span>
                                {data.cohosts && data.cohosts.length > 0 && (
                                    <>
                                        <span className='text-gray-400'>•</span>
                                        <div className='flex flex-wrap gap-1 items-center'>
                                            <span className='text-gray-600'>Co-hosts:</span>
                                            {data.cohosts.map((cohost, index) => (
                                                <span key={cohost.userId} className='text-purple-700 font-medium'>
                                                    @{cohost.username}{index < data.cohosts.length - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings & Reviews Section - Only for Past Events */}
                {data.status === 'past' && (
                    <div className='space-y-6 mt-6'>
                        {/* Average Rating Display */}
                        {data.totalRatings > 0 && (
                            <div className='bg-white rounded-lg border border-gray-200 p-6'>
                                <div className='flex items-center gap-4'>
                                    <div className='flex flex-col items-center'>
                                        <div className='text-4xl font-bold text-gray-900'>
                                            {data.averageRating?.toFixed(1) || '0.0'}
                                        </div>
                                        <StarRating rating={data.averageRating || 0} readonly size='md' />
                                        <p className='text-sm text-gray-600 mt-1'>
                                            {data.totalRatings} {data.totalRatings === 1 ? 'review' : 'reviews'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Review Form or Button */}
                        {!hasRated && !showReviewForm && (
                            <div className='text-center py-6'>
                                <button
                                    onClick={() => {
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            toast.error('Please login to write a review');
                                            router.push('/login');
                                            return;
                                        }
                                        setShowReviewForm(true);
                                    }}
                                    className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                                    </svg>
                                    Write a Review
                                </button>
                            </div>
                        )}

                        {showReviewForm && (
                            <ReviewForm 
                                eventId={id}
                                eventTitle={data.title}
                                onReviewSubmitted={handleReviewSubmitted}
                                editingReview={editingReview}
                            />
                        )}

                        {hasRated && !showReviewForm && (
                            <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-center'>
                                <p className='text-green-800 font-medium'>Thank you for your review!</p>
                            </div>
                        )}

                        {/* Reviews List */}
                        <ReviewList 
                            reviews={reviews}
                            averageRating={data.averageRating || 0}
                            totalRatings={data.totalRatings || 0}
                            onEditReview={handleEditReview}
                        />
                    </div>
                )}
            </div>
        </div>
        <Footer />
        
        {/* Success Modal */}
        <SuccessModal 
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            eventData={data}
            actionType={modalActionType}
        />

        {/* Share Modal */}
        <ShareModal 
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            eventData={data}
        />
        </>
    )
}

export default Page