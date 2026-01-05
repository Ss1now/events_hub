import React from 'react'
import { blog_data } from '@/assets/assets';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import Footer from '@/components/footer';
import Link from 'next/link';


const page = async ({ params }) => {
    const { id } = await params;
    
    const data = blog_data.find(item => item.id === Number(id));

    return (data?<>
        <div className ='bg-gray-200 py-5 px-5 md:px-12 lg:px-28'>
            <div className='flex justify-between items-center'>
            <Link href='/'>
            <Image src={assets.logo} width={180} alt='' className= 'w-[130px] sm:w-auto'/>
            </Link>
            <button className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black'>Get Started</button>
            </div>
            <div className='text-center my-24'>
                <h1 className='text-2xl sm:text-5xl font-semibold max-w-[700px] mx-auto'>{data.title}</h1>
                <p className='mt-1 pb-2 text-lg max-w-[740] mx-auto'>{data.author}</p>
            </div>
        </div>
        <div className='mx-5 max-2-[800px] md:mx-auto mt-[-100px] mb-10'>
            <Image className='border-4 border-white' src={data.image} width={500} height={500} alt=''/>
            <h1 className='my-8 text-[26px] font-semibold'>Introduction:</h1>
            <p>{data.description}</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id eleme</h3>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id eleme</h3>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id eleme</h3>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id eleme</h3>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <h3 className='my-5 text-[18px] font-semibold'>Step1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id eleme</h3>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
            <p className='my-3'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lorem dui, rhoncus id elementum sit amet, pellentesque et lectus. Nunc tempor venenatis elementum. Integer placerat enim vel diam varius convallis. Phasellus magna turpis, mollis eget lacus ac, pretium vulputate diam. Fusce volutpat fermentum mauris ut suscipit. Mauris sit amet sapien non felis rutrum imperdiet et eget massa. Fusce iaculis eleifend leo, vitae malesuada tortor consectetur et. Vivamus aliquam mattis orci, vel rhoncus velit hendrerit vel. Praesent pulvinar risus felis, a pulvinar quam mollis at. Duis tristique quam eu purus cursus semper.</p>
        </div>
        <Footer />
        </>:<></>
    )
}

export default page