'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LiveMetrics = ({ eventId, eventType }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            console.log('[LiveMetrics] Fetching metrics for eventId:', eventId);
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
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20'>
                <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
                </div>
            </div>
        );
    }

    if (!metrics) return null;

    const { timeline, lineEstimate } = metrics;

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

    const getMovementIcon = (movement) => {
        switch (movement) {
            case 'ARRIVING': return '📈';
            case 'STAYING': return '🎯';
            case 'LEAVING': return '📉';
            default: return '➡️';
        }
    };

    const getMovementColor = (movement) => {
        if (movement === 'No reports yet') return 'text-gray-500';
        switch (movement) {
            case 'ARRIVING': return 'text-green-400';
            case 'STAYING': return 'text-blue-400';
            case 'LEAVING': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getCrowdColor = (crowd) => {
        if (crowd === 'No reports yet') return 'text-gray-500';
        switch (crowd) {
            case 'TOO_PACKED': return 'text-red-500';
            case 'PACKED': return 'text-orange-400';
            case 'CHILL': return 'text-yellow-400';
            case 'DEAD': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const getLineColor = (label) => {
        if (label.includes('No') || label.includes('Walk')) return 'text-green-400';
        if (label.includes('Short')) return 'text-yellow-400';
        if (label.includes('Normal')) return 'text-orange-400';
        if (label.includes('Long')) return 'text-red-400';
        if (label.includes('Cooked')) return 'text-red-600 font-bold';
        return 'text-gray-400';
    };

    return (
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 shadow-lg space-y-4'>
            {/* Timeline */}
            <div>
                <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                        {getStageEmoji(timeline.stage)} {timeline.stage}
                    </h3>
                    <span className='text-sm text-gray-400'>
                        {timeline.feedbackCount} updates
                    </span>
                </div>

                {/* Progress Bar */}
                <div className='relative h-8 bg-gray-700 rounded-full overflow-hidden'>
                    <div
                        className={`h-full bg-gradient-to-r ${getStageColor(timeline.stage)} transition-all duration-1000 flex items-center justify-end pr-3`}
                        style={{ width: `${timeline.position}%` }}
                    >
                        <span className='text-white font-bold text-sm'>{Math.round(timeline.position)}%</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className='grid grid-cols-3 gap-3 mt-4'>
                    <div className='bg-gray-800/50 rounded-lg p-3 border border-purple-500/10'>
                        <div className='text-xs text-gray-400 mb-1'>Vibe</div>
                        <div className='text-2xl font-bold text-purple-400'>
                            {timeline.vibeNow !== null ? timeline.vibeNow : '--'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>/100</div>
                    </div>
                    <div className='bg-gray-800/50 rounded-lg p-3 border border-purple-500/10'>
                        <div className='text-xs text-gray-400 mb-1'>Crowd</div>
                        <div className={`text-sm font-bold ${getCrowdColor(timeline.crowdNow)}`}>
                            {timeline.crowdNow}
                        </div>
                    </div>
                    <div className='bg-gray-800/50 rounded-lg p-3 border border-purple-500/10'>
                        <div className='text-xs text-gray-400 mb-1'>Movement</div>
                        <div className={`text-xs font-bold ${getMovementColor(timeline.movement)} flex items-center gap-1`}>
                            {timeline.movement !== 'No reports yet' && <span>{getMovementIcon(timeline.movement)}</span>}
                            <span>{timeline.movement}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Estimate */}
            {lineEstimate.estimate !== null && (
                <div className='bg-gray-800/50 rounded-lg p-4 border border-purple-500/10'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-sm text-gray-400 mb-1'>Line Wait</div>
                            <div className={`text-3xl font-bold ${getLineColor(lineEstimate.label)}`}>
                                {lineEstimate.label}
                            </div>
                            <div className='text-sm text-gray-400 mt-1'>
                                ~{lineEstimate.estimate} min • {lineEstimate.count} reports
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMetrics;
