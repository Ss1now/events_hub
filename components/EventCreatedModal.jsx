'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import CohostInviteModal from './CohostInviteModal'

const EventCreatedModal = ({ isOpen, onClose, eventData }) => {
    const router = useRouter();
    const [showCohostModal, setShowCohostModal] = useState(false);

    if (!isOpen || !eventData) return null;

    const handleViewEvent = () => {
        router.push(`/blogs/${eventData._id}`);
        onClose();
    };

    const handleInviteCohost = () => {
        setShowCohostModal(true);
    };

    return (
        <>
            <div className='fixed inset-0 flex items-center justify-center z-50 p-4' style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
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
                        Event Created
                    </h2>

                    {/* Message */}
                    <p className='text-center text-gray-600 mb-6'>
                        Your event "{eventData.title}" is now live and ready for attendees!
                    </p>

                    {/* Event Details Preview */}
                    <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-100'>
                        <div className='space-y-2'>
                            <div className='flex items-start gap-2 text-sm'>
                                <svg className='w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                                <svg className='w-5 h-5 text-purple-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                </svg>
                                <p className='text-gray-900'>{eventData.location}</p>
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                                <svg className='w-5 h-5 text-purple-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
                                </svg>
                                <p className='text-gray-900'>{eventData.eventType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                        <button
                            onClick={handleViewEvent}
                            className='w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                            </svg>
                            View Event Details
                        </button>
                        <button
                            onClick={handleInviteCohost}
                            className='w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                            </svg>
                            Invite Co-host
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

            {/* Cohost Invite Modal */}
            <CohostInviteModal
                isOpen={showCohostModal}
                onClose={() => setShowCohostModal(false)}
                eventId={eventData._id}
                eventTitle={eventData.title}
            />
        </>
    )
}

export default EventCreatedModal
