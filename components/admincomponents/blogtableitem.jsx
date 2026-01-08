import React from 'react'

export default function Page({host, title, date,deleteBlog,mongoId}) {
    const BlogDate = new Date(date);
    return (
        <tr className='bg-white border-b'>
            <th scope='row' className='item-center gap-3 hidden sm:flex px-6 py-4 font-mediuem text-gray-900 whitespace-nowrap'>
                {host ? host : "N/A"}
            </th>
            <td className='py-6 py-4'>
                {title?title:"N/A"}
            </td>
            <td className='px-6 py-4'>
                {date ? BlogDate.toDateString() : "N/A"}
            </td>
            <td onClick={()=>deleteBlog(mongoId)}className='px-6 py-4 cursor-pointer'>
                x
            </td>
        </tr>
    )
}