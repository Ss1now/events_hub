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
                <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl text-white relative'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white hover:text-gray-200 transition-colors'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                    <div className='flex items-center gap-3'>
                        <div className='bg-white bg-opacity-20 p-3 rounded-lg'>
                            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-2xl font-bold'>Email Notifications</h2>
                            <p className='text-blue-100 text-sm'>Manage your email preferences</p>
                        </div>
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
                            className='mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer'
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
                            className='mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer'
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
                            className='mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer'
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
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                                            : 'border-gray-300 hover:border-purple-400'
                                    }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => handleFrequencyChange('weekly')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                                        subscriptions.frequency === 'weekly'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                                            : 'border-gray-300 hover:border-purple-400'
                                    }`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <div className='flex gap-3'>
                            <svg className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                            </svg>
                            <div className='text-sm text-blue-800'>
                                <p className='font-medium'>Privacy Note</p>
                                <p className='mt-1'>You can unsubscribe at any time. We'll never share your email with third parties.</p>
                            </div>
                        </div>
                    </div>
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
                        className='flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50'
                    >
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSubscriptionModal;
