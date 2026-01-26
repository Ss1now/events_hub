import React, { useEffect } from 'react';
import { blog_data } from '@/assets/assets';
import BlogItem from './blogitem';
import { useState } from 'react';
import axios from 'axios';

const BlogList = () => {

        const [menu, setMenu] = useState("official");
        const [searchTerm, setSearchTerm] = useState("");
        const [blogs, setBlogs] = useState([]);
        const [userCollege, setUserCollege] = useState('');

        const fetchBlogs = async () =>{
            const response = await axios.get(`/api/blog?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            // Filter only party events
            const partyEvents = response.data.blogs.filter(blog => blog.eventPageType === 'party' || !blog.eventPageType);
            setBlogs(partyEvents);
            console.log('party events:', partyEvents);
        }

        useEffect(()=>{
            fetchBlogs();
            
            // Fetch user profile to get residential college
            const fetchUserProfile = async () => {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await axios.get('/api/user', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.data.success) {
                            setUserCollege(response.data.user.residentialCollege || '');
                        }
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error);
                    }
                }
            };
            
            fetchUserProfile();
        },[])
        
        console.log('blogs:', blogs);

        // Filter events by status/category and search term
        const filteredEvents = blogs.filter((item) => {
            let matchesCategory = false;
            
            if (menu === "official") {
                // Official events: from admin-created official categories OR from organization accounts
                // Exclude college-only events from other colleges
                const isOfficial = item.eventCategory === 'residential_college' || 
                                item.eventCategory === 'university' ||
                                (item.authorId && item.authorId.isOrganization);
                const isAccessible = !item.isCollegeOnly || item.targetCollege === userCollege;
                matchesCategory = isOfficial && isAccessible;
            } else if (menu === "mycollege") {
                // My College: only events marked as college-only for user's college
                matchesCategory = item.isCollegeOnly && item.targetCollege === userCollege;
            } else {
                // For future/live/past, show all party events in their time categories (including organization events)
                // Exclude college-only events from other colleges
                const isInTimeCategory = item.status === menu;
                const isAccessible = !item.isCollegeOnly || item.targetCollege === userCollege;
                matchesCategory = isInTimeCategory && isAccessible;
            }
            
            const matchesSearch = searchTerm === "" || 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.host.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

    return (
        <div className='bg-transparent min-h-screen py-4 md:py-8'>
            {/* Search Bar */}
            <div className='max-w-4xl mx-auto px-4 sm:px-5 mb-4 md:mb-8'>
                <div className='relative'>
                    <svg className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    <input 
                        type='text' 
                        placeholder='Search events' 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-purple-500/30 bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-[0_0_15px_rgba(176,38,255,0.3)]'
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className='flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-8 px-4 overflow-x-auto'>
                <button onClick={()=>setMenu('official')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="official"?'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-purple-500/10'}`}>Official Events</button>
                {userCollege && (
                    <button onClick={()=>setMenu('mycollege')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="mycollege"?'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-purple-500/10'}`}>My College</button>
                )}
                <button onClick={()=>setMenu('future')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="future"?'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_0_20px_rgba(255,0,128,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-purple-500/10'}`}>Upcoming</button>
                <button onClick={()=>setMenu('live')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="live"?'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_20px_rgba(255,0,128,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-purple-500/10'}`}>Happening Now</button>
                <button onClick={()=>setMenu('past')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="past"?'bg-gray-700 text-white shadow-[0_0_15px_rgba(100,100,100,0.5)]':'text-gray-300 hover:bg-gray-800/50 border border-purple-500/10'}`}>Past</button>
            </div>

            {/* Event Cards */}
            <div className='max-w-6xl mx-auto px-4 sm:px-5'>
                <div className='space-y-4 md:space-y-6'>
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
                                eventCategory={item.eventCategory}
                                organizer={item.organizer}
                                isRecurring={item.isRecurring}
                                recurrencePattern={item.recurrencePattern}
                                weeklyTheme={item.weeklyTheme}
                                authorId={item.authorId}
                            />
                        })
                    ) : (
                        <div className='text-center py-12'>
                            <p className='text-gray-400 text-lg'>No events found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BlogList