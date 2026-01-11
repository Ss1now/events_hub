'use client'

import React, { useState, useEffect } from 'react';

const EmailSubscriptionButton = ({ onOpen }) => {
    const [hasSubscriptions, setHasSubscriptions] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            checkSubscriptionStatus();
        }
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/email-subscription', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const { recommendations, reminders, updates } = data.subscriptions || {};
                setHasSubscriptions(recommendations || reminders || updates);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <button
            onClick={onOpen}
            className='relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='Email Notifications'
        >
            <svg 
                className='w-5 h-5 sm:w-6 sm:h-6 text-gray-700' 
                fill={hasSubscriptions ? 'currentColor' : 'none'}
                stroke='currentColor' 
                viewBox='0 0 24 24'
            >
                <path 
                    strokeLinecap='round' 
                    strokeLinejoin='round' 
                    strokeWidth={hasSubscriptions ? 0 : 2} 
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' 
                />
            </svg>
            {hasSubscriptions && (
                <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white'></span>
            )}
        </button>
    );
};

export default EmailSubscriptionButton;
