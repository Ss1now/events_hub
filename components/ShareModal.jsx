'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

const ShareModal = ({ isOpen, onClose, eventData }) => {
    const [copied, setCopied] = useState(false)

    if (!eventData) return null

    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const eventTitle = eventData.title || 'Check out this event!'
    const eventDescription = eventData.description || ''

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy link')
        }
    }

    const shareToInstagram = () => {
        // Instagram doesn't support direct web sharing, so we'll copy the link and notify user
        copyToClipboard()
        toast.info('Link copied - open Instagram to share')
    }

    const shareToMessages = () => {
        // SMS sharing with pre-filled text
        const text = `Check out "${eventTitle}" on Rice Party: ${shareUrl}`
        window.location.href = `sms:?&body=${encodeURIComponent(text)}`
    }

    const shareToWhatsApp = () => {
        const text = `Check out "${eventTitle}" on Rice Party: ${shareUrl}`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const shareToEmail = () => {
        const subject = `Check out this event: ${eventTitle}`
        const body = `I thought you might be interested in this event:\n\n${eventTitle}\n${eventDescription}\n\nView event: ${shareUrl}`
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }

    const shareToMessenger = () => {
        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
    }

    const shareToLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
    }

    const shareOptions = [
        {
            name: 'Copy Link',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                </svg>
            ),
            onClick: copyToClipboard,
            color: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        },
        {
            name: 'WhatsApp',
            icon: (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
                </svg>
            ),
            onClick: shareToWhatsApp,
            color: 'bg-green-500 hover:bg-green-600 text-white'
        },
        {
            name: 'Instagram',
            icon: (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                </svg>
            ),
            onClick: shareToInstagram,
            color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white'
        },
        {
            name: 'Messages',
            icon: (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z'/>
                </svg>
            ),
            onClick: shareToMessages,
            color: 'bg-sky-500 hover:bg-sky-600 text-white'
        },
        {
            name: 'Email',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
            ),
            onClick: shareToEmail,
            color: 'bg-red-500 hover:bg-red-600 text-white'
        },
        {
            name: 'LinkedIn',
            icon: (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/>
                </svg>
            ),
            onClick: shareToLinkedIn,
            color: 'bg-[#001840] hover:bg-[#000f2d] text-white'
        }
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className='fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className='bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto'
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl sm:rounded-t-2xl'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-xl font-bold text-gray-900'>Share Event</h3>
                                <button
                                    onClick={onClose}
                                    className='text-gray-400 hover:text-gray-600 transition-colors'
                                >
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>
                            <p className='text-sm text-gray-500 mt-1'>Share this event with your friends</p>
                        </div>

                        {/* Event Preview */}
                        <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
                            <div className='flex gap-3'>
                                {eventData.images && eventData.images[0] && (
                                    <img 
                                        src={eventData.images[0]} 
                                        alt={eventTitle}
                                        className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
                                    />
                                )}
                                <div className='flex-1 min-w-0'>
                                    <h4 className='font-semibold text-gray-900 truncate'>{eventTitle}</h4>
                                    <p className='text-sm text-gray-500 line-clamp-2 mt-1'>{eventDescription}</p>
                                </div>
                            </div>
                        </div>

                        {/* Share Options */}
                        <div className='px-6 py-6'>
                            <div className='grid grid-cols-3 gap-4'>
                                {shareOptions.map((option, index) => (
                                    <motion.button
                                        key={option.name}
                                        onClick={option.onClick}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${option.color} ${
                                            option.name === 'Copy Link' && copied ? 'ring-2 ring-green-500' : ''
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className='mb-2'>
                                            {option.name === 'Copy Link' && copied ? (
                                                <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                                </svg>
                                            ) : (
                                                option.icon
                                            )}
                                        </div>
                                        <span className='text-xs font-medium text-center'>
                                            {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Link Display */}
                        <div className='px-6 pb-6'>
                            <div className='bg-gray-100 rounded-xl p-4 flex items-center gap-3'>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm text-gray-600 font-mono truncate'>{shareUrl}</p>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className='flex-shrink-0 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors'
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ShareModal
