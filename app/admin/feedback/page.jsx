'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function FeedbackListPage() {
    const [feedbacks, setFeedbacks] = useState([])
    const [stats, setStats] = useState({ total: 0, new: 0, read: 0, resolved: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, new, read, resolved
    const [searchTerm, setSearchTerm] = useState('')
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

            // Fetch feedbacks
            fetchFeedbacks()
        } catch (error) {
            toast.error('Authentication failed')
            router.push('/login')
        }
    }

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.data.success) {
                setFeedbacks(response.data.feedbacks)
                setStats(response.data.stats)
            }
        } catch (error) {
            toast.error('Failed to fetch feedback')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (feedbackId, newStatus) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.patch('/api/feedback', 
                { feedbackId, status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success('Status updated')
                fetchFeedbacks()
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const deleteFeedback = async (feedbackId) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await axios.delete(`/api/feedback?id=${feedbackId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.data.success) {
                toast.success('Feedback deleted')
                fetchFeedbacks()
            }
        } catch (error) {
            toast.error('Failed to delete feedback')
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800'
        }
        return styles[status] || styles.new
    }

    const filteredFeedbacks = feedbacks.filter(fb => {
        const matchesFilter = filter === 'all' || fb.status === filter
        const matchesSearch = searchTerm === '' || 
            fb.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.userName.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading feedback...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
                <div className='max-w-7xl mx-auto px-6 py-4'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>💬 User Feedback</h1>
                            <p className='text-sm text-gray-600 mt-1'>Manage and respond to user feedback</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/bloglist')}
                            className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            Back to Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className='max-w-7xl mx-auto px-6 py-6'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white rounded-lg p-4 border-2 border-gray-200'>
                        <p className='text-sm text-gray-600'>Total Feedback</p>
                        <p className='text-3xl font-bold text-gray-900'>{stats.total}</p>
                    </div>
                    <div className='bg-blue-50 rounded-lg p-4 border-2 border-blue-200'>
                        <p className='text-sm text-blue-600'>New</p>
                        <p className='text-3xl font-bold text-blue-900'>{stats.new}</p>
                    </div>
                    <div className='bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200'>
                        <p className='text-sm text-yellow-600'>Read</p>
                        <p className='text-3xl font-bold text-yellow-900'>{stats.read}</p>
                    </div>
                    <div className='bg-green-50 rounded-lg p-4 border-2 border-green-200'>
                        <p className='text-sm text-green-600'>Resolved</p>
                        <p className='text-3xl font-bold text-green-900'>{stats.resolved}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className='bg-white rounded-lg p-4 mb-6 border border-gray-200'>
                    <div className='flex flex-col sm:flex-row gap-4'>
                        <div className='flex gap-2 flex-wrap'>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('new')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'new' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                New ({stats.new})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'read' 
                                        ? 'bg-yellow-600 text-white' 
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                            >
                                Read ({stats.read})
                            </button>
                            <button
                                onClick={() => setFilter('resolved')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === 'resolved' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                Resolved ({stats.resolved})
                            </button>
                        </div>
                        <input
                            type='text'
                            placeholder='Search feedback...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                </div>

                {/* Feedback List */}
                <div className='space-y-4'>
                    {filteredFeedbacks.length === 0 ? (
                        <div className='bg-white rounded-lg p-12 text-center border border-gray-200'>
                            <p className='text-gray-500'>No feedback found</p>
                        </div>
                    ) : (
                        filteredFeedbacks.map((fb) => (
                            <div key={fb._id} className='bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow'>
                                <div className='flex justify-between items-start mb-4'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <span className='font-semibold text-gray-900'>{fb.userName}</span>
                                            <span className='text-sm text-gray-500'>{fb.email}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(fb.status)}`}>
                                                {fb.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className='text-sm text-gray-500'>
                                            {new Date(fb.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteFeedback(fb._id)}
                                        className='text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors'
                                        title='Delete feedback'
                                    >
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                        </svg>
                                    </button>
                                </div>

                                <div className='mb-4'>
                                    <p className='text-gray-800 whitespace-pre-wrap'>{fb.feedback}</p>
                                </div>

                                <div className='flex gap-2 pt-4 border-t border-gray-100'>
                                    <button
                                        onClick={() => updateStatus(fb._id, 'new')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            fb.status === 'new'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                    >
                                        Mark as New
                                    </button>
                                    <button
                                        onClick={() => updateStatus(fb._id, 'read')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            fb.status === 'read'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                    >
                                        Mark as Read
                                    </button>
                                    <button
                                        onClick={() => updateStatus(fb._id, 'resolved')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            fb.status === 'resolved'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                    >
                                        Mark as Resolved
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
