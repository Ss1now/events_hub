'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!feedback.trim()) {
            toast.error('Please enter feedback')
            return
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await axios.post('/api/feedback', {
                feedback: feedback.trim(),
                email: email.trim() || 'Anonymous'
            }, { headers });

            if (response.data.success) {
                toast.success('Thanks for your feedback', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                setFeedback('');
                setEmail('');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className='fixed inset-0 flex items-center justify-center z-50 p-4'
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                backdropFilter: 'blur(8px)', 
                WebkitBackdropFilter: 'blur(8px)' 
            }}
            onClick={onClose}
        >
            <div 
                className='bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Share Your Feedback</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                            Your Feedback <span className='text-red-500'>*</span>
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all'
                            rows={6}
                            maxLength={1000}
                            required
                        />
                        <div className='flex justify-end items-center mt-1'>
                            <p className='text-xs text-gray-400'>{feedback.length}/1000</p>
                        </div>
                    </div>

                    <div className='flex gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={isSubmitting || !feedback.trim()}
                            className='flex-1 px-6 py-3 bg-[#00205B] text-white rounded-xl font-semibold hover:bg-[#001840] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                                    </svg>
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
