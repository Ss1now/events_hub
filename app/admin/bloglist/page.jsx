'use client'

import React from 'react'
import BlogTableItem from '@/components/admincomponents/blogtableitem';

export default function Page() {
    return (
        <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16'>
            <h1>All Posts</h1>
            <div className='relative h-[80vh] max-w-[850px] overflow-x-auto mt-4 border border-gray-400'>
                <table className='w-full text-sm text-gray-500'>
                    <thead className='text-sm text-gray-700 text-left uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Your Name
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Title
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Date
                            </th>
                            <th scope='col' className= 'hidden sm:block px6 py-3'>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <BlogTableItem />
                    </tbody>

                </table>

            </div>

        </div>
    )
}