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
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const response = await axios.post('/api/auth', {
                action: 'register',
                name,
                email,
                password,
                residentialCollege
            })

            if (response.data.success) {
                localStorage.setItem('token', response.data.token)
                toast.success('🎉 Account created successfully! Welcome!', {
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
            toast.error('An error occurred during registration')
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <button
                        onClick={() => router.push('/')}
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
