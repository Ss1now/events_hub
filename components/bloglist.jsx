import React from 'react';
import { blog_data } from '@/assets/assets';
import BlogItem from './blogitem';
import { useState } from 'react';

const BlogList = () => {

        const [menu, setMenu] = useState("All");
        
        console.log('blog_data:', blog_data);

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
                        placeholder='Search' 
                        className='w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300'
                    />
                </div>
                <p className='text-sm text-gray-400 mt-2 text-right'>Try "jones", "silent disco", "rooftop"...</p>
            </div>

            {/* Filter Tabs */}
            <div className='flex justify-center gap-4 mb-8'>
                <button onClick={()=>setMenu('All')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="All"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Future</button>
                <button onClick={()=>setMenu('Design')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="Design"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Ongoing</button>
                <button onClick={()=>setMenu('Development')} className={`px-6 py-2 rounded-full font-medium transition-colors ${menu==="Development"?'bg-gray-200 text-black':'text-gray-600 hover:bg-gray-100'}`}>Past</button>
            </div>

            {/* Event Cards */}
            <div className='max-w-6xl mx-auto px-5'>
                <div className='space-y-6'>
                    {blog_data.filter((item)=> menu==="All"?true:item.category===menu).map((item,index)=>{
                        return <BlogItem key={index} id={item.id} image={item.image} title={item.title} description={item.description} category={item.category} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default BlogList