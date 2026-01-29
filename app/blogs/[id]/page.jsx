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
import PregamesList from '@/components/PregamesList';
import LiveMetrics from '@/components/LiveMetrics';
import LiveMetricsBar from '@/components/LiveMetricsBar';
import LiveFeedbackForm from '@/components/LiveFeedbackForm';
import LiveComments from '@/components/LiveComments';
import WhatsMoveNow from '@/components/WhatsMoveNow';


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
            
            // Fetch blog data with cache-busting
            const response = await fetch(`/api/blog?id=${resolvedParams.id}&t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
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

        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.patch('/api/blog', 
                { action: 'interested', eventId: id },
                { headers }
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
            toast.error(error.response?.data?.msg || 'Could not mark as interested');
        }
    };

    const handleReserve = async () => {
        const token = localStorage.getItem('token');

        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.patch('/api/blog', 
                { action: 'reserve', eventId: id },
                { headers }
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
            toast.error(error.response?.data?.msg || 'Could not reserve');
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
            toast.error(error.response?.data?.msg || 'Could not cancel RSVP');
        }
    };

    if (loading) {
        return <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
            <p className='text-xl text-white'>Loading...</p>
        </div>;
    }

    if (!data) {
        return <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
            <p className='text-xl text-white'>Event not found</p>
        </div>;
    }

    const isRSVPDeadlinePassed = data.reservationDeadline && new Date() > new Date(data.reservationDeadline);
    const isCapacityReached = data.needReservation && data.reserved >= data.capacity;
    
    return (
        <>
        <div className='bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 py-4 px-4 md:py-6 md:px-12 lg:px-28 border-b border-purple-500/20'>
            <div className='flex justify-between items-center'>
            <Link href='/'>
                <div className='flex items-center gap-2 cursor-pointer hover:opacity-80'>
                    <Image src={assets.logo} width={50} height={50} alt='Rice Party Logo' className='w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'/>
                    <div>
                        <h2 className='text-lg md:text-xl font-semibold text-white'>Rice Parties</h2>
                    </div>
                </div>
            </Link>
            <button className='bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-1.5 px-3 md:py-2 md:px-6 rounded-md hover:from-orange-600 hover:to-pink-600 shadow-[0_0_20px_rgba(255,0,128,0.6)] transition-all text-xs md:text-sm whitespace-nowrap'>Create</button>
            </div>
        </div>
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen py-6 md:py-12'>
            <div className='max-w-4xl mx-auto px-4 sm:px-5 md:px-12'>
                {/* Event Header */}
                <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-purple-500/20 p-4 sm:p-6 md:p-8 mb-4 md:mb-6'>
                    <div className='flex justify-between items-start mb-4 md:mb-6'>
                        <div className='flex-1'>
                            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3'>{data.title}</h1>
                            
                            {/* Event Meta Info */}
                            <div className='flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-300 mb-3 md:mb-4'>
                                <div className='flex items-center gap-1.5 sm:gap-2'>
                                    <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    <span className='text-xs sm:text-sm'>{new Date(data.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {new Date(data.startDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {new Date(data.endDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                <div className='flex items-center gap-1.5 sm:gap-2'>
                                    <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    <span className='text-xs sm:text-sm'>{data.location}</span>
                                </div>
                                {data.needReservation && (
                                    <div className='flex items-center gap-1.5 sm:gap-2'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                        <span>{data.reserved || 0}/{data.capacity} reserved</span>
                                    </div>
                                )}
                                {!data.needReservation && (data.status === 'future' || data.status === 'live') && (
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5 text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                        <span className='text-white font-medium'>{data.interestedUsers?.length || 0} interested</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {/* Public Event Badges */}
                                {data.eventCategory === 'residential_college' && (
                                    <span className='bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-[0_0_10px_rgba(236,72,153,0.5)]'>
                                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'/>
                                        </svg>
                                        {data.organizer || data.host}
                                    </span>
                                )}
                                {data.eventCategory === 'university' && (
                                    <span className='bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-[0_0_10px_rgba(255,107,53,0.5)]'>
                                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                                        </svg>
                                        {data.organizer || 'Rice University'}
                                    </span>
                                )}
                                {/* Recurring Event Badge */}
                                {data.isRecurring && (
                                    <span className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1'>
                                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path fillRule='evenodd' d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z' clipRule='evenodd' />
                                        </svg>
                                        {data.recurrencePattern === 'weekly' ? 'WEEKLY' : 'MONTHLY'}
                                    </span>
                                )}
                                {data.status === 'live' && <span className='bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]'>#HAPPENING NOW</span>}
                                {data.status === 'future' && <span className='bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,107,53,0.5)]'>#UPCOMING</span>}
                                <span className='bg-gray-700/50 text-gray-200 text-xs px-3 py-1 rounded-full border border-purple-500/20'>{data.eventType}</span>
                                {isCapacityReached && <span className='bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]'>FULL</span>}
                                {isRSVPDeadlinePassed && data.needReservation && <span className='bg-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]'>RSVP Closed</span>}
                            </div>

                            {/* Weekly Theme Display */}
                            {data.isRecurring && data.recurrencePattern === 'weekly' && data.weeklyTheme && (
                                <div className='mb-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-lg p-4'>
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5 text-indigo-400' fill='currentColor' viewBox='0 0 20 20'>
                                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                                        </svg>
                                        <span className='text-base font-medium text-indigo-300'>This Week's Theme:</span>
                                        <span className='text-base text-white font-bold'>{data.weeklyTheme}</span>
                                    </div>
                                </div>
                            )}

                            {/* Live Metrics Bar - for pub/public events */}
                            {data.status === 'live' && (data.publicEventType === 'pub' || data.publicEventType === 'public') && (
                                <div className='mb-4'>
                                    <LiveMetricsBar eventId={id} />
                                </div>
                            )}
                            
                            {/* Live Rating Display - prominent placement for non-pub/public live events */}
                            {data.status === 'live' && data.publicEventType !== 'pub' && data.publicEventType !== 'public' && (
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

                            <div className='flex items-center gap-3'>
                                <p className='text-sm text-gray-500'>Hosted by <span className='font-semibold'>{data.host}</span></p>
                                {(data.instagram || data.authorId?.instagram) && (
                                    <a 
                                        href={`https://instagram.com/${data.instagram || data.authorId.instagram}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full hover:from-purple-600/30 hover:to-pink-600/30 transition-all group'
                                    >
                                        <svg className='w-4 h-4 text-pink-400 group-hover:text-pink-300' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                                        </svg>
                                        <span className='text-xs font-medium text-pink-300 group-hover:text-pink-200'>@{data.instagram || data.authorId.instagram}</span>
                                    </a>
                                )}
                            </div>
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
                            className='text-center bg-gray-800/50 rounded-lg md:rounded-xl p-3 md:p-4 ml-3 md:ml-6 hover:bg-gray-700/50 hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] transition-all cursor-pointer group flex-shrink-0 border border-purple-500/20'
                            title='Add to Google Calendar'
                        >
                            <div className='text-[10px] sm:text-xs md:text-sm text-gray-400 uppercase group-hover:text-orange-400 transition-colors'>{new Date(data.startDateTime).toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-orange-400 transition-colors'>{new Date(data.startDateTime).getDate()}</div>
                            <div className='text-[10px] sm:text-xs text-gray-500 mt-0.5 md:mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>Add Cal</div>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 md:pt-6 border-t border-purple-500/20'>
                        {(data.status === 'future' || data.status === 'live') && (
                            <>
                                {data.needReservation ? (
                                    <>
                                        {!isReserved ? (
                                            <button 
                                                onClick={handleReserve}
                                                disabled={isCapacityReached || isRSVPDeadlinePassed}
                                                className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all ${
                                                    isCapacityReached || isRSVPDeadlinePassed
                                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-[0_0_20px_rgba(255,0,128,0.6)] hover:shadow-[0_0_30px_rgba(255,0,128,0.8)]'
                                                }`}
                                            >
                                                {isCapacityReached ? 'Event Full' : isRSVPDeadlinePassed ? 'RSVP Closed' : 'RSVP'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleCancelRSVP}
                                                className='flex-1 bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all'
                                            >
                                                Cancel RSVP
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button 
                                        onClick={handleInterested}
                                        className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all ${
                                            isInterested 
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)]' 
                                                : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-[0_0_20px_rgba(255,0,128,0.6)] hover:shadow-[0_0_30px_rgba(255,0,128,0.8)]'
                                        }`}
                                    >
                                        {isInterested ? "I'm Going!" : "I'm Going"}
                                    </button>
                                )}
                            </>
                        )}
                        <button 
                            onClick={() => setShowShareModal(true)}
                            className='px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-purple-500/30 bg-gray-800/50 text-gray-200 rounded-lg font-medium hover:bg-gray-700/50 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2'
                        >
                            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                            </svg>
                            <span className='hidden sm:inline'>Share</span>
                        </button>
                    </div>
                    
                    {/* RSVP deadline info */}
                    {data.needReservation && data.reservationDeadline && (
                        <div className='mt-3 md:mt-4 p-2.5 sm:p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg'>
                            <p className='text-xs sm:text-sm text-purple-300'>
                                <span className='font-semibold text-purple-200'>RSVP Deadline:</span> {new Date(data.reservationDeadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    )}
                    
                    {/* Add to Calendar Section */}
                    {(isInterested || isReserved) && (
                        <div className='mt-3 md:mt-4 p-3 md:p-4 bg-gray-800/50 border border-purple-500/20 rounded-lg'>
                            <p className='text-xs sm:text-sm font-semibold text-white mb-2 md:mb-3'>Add to Calendar</p>
                            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
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
                                    className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all flex items-center justify-center gap-1.5 sm:gap-2'
                                >
                                    <svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='currentColor'>
                                        <path d='M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m15 0h-15' />
                                    </svg>
                                    <span>Google Calendar</span>
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
                                    className='flex-1 bg-gray-700 text-white py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg font-bold hover:bg-gray-600 shadow-[0_0_10px_rgba(100,100,100,0.3)] hover:shadow-[0_0_20px_rgba(100,100,100,0.5)] transition-all flex items-center justify-center gap-1.5 sm:gap-2'
                                >
                                    <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' />
                                    </svg>
                                    <span className='hidden sm:inline'>Download .ics</span>
                                    <span className='sm:hidden'>.ics</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Details */}
                <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-purple-500/20 p-4 sm:p-6 md:p-8'>
                    {/* Image Gallery - Only show if images exist */}
                    {data.images && data.images.length > 0 && (
                        <div className='mb-6 md:mb-8'>
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
                    
                    <h2 className='text-2xl font-bold mb-4 text-white'>About this Event</h2>
                    <p className='text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap'>{data.description}</p>
                    
                    <h3 className='text-xl font-semibold mb-3 text-white'>Event Details</h3>
                    <div className='space-y-3 text-gray-300'>
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

                {/* Pub/Public Event Features */}
                {(data.publicEventType === 'pub' || data.publicEventType === 'public') && (
                    <>
                        {/* Future Events: Show Pregames */}
                        {data.status === 'future' && (
                            <div className='mt-6'>
                                <PregamesList eventId={id} />
                            </div>
                        )}

                        {/* Live Events: Show Metrics, Feedback Form, and Comments */}
                        {data.status === 'live' && (
                            <div className='mt-6 space-y-6'>
                                {/* Live Metrics */}
                                <LiveMetrics eventId={id} eventType={data.publicEventType} />
                                
                                {/* Submit Feedback */}
                                <LiveFeedbackForm 
                                    eventId={id} 
                                    eventType={data.publicEventType}
                                    onFeedbackSubmitted={() => {
                                        // Metrics will auto-refresh
                                    }}
                                />
                                
                                {/* Live Comments */}
                                <LiveComments eventId={id} isPast={false} />
                            </div>
                        )}

                        {/* Past Events: Show "What's the Move Now" for pub/public events */}
                        {data.status === 'past' && (data.publicEventType === 'pub' || data.publicEventType === 'public') && (
                            <div className='mt-6'>
                                <WhatsMoveNow eventId={id} />
                            </div>
                        )}
                    </>
                )}

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
                                    className='px-6 py-3 bg-[#00205B] text-white rounded-lg font-semibold hover:bg-[#001840] transition-colors flex items-center gap-2 mx-auto'
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