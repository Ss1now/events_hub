'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LiveComments = ({ eventId, isPast = false }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            console.log('[LiveComments] Fetching comments for eventId:', eventId);
            const response = await axios.get(`/api/live-feedback?eventId=${eventId}&action=comments`);
            if (response.data.success) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        if (!isPast) {
            const interval = setInterval(fetchComments, 20000); // Update every 20 seconds for live
            return () => clearInterval(interval);
        }
    }, [eventId, isPast]);

    const formatTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000); // seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return time.toLocaleDateString();
    };

    const getVibeColor = (vibe) => {
        if (vibe >= 80) return 'text-green-400';
        if (vibe >= 60) return 'text-yellow-400';
        if (vibe >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-lg'>
            <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
                {isPast ? "What's the Move Now" : 'Live Comments'}
            </h3>

            {loading ? (
                <div className='flex items-center justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
                </div>
            ) : comments.length === 0 ? (
                <div className='text-center py-8 text-gray-400'>
                    <p>No comments yet. Be the first to share!</p>
                </div>
            ) : (
                <div className='space-y-3 max-h-96 overflow-y-auto custom-scrollbar'>
                    {comments.map((comment, index) => (
                        <div
                            key={`${comment.anonId}-${comment.timestamp}-${index}`}
                            className='bg-gray-800/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-all'
                        >
                            <div className='flex items-start justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm'>
                                        {comment.username 
                                            ? comment.username.substring(0, 2).toUpperCase()
                                            : 'AN'
                                        }
                                    </div>
                                    <span className='text-sm font-medium text-gray-300'>
                                        {comment.username || 'Anonymous'}
                                    </span>
                                    {comment.vibe && (
                                        <span className={`text-xs font-bold ${getVibeColor(comment.vibe)}`}>
                                            {comment.vibe}/100
                                        </span>
                                    )}
                                </div>
                                <span className='text-xs text-gray-500'>
                                    {formatTime(comment.timestamp)}
                                </span>
                            </div>
                            <p className='text-gray-200 text-sm whitespace-pre-wrap'>
                                {comment.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(75, 85, 99, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(147, 51, 234, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(147, 51, 234, 0.7);
                }
            `}</style>
        </div>
    );
};

export default LiveComments;
