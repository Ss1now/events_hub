'use client'

import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import Image from 'next/image';

const ReviewList = ({ reviews, averageRating, totalRatings, onEditReview }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Get current user ID
        const fetchUserId = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('/api/user', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setCurrentUserId(data.user._id || data.user.id);
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
        };
        fetchUserId();
    }, []);

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    };

    const distribution = getRatingDistribution();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className='space-y-6'>
            {/* Overall Rating Summary */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>Event Reviews</h3>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Average Rating */}
                    <div className='flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg'>
                        <div className='text-5xl font-bold text-gray-900 mb-2'>
                            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                        </div>
                        <StarRating rating={averageRating} readonly size='lg' />
                        <p className='text-gray-600 mt-2'>{totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className='space-y-2'>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = distribution[star];
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                            
                            return (
                                <div key={star} className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-600 w-8'>{star} ★</span>
                                    <div className='flex-1 bg-gray-200 rounded-full h-2'>
                                        <div
                                            className='bg-yellow-400 h-2 rounded-full transition-all'
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className='text-sm text-gray-600 w-12 text-right'>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Individual Reviews */}
            <div className='space-y-4'>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'>
                            {/* Review Header */}
                            <div className='flex items-start justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    {/* User Avatar */}
                                    <div className='w-12 h-12 bg-[#00205B] rounded-full flex items-center justify-center text-white font-bold text-lg'>
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className='font-semibold text-gray-900'>{review.userName}</h4>
                                        <p className='text-sm text-gray-500'>
                                            {formatDate(review.date)}
                                            {review.updatedAt && <span className='ml-1'>(edited)</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <StarRating rating={review.rating} readonly size='sm' />
                                    {currentUserId && review.userId.toString() === currentUserId && (
                                        <button
                                            onClick={() => onEditReview(review)}
                                            className='text-[#00205B] hover:text-[#001840] text-sm font-medium ml-2'
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Review Text */}
                            {review.comment && (
                                <p className='text-gray-700 mb-4 leading-relaxed'>{review.comment}</p>
                            )}

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4'>
                                    {review.images.map((image, imgIndex) => (
                                        <div
                                            key={imgIndex}
                                            className='relative aspect-square cursor-pointer group overflow-hidden rounded-lg'
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <img
                                                src={image}
                                                alt={`Review image ${imgIndex + 1}`}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                            />
                                            <div className='absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity' />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className='bg-white rounded-lg border border-gray-200 p-12 text-center'>
                        <svg className='w-16 h-16 mx-auto text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                        </svg>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>No reviews yet</h3>
                        <p className='text-gray-600'>Be the first to share your experience!</p>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4'
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors'
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                    <img
                        src={selectedImage}
                        alt='Full size'
                        className='max-w-full max-h-full object-contain'
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ReviewList;
