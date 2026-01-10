'use client'

import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const LiveRatingButton = ({ eventId, averageLiveRating, totalLiveRatings, needReservation, hasReservation }) => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentAverage, setCurrentAverage] = useState(averageLiveRating || 0);
    const [currentTotal, setCurrentTotal] = useState(totalLiveRatings || 0);

    useEffect(() => {
        fetchUserRating();
    }, []);

    const fetchUserRating = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`/api/live-rating?eventId=${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setHasRated(response.data.hasRated);
                setUserRating(response.data.userRating);
                setRating(response.data.userRating);
                setCurrentAverage(response.data.averageLiveRating);
                setCurrentTotal(response.data.totalLiveRatings);
            }
        } catch (error) {
            // User not logged in or error fetching
        }
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to rate this event');
            router.push('/login');
            return;
        }

        if (needReservation && !hasReservation) {
            toast.error('Only users with RSVPs can rate this event');
            return;
        }

        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to rate this event');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('eventId', eventId);
            formData.append('rating', rating);

            const response = await axios.post('/api/live-rating', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(hasRated ? 'Rating updated!' : 'Rating submitted!');
                setHasRated(true);
                setUserRating(rating);
                setCurrentAverage(response.data.averageLiveRating);
                setCurrentTotal(response.data.totalLiveRatings);
                setShowModal(false);
                // Refresh to show updated rating on card
                setTimeout(() => window.location.reload(), 500);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error submitting rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Display Average Rating */}
            <div 
                onClick={handleOpenModal}
                className='flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors group'
                title={hasRated ? 'Click to update your rating' : 'Click to rate this event'}
            >
                <div className='flex items-center gap-1'>
                    <svg className='w-5 h-5 text-amber-500 fill-current' viewBox='0 0 24 24'>
                        <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                    </svg>
                    <span className='font-bold text-amber-700'>
                        {currentTotal > 0 ? currentAverage.toFixed(1) : '—'}
                    </span>
                </div>
                <span className='text-xs text-amber-600'>
                    ({currentTotal} {currentTotal === 1 ? 'rating' : 'ratings'})
                </span>
                {hasRated && (
                    <span className='text-xs text-amber-700 font-medium ml-1'>
                        · You rated {userRating}★
                    </span>
                )}
            </div>

            {/* Rating Modal */}
            {showModal && (
                <div 
                    className='fixed inset-0 flex items-center justify-center z-50 p-4'
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowModal(false);
                    }}
                >
                    <div 
                        className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slideUp'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='flex justify-between items-start mb-6'>
                            <div>
                                <h3 className='text-2xl font-bold text-gray-900'>
                                    {hasRated ? 'Update Your Rating' : 'Rate This Live Event'}
                                </h3>
                                <p className='text-sm text-gray-600 mt-1'>
                                    Help others decide if this event is worth attending!
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(false);
                                }}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        {/* Current Stats */}
                        {currentTotal > 0 && (
                            <div className='bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 mb-6'>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-amber-700 mb-1'>
                                        {currentAverage.toFixed(1)} ★
                                    </div>
                                    <div className='text-sm text-amber-600'>
                                        Based on {currentTotal} {currentTotal === 1 ? 'rating' : 'ratings'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rating Selection */}
                        <div className='text-center mb-6'>
                            <p className='text-gray-700 mb-4 text-lg font-medium'>
                                {hasRated ? 'Your current rating:' : 'How would you rate this event?'}
                            </p>
                            <div className='flex justify-center mb-3'>
                                <StarRating rating={rating} onRatingChange={setRating} size='2xl' />
                            </div>
                            {rating > 0 && (
                                <p className='text-gray-600 font-medium text-lg'>
                                    {rating === 5 ? '🔥 This event is LIT!' : rating === 4 ? '👍 Pretty good!' : rating === 3 ? '😊 It\'s alright' : rating === 2 ? '😐 Could be better' : '👎 Not great'}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || rating === 0}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                                submitting || rating === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                            }`}
                        >
                            {submitting ? 'Submitting...' : hasRated ? 'Update Rating' : 'Submit Rating'}
                        </button>

                        <p className='text-xs text-gray-500 text-center mt-4'>
                            Live ratings help attendees know if an event is worth joining right now!
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default LiveRatingButton;
