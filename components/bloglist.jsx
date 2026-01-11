import React, { useEffect } from 'react';
import { blog_data } from '@/assets/assets';
import BlogItem from './blogitem';
import { useState } from 'react';
import axios from 'axios';

const BlogList = () => {

        const [menu, setMenu] = useState("future");
        const [searchTerm, setSearchTerm] = useState("");
        const [blogs, setBlogs] = useState([]);

        const fetchBlogs = async () =>{
            const response = await axios.get('/api/blog');
            setBlogs(response.data.blogs);
            console.log(response.data.blogs);
        }

        useEffect(()=>{
            fetchBlogs();
        },[])
        
        console.log('blogs:', blogs);

        // Filter events by status and search term
        const filteredEvents = blogs.filter((item) => {
            const matchesStatus = item.status === menu;
            const matchesSearch = searchTerm === "" || 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.host.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

    return (
        <div className='bg-gray-50 min-h-screen py-8'>
            {/* Search Bar */}
            <div className='max-w-4xl mx-auto px-5 mb-8'>
                <div className='relative'>
                    <svg className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    <input 
                        type='text' 
                        placeholder='Search events' 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300'
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className='flex justify-center gap-4 mb-8'>
                <button onClick={()=>setMenu('future')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="future"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Upcoming</button>
                <button onClick={()=>setMenu('live')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="live"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Happening Now</button>
                <button onClick={()=>setMenu('past')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="past"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Past</button>
            </div>

            {/* Event Cards */}
            <div className='max-w-6xl mx-auto px-5'>
                <div className='space-y-6'>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((item,index)=>{
                            return <BlogItem 
                                key={item._id} 
                                id={item._id} 
                                images={item.images} 
                                title={item.title} 
                                description={item.description} 
                                category={item.category}
                                status={item.status}
                                eventType={item.eventType}
                                location={item.location}
                                needReservation={item.needReservation}
                                reserved={item.reserved}
                                capacity={item.capacity}
                                startDateTime={item.startDateTime}
                                endDateTime={item.endDateTime}
                                host={item.host}
                                cohosts={item.cohosts}
                                interestedUsers={item.interestedUsers}
                                reservedUsers={item.reservedUsers}
                                reservationDeadline={item.reservationDeadline}
                                averageLiveRating={item.averageLiveRating}
                                totalLiveRatings={item.totalLiveRatings}
                            />
                        })
                    ) : (
                        <div className='text-center py-12'>
                            <p className='text-gray-500 text-lg'>No events found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BlogList