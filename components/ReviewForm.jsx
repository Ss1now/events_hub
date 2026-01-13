'use client'

import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import axios from 'axios';
import { toast } from 'react-toastify';
import Image from 'next/image';

const ReviewForm = ({ eventId, eventTitle, onReviewSubmitted, editingReview }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (editingReview) {
            setRating(editingReview.rating);
            setComment(editingReview.comment || '');
            if (editingReview.images && editingReview.images.length > 0) {
                setExistingImages(editingReview.images);
            }
        }
    }, [editingReview]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = images.length + existingImages.length;
        if (files.length + totalImages > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const removeExistingImage = (index) => {
        const newExistingImages = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExistingImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to submit a review');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('eventId', eventId);
            formData.append('rating', rating);
            formData.append('comment', comment);
            formData.append('keepExistingImages', existingImages.length > 0 ? 'true' : 'false');
            
            images.forEach((image) => {
                formData.append('images', image);
            });

            const url = editingReview ? '/api/rating' : '/api/rating';
            const method = editingReview ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(editingReview ? 'Review updated' : 'Review submitted');
                setRating(0);
                setComment('');
                setImages([]);
                setImagePreviews([]);
                setExistingImages([]);
                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }
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

    return (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>{editingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
            <p className='text-gray-600 mb-6'>Share your experience at {eventTitle}</p>

            <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Rating */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Your Rating <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex items-center gap-3'>
                        <StarRating rating={rating} onRatingChange={setRating} size='xl' />
                        {rating > 0 && (
                            <span className='text-lg font-semibold text-gray-700'>
                                {rating} {rating === 1 ? 'star' : 'stars'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Your Review (Optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder='Share your thoughts about this event...'
                        rows={4}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                        maxLength={1000}
                    />
                    <p className='text-sm text-gray-500 mt-1'>{comment.length}/1000 characters</p>
                </div>

                {/* Image Upload */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Add Photos (Optional)
                    </label>
                    <div className='space-y-3'>
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3'>
                                {existingImages.map((imageUrl, index) => (
                                    <div key={`existing-${index}`} className='relative group'>
                                        <img
                                            src={imageUrl}
                                            alt={`Existing ${index + 1}`}
                                            className='w-full h-24 object-cover rounded-lg border border-gray-200'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => removeExistingImage(index)}
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
                        
                        {/* New Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3'>
                                {imagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className='relative group'>
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className='w-full h-24 object-cover rounded-lg border border-gray-200'
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
                        
                        {(images.length + existingImages.length) < 5 && (
                            <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#00205B] hover:bg-blue-50 transition-colors'>
                                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                    <svg className='w-8 h-8 text-gray-400 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                                    </svg>
                                    <p className='text-sm text-gray-600'>
                                        <span className='font-semibold'>Click to upload</span> or drag and drop
                                    </p>
                                    <p className='text-xs text-gray-500 mt-1'>PNG, JPG up to 10MB (max 5 photos)</p>
                                </div>
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
                </div>

                {/* Submit Button */}
                <div className='flex gap-3'>
                    <button
                        type='submit'
                        disabled={submitting || rating === 0}
                        className='flex-1 bg-[#00205B] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#001840] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                    >
                        {submitting ? (
                            <>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                                {editingReview ? 'Updating...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                </svg>
                                {editingReview ? 'Update Review' : 'Submit Review'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
