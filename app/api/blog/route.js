import { connectDB } from "@/lib/config/db"
const { NextResponse } = require("next/server")
import {writeFile} from 'fs/promises';

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

export async function GET(request){
    
    return NextResponse.json({msg: "API is working"})
}

export async function POST(request){

    const formData=await request.formData();
    const timestamp=Date.now();
    const image=formData.get('image');
    const imageByteData=await image.arrayBuffer();
    const buffer = Buffer.from(imageByteData);
    const path = `./public/images/blogs/${timestamp}-${image.name}`;
    await writeFile(path, buffer);
    const imgUrl=`/images/blogs/${timestamp}_${image.name}`;
   
    const blogData = {
        title: `${formData.get('title')}`,
        description: `${formData.get('description')}`,
        image: imgUrl,
        date: new Date(),
        eventDate: {
            month: `${formData.get('month')}`,
            day: parseInt(formData.get('day'))
        },
        status: `${formData.get('status')}`,
        eventType: `${formData.get('eventType')}`,
        theme: `${formData.get('theme')}`,
        dressCode: `${formData.get('dressCode')}`,
        location: `${formData.get('location')}`,
        needReservation: formData.get('needReservation') === 'true',
        reserved: parseInt(formData.get('reserved')) || 0,
        capacity: parseInt(formData.get('capacity')),
        time: `${formData.get('time')}`,
        host: `${formData.get('host')}`,
        hostUsername: `${formData.get('hostUsername')}`
    }

    return NextResponse.json({imgUrl})
}
