import { connectDB } from "@/lib/config/db"
const { NextResponse } = require("next/server")
import {writeFile, mkdir} from 'fs/promises';
import Blogmodel from "@/lib/models/blogmodel";
import path from 'path';
const fs = require('fs');

const LoadDB = async () => {
    await connectDB();
}

LoadDB();

// API Endpoint to get all blogs
export async function GET(request){

    const blogId = request.nextUrl.searchParams.get("id")
    if (blogId){
        const blog = await Blogmodel.findById(blogId);
        return NextResponse.json(blog);
    }else{
        const blogs = await Blogmodel.find({});
        return NextResponse.json({blogs});
    }
}


// API Endpoint for uploading post
export async function POST(request){

    const formData=await request.formData();
    const timestamp=Date.now();
    const image=formData.get('image');
    
    let imgUrl = '';
    
    // Only process image if one was uploaded
    if (image && image.size > 0) {
        const imageByteData=await image.arrayBuffer();
        const buffer = Buffer.from(imageByteData);
        
        // Ensure directory exists
        const dir = './public/images/blogs';
        await mkdir(dir, { recursive: true });
        
        const filePath = `${dir}/${timestamp}_${image.name}`;
        await writeFile(filePath, buffer);
        imgUrl=`/images/blogs/${timestamp}_${image.name}`;
    }
   
    const blogData = {
        title: `${formData.get('title')}`,
        description: `${formData.get('description')}`,
        image: imgUrl,
        date: new Date(),
        startDateTime: new Date(formData.get('startDateTime')),
        endDateTime: new Date(formData.get('endDateTime')),
        status: `${formData.get('status')}`,
        eventType: `${formData.get('eventType')}`,
        theme: `${formData.get('theme')}`,
        dressCode: `${formData.get('dressCode')}`,
        location: `${formData.get('location')}`,
        needReservation: formData.get('needReservation') === 'true',
        reserved: parseInt(formData.get('reserved')) || 0,
        capacity: parseInt(formData.get('capacity')),
        host: `${formData.get('host')}`
    }

    await Blogmodel.create(blogData);
    console.log("Post Created");

    return NextResponse.json({success:true, msg:"Post Created Successfully"});
}


//API Endpoint for deleting post

export async function DELETE(request){
    const id = await request.nextUrl.searchParams.get('id');
    const blog = await Blogmodel.findById(id);
    fs.unlink(`./public${blog.image}`,()=>{});
    await Blogmodel.findByIdAndDelete(id);
    return NextResponse.json({msg:"Post Deleted"})
}