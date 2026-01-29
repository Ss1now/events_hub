'use client'

import React, { useState } from 'react';
import StarRating from './StarRating';
import axios from 'axios';
import { toast } from 'react-toastify';

const RatingPopup = ({ event, onClose, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        const token = localStorage.getItem('token');

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('eventId', event._id);
            formData.append('rating', rating);
            formData.append('comment', comment);
            
            images.forEach((image) => {
                formData.append('images', image);
            });

            const headers = token 
                ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                : { 'Content-Type': 'multipart/form-data' };

            const response = await axios.post('/api/rating', formData, {
                headers
            });

            if (response.data.success) {
                toast.success('Thanks for your review');
                if (onSubmitted) {
                    onSubmitted();
                }
                onClose();
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || 'Could not submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        // Mark as dismissed in localStorage so it doesn't show again
        const dismissed = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
        if (!dismissed.includes(event._id)) {
            dismissed.push(event._id);
            localStorage.setItem('dismissedRatingPopups', JSON.stringify(dismissed));
        }
        onClose();
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn' style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp'>
                {/* Header */}
                <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl text-white relative'>
                    <button
                        onClick={handleSkip}
                        className='absolute top-4 right-4 text-white hover:text-gray-200 transition-colors'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='bg-white bg-opacity-20 p-3 rounded-lg'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-2xl font-bold'>How was your experience?</h2>
                            <p className='text-blue-100 text-sm'>at {event.title}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className='p-6 space-y-6'>
                    {/* Rating */}
                    <div className='text-center'>
                        <p className='text-gray-700 mb-4 text-lg'>Rate your experience</p>
                        <div className='flex justify-center mb-2'>
                            <StarRating rating={rating} onRatingChange={setRating} size='xl' />
                        </div>
                        {rating > 0 && (
                            <p className='text-gray-600 font-medium'>
                                {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Not great'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Tell us more
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                            maxLength={1000}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Add Photos
                        </label>
                        
                        {imagePreviews.length > 0 && (
                            <div className='grid grid-cols-3 gap-2 mb-3'>
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className='relative group'>
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className='w-full h-20 object-cover rounded-lg'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => removeImage(index)}
                                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                        >
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 5 && (
                            <label className='flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#00205B] hover:bg-blue-50 transition-colors'>
                                <svg className='w-6 h-6 text-gray-400 mb-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                </svg>
                                <span className='text-sm text-gray-600'>Add photos</span>
                                <input
                                    type='file'
                                    className='hidden'
                                    accept='image/*'
                                    multiple
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={handleSkip}
                            className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                        >
                            Skip for now
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || rating === 0}
                            className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
                        >
                            {submitting ? (
                                <>
                                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default RatingPopup;
