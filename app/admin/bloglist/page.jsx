'use client'

import React from 'react'
import BlogTableItem from '@/components/admincomponents/blogtableitem';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function Page() {
    
    const [blogs,setBlogs] = useState ([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        live: 0,
        future: 0,
        past: 0
    });
    const router = useRouter();

    useEffect(() => {
        const checkAdminAndFetchBlogs = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('Please login to access admin panel');
                router.push('/login');
                return;
            }

            try {
                // Check if user is admin
                const userResponse = await axios.get('/api/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userResponse.data.success && userResponse.data.user.isAdmin) {
                    setIsAdmin(true);
                    fetchBlogs();
                } else {
                    toast.error('Access denied. Admin privileges required.');
                    router.push('/');
                }
            } catch (error) {
                console.error(error);
                toast.error('Authentication error');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAdminAndFetchBlogs();
    }, [router]);

    const fetchBlogs = async () => {
        const response = await axios.get('/api/blog');
        const fetchedBlogs = response.data.blogs;
        setBlogs(fetchedBlogs);
        
        // Calculate stats
        const total = fetchedBlogs.length;
        const live = fetchedBlogs.filter(b => b.status === 'live').length;
        const future = fetchedBlogs.filter(b => b.status === 'future').length;
        const past = fetchedBlogs.filter(b => b.status === 'past').length;
        
        setStats({ total, live, future, past });
    }

    const deleterBlogs = async (mongoId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to delete posts');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        
        try {
            const response = await axios.delete('/api/blog', {
                params: {
                    id:mongoId
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (response.data.success) {
                toast.success(response.data.msg);
                fetchBlogs();
            } else {
                toast.error(response.data.msg);
            }
        } catch (error) {
            toast.error('Error deleting post');
            console.error(error);
        }
    }
    
    const bulkDelete = async () => {
        if (selectedBlogs.length === 0) {
            toast.error('No events selected');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${selectedBlogs.length} event(s)?`)) {
            return;
        }
        
        const token = localStorage.getItem('token');
        const deletePromises = selectedBlogs.map(id => 
            axios.delete('/api/blog', {
                params: { id },
                headers: { 'Authorization': `Bearer ${token}` }
            })
        );
        
        try {
            await Promise.all(deletePromises);
            toast.success(`Deleted ${selectedBlogs.length} event(s)`);
            setSelectedBlogs([]);
            fetchBlogs();
        } catch (error) {
            toast.error('Error deleting some events');
            console.error(error);
        }
    }
    
    const toggleSelectAll = () => {
        if (selectedBlogs.length === filteredBlogs.length) {
            setSelectedBlogs([]);
        } else {
            setSelectedBlogs(filteredBlogs.map(b => b._id));
        }
    }
    
    const toggleSelect = (id) => {
        if (selectedBlogs.includes(id)) {
            setSelectedBlogs(selectedBlogs.filter(blogId => blogId !== id));
        } else {
            setSelectedBlogs([...selectedBlogs, id]);
        }
    }
    
    // Filter and search
    const filteredBlogs = blogs.filter(blog => {
        const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
        const matchesSearch = searchTerm === '' || 
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    
    if (loading) {
        return (
            <div className='flex-1 flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }
    
    return (
        <div className='flex-1 bg-gray-50 min-h-screen p-6'>
            {/* Header */}
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-900'>Event Management</h1>
                <p className='text-gray-600 mt-1'>Manage all events and monitor platform activity</p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-gray-600'>Total Events</p>
                            <p className='text-3xl font-bold text-gray-900 mt-1'>{stats.total}</p>
                        </div>
                        <div className='bg-blue-100 p-3 rounded-lg'>
                            <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-gray-600'>Happening Now</p>
                            <p className='text-3xl font-bold text-green-600 mt-1'>{stats.live}</p>
                        </div>
                        <div className='bg-green-100 p-3 rounded-lg'>
                            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z' />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-gray-600'>Upcoming</p>
                            <p className='text-3xl font-bold text-orange-600 mt-1'>{stats.future}</p>
                        </div>
                        <div className='bg-orange-100 p-3 rounded-lg'>
                            <svg className='w-6 h-6 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-gray-600'>Past Events</p>
                            <p className='text-3xl font-bold text-gray-500 mt-1'>{stats.past}</p>
                        </div>
                        <div className='bg-gray-100 p-3 rounded-lg'>
                            <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6'>
                <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
                    <div className='flex-1 w-full md:w-auto'>
                        <div className='relative'>
                            <svg className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <input 
                                type='text' 
                                placeholder='Search by title, host, type, location...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                        </div>
                    </div>
                    
                    <div className='flex gap-2 w-full md:w-auto'>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        >
                            <option value='all'>All Status</option>
                            <option value='live'>Happening Now</option>
                            <option value='future'>Upcoming</option>
                            <option value='past'>Past</option>
                        </select>
                        
                        {selectedBlogs.length > 0 && (
                            <button
                                onClick={bulkDelete}
                                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                </svg>
                                Delete {selectedBlogs.length}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Events Table */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50 border-b border-gray-200'>
                            <tr>
                                <th className='px-6 py-3 text-left'>
                                    <input 
                                        type='checkbox'
                                        checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
                                        onChange={toggleSelectAll}
                                        className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                                    />
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Host</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Title</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {filteredBlogs.length > 0 ? (
                                filteredBlogs.map((item) => (
                                    <BlogTableItem 
                                        key={item._id} 
                                        mongoId={item._id} 
                                        title={item.title} 
                                        host={item.host} 
                                        date={item.date}
                                        status={item.status}
                                        deleteBlog={deleterBlogs}
                                        isSelected={selectedBlogs.includes(item._id)}
                                        toggleSelect={toggleSelect}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='6' className='px-6 py-12 text-center text-gray-500'>
                                        <svg className='w-12 h-12 mx-auto text-gray-400 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                                        </svg>
                                        <p className='text-lg font-medium'>No events found</p>
                                        <p className='text-sm'>Try adjusting your search or filter criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
            
            {/* Results count */}
            <div className='mt-4 text-sm text-gray-600 text-center'>
                Showing {filteredBlogs.length} of {blogs.length} events
            </div>

        </div>
    )
}