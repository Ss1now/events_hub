'use client'
import React, { useState } from 'react';
import { assets } from '../assets/assets';
import Image from 'next/image';
import FeedbackModal from './FeedbackModal';

const Footer = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    return (
        <>
            <div className='bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-t border-purple-500/20 py-8 mt-12'>
                <div className='max-w-6xl mx-auto px-5 flex justify-between items-center flex-col sm:flex-row gap-4'>
                    <div className='flex items-center gap-3'>
                        <Image src={assets.logo} width={40} height={40} alt='Rice Party Logo' className='w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'/>
                        <h3 className='font-semibold text-sm text-white'>Rice Parties</h3>
                    </div>
                    <button 
                        onClick={() => setShowFeedbackModal(true)}
                        className='text-sm text-orange-400 hover:text-orange-300 font-medium hover:underline transition-colors'
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