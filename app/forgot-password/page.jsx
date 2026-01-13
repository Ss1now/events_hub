'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!email) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)
        
        try {
            const response = await axios.post('/api/reset-password', {
                action: 'request-reset',
                email
            })

            if (response.data.success) {
                setSubmitted(true)
                toast.success(response.data.msg)
                
                // In development, show the reset URL
                if (response.data.resetURL) {
                    console.log('Reset URL (dev only):', response.data.resetURL)
                    toast.info('Check console for reset link (development mode)', {
                        autoClose: 5000
                    })
                }
            } else {
                toast.error(response.data.msg)
            }
        } catch (error) {
            console.error(error)
            toast.error('Could not send reset email')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
                <div className='max-w-md w-full space-y-8'>
                    <div>
                        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                            Check Your Email
                        </h2>
                        <p className='mt-2 text-center text-sm text-gray-600'>
                            If an account exists with <span className='font-semibold'>{email}</span>, 
                            you will receive a password reset link shortly.
                        </p>
                    </div>
                    
                    <div className='rounded-md bg-blue-50 p-4'>
                        <div className='flex'>
                            <div className='flex-shrink-0'>
                                <svg className='h-5 w-5 text-blue-400' viewBox='0 0 20 20' fill='currentColor'>
                                    <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                                </svg>
                            </div>
                            <div className='ml-3 flex-1'>
                                <p className='text-sm text-blue-700'>
                                    The link will expire in 1 hour. Please check your spam folder if you don't see the email.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='text-center space-y-3'>
                        <button
                            onClick={() => {
                                setSubmitted(false)
                                setEmail('')
                            }}
                            className='text-sm font-medium text-purple-600 hover:text-purple-500'
                        >
                            Try a different email
                        </button>
                        <div>
                            <Link href='/login' className='text-sm font-medium text-gray-600 hover:text-gray-900'>
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        Forgot Your Password?
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-600'>
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>
                
                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    <div className='rounded-md shadow-sm'>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm'
                                placeholder='Email address'
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            {loading ? (
                                <span className='flex items-center'>
                                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </div>

                    <div className='text-center text-sm'>
                        <Link href='/login' className='font-medium text-purple-600 hover:text-purple-500'>
                            ← Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
