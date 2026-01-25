'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PageToggle = () => {
    const pathname = usePathname();
    const isClubEvents = pathname === '/clubevents';

    return (
        <div className='max-w-md mx-auto px-4 sm:px-5 mb-6 md:mb-8'>
            <div className='bg-gray-800/50 backdrop-blur-sm p-1 rounded-full flex border-2 border-purple-500/30 shadow-[0_0_20px_rgba(176,38,255,0.3)]'>
                <Link 
                    href='/'
                    className={`flex-1 py-2.5 px-6 rounded-full font-medium text-center transition-all text-sm ${
                        !isClubEvents 
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_0_20px_rgba(255,0,128,0.6)]' 
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    🎉 Parties
                </Link>
                <Link 
                    href='/clubevents'
                    className={`flex-1 py-2.5 px-6 rounded-full font-medium text-center transition-all text-sm ${
                        isClubEvents 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.6)]' 
                            : 'text-gray-300 hover:text-white'
                    }`}
                >
                    🎯 Club Events
                </Link>
            </div>
        </div>
    );
};

export default PageToggle;
