'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const CohostInviteModal = ({ isOpen, onClose, eventId, eventTitle, onCohostAdded }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [inviting, setInviting] = useState(null);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/cohost?search=${encodeURIComponent(query)}&eventId=${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSearchResults(response.data.users);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleInvite = async (userId, userName) => {
        setInviting(userId);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/cohost', {
                eventId,
                userId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.msg);
                setSearchQuery('');
                setSearchResults([]);
                if (onCohostAdded) onCohostAdded();
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Failed to send invitation');
        } finally {
            setInviting(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className='fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className='bg-white rounded-2xl shadow-2xl w-full max-w-md'
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className='border-b border-gray-200 px-6 py-4'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-900'>Invite Co-host</h3>
                                    <p className='text-sm text-gray-500 mt-1'>{eventTitle}</p>
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
                        </div>

                        {/* Search Section */}
                        <div className='p-6'>
                            <div className='relative'>
                                <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                </svg>
                                <input
                                    type='text'
                                    placeholder='Search by username or email...'
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
                                />
                            </div>

                            {/* Search Results */}
                            <div className='mt-4 max-h-64 overflow-y-auto'>
                                {searching && (
                                    <div className='text-center py-8 text-gray-500'>
                                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto'></div>
                                    </div>
                                )}

                                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <div className='text-center py-8 text-gray-500'>
                                        <svg className='w-12 h-12 mx-auto mb-2 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                        <p className='text-sm'>No users found</p>
                                    </div>
                                )}

                                {searchResults.map((user) => (
                                    <div
                                        key={user._id}
                                        className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold'>
                                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='font-medium text-gray-900'>{user.name}</p>
                                                <p className='text-sm text-gray-500'>@{user.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleInvite(user._id, user.name)}
                                            disabled={inviting === user._id}
                                            className='px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium'
                                        >
                                            {inviting === user._id ? 'Inviting...' : 'Invite'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {searchQuery.length < 2 && (
                                <div className='mt-4 text-center py-8 text-gray-400'>
                                    <svg className='w-16 h-16 mx-auto mb-3 text-gray-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                                    <p className='text-sm'>Search for users to invite as co-hosts</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CohostInviteModal;
