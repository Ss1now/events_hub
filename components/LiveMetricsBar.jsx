'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LiveMetricsBar = ({ eventId }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const response = await axios.get(`/api/live-feedback?eventId=${eventId}&action=metrics`);
            if (response.data.success) {
                setMetrics(response.data.metrics);
            }
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [eventId]);

    if (loading) {
        return (
            <div className='bg-gray-700/50 rounded-lg h-8 animate-pulse'></div>
        );
    }

    if (!metrics) return null;

    const { timeline } = metrics;

    const getStageColor = (stage) => {
        switch (stage) {
            case 'WARM': return 'from-blue-500 to-cyan-500';
            case 'PEAK': return 'from-pink-500 to-orange-500';
            case 'DYING': return 'from-gray-500 to-gray-600';
            case 'ENDED': return 'from-gray-700 to-gray-800';
            default: return 'from-purple-500 to-blue-500';
        }
    };

    const getStageEmoji = (stage) => {
        switch (stage) {
            case 'WARM': return '🔥';
            case 'PEAK': return '🎉';
            case 'DYING': return '😴';
            case 'ENDED': return '👋';
            default: return '📊';
        }
    };

    return (
        <div className='space-y-2'>
            {/* Stage Label */}
            <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-white flex items-center gap-1'>
                    {getStageEmoji(timeline.stage)} {timeline.stage}
                </span>
                <span className='text-xs text-gray-400'>
                    {timeline.feedbackCount} updates
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className='relative h-6 bg-gray-700 rounded-full overflow-hidden'>
                <div
                    className={`h-full bg-gradient-to-r ${getStageColor(timeline.stage)} transition-all duration-1000 flex items-center justify-end pr-2`}
                    style={{ width: `${timeline.position}%` }}
                >
                    <span className='text-white font-bold text-xs'>{Math.round(timeline.position)}%</span>
                </div>
            </div>
        </div>
    );
};

export default LiveMetricsBar;
