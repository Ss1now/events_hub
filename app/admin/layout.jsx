'use client'

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/components/admincomponents/sidebar";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Layout({children}){
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/api/user', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setUser(response.data.user);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
            <ToastContainer theme="dark" />
            <Sidebar/>
            <div className='flex flex-col flex-1'>
                <div className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm'> 
                    <div>
                        <h3 className='text-xl font-bold text-gray-900'>Admin Panel</h3>
                        <p className='text-sm text-gray-500'>Manage your events platform</p>
                    </div>
                    <div className='flex items-center gap-4'>
                        {user && (
                            <div className='flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg'>
                                <div className='text-right'>
                                    <p className='text-sm font-medium text-gray-900'>{user.name || 'Admin'}</p>
                                    <p className='text-xs text-gray-500'>{user.email}</p>
                                </div>
                                <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold'>
                                    {(user.name || user.email || 'A').charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
                {children}
            </div>
            </div>
        </>
    )

}