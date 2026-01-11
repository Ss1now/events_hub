'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailSubscriptionModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState({
        recommendations: false,
        reminders: false,
        updates: false,
        patchNotes: false,
        frequency: 'weekly'
    });

    useEffect(() => {
        if (isOpen) {
            fetchSubscriptions();
        }
    }, [isOpen]);

    const fetchSubscriptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/email-subscription', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setSubscriptions(response.data.subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const handleToggle = (type) => {
        setSubscriptions(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleFrequencyChange = (frequency) => {
        setSubscriptions(prev => ({
            ...prev,
            frequency
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/email-subscription', subscriptions, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Email preferences saved!');
                onClose();
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            console.error('Error saving subscriptions:', error);
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn' 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            onClick={onClose}
        >
            <div 
                className='bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='bg-gradient-to-r from-black to-[#00205B] p-6 rounded-t-2xl text-white relative'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white hover:text-gray-200 transition-colors'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                    <div>
                        <h2 className='text-2xl font-bold'>Email Notifications</h2>
                        <p className='text-gray-200 text-sm mt-1'>Manage your email preferences</p>
                    </div>
                </div>

                {/* Content */}
                <div className='p-6 space-y-6'>
                    {/* Event Recommendations */}
                    <div className='flex items-start gap-4'>
                        <input
                            type='checkbox'
                            id='recommendations'
                            checked={subscriptions.recommendations}
                            onChange={() => handleToggle('recommendations')}
                            className='mt-1 w-5 h-5 text-[#00205B] rounded focus:ring-2 focus:ring-[#00205B] cursor-pointer'
                        />
                        <div className='flex-1'>
                            <label htmlFor='recommendations' className='block font-medium text-gray-900 cursor-pointer'>
                                Event Recommendations
                            </label>
                            <p className='text-sm text-gray-600 mt-1'>
                                Receive personalized event suggestions based on your interests
                            </p>
                        </div>
                    </div>

                    {/* Event Reminders */}
                    <div className='flex items-start gap-4'>
                        <input
                            type='checkbox'
                            id='reminders'
                            checked={subscriptions.reminders}
                            onChange={() => handleToggle('reminders')}
                            className='mt-1 w-5 h-5 text-[#00205B] rounded focus:ring-2 focus:ring-[#00205B] cursor-pointer'
                        />
                        <div className='flex-1'>
                            <label htmlFor='reminders' className='block font-medium text-gray-900 cursor-pointer'>
                                Event Reminders
                            </label>
                            <p className='text-sm text-gray-600 mt-1'>
                                Get notified before events you're attending (24h and 1h before)
                            </p>
                        </div>
                    </div>

                    {/* Event Updates */}
                    <div className='flex items-start gap-4'>
                        <input
                            type='checkbox'
                            id='updates'
                            checked={subscriptions.updates}
                            onChange={() => handleToggle('updates')}
                            className='mt-1 w-5 h-5 text-[#00205B] rounded focus:ring-2 focus:ring-[#00205B] cursor-pointer'
                        />
                        <div className='flex-1'>
                            <label htmlFor='updates' className='block font-medium text-gray-900 cursor-pointer'>
                                Event Updates
                            </label>
                            <p className='text-sm text-gray-600 mt-1'>
                                Receive alerts when hosts modify events you're interested in
                            </p>
                        </div>
                    </div>

                    {/* Patch Notes */}
                    <div className='flex items-start gap-4'>
                        <input
                            type='checkbox'
                            id='patchNotes'
                            checked={subscriptions.patchNotes}
                            onChange={() => handleToggle('patchNotes')}
                            className='mt-1 w-5 h-5 text-[#00205B] rounded focus:ring-2 focus:ring-[#00205B] cursor-pointer'
                        />
                        <div className='flex-1'>
                            <label htmlFor='patchNotes' className='block font-medium text-gray-900 cursor-pointer'>
                                Patch Notes & Updates
                            </label>
                            <p className='text-sm text-gray-600 mt-1'>
                                Get notified about major feature updates and platform improvements
                            </p>
                        </div>
                    </div>

                    {/* Frequency Selection */}
                    {subscriptions.recommendations && (
                        <div className='pt-4 border-t border-gray-200'>
                            <label className='block font-medium text-gray-900 mb-3'>
                                Recommendation Frequency
                            </label>
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => handleFrequencyChange('daily')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                                        subscriptions.frequency === 'daily'
                                            ? 'border-[#00205B] bg-blue-50 text-[#00205B] font-medium'
                                            : 'border-gray-300 hover:border-[#00205B]'
                                    }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => handleFrequencyChange('weekly')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                                        subscriptions.frequency === 'weekly'
                                            ? 'border-[#00205B] bg-blue-50 text-[#00205B] font-medium'
                                            : 'border-gray-300 hover:border-[#00205B]'
                                    }`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='px-6 pb-6 flex gap-3'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className='flex-1 px-4 py-2 bg-gradient-to-r from-black to-[#00205B] text-white rounded-lg hover:from-gray-800 hover:to-[#001840] transition-all font-medium disabled:opacity-50'
                    >
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSubscriptionModal;
