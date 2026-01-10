'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const EventUpdateNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentNotification, setCurrentNotification] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success) {
                    const unreadNotifications = response.data.user.eventUpdateNotifications?.filter(n => !n.read) || [];
                    setNotifications(unreadNotifications);
                    
                    if (unreadNotifications.length > 0 && !currentNotification) {
                        setCurrentNotification(unreadNotifications[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [currentNotification]);

    const handleViewEvent = async () => {
        if (!currentNotification) return;

        await markAsRead(currentNotification._id);
        router.push(`/blogs/${currentNotification.eventId}`);
    };

    const handleDismiss = async () => {
        if (!currentNotification) return;
        await markAsRead(currentNotification._id);
    };

    const markAsRead = async (notificationId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.patch('/api/user/notifications', {
                notificationId,
                type: 'eventUpdate'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Remove from current notifications
            const remaining = notifications.filter(n => n._id !== notificationId);
            setNotifications(remaining);
            
            // Show next notification if available
            if (remaining.length > 0) {
                setCurrentNotification(remaining[0]);
            } else {
                setCurrentNotification(null);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <AnimatePresence>
            {currentNotification && (
                <motion.div
                    className='fixed top-4 right-4 z-50 max-w-md'
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className='bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden'>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='bg-white/20 p-2 rounded-lg'>
                                        <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className='text-white font-semibold text-sm'>Event Updated</h3>
                                        <p className='text-blue-100 text-xs'>
                                            {new Date(currentNotification.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className='text-white/80 hover:text-white transition-colors'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-4'>
                            <p className='text-gray-900 font-medium mb-2'>
                                "{currentNotification.eventTitle}"
                            </p>
                            <p className='text-gray-600 text-sm mb-4'>
                                The event details have been updated by the host. Check the latest information.
                            </p>

                            {/* Actions */}
                            <div className='flex gap-2'>
                                <button
                                    onClick={handleViewEvent}
                                    className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm'
                                >
                                    View Event
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm'
                                >
                                    Dismiss
                                </button>
                            </div>

                            {/* Notification count */}
                            {notifications.length > 1 && (
                                <p className='text-center text-xs text-gray-500 mt-3'>
                                    {notifications.length - 1} more update{notifications.length > 2 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EventUpdateNotification;
