'use client'
import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'
import { useState } from 'react';

export default function Page() {

    const [image,setImage] = useState(false);
    const [eventTypeOption, setEventTypeOption] = useState('Socializing');
    const [customEventType, setCustomEventType] = useState('');
    const [data,setData] = useState({
        title:'',
        description:'',
        date:'',
        eventMonth:'',
        eventDay:'',
        status:'future',
        eventType:eventTypeOption,
        theme:'',
        dressCode:'',
        location:'',
        needReservation:false,
        reserved:0,
        capacity:0,
        time:'',
        host:''
    })

    const onChangeHandler = (event) =>{
        const { name, type, value, checked } = event.target;
        const next = type === 'checkbox' ? checked : value;
        setData(prev => ({ ...prev, [name]: next }));
    }


    return (
        <>
        <form className='pt-5 px-5 sm:pt-12 sm:px-16'>
            <p className='text-xl'>Upload</p>
                        <div
                            onClick={() => document.getElementById('image')?.click()}
                            className='inline-block cursor-pointer mt-4'
                            style={{ width: 140, height: 70 }}
                        >
                                <Image src={!image?assets.upload:URL.createObjectURL(image)} width={140} height={70} alt='upload image' />
            </div>
            <input onChange={(e)=>setImage(e.target.files[0])}type="file" id='image' hidden required/>
            <p className='text-xl mt-4'>Blog Title</p>
            <input name='title' onChange={onChangeHandler} value={data.title} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type="text" placeholder='Type here' required/>
            
            {/* Description */}
            <p className='text-xl mt-6'>Description</p>
            <textarea name='description' onChange={onChangeHandler} value={data.description} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' rows={4} placeholder='Describe your event' required></textarea>

            {/* Date */}
            <p className='text-xl mt-6'>Date</p>
            <input name='date' onChange={onChangeHandler} value={data.date} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='date' required/>

            {/* Event Month/Day (optional for display badge) */}
            <div className='flex gap-4 mt-4'>
                <div className='flex-1'>
                    <p className='text-sm'>Event Month</p>
                    <input name='eventMonth' onChange={onChangeHandler} value={data.eventMonth} className='w-full mt-2 px-4 py-3 border' type='text' placeholder='Jan'/>
                </div>
                <div className='flex-1'>
                    <p className='text-sm'>Event Day</p>
                    <input name='eventDay' onChange={onChangeHandler} value={data.eventDay} className='w-full mt-2 px-4 py-3 border' type='number' min='1' max='31' placeholder='30'/>
                </div>
            </div>

            {/* Status */}
            <p className='text-xl mt-6'>Status</p>
            <select name='status' onChange={onChangeHandler} value={data.status} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' required>
                <option value='live'>live</option>
                <option value='future'>future</option>
                <option value='past'>past</option>
            </select>

            {/* Event Type */}
            <p className='text-xl mt-6'>Event Type</p>
            <select
                name='eventType'
                className='w-full sm:w-[500px] mt-4 px-4 py-3 border'
                value={eventTypeOption}
                onChange={(e)=> { setEventTypeOption(e.target.value); if(e.target.value !== 'Other'){ onChangeHandler(e);} }}
                required
            >
                <option value='Private Party'>Private Party</option>
                <option value='Socializing'>Socializing</option>
                <option value='Gathering'>Gathering</option>
                <option value='Entertainment'>Entertainment</option>
                <option value='Workshop'>Workshop</option>
                <option value='Game Night'>Game Night</option>
                <option value='Other'>Other (type manually)</option>
            </select>
            {eventTypeOption === 'Other' ? (
                <input
                    name='eventType'
                    className='w-full sm:w-[500px] mt-4 px-4 py-3 border'
                    type='text'
                    placeholder='Type event type'
                    value={data.eventType}
                    onChange={onChangeHandler}
                    required
                />
            ) : (
                <input type='hidden' name='eventType' value={eventTypeOption} />
            )}

            {/* Theme */}
            <p className='text-xl mt-6'>Theme</p>
            <input name='theme' onChange={onChangeHandler} value={data.theme} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Warm Neutrals' required/>

            {/* Dress Code */}
            <p className='text-xl mt-6'>Dress Code</p>
            <input name='dressCode' onChange={onChangeHandler} value={data.dressCode} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Cozy Chic' required/>

            {/* Location */}
            <p className='text-xl mt-6'>Location</p>
            <input name='location' onChange={onChangeHandler} value={data.location} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Jones College Rooftop' required/>

            {/* Need Reservation */}
            <div className='mt-6 flex items-center gap-3'>
                <input name='needReservation' id='needReservation' type='checkbox' className='w-4 h-4 border' onChange={onChangeHandler} checked={data.needReservation}/>
                <label htmlFor='needReservation' className='text-base'>Need Reservation</label>
            </div>

            {/* Reserved & Capacity */}
            <div className='mt-6 flex gap-4'>
                <div className='flex-1'>
                    <p className='text-xl'>Reserved</p>
                    <input name='reserved' onChange={onChangeHandler} value={data.reserved} className='w-full mt-4 px-4 py-3 border' type='number' min='0' placeholder='64'/>
                </div>
                <div className='flex-1'>
                    <p className='text-xl'>Capacity</p>
                    <input name='capacity' onChange={onChangeHandler} value={data.capacity} className='w-full mt-4 px-4 py-3 border' type='number' min='1' placeholder='120' required/>
                </div>
            </div>

            {/* Time */}
            <p className='text-xl mt-6'>Time</p>
            <input name='time' onChange={onChangeHandler} value={data.time} className='w-full sm:w-[500px] mt-4 px-4 py-3 border' type='text' placeholder='Tue, Jan 30, 5:00 PM → 8:00 PM' required/>

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