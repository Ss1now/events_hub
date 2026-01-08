'use client'

import React from 'react'
import BlogTableItem from '@/components/admincomponents/blogtableitem';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Page() {
    
    const [blogs,setBlogs] = useState ([]);

    const fetchBlogs = async () => {
        const response = await axios.get('/api/blog');
        setBlogs(response.data.blogs)

    }

    const deleterBlogs = async (mongoId) => {
        const response = await axios.delete('/api/blog', {
            params: {
                id:mongoId
            }
        })
        toast.success(response.data.msg);
        fetchBlogs();
    }

    useEffect(()=>{
        fetchBlogs();
    },[])
    
    
    
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