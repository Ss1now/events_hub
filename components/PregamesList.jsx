'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

const PregamesList = ({ eventId }) => {
    const [pregames, setPregames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPregames = async () => {
            try {
                const response = await axios.get(`/api/pregames?eventId=${eventId}`);
                if (response.data.success) {
                    setPregames(response.data.pregames);
                }
            } catch (error) {
                console.error('Error fetching pregames:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPregames();
        // Refresh every 2 minutes
        const interval = setInterval(fetchPregames, 120000);
        return () => clearInterval(interval);
    }, [eventId]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (loading) {
        return (
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20'>
                <div className='flex items-center justify-center py-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
                </div>
            </div>
        );
    }

    if (pregames.length === 0) {
        return (
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-lg'>
                <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                    <svg className='w-6 h-6 text-pink-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Pregames
                </h3>
                <p className='text-gray-400 text-center py-4'>
                    No pregames listed yet for this event
                </p>
            </div>
        );
    }

    return (
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-lg'>
            <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-pink-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Pregames ({pregames.length})
            </h3>

            <div className='space-y-3'>
                {pregames.map((pregame) => (
                    <Link
                        key={pregame._id}
                        href={`/blogs/${pregame._id}`}
                        className='block bg-gray-800/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/40 hover:bg-gray-800/70 transition-all'
                    >
                        <div className='flex gap-3'>
                            {/* Image */}
                            {pregame.images && pregame.images.length > 0 && (
                                <div className='flex-shrink-0'>
                                    <Image
                                        src={pregame.images[0]}
                                        alt={pregame.title}
                                        width={80}
                                        height={80}
                                        className='rounded-lg object-cover'
                                    />
                                </div>
                            )}

                            {/* Info */}
                            <div className='flex-1 min-w-0'>
                                <h4 className='text-white font-bold text-lg mb-1 truncate'>
                                    {pregame.title}
                                </h4>
                                
                                <div className='flex items-center gap-2 text-sm text-gray-300 mb-2'>
                                    <svg className='w-4 h-4 text-pink-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    <span>{formatTime(pregame.startDateTime)}</span>
                                </div>

                                <div className='flex items-center gap-2 text-sm text-gray-400 mb-2'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    <span className='truncate'>{pregame.location}</span>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <span className='bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full'>
                                        {pregame.eventType}
                                    </span>
                                    {pregame.status === 'live' && (
                                        <span className='bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse'>
                                            LIVE NOW
                                        </span>
                                    )}
                                    {pregame.interestedUsers && pregame.interestedUsers.length > 0 && (
                                        <span className='text-xs text-gray-400'>
                                            {pregame.interestedUsers.length} interested
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PregamesList;
