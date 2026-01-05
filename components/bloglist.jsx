import React from 'react';
import { blog_data } from '@/assets/assets';
import BlogItem from './blogitem';
import { useState } from 'react';

const BlogList = () => {

        const [menu, setMenu] = useState("All");
        
        console.log('blog_data:', blog_data);

    return (
        <div>
            <div className='flex justify-center gap-6 my-10'>
                <button onClick={()=>setMenu('All')} className={menu==="All"?'bg-black text-white py-1 px-4 rounded-sm':""}>All</button>
                <button onClick={()=>setMenu('Design')} className={menu==="Design"?'bg-black text-white py-1 px-4 rounded-sm':""}>Design</button>
                <button onClick={()=>setMenu('Development')} className={menu==="Development"?'bg-black text-white py-1 px-4 rounded-sm':""}>Development</button>
                <button onClick={()=>setMenu('Tutorial')} className={menu==="Tutorial"?'bg-black text-white py-1 px-4 rounded-sm':""}>Tutorial</button>
            </div>
            <div className='flex flex-wrap justify-around gap-1 gap-y-10 mb-16 xl:mx-24'>
                {blog_data.filter((item)=> menu==="All"?true:item.category===menu).map((item,index)=>{
                    return <BlogItem key={index} id={item.id} image={item.image} title={item.title} description={item.description} category={item.category} />
                })}
            </div>
        </div>
    )
}

export default BlogList