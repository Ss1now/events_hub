'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to bloglist when accessing /admin
        router.push('/admin/bloglist');
    }, [router]);

    return (
        <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
            <p>Redirecting to admin panel...</p>
        </div>
    );
}

export default Page;
