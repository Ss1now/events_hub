'use client'

import React, { useEffect, useState } from 'react';
import RatingPopup from './RatingPopup';
import axios from 'axios';

const RatingPrompt = () => {
    const [eventToRate, setEventToRate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const checkForUnratedEvents = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const userResponse = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!userResponse.data.success) return;

                const user = userResponse.data.user;
                const ratedEvents = user.ratedEvents || [];
                const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
                const shownRatingPopups = JSON.parse(localStorage.getItem('shownRatingPopups') || '[]');
                
                // Get all reserved and interested events
                const reservedEvents = userResponse.data.reservedEvents || [];
                const interestedEvents = userResponse.data.interestedEvents || [];
                
                // Combine and get unique events
                const attendedEvents = [...reservedEvents, ...interestedEvents];
                
                // Find past events that user attended but hasn't rated yet
                // Exclude events where the user is the author or a co-host
                const unratedPastEvent = attendedEvents.find(event => {
                    // Check if user is the event author
                    const isAuthor = event.author === user._id || event.author?._id === user._id;
                    
                    // Check if user is a co-host
                    const isCohost = event.cohosts?.some(cohost => 
                        cohost.userId === user._id || cohost.userId?._id === user._id
                    );
                    
                    return event.status === 'past' && 
                        !ratedEvents.includes(event._id) &&
                        !dismissedPopups.includes(event._id) &&
                        !shownRatingPopups.includes(event._id) &&
                        !isAuthor &&
                        !isCohost;
                });

                if (unratedPastEvent) {
                    // Mark as shown immediately to prevent duplicate popups
                    const updatedShownPopups = [...shownRatingPopups, unratedPastEvent._id];
                    localStorage.setItem('shownRatingPopups', JSON.stringify(updatedShownPopups));
                    
                    // Small delay to let the page load
                    setTimeout(() => {
                        setEventToRate(unratedPastEvent);
                        setShowPopup(true);
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking for unrated events:', error);
            }
        };

        checkForUnratedEvents();
    }, []);

    const handleClose = () => {
        setShowPopup(false);
        setEventToRate(null);
    };

    const handleSubmitted = () => {
        setShowPopup(false);
        setEventToRate(null);
    };

    if (!showPopup || !eventToRate) return null;

    return (
        <RatingPopup
            event={eventToRate}
            onClose={handleClose}
            onSubmitted={handleSubmitted}
        />
    );
};

export default RatingPrompt;
