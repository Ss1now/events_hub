'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [residentialCollege, setResidentialCollege] = useState('')
    const [emailConsent, setEmailConsent] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!emailConsent) {
            toast.error('Please agree to email notifications to continue')
            return
        }
        
        try {
            const response = await axios.post('/api/auth', {
                action: 'register',
                name,
                email,
                password,
                residentialCollege,
                emailConsent
            })

            if (response.data.success) {
                localStorage.setItem('token', response.data.token)
                toast.success('Account created', {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                })
                
                // Redirect to main page after a brief delay
                setTimeout(() => {
                    window.location.href = '/'
                }, 1500)
            } else {
                toast.error(response.data.msg)
            }
        } catch (error) {
            console.error(error)
            toast.error('Registration failed')
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <button
                        onClick={() => router.back()}
                        className='mb-4 text-gray-600 hover:text-black flex items-center gap-2 transition-colors'
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                        </svg>
                        Go Back
                    </button>
                    <h2 className='mt-6 text-center text-3xl font-bold text-gray-900'>
                        Create your account
                    </h2>
                    <div className='mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                        <div className='flex'>
                            <div className='flex-shrink-0'>
                                <svg className='h-5 w-5 text-yellow-400' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                                    <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                </svg>
                            </div>
                            <div className='ml-3'>
                                <p className='text-sm text-yellow-700'>
                                    <strong>Note:</strong> We recommend using a personal email (gmail, outlook, etc.) instead of your rice.edu email. 
                                    Email notifications may not be delivered to rice.edu addresses while we work on fixing this issue.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    <div className='rounded-md shadow-sm -space-y-px'>
                        <div>
                            <label htmlFor='email-address' className='sr-only'>
                                Email address
                            </label>
                            <input
                                id='email-address'
                                name='email'
                                type='email'
                                autoComplete='email'
                                required
                                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
                                placeholder='Email address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor='password' className='sr-only'>
                                Password
                            </label>
                            <input
                                id='password'
                                name='password'
                                type='password'
                                autoComplete='new-password'
                                required
                                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
                                placeholder='Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor='residential-college' className='sr-only'>
                                Residential College
                            </label>
                            <select
                                id='residential-college'
                                name='residential-college'
                                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm'
                                value={residentialCollege}
                                onChange={(e) => setResidentialCollege(e.target.value)}
                            >
                                <option value=''>Select your residential college (optional)</option>
                                <option value='Baker College'>Baker College</option>
                                <option value='Brown College'>Brown College</option>
                                <option value='Duncan College'>Duncan College</option>
                                <option value='Hanszen College'>Hanszen College</option>
                                <option value='Jones College'>Jones College</option>
                                <option value='Lovett College'>Lovett College</option>
                                <option value='Martel College'>Martel College</option>
                                <option value='McMurtry College'>McMurtry College</option>
                                <option value='Sid Richardson College'>Sid Richardson College</option>
                                <option value='Wiess College'>Wiess College</option>
                                <option value='Will Rice College'>Will Rice College</option>
                                <option value='Others'>Others</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex items-start space-x-2'>
                        <input
                            id='email-consent'
                            type='checkbox'
                            checked={emailConsent}
                            onChange={(e) => setEmailConsent(e.target.checked)}
                            className='mt-0.5 h-4 w-4 text-[#00205B] focus:ring-[#00205B] border-gray-300 rounded cursor-pointer'
                        />
                        <label htmlFor='email-consent' className='text-xs text-gray-600 cursor-pointer'>
                            I consent to receive email notifications including event reminders, event updates, and platform announcements.
                        </label>
                    </div>

                    <div>
                        <button
                            type='submit'
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                        >
                            Register
                        </button>
                    </div>

                    <div className='text-center'>
                        <p className='text-sm text-gray-600'>
                            Already have an account?{' '}
                            <Link href='/login' className='font-medium text-black hover:underline'>
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
