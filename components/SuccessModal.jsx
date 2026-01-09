'use client'
import React from 'react'

const SuccessModal = ({ isOpen, onClose, eventData, actionType }) => {
    if (!isOpen || !eventData) return null;

    const handleAddToCalendar = () => {
        // Create iCalendar format
        const event = eventData;
        
        // Format dates for iCal (YYYYMMDDTHHMMSS)
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = formatDate(event.startDateTime);
        const endDate = formatDate(event.endDateTime);
        const now = formatDate(new Date());

        // Create iCal content
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rice Party//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event._id}@riceparty.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nEvent Type: ${event.eventType}\\nTheme: ${event.theme}\\nDress Code: ${event.dressCode}\\nHosted by: ${event.host}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

        // Create blob and download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddToGoogleCalendar = () => {
        const event = eventData;
        
        // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
        const formatGoogleDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = formatGoogleDate(event.startDateTime);
        const endDate = formatGoogleDate(event.endDateTime);
        
        // Build description
        const description = `${event.description}\n\nEvent Type: ${event.eventType}\nTheme: ${event.theme}\nDress Code: ${event.dressCode}\nHosted by: ${event.host}`;
        
        // Create Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(event.location)}`;
        
        // Open in new window
        window.open(googleCalendarUrl, '_blank');
    };

    const isReservation = actionType === 'reserve';

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn'>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
                >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>

                {/* Success Icon */}
                <div className='flex justify-center mb-6'>
                    <div className='bg-green-100 rounded-full p-4'>
                        <svg className='w-16 h-16 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className='text-2xl font-bold text-center text-gray-900 mb-2'>
                    {isReservation ? 'Reservation Confirmed!' : 'You\'re Going!'}
                </h2>

                {/* Message */}
                <p className='text-center text-gray-600 mb-6'>
                    {isReservation 
                        ? `You've successfully reserved a spot for "${eventData.title}"`
                        : `You've marked interest in "${eventData.title}"`
                    }
                </p>

                {/* Event Details */}
                <div className='bg-gray-50 rounded-lg p-4 mb-6 space-y-2'>
                    <div className='flex items-start gap-2 text-sm'>
                        <svg className='w-5 h-5 text-gray-500 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        <div>
                            <p className='font-medium text-gray-900'>
                                {new Date(eventData.startDateTime).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                            <p className='text-gray-600'>
                                {new Date(eventData.startDateTime).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                })} - {new Date(eventData.endDateTime).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                })}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        <p className='text-gray-900'>{eventData.location}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-3'>
                    <button
                        onClick={handleAddToGoogleCalendar}
                        className='w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
                    >
                        <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M19.5 8.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5m15 0V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m15 0h-15' />
                        </svg>
                        Add to Google Calendar
                    </button>
                    <button
                        onClick={handleAddToCalendar}
                        className='w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2'
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        Download Calendar File (.ics)
                    </button>
                    <button
                        onClick={onClose}
                        className='w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                    >
                        Done
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default SuccessModal
