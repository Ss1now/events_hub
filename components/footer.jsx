'use client'
import React, { useState } from 'react';
import { assets } from '../assets/assets';
import Image from 'next/image';
import FeedbackModal from './FeedbackModal';

const Footer = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    return (
        <>
            <div className='bg-white border-t border-gray-200 py-8 mt-12'>
                <div className='max-w-6xl mx-auto px-5 flex justify-between items-center flex-col sm:flex-row gap-4'>
                    <div className='flex items-center gap-3'>
                        <Image src={assets.logo} width={40} height={40} alt='Rice Party Logo' className='w-10 h-10 object-contain'/>
                        <h3 className='font-semibold text-sm'>Rice Events</h3>
                    </div>
                    <button 
                        onClick={() => setShowFeedbackModal(true)}
                        className='text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors'
                    >
                        Feedback
                    </button>
                </div>
            </div>
            
            <FeedbackModal 
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
            />
        </>
    )
}

export default Footer