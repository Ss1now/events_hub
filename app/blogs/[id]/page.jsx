'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { blog_data } from '@/assets/assets';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { assets } from '@/assets/assets';


const page = ({params}) => {

    const [data,setData] = useState(null);

    const fetchBlogData = () => {
        for(let i=0;i<blog_data.length;i++){
            if (Number(params.id)===blog_data[i].id){
                setData(blog_data[i]);
                console.log(blog_data[i]);
                break;
            }
        }
    }   

    useEffect(() => {
        fetchBlogData();
    }, []);

    return (data?<>
        <div className ='bg-gray-200 py-5 px-5 md:px-12 lg:px-28'>
            <div className='flex justify-between items-center'>
            <Image src={assets.logo} width={180} alt='' className= 'w-[130px] sm:w-auto'/>
            <button className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black'>Get Started</button>
            </div>
            <div className='text-center my-24'>
                <h1>{data.title}</h1>
            </div>
        </div>
        </>:<></>
    )
}

export default page