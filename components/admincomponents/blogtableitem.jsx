import React from 'react'

export default function Page({host, title, date}) {
    return (
        <tr className='bg-white border-b'>
            <th scope='row' className='item-center gap-3 hidden sm:flex px-6 py-4 font-mediuem text-gray-900 whitespace-nowrap'>
                {host}
            </th>
            <td className='py-6 py-4'>
                {title?title:"N/A"}
            </td>
            <td className='px-6 py-4'>
                {date}
            </td>
            <td className='px-6 py-4'>
                x
            </td>
        </tr>
    )
}