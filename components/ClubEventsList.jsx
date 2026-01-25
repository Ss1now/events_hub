import React, { useEffect } from 'react';
import BlogItem from './blogitem';
import { useState } from 'react';
import axios from 'axios';

const ClubEventsList = () => {

        const [menu, setMenu] = useState("future");
        const [searchTerm, setSearchTerm] = useState("");
        const [events, setEvents] = useState([]);

        const fetchEvents = async () =>{
            const response = await axios.get('/api/blog');
            // Filter only club events
            const clubEvents = response.data.blogs.filter(blog => blog.eventPageType === 'club_event');
            setEvents(clubEvents);
            console.log('club events:', clubEvents);
        }

        useEffect(()=>{
            fetchEvents();
        },[])
        
        console.log('events:', events);

        // Filter events by status and search term
        const filteredEvents = events.filter((item) => {
            // Only show time-based categories (future/live/past) - no official category for club events
            const matchesCategory = item.status === menu;
            
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
                    <svg className='absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth={2.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    <input
                        type='text'
                        placeholder='Find club events...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-blue-500/15 bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className='flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-8 px-4 overflow-x-auto'>
                <button onClick={()=>setMenu('future')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="future"?'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-blue-500/30'}`}>Upcoming</button>
                <button onClick={()=>setMenu('live')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="live"?'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]':'text-gray-300 hover:bg-gray-800/50 border border-blue-500/30'}`}>Happening Now</button>
                <button onClick={()=>setMenu('past')} className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${menu==="past"?'bg-gray-700 text-white shadow-[0_0_15px_rgba(100,100,100,0.5)]':'text-gray-300 hover:bg-gray-800/50 border border-blue-500/30'}`}>Past</button>
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
                            <p className='text-gray-400 text-lg'>No club events found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ClubEventsList;
