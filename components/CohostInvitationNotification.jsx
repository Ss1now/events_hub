'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CohostInvitationNotification = () => {
    const router = useRouter();
    const [invitations, setInvitations] = useState([]);
    const [currentInvite, setCurrentInvite] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchInvitations();
        // Poll for new invitations every 30 seconds
        const interval = setInterval(fetchInvitations, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchInvitations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('/api/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success && response.data.user.cohostInvitations) {
                const pendingInvites = response.data.user.cohostInvitations.filter(
                    inv => inv.status === 'pending'
                );
                setInvitations(pendingInvites);
                
                // Show the first invitation if there is one and nothing is currently shown
                if (pendingInvites.length > 0 && !currentInvite) {
                    setCurrentInvite(pendingInvites[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    };

    const handleResponse = async (action) => {
        if (!currentInvite) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch('/api/cohost', {
                eventId: currentInvite.eventId,
                action
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.msg);
                
                // Remove current invitation from list
                const remaining = invitations.filter(inv => inv.eventId !== currentInvite.eventId);
                setInvitations(remaining);
                
                // Show next invitation if any
                setCurrentInvite(remaining.length > 0 ? remaining[0] : null);
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error processing invitation');
        } finally {
            setProcessing(false);
        }
    };

    const handleViewEvent = () => {
        if (currentInvite) {
            router.push(`/blogs/${currentInvite.eventId}`);
            // Keep the notification so user can accept/decline later
        }
    };

    const handleDismiss = () => {
        // Move to next invitation without accepting/declining
        const remaining = invitations.filter(inv => inv.eventId !== currentInvite.eventId);
        setCurrentInvite(remaining.length > 0 ? remaining[0] : null);
    };

    return (
        <AnimatePresence>
            {currentInvite && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className='fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]'
                >
                    <div className='bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden'>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                                    <h3 className='text-white font-semibold text-sm'>Co-host Invitation</h3>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className='text-white hover:text-gray-200 transition-colors'
                                    title='Dismiss temporarily'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-4'>
                            <p className='text-gray-700 text-sm mb-2'>
                                <span className='font-semibold text-gray-900'>{currentInvite.invitedByName}</span> invited you to co-host:
                            </p>
                            <p className='text-gray-900 font-medium mb-3'>{currentInvite.eventTitle}</p>
                            
                            <p className='text-xs text-gray-500 mb-4'>
                                As a co-host, you'll have full access to edit and manage this event.
                            </p>

                            {/* Actions */}
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handleResponse('accept')}
                                    disabled={processing}
                                    className='flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50'
                                >
                                    {processing ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    onClick={() => handleResponse('decline')}
                                    disabled={processing}
                                    className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50'
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleViewEvent}
                                    className='bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                                    title='View Event'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                    </svg>
                                </button>
                            </div>

                            {invitations.length > 1 && (
                                <p className='text-xs text-gray-500 text-center mt-2'>
                                    {invitations.length - 1} more invitation{invitations.length > 2 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CohostInvitationNotification;
