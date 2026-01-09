'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'

export default function MePage() {
    const [user, setUser] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [editName, setEditName] = useState('')
    const [selectedCollege, setSelectedCollege] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token')
            
            if (!token) {
                toast.error('Please login to view this page')
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
                    setSelectedCollege(response.data.user.residentialCollege || '')
                    setEditName(response.data.user.name || '')
                } else {
                    toast.error('Failed to load profile')
                    router.push('/login')
                }
            } catch (error) {
                console.error(error)
                toast.error('Please login again')
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
                toast.success('Personal information updated successfully')
            } else {
                toast.error('Failed to update personal information')
            }
        } catch (error) {
            console.error('Error updating personal info:', error)
            toast.error(error.response?.data?.msg || 'Error updating personal information')
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
                toast.success('Event deleted successfully')
                setEvents(events.filter(event => event._id !== eventId))
            } else {
                toast.error('Failed to delete event')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error deleting event')
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
                        onClick={() => router.push('/')}
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
                                Post New Event
                            </button>
                        </Link>
                    </div>

                    {events.length === 0 ? (
                        <div className='text-center py-12'>
                            <p className='text-gray-500 text-lg mb-4'>You haven't posted any events yet</p>
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
                                        <tr key={event._id} className='hover:bg-gray-50'>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center'>
                                                    {event.image && (
                                                        <Image 
                                                            src={event.image} 
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
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {new Date(event.startDateTime).toLocaleDateString()}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>{event.location}</td>
                                            <td className='px-6 py-4 text-sm font-medium'>
                                                <button
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                    className='text-red-600 hover:text-red-900'
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-blue-50 rounded-lg p-4'>
                            <p className='text-sm font-medium text-blue-600'>Total Events</p>
                            <p className='text-2xl font-bold text-blue-900'>{events.length}</p>
                        </div>
                        <div className='bg-green-50 rounded-lg p-4'>
                            <p className='text-sm font-medium text-green-600'>Live Events</p>
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
                </div>
            </div>
        </div>
    )
}
