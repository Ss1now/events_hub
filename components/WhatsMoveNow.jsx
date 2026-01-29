'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WhatsMoveNow({ eventId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [available, setAvailable] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);

    // Fetch comments
    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/move-now?eventId=${eventId}`);
            if (response.data.success) {
                setComments(response.data.comments || []);
                setAvailable(response.data.available);
                setExpiresAt(response.data.expiresAt);
                setTimeRemaining(response.data.timeRemaining);
                setHasExpired(response.data.hasExpired);
            }
        } catch (error) {
            console.error('Error fetching What\'s the Move Now comments:', error);
        }
    };

    useEffect(() => {
        fetchComments();
        
        // Refresh comments every 30 seconds
        const interval = setInterval(fetchComments, 30000);
        return () => clearInterval(interval);
    }, [eventId]);

    // Update countdown timer
    useEffect(() => {
        if (!expiresAt || hasExpired) return;

        const timer = setInterval(() => {
            const now = new Date();
            const remaining = Math.max(0, new Date(expiresAt) - now);
            setTimeRemaining(remaining);
            
            if (remaining === 0) {
                setHasExpired(true);
                setAvailable(false);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, hasExpired]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) return;

        const token = localStorage.getItem('token');

        setIsLoading(true);
        try {
            const response = await axios.post('/api/move-now', {
                eventId,
                comment: newComment,
                isAnonymous
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setNewComment('');
                setIsAnonymous(false);
                await fetchComments();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            if (error.response?.status === 401) {
                alert('Please login to post a comment');
            } else {
                alert(error.response?.data?.msg || 'Failed to post comment');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Format time remaining
    const formatTimeRemaining = (ms) => {
        if (!ms || ms <= 0) return 'Expired';
        
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s remaining`;
        } else {
            return `${seconds}s remaining`;
        }
    };

    // Format timestamp for comments
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    if (!available && !hasExpired) return null;

    return (
        <div className='bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl border-2 border-purple-500/30 p-6 shadow-[0_0_30px_rgba(168,85,247,0.4)]'>
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h3 className='text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                        What's the Move Now?
                    </h3>
                    <p className='text-gray-300 text-sm mt-1'>
                        {hasExpired ? 'This section has expired' : 'Share where the party continues!'}
                    </p>
                </div>
            </div>

            {/* Comment Form */}
            {!hasExpired && (
                <form onSubmit={handleSubmit} className='mb-6'>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Where's the afterparty? Share the move..."
                        className='w-full px-4 py-3 rounded-lg bg-gray-900/70 border-2 border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none'
                        rows={3}
                        disabled={isLoading}
                    />
                    
                    <div className='flex items-center justify-between mt-3'>
                        <label className='flex items-center gap-2 cursor-pointer group'>
                            <input
                                type='checkbox'
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className='w-4 h-4 rounded border-2 border-purple-500/50 bg-gray-900/70 text-pink-500 focus:ring-2 focus:ring-pink-500 cursor-pointer'
                                disabled={isLoading}
                            />
                            <span className='text-sm text-gray-300 group-hover:text-purple-400 transition-colors'>
                                Post anonymously
                            </span>
                        </label>
                        
                        <button
                            type='submit'
                            disabled={isLoading || !newComment.trim()}
                            className='px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        >
                            {isLoading ? 'Posting...' : 'Share'}
                        </button>
                    </div>
                </form>
            )}

            {/* Comments List */}
            <div className='space-y-3 max-h-96 overflow-y-auto'>
                {comments.length === 0 ? (
                    <div className='text-center py-8 text-gray-400'>
                        <p className='text-lg'>🤔 No moves shared yet</p>
                        <p className='text-sm mt-2'>Be the first to share where the party continues!</p>
                    </div>
                ) : (
                    [...comments].reverse().map((comment, index) => (
                        <div
                            key={index}
                            className='bg-gray-900/50 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors'
                        >
                            <div className='flex items-start justify-between gap-3'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <span className={`font-semibold ${comment.isAnonymous ? 'text-gray-400 italic' : 'text-purple-400'}`}>
                                            {comment.username}
                                        </span>
                                        <span className='text-gray-500 text-xs'>
                                            •
                                        </span>
                                        <span className='text-gray-500 text-xs'>
                                            {formatTimestamp(comment.timestamp)}
                                        </span>
                                    </div>
                                    <p className='text-gray-200 whitespace-pre-wrap break-words'>
                                        {comment.comment}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {hasExpired && (
                <div className='mt-4 text-center py-4 bg-gray-900/30 rounded-lg border border-gray-700'>
                    <p className='text-gray-400 text-sm'>
                        ⏰ This section closed 5 hours after the event ended
                    </p>
                </div>
            )}
        </div>
    );
}
