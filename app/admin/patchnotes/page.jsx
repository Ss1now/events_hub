'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function PatchNotesSubscribersPage() {
    const [subscribers, setSubscribers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [copiedEmail, setCopiedEmail] = useState(null)
    const router = useRouter()

    useEffect(() => {
        checkAdminAndFetch()
    }, [])

    const checkAdminAndFetch = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            // Check if user is admin
            const userResponse = await axios.get('/api/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!userResponse.data.user.isAdmin) {
                toast.error('Admin access required')
                router.push('/')
                return
            }

            // Fetch subscribers
            fetchSubscribers()
        } catch (error) {
            toast.error('Authentication failed')
            router.push('/login')
        }
    }

    const fetchSubscribers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/admin/patchnotes-subscribers', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.data.success) {
                setSubscribers(response.data.subscribers)
            }
        } catch (error) {
            toast.error('Failed to fetch subscribers')
        } finally {
            setLoading(false)
        }
    }

    const copyEmail = (email) => {
        navigator.clipboard.writeText(email)
        setCopiedEmail(email)
        toast.success('Email copied to clipboard!')
        setTimeout(() => setCopiedEmail(null), 2000)
    }

    const copyAllEmails = () => {
        const emailList = filteredSubscribers.map(s => s.email).join(', ')
        navigator.clipboard.writeText(emailList)
        toast.success(`Copied ${filteredSubscribers.length} emails to clipboard!`)
    }

    const filteredSubscribers = subscribers.filter(subscriber =>
        subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscriber.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin'></div>
                    <p className='text-gray-600 font-medium'>Loading subscribers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg'>
                                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                </svg>
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>Patch Notes Subscribers</h1>
                                <p className='text-sm text-gray-600'>Users who opted in to receive feature updates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/admin/bloglist')}
                            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            Back to Events
                        </button>
                    </div>

                    {/* Stats & Actions */}
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200'>
                        <div className='flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200'>
                            <svg className='w-5 h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                            <span className='text-sm font-semibold text-purple-900'>
                                {filteredSubscribers.length} Subscriber{filteredSubscribers.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {filteredSubscribers.length > 0 && (
                            <button
                                onClick={copyAllEmails}
                                className='flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#001840] transition-colors text-sm font-medium'
                            >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
                                </svg>
                                Copy All Emails
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6'>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Search by name, email, or username...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        />
                        <svg className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>
                </div>

                {/* Subscribers List */}
                {filteredSubscribers.length === 0 ? (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
                        <div className='flex justify-center mb-4'>
                            <div className='bg-gray-100 p-6 rounded-full'>
                                <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                                </svg>
                            </div>
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                            {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
                        </h3>
                        <p className='text-gray-600'>
                            {searchTerm 
                                ? 'Try adjusting your search terms'
                                : 'Users who subscribe to patch notes will appear here'
                            }
                        </p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b border-gray-200'>
                                    <tr>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                            Name
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                            Username
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                            Email
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                            Subscribed On
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {filteredSubscribers.map((subscriber) => (
                                        <tr key={subscriber._id} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold'>
                                                        {subscriber.name?.[0]?.toUpperCase() || subscriber.email?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className='font-medium text-gray-900'>
                                                        {subscriber.name || 'No Name'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className='text-purple-600 font-medium'>
                                                    @{subscriber.username || 'N/A'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-gray-900'>{subscriber.email}</span>
                                                    <button
                                                        onClick={() => copyEmail(subscriber.email)}
                                                        className='text-gray-400 hover:text-purple-600 transition-colors'
                                                        title='Copy email'
                                                    >
                                                        {copiedEmail === subscriber.email ? (
                                                            <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                                            </svg>
                                                        ) : (
                                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3' />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                                {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <a
                                                    href={`mailto:${subscriber.email}`}
                                                    className='inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                                    </svg>
                                                    Email
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
