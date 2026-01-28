'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LiveFeedbackForm = ({ eventId, eventType, onFeedbackSubmitted }) => {
    const [vibe, setVibe] = useState(50);
    const [crowd, setCrowd] = useState('');
    const [lineMinutes, setLineMinutes] = useState('');
    const [isInside, setIsInside] = useState(false);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to submit feedback');
            return;
        }

        setSubmitting(true);

        try {
            console.log('[LiveFeedbackForm] Submitting feedback for eventId:', eventId);
            const formData = new FormData();
            formData.append('eventId', eventId);
            if (vibe) formData.append('vibe', vibe);
            if (crowd) formData.append('crowd', crowd);
            if (lineMinutes) formData.append('lineMinutes', lineMinutes);
            formData.append('isInside', isInside);
            if (comment) formData.append('comment', comment);

            const response = await axios.post('/api/live-feedback', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Feedback submitted!');
                // Reset form
                setVibe(50);
                setCrowd('');
                setLineMinutes('');
                setIsInside(false);
                setComment('');
                
                if (onFeedbackSubmitted) {
                    onFeedbackSubmitted();
                }
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.response?.data?.msg || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-lg'>
            <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
                Live Update
            </h3>

            <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Vibe Slider */}
                <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Vibe: <span className='text-purple-400 font-bold'>{vibe}</span>/100
                    </label>
                    <input
                        type='range'
                        min='1'
                        max='100'
                        value={vibe}
                        onChange={(e) => setVibe(e.target.value)}
                        className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500'
                    />
                    <div className='flex justify-between text-xs text-gray-400 mt-1'>
                        <span>Dead</span>
                        <span>Mid</span>
                        <span>Fire 🔥</span>
                    </div>
                </div>

                {/* Crowd Level */}
                <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Crowd Level
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                        {['DEAD', 'CHILL', 'PACKED', 'TOO_PACKED'].map((level) => (
                            <button
                                key={level}
                                type='button'
                                onClick={() => setCrowd(level)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    crowd === level
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {level.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Line Wait */}
                <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Line Wait (minutes)
                    </label>
                    <div className='flex items-center gap-3'>
                        <input
                            type='number'
                            min='0'
                            max='120'
                            value={lineMinutes}
                            onChange={(e) => setLineMinutes(e.target.value)}
                            placeholder='0'
                            className='flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        />
                        <label className='flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                            <input
                                type='checkbox'
                                checked={isInside}
                                onChange={(e) => setIsInside(e.target.checked)}
                                className='w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500'
                            />
                            Inside
                        </label>
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Comment
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What's the vibe? Any updates?"
                        maxLength={500}
                        rows={3}
                        className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
                    />
                    <div className='text-xs text-gray-400 mt-1'>{comment.length}/500</div>
                </div>

                <button
                    type='submit'
                    disabled={submitting}
                    className='w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                >
                    {submitting ? 'Submitting...' : 'Submit Update'}
                </button>
            </form>
        </div>
    );
};

export default LiveFeedbackForm;
