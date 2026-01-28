'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Page() {

    const [image,setImage] = useState(false);
    const [data,setData] = useState({
        title:'',
        description:'',
        startDateTime:'',
        endDateTime:'',
        eventType:'',
        theme:'',
        dressCode:'',
        location:'',
        needReservation:false,
        capacity:0,
        reservationDeadline:'',
        host:'',
        publicEventType:'none',
        deadMax:0,
        chillMax:0,
        packedMax:0,
        peakMax:0
    })

    const onChangeHandler = (event) =>{
        const { name, type, value, checked } = event.target;
        const next = type === 'checkbox' ? checked : value;
        setData(prev => ({ ...prev, [name]: next }));
        console.log(data);
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('image', image);
        formData.append('startDateTime', data.startDateTime);
        formData.append('endDateTime', data.endDateTime);
        formData.append('eventType', data.eventType);
        formData.append('location', data.location);
        formData.append('needReservation', data.needReservation);
        formData.append('capacity', data.capacity);
        formData.append('reservationDeadline', data.reservationDeadline);
        formData.append('host', data.host);
        // publicEventType defaults to 'none' - tags assigned later in edit page

        const response = await axios.post('/api/blog', formData);
        if (response.data.success) {
            toast.success(response.data.msg)
        } else {
            toast.error('Could not create event')
        }
    }


    


    return (
        <>
        <form onSubmit={onSubmitHandler} className='pt-5 px-5 sm:pt-12 sm:px-16'>
            <p className='text-xl'>Upload</p>
                        <div
                            onClick={() => document.getElementById('image')?.click()}
                            className='inline-block cursor-pointer mt-4'
                            style={{ width: 140, height: 70 }}
                        >
                                <Image src={!image?assets.upload:URL.createObjectURL(image)} width={140} height={70} alt='upload image' />
            </div>
            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden />
            <p className='text-xl mt-4'>Blog Title</p>
            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type="text" placeholder='Type here' required/>
            
            {/* Description */}
            <p className='text-xl mt-6'>Description</p>
            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' rows={4} placeholder='Describe your event' required></textarea>

            {/* Start Date & Time */}
            <p className='text-xl mt-6'>Start Date & Time</p>
            <input name='startDateTime' onChange={onChangeHandler} value={data.startDateTime} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='datetime-local' required/>

            {/* End Date & Time */}
            <p className='text-xl mt-6'>End Date & Time</p>
            <input name='endDateTime' onChange={onChangeHandler} value={data.endDateTime} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='datetime-local' required/>

            {/* Event Type */}
            <p className='text-xl mt-6'>Event Type</p>
            <input
                name='eventType'
                className='w-full sm:w-[500px] mt-4 px-4 py-3 border'
                type='text'
                placeholder=''
                value={data.eventType}
                onChange={onChangeHandler}
                required
            />

            {/* Location */}
            <p className='text-xl mt-6'>Location</p>
            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Jones College Rooftop' required/>

            {/* Need RSVP */}
            <div className='flex items-center gap-2 mb-6'>
                <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border' onChange={onChangeHandler} checked={data.needReservation}/>
                <label htmlFor='needReservation' className='text-base'>Need RSVP</label>
            </div>

            {/* Conditional fields for RSVP */}
            {data.needReservation && (
                <>
                    {/* RSVP Deadline */}
                    <div className='mt-6'>
                        <p className='text-xl'>RSVP Deadline</p>
                        <input 
                            name='reservationDeadline' 
                            onChange={onChangeHandler} 
                            value={data.reservationDeadline} 
                            className='w-full sm:w-[500px] mt-4 px-4 py-3 border' 
                            type='datetime-local' 
                            required={data.needReservation}
                        />
                    </div>

                    {/* Capacity */}
                    <div className='mt-6'>
                        <p className='text-xl'>Capacity</p>
                        <input 
                            name='capacity' 
                            onChange={onChangeHandler} 
                            value={data.capacity} 
                            className='w-full sm:w-[500px] mt-4 px-4 py-3 border' 
                            type='number' 
                            min='1' 
                            placeholder='120' 
                            required={data.needReservation}
                        />
                    </div>
                </>
            )}


            {/* Host */}
            <div className='mt-6'>
                <p className='text-xl'>Host</p>
                <input name='host' onChange={onChangeHandler} value={data.host} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Howard Zhao' required/>
            </div>

            <br />
            <button type="submit" className='mt-8 w-40 bg-black text-white'>Post</button>
        </form>
        </>
    )
}