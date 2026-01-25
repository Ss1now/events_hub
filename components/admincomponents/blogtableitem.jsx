import React from 'react'

export default function BlogTableItem({host, title, date, status, deleteBlog, mongoId, isSelected, toggleSelect, eventCategory, onMakeOfficial, onTransferOwnership}) {
    const BlogDate = new Date(date);
    
    const getStatusBadge = (status) => {
        const badges = {
            live: 'bg-green-100 text-green-800 border-green-200',
            future: 'bg-orange-100 text-orange-800 border-orange-200',
            past: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        
        const labels = {
            live: 'Live',
            future: 'Upcoming',
            past: 'Past'
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status] || badges.past}`}>
                {labels[status] || status}
            </span>
        );
    };
    
    const isOfficial = eventCategory === 'residential_college' || eventCategory === 'university';
    
    return (
        <tr className='hover:bg-gray-50 transition-colors'>
            <td className='px-6 py-4'>
                <input 
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => toggleSelect(mongoId)}
                    className='w-4 h-4 text-[#00205B] rounded focus:ring-2 focus:ring-blue-500'
                />
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-medium text-gray-900'>
                    {host ? host : "N/A"}
                </div>
            </td>
            <td className='px-6 py-4'>
                <div className='flex items-center gap-2'>
                    <div className='text-sm text-gray-900 font-medium max-w-md truncate'>
                        {title ? title : "N/A"}
                    </div>
                    {isOfficial && (
                        <span className='bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0'>
                            Official
                        </span>
                    )}
                </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                {getStatusBadge(status)}
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-900'>
                    {date ? BlogDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    }) : "N/A"}
                </div>
                <div className='text-xs text-gray-500'>
                    {date ? BlogDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit'
                    }) : ""}
                </div>
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => onMakeOfficial(mongoId, eventCategory)}
                        className={`${isOfficial ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'} p-2 rounded-lg transition-colors inline-flex items-center gap-1`}
                        title={isOfficial ? 'Remove Official Status' : 'Make Official Event'}
                    >
                        <svg className='w-5 h-5' fill={isOfficial ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </button>
                    <button
                        onClick={() => onTransferOwnership(mongoId, host)}
                        className='text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1'
                        title='Transfer Ownership'
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                        </svg>
                    </button>
                    <button
                        onClick={() => deleteBlog(mongoId)}
                        className='text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1'
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    )
}