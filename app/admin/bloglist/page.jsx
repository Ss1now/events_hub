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
        setBlogs(response.data.blogs)

    }

    const deleterBlogs = async (mongoId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to delete posts');
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
    
    if (loading) {
        return (
            <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }
    
    return (
        <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
            <h1>All Posts</h1>
            <div className='relative h-[80vh] max-w-[850px] overflow-x-auto mt-4 border border-gray-400'>
                <table className='w-full text-sm text-gray-500'>
                    <thead className='text-sm text-gray-700 text-left uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Your Name
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Title
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Date
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((item,index)=>{
                            return <BlogTableItem key={index} mongoId={item._id} title={item.title} host={item.host} date={item.date} deleteBlog={deleterBlogs}/>;
                        })}
                    </tbody>

                </table>

            </div>

        </div>
    )
}