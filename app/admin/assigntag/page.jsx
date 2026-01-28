'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AssignTagPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [tagData, setTagData] = useState({
        publicEventType: 'none',
        deadMax: 0,
        chillMax: 0,
        packedMax: 0,
        peakMax: 0
    });

    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login');
                router.push('/login');
                return;
            }

            try {
                // Verify admin
                const userResponse = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!userResponse.data.success || !userResponse.data.user.isAdmin) {
                    toast.error('Admin privileges required');
                    router.push('/');
                    return;
                }

                // Fetch all events
                const response = await axios.get('/api/blog');
                if (response.data && response.data.blogs) {
                    setEvents(response.data.blogs);
                } else if (Array.isArray(response.data)) {
                    setEvents(response.data);
                } else {
                    setEvents([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch events:', error);
                toast.error('Failed to load events');
                setLoading(false);
            }
        };

        fetchEvents();
    }, [router]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setTagData({
            publicEventType: event.publicEventType || 'none',
            deadMax: event.capacityProfile?.deadMax || 0,
            chillMax: event.capacityProfile?.chillMax || 0,
            packedMax: event.capacityProfile?.packedMax || 0,
            peakMax: event.capacityProfile?.peakMax || 0
        });
    };

    const handleTagChange = (e) => {
        const { name, value } = e.target;
        setTagData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token || !selectedEvent) return;

        try {
            const response = await axios.post('/api/admin/assign-tag', {
                eventId: selectedEvent._id,
                publicEventType: tagData.publicEventType,
                capacityProfile: tagData.publicEventType !== 'none' ? {
                    deadMax: parseInt(tagData.deadMax),
                    chillMax: parseInt(tagData.chillMax),
                    packedMax: parseInt(tagData.packedMax),
                    peakMax: parseInt(tagData.peakMax)
                } : null
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Tag assigned successfully!');
                // Refresh events list
                const eventsResponse = await axios.get('/api/blog');
                if (eventsResponse.data && eventsResponse.data.blogs) {
                    setEvents(eventsResponse.data.blogs);
                } else if (Array.isArray(eventsResponse.data)) {
                    setEvents(eventsResponse.data);
                }
                setSelectedEvent(null);
            } else {
                toast.error(response.data.msg || 'Failed to assign tag');
            }
        } catch (error) {
            console.error('Failed to assign tag:', error);
            toast.error('Failed to assign tag');
        }
    };

    if (loading) {
        return (
            <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
                <p className='text-white'>Loading events...</p>
            </div>
        );
    }

    return (
        <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
            <h1 className='text-3xl font-bold text-white mb-8'>🏷️ Assign Event Tags</h1>
            <p className='text-gray-400 mb-6'>Assign Pub/Public tags to events without sending update notifications to users</p>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Events List */}
                <div className='bg-gray-800/50 rounded-lg p-6 border-2 border-purple-500/30'>
                    <h2 className='text-xl font-semibold text-white mb-4'>Select Event</h2>
                    <div className='space-y-2 max-h-[600px] overflow-y-auto'>
                        {events.length === 0 ? (
                            <p className='text-gray-400'>No events found</p>
                        ) : (
                            events.map(event => (
                                <button
                                    key={event._id}
                                    onClick={() => handleSelectEvent(event)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                        selectedEvent?._id === event._id
                                            ? 'border-pink-500 bg-pink-500/20'
                                            : 'border-purple-500/30 bg-gray-900/30 hover:border-purple-500/50'
                                    }`}
                                >
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='flex-1'>
                                            <h3 className='font-semibold text-white'>{event.title}</h3>
                                            <p className='text-sm text-gray-400 mt-1'>{event.location}</p>
                                            <p className='text-xs text-gray-500 mt-1'>
                                                {new Date(event.startDateTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            {event.publicEventType === 'pub' && (
                                                <span className='text-xs bg-amber-600/30 text-amber-300 px-2 py-1 rounded border border-amber-500/50'>
                                                    🍺 PUB
                                                </span>
                                            )}
                                            {event.publicEventType === 'public' && (
                                                <span className='text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded border border-blue-500/50'>
                                                    🌍 PUBLIC
                                                </span>
                                            )}
                                            {(!event.publicEventType || event.publicEventType === 'none') && (
                                                <span className='text-xs bg-gray-600/30 text-gray-400 px-2 py-1 rounded border border-gray-500/50'>
                                                    None
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Tag Assignment Form */}
                <div className='bg-gray-800/50 rounded-lg p-6 border-2 border-purple-500/30'>
                    <h2 className='text-xl font-semibold text-white mb-4'>Assign Tag</h2>
                    
                    {!selectedEvent ? (
                        <p className='text-gray-400'>Select an event to assign a tag</p>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* Selected Event Info */}
                            <div className='p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg'>
                                <p className='text-sm text-gray-400'>Selected Event:</p>
                                <p className='text-lg font-semibold text-white'>{selectedEvent.title}</p>
                            </div>

                            {/* Event Tag Dropdown */}
                            <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                    Event Tag
                                </label>
                                <select 
                                    name='publicEventType' 
                                    value={tagData.publicEventType}
                                    onChange={handleTagChange}
                                    className='w-full px-4 py-3 border-2 border-purple-500/30 bg-gray-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent'
                                >
                                    <option value='none'>None (Regular Event)</option>
                                    <option value='pub'>🍺 Pub (Bar/Club Event)</option>
                                    <option value='public'>🌍 Public (Campus-wide Event)</option>
                                </select>
                                <p className='text-xs text-gray-400 mt-2'>
                                    Pub/Public tagged events get live crowd tracking, vibe ratings, and timeline features
                                </p>
                            </div>

                            {/* Capacity Profile */}
                            {tagData.publicEventType !== 'none' && (
                                <div className='p-4 border-2 border-amber-500/30 rounded-lg bg-amber-900/10'>
                                    <p className='text-base font-bold text-amber-300 mb-3'>📊 Capacity Profile</p>
                                    <p className='text-xs text-gray-400 mb-4'>Set headcount thresholds for crowd levels</p>
                                    
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-xs font-medium text-gray-300 mb-1'>💀 Dead Max</label>
                                            <input 
                                                name='deadMax' 
                                                type='number' 
                                                min='0'
                                                value={tagData.deadMax}
                                                onChange={handleTagChange}
                                                className='w-full px-3 py-2 border border-purple-500/30 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-pink-500'
                                                placeholder='20'
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-medium text-gray-300 mb-1'>😌 Chill Max</label>
                                            <input 
                                                name='chillMax' 
                                                type='number' 
                                                min='0'
                                                value={tagData.chillMax}
                                                onChange={handleTagChange}
                                                className='w-full px-3 py-2 border border-purple-500/30 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-pink-500'
                                                placeholder='50'
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-medium text-gray-300 mb-1'>🔥 Packed Max</label>
                                            <input 
                                                name='packedMax' 
                                                type='number' 
                                                min='0'
                                                value={tagData.packedMax}
                                                onChange={handleTagChange}
                                                className='w-full px-3 py-2 border border-purple-500/30 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-pink-500'
                                                placeholder='100'
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-xs font-medium text-gray-300 mb-1'>🚨 Peak Max</label>
                                            <input 
                                                name='peakMax' 
                                                type='number' 
                                                min='0'
                                                value={tagData.peakMax}
                                                onChange={handleTagChange}
                                                className='w-full px-3 py-2 border border-purple-500/30 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-pink-500'
                                                placeholder='150'
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300'>
                                        <strong>Ranges:</strong> DEAD: 0-{tagData.deadMax} | CHILL: {tagData.deadMax+1}-{tagData.chillMax} | PACKED: {tagData.chillMax+1}-{tagData.packedMax} | TOO_PACKED: {tagData.packedMax+1}-{tagData.peakMax}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type='submit'
                                className='w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all'
                            >
                                Assign Tag
                            </button>

                            <p className='text-xs text-gray-400 text-center'>
                                ✓ No email notifications will be sent to users
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
