'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const EventUpdateNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Get already shown notifications from localStorage
            const shownNotifications = JSON.parse(localStorage.getItem('shownEventNotifications') || '[]');

            try {
                const response = await axios.get('/api/user/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success && response.data.notifications.length > 0) {
                    // Filter out notifications that were already shown in this session
                    const newNotifications = response.data.notifications.filter(
                        n => !shownNotifications.includes(n.notificationId.toString())
                    );

                    if (newNotifications.length > 0) {
                        setNotifications(newNotifications);
                        setCurrentNotification(newNotifications[0]);
                        setShowModal(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        // Check for notifications on component mount
        fetchNotifications();
    }, []);

    const handleDismiss = async () => {
        if (!currentNotification) return;

        const token = localStorage.getItem('token');
        
        try {
            // Mark as shown in localStorage to prevent re-showing in same session
            const shownNotifications = JSON.parse(localStorage.getItem('shownEventNotifications') || '[]');
            if (!shownNotifications.includes(currentNotification.notificationId.toString())) {
                shownNotifications.push(currentNotification.notificationId.toString());
                localStorage.setItem('shownEventNotifications', JSON.stringify(shownNotifications));
            }

            await axios.post('/api/user/notifications/dismiss', {
                eventId: currentNotification.eventId,
                notificationId: currentNotification.notificationId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Remove from local state
            const remaining = notifications.filter(n => n._id !== currentNotification._id);
            setNotifications(remaining);

            if (remaining.length > 0) {
                setCurrentNotification(remaining[0]);
            } else {
                setShowModal(false);
                setCurrentNotification(null);
            }
        } catch (error) {
            console.error('Error dismissing notification:', error);
            setShowModal(false);
        }
    };

    const handleViewEvent = () => {
        handleDismiss();
    };

    if (!showModal || !currentNotification) return null;

    return (
        <div 
            className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn' 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
            <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slideUp'>
                <button
                    onClick={handleDismiss}
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
                >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>

                {/* Icon */}
                <div className='flex justify-center mb-4'>
                    <div className='bg-blue-100 rounded-full p-4'>
                        <svg className='w-12 h-12 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className='text-2xl font-bold text-center text-gray-900 mb-2'>
                    Event Updated
                </h2>

                {/* Message */}
                <p className='text-center text-gray-600 mb-4'>
                    {currentNotification.message}
                </p>

                {/* Event Details */}
                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                    <p className='text-sm font-semibold text-gray-700 mb-1'>{currentNotification.eventTitle}</p>
                    <p className='text-xs text-gray-500'>Updated: {new Date(currentNotification.timestamp).toLocaleString()}</p>
                    {currentNotification.changes && currentNotification.changes.length > 0 && (
                        <div className='mt-2 pt-2 border-t border-gray-200'>
                            <p className='text-xs font-medium text-gray-600 mb-1'>Changes:</p>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                {currentNotification.changes.map((change, idx) => (
                                    <li key={idx}>• {change}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                    <button
                        onClick={handleDismiss}
                        className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                        Dismiss
                    </button>
                    <Link href={`/blogs/${currentNotification.eventId}`} className='flex-1'>
                        <button
                            onClick={handleViewEvent}
                            className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                            View Event
                        </button>
                    </Link>
                </div>

                {/* Multiple notifications indicator */}
                {notifications.length > 1 && (
                    <p className='text-center text-xs text-gray-500 mt-3'>
                        {notifications.length - 1} more update{notifications.length - 1 > 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </div>
    );
};

export default EventUpdateNotification;
