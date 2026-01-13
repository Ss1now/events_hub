'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import CohostInviteModal from '@/components/CohostInviteModal'

export default function MePage() {
    const [user, setUser] = useState(null)
    const [events, setEvents] = useState([])
    const [interestedEvents, setInterestedEvents] = useState([])
    const [reservedEvents, setReservedEvents] = useState([])
    const [participatedEvents, setParticipatedEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [editName, setEditName] = useState('')
    const [editUsername, setEditUsername] = useState('')
    const [selectedCollege, setSelectedCollege] = useState('')
    const [activeTab, setActiveTab] = useState('hosted') // 'hosted', 'interested', 'reserved', 'participated'
    const [showCohostModal, setShowCohostModal] = useState(false)
    const [selectedEventForCohost, setSelectedEventForCohost] = useState(null)
    const router = useRouter()

    // Calendar functions
    const handleAddToGoogleCalendar = (event) => {
        const formatGoogleDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = formatGoogleDate(event.startDateTime);
        const endDate = formatGoogleDate(event.endDateTime);
        const description = `${event.description}\n\nEvent Type: ${event.eventType}\nHosted by: ${event.host}`;
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location)}`;
        window.open(googleCalendarUrl, '_blank');
    };

    const handleDownloadICS = (event) => {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = formatDate(event.startDateTime);
        const endDate = formatDate(event.endDateTime);
        const now = formatDate(new Date());

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rice Party//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event._id}@riceparty.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nEvent Type: ${event.eventType}\\nHosted by: ${event.host}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token')
            
            if (!token) {
                toast.error('Please login')
                router.push('/login')
                return
            }

            try {
                const response = await axios.get('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.data.success) {
                    setUser(response.data.user)
                    setEvents(response.data.events)
                    
                    // Filter events based on their status
                    const now = new Date()
                    const interested = response.data.interestedEvents || []
                    const reserved = response.data.reservedEvents || []
                    
                    // Events that are still future or live
                    const activeInterested = interested.filter(e => new Date(e.endDateTime) > now)
                    const activeReserved = reserved.filter(e => new Date(e.endDateTime) > now)
                    
                    // Events that have ended (participated)
                    const pastInterested = interested.filter(e => new Date(e.endDateTime) <= now)
                    const pastReserved = reserved.filter(e => new Date(e.endDateTime) <= now)
                    
                    // Combine and deduplicate participated events
                    const participated = [...pastInterested, ...pastReserved]
                    const uniqueParticipated = participated.filter((event, index, self) =>
                        index === self.findIndex((e) => e._id === event._id)
                    )
                    
                    setInterestedEvents(activeInterested)
                    setReservedEvents(activeReserved)
                    setParticipatedEvents(uniqueParticipated)
                    setSelectedCollege(response.data.user.residentialCollege || '')
                    setEditName(response.data.user.name || '')
                    setEditUsername(response.data.user.username || '')
                } else {
                    toast.error('Could not load profile')
                    router.push('/login')
                }
            } catch (error) {
                console.error(error)
                toast.error('Please login')
                localStorage.removeItem('token')
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [router])

    const handleUpdatePersonalInfo = async () => {
        const token = localStorage.getItem('token')
        
        try {
            const response = await axios.put('/api/user', 
                { 
                    name: editName,
                    username: editUsername,
                    residentialCollege: selectedCollege
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data.success) {
                setUser(response.data.user)
                setIsEditingPersonalInfo(false)
                toast.success('Profile updated')
            } else {
                toast.error(response.data.msg || 'Update failed')
            }
        } catch (error) {
            console.error('Error updating personal info:', error)
            toast.error(error.response?.data?.msg || 'Could not update profile')
        }
    }

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        const token = localStorage.getItem('token')

        try {
            const response = await axios.delete('/api/blog', {
                params: { id: eventId },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.data.success) {
                toast.success('Event deleted')
                setEvents(events.filter(event => event._id !== eventId))
            } else {
                toast.error('Could not delete event')
            }
        } catch (error) {
            console.error(error)
            toast.error('Delete failed')
        }
    }

    const handleCancelRSVP = async (eventId) => {
        if (!confirm('Are you sure you want to cancel this RSVP?')) return

        const token = localStorage.getItem('token')

        try {
            const response = await axios.patch('/api/blog', 
                { action: 'cancel-rsvp', eventId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success('RSVP cancelled')
                setReservedEvents(reservedEvents.filter(event => event._id !== eventId))
            } else {
                toast.error('Could not cancel RSVP')
            }
        } catch (error) {
            console.error(error)
            toast.error('Cancellation failed')
        }
    }

    const handleRemoveInterested = async (eventId) => {
        const token = localStorage.getItem('token')

        try {
            const response = await axios.patch('/api/blog', 
                { action: 'interested', eventId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success('Removed from interested')
                setInterestedEvents(interestedEvents.filter(event => event._id !== eventId))
            } else {
                toast.error('Could not remove')
            }
        } catch (error) {
            console.error(error)
            toast.error('Removal failed')
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-xl'>Loading...</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <button
                        onClick={() => router.back()}
                        className='mb-4 text-gray-600 hover:text-black flex items-center gap-2 transition-colors'
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className='text-4xl font-bold text-gray-900'>My Profile</h1>
                </div>

                {/* Profile Card */}
                <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900'>Personal Information</h2>
                        {!isEditingPersonalInfo && (
                            <button
                                onClick={() => setIsEditingPersonalInfo(true)}
                                className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2'
                            >
                                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-4 h-4'>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />
                                </svg>
                                Edit Personal Info
                            </button>
                        )}
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='text-sm font-medium text-gray-500'>Name</label>
                            {isEditingPersonalInfo ? (
                                <input
                                    type='text'
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className='mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                    placeholder='Enter your name'
                                />
                            ) : (
                                <p className='text-lg font-semibold text-gray-900'>{user?.name || 'Not set'}</p>
                            )}
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-500'>Username</label>
                            {isEditingPersonalInfo ? (
                                <div>
                                    <input
                                        type='text'
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        className='mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                        placeholder='username'
                                        maxLength={20}
                                    />
                                    <p className='text-xs text-gray-500 mt-1'>3-20 characters, lowercase letters, numbers, and underscores only</p>
                                </div>
                            ) : (
                                <p className='text-lg font-semibold text-gray-900'>@{user?.username}</p>
                            )}
                        </div>
                        <div>
                            <label className='text-sm font-medium text-gray-500'>Email</label>
                            <p className='text-lg font-semibold text-gray-900'>{user?.email}</p>
                        </div>
                        <div className='md:col-span-2'>
                            <label className='text-sm font-medium text-gray-500'>Residential College</label>
                            {isEditingPersonalInfo ? (
                                <select
                                    value={selectedCollege}
                                    onChange={(e) => setSelectedCollege(e.target.value)}
                                    className='mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                                >
                                    <option value=''>Select your residential college</option>
                                    <option value='Baker College'>Baker College</option>
                                    <option value='Brown College'>Brown College</option>
                                    <option value='Duncan College'>Duncan College</option>
                                    <option value='Hanszen College'>Hanszen College</option>
                                    <option value='Jones College'>Jones College</option>
                                    <option value='Lovett College'>Lovett College</option>
                                    <option value='Martel College'>Martel College</option>
                                    <option value='McMurtry College'>McMurtry College</option>
                                    <option value='Sid Richardson College'>Sid Richardson College</option>
                                    <option value='Wiess College'>Wiess College</option>
                                    <option value='Will Rice College'>Will Rice College</option>
                                    <option value='Others'>Others</option>
                                </select>
                            ) : (
                                <p className='text-lg font-semibold text-gray-900'>
                                    {user?.residentialCollege || 'Not set'}
                                </p>
                            )}
                        </div>
                    </div>
                    {isEditingPersonalInfo && (
                        <div className='flex justify-end gap-3 mt-6 pt-6 border-t'>
                            <button
                                onClick={() => {
                                    setIsEditingPersonalInfo(false)
                                    setEditName(user?.name || '')
                                    setEditUsername(user?.username || '')
                                    setSelectedCollege(user?.residentialCollege || '')
                                }}
                                className='bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePersonalInfo}
                                className='bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors'
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Events Dashboard */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-2xl font-bold text-gray-900'>My Events</h2>
                        <Link href='/me/postevent'>
                            <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>
                                Create New Event
                            </button>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className='flex gap-4 mb-6 border-b border-gray-200'>
                        <button
                            onClick={() => setActiveTab('hosted')}
                            className={`pb-3 px-4 font-medium transition-colors ${
                                activeTab === 'hosted'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Events I Host ({events.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('interested')}
                            className={`pb-3 px-4 font-medium transition-colors ${
                                activeTab === 'interested'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Going ({interestedEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('reserved')}
                            className={`pb-3 px-4 font-medium transition-colors ${
                                activeTab === 'reserved'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Reserved ({reservedEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('participated')}
                            className={`pb-3 px-4 font-medium transition-colors ${
                                activeTab === 'participated'
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Past Events ({participatedEvents.length})
                        </button>
                    </div>

                    {/* Hosted Events Tab */}
                    {activeTab === 'hosted' && (
                        <>
                            {events.length === 0 ? (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-4'>You haven&apos;t posted any events yet</p>
                                    <Link href='/me/postevent'>
                                        <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>
                                            Create Your First Event
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                        <thead className='bg-gray-50'>
                                            <tr>
                                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Event</th>
                                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Location</th>
                                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-gray-200'>
                                            {events.map((event) => (
                                                <tr key={event._id} className='hover:bg-gray-50 cursor-pointer' onClick={() => router.push(`/blogs/${event._id}`)}>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center'>
                                                            {event.images && event.images.length > 0 && (
                                                                <Image 
                                                                    src={event.images[0]} 
                                                                    alt={event.title}
                                                                    width={50}
                                                                    height={50}
                                                                    className='rounded mr-3 object-cover'
                                                                />
                                                            )}
                                                            <div>
                                                                <div className='text-sm font-medium text-gray-900'>{event.title}</div>
                                                                <div className='text-sm text-gray-500'>{event.eventType}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${event.status === 'live' ? 'bg-green-100 text-green-800' : 
                                                              event.status === 'future' ? 'bg-blue-100 text-blue-800' : 
                                                              'bg-gray-100 text-gray-800'}`}>
                                                            {event.status === 'live' ? 'Happening Now' : event.status === 'future' ? 'Upcoming' : 'Past'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>
                                                        {new Date(event.startDateTime).toLocaleDateString()}
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{event.location}</td>
                                                    <td className='px-6 py-4 text-sm font-medium' onClick={(e) => e.stopPropagation()}>
                                                        <div className='flex gap-3'>
                                                            {(event.status === 'future' || event.status === 'live') && (
                                                                <Link href={`/me/editevent/${event._id}`}>
                                                                    <button className='text-[#00205B] hover:text-[#001840] flex items-center gap-1'>
                                                                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
                                                                            <path strokeLinecap='round' strokeLinejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />
                                                                        </svg>
                                                                        Edit
                                                                    </button>
                                                                </Link>
                                                            )}
                                                            {event.status === 'future' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedEventForCohost(event)
                                                                        setShowCohostModal(true)
                                                                    }}
                                                                    className='text-purple-600 hover:text-purple-900 flex items-center gap-1'
                                                                >
                                                                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' d='M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z' />
                                                                    </svg>
                                                                    Invite
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteEvent(event._id)}
                                                                className='text-red-600 hover:text-red-900 flex items-center gap-1'
                                                            >
                                                                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
                                                                    <path strokeLinecap='round' strokeLinejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* Interested Events Tab */}
                    {activeTab === 'interested' && (
                        <>
                            {interestedEvents.length === 0 ? (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-4'>You haven&apos;t marked interest in any events yet</p>
                                    <Link href='/'>
                                        <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>
                                            Browse Events
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {interestedEvents.map((event) => (
                                        <div key={event._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                                            <div className='flex justify-between items-start mb-3'>
                                                <div className='flex-1'>
                                                    <Link href={`/blogs/${event._id}`}>
                                                        <h3 className='text-lg font-semibold text-gray-900 hover:text-gray-700 cursor-pointer'>{event.title}</h3>
                                                    </Link>
                                                    <p className='text-sm text-gray-600 mt-1'>{event.eventType}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    event.status === 'live' ? 'bg-green-100 text-green-800' : 
                                                    event.status === 'future' ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {event.status === 'live' ? 'Happening Now' : event.status === 'future' ? 'Upcoming' : 'Past'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                                </svg>
                                                <span>{new Date(event.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-600 mb-3'>
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                                </svg>
                                                <span>{event.location}</span>
                                            </div>
                                            <div className='flex gap-2 mb-2'>
                                                <button
                                                    onClick={() => handleAddToGoogleCalendar(event)}
                                                    className='flex-1 bg-[#00205B] text-white py-2 rounded-md hover:bg-[#001840] transition-colors text-sm flex items-center justify-center gap-1'
                                                >
                                                    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                                                        <path d='M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m15 0h-15' />
                                                    </svg>
                                                    Google
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadICS(event)}
                                                    className='flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-1'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' />
                                                    </svg>
                                                    .ics
                                                </button>
                                            </div>
                                            <div className='flex gap-2'>
                                                <Link href={`/blogs/${event._id}`} className='flex-1'>
                                                    <button className='w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm'>
                                                        View Details
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleRemoveInterested(event._id)}
                                                    className='px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm'
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Reserved Events Tab */}
                    {activeTab === 'reserved' && (
                        <>
                            {reservedEvents.length === 0 ? (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-4'>You haven&apos;t reserved any events yet</p>
                                    <Link href='/'>
                                        <button className='bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors'>
                                            Browse Events
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {reservedEvents.map((event) => (
                                        <div key={event._id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                                            <div className='flex justify-between items-start mb-3'>
                                                <div className='flex-1'>
                                                    <Link href={`/blogs/${event._id}`}>
                                                        <h3 className='text-lg font-semibold text-gray-900 hover:text-gray-700 cursor-pointer'>{event.title}</h3>
                                                    </Link>
                                                    <p className='text-sm text-gray-600 mt-1'>{event.eventType}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    event.status === 'live' ? 'bg-green-100 text-green-800' : 
                                                    event.status === 'future' ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {event.status === 'live' ? 'Happening Now' : event.status === 'future' ? 'Upcoming' : 'Past'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                                </svg>
                                                <span>{new Date(event.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                                </svg>
                                                <span>{event.location}</span>
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-600 mb-3'>
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                                </svg>
                                                <span className='font-medium'>{event.reserved}/{event.capacity} reserved</span>
                                            </div>
                                            <div className='flex gap-2 mb-2'>
                                                <button
                                                    onClick={() => handleAddToGoogleCalendar(event)}
                                                    className='flex-1 bg-[#00205B] text-white py-2 rounded-md hover:bg-[#001840] transition-colors text-sm flex items-center justify-center gap-1'
                                                >
                                                    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                                                        <path d='M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m15 0h-15' />
                                                    </svg>
                                                    Google
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadICS(event)}
                                                    className='flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-1'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' />
                                                    </svg>
                                                    .ics
                                                </button>
                                            </div>
                                            <div className='flex gap-2'>
                                                <Link href={`/blogs/${event._id}`} className='flex-1'>
                                                    <button className='w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm'>
                                                        View Details
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleCancelRSVP(event._id)}
                                                    className='px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm'
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Participated Events Tab */}
                    {activeTab === 'participated' && (
                        <>
                            {participatedEvents.length === 0 ? (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-4'>You haven&apos;t participated in any events yet</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {participatedEvents.map((event) => (
                                        <div key={event._id} className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-gray-50'>
                                            {event.images && event.images.length > 0 && (
                                                <div className='aspect-w-16 aspect-h-9 bg-gray-200'>
                                                    <Image
                                                        src={event.images[0]}
                                                        alt={event.title}
                                                        width={400}
                                                        height={225}
                                                        className='w-full h-48 object-cover'
                                                    />
                                                </div>
                                            )}
                                            <div className='p-4'>
                                                <div className='mb-2'>
                                                    <span className='inline-block bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold'>
                                                        Past Event
                                                    </span>
                                                </div>
                                                <h3 className='font-bold text-lg mb-2 text-gray-700'>{event.title}</h3>
                                                <p className='text-sm text-gray-600 mb-2'>{event.description.slice(0, 100)}...</p>
                                                <div className='text-sm text-gray-500 mb-4'>
                                                    <p>{new Date(event.startDateTime).toLocaleDateString()}</p>
                                                    <p>{event.location}</p>
                                                </div>
                                                <div className='flex flex-col gap-2'>
                                                    <Link href={`/blogs/${event._id}`}>
                                                        <button className='w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors text-sm'>
                                                            View Details
                                                        </button>
                                                    </Link>
                                                    {user?.ratedEvents?.includes(event._id) ? (
                                                        <div className='w-full bg-green-50 border border-green-200 text-green-700 py-2 rounded-md text-sm text-center flex items-center justify-center gap-1'>
                                                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                                                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                                                            </svg>
                                                            Reviewed
                                                        </div>
                                                    ) : (
                                                        <Link href={`/blogs/${event._id}`}>
                                                            <button className='w-full bg-[#00205B] text-white py-2 rounded-md hover:bg-[#001840] transition-colors text-sm flex items-center justify-center gap-1'>
                                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                                                                </svg>
                                                                Rate Event
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Summary Stats */}
                    {activeTab === 'hosted' && events.length > 0 && (
                        <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-blue-50 rounded-lg p-4'>
                            <p className='text-sm font-medium text-[#00205B]'>Total Events</p>
                            <p className='text-2xl font-bold text-blue-900'>{events.length}</p>
                        </div>
                        <div className='bg-green-50 rounded-lg p-4'>
                            <p className='text-sm font-medium text-green-600'>Happening Now</p>
                            <p className='text-2xl font-bold text-green-900'>
                                {events.filter(e => e.status === 'live').length}
                            </p>
                        </div>
                        <div className='bg-purple-50 rounded-lg p-4'>
                            <p className='text-sm font-medium text-purple-600'>Upcoming Events</p>
                            <p className='text-2xl font-bold text-purple-900'>
                                {events.filter(e => e.status === 'future').length}
                            </p>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {/* Cohost Invite Modal */}
            {showCohostModal && selectedEventForCohost && (
                <CohostInviteModal
                    isOpen={showCohostModal}
                    eventId={selectedEventForCohost._id}
                    eventTitle={selectedEventForCohost.title}
                    onClose={() => {
                        setShowCohostModal(false)
                        setSelectedEventForCohost(null)
                    }}
                    onCohostAdded={() => {
                        // Optionally refresh events data here
                        setShowCohostModal(false)
                        setSelectedEventForCohost(null)
                    }}
                />
            )}
        </div>
    )
}
