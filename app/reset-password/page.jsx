'use client'

import React, { useState, useEffect, Suspense } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [email, setEmail] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link')
            setVerifying(false)
            return
        }

        // Verify token on load
        const verifyToken = async () => {
            try {
                const response = await axios.get(`/api/reset-password?token=${token}`)
                if (response.data.success) {
                    setTokenValid(true)
                    setEmail(response.data.email)
                } else {
                    toast.error(response.data.msg)
                    setTokenValid(false)
                }
            } catch (error) {
                console.error(error)
                toast.error('Invalid or expired reset link')
                setTokenValid(false)
            } finally {
                setVerifying(false)
            }
        }

        verifyToken()
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        
        try {
            const response = await axios.post('/api/reset-password', {
                action: 'reset-password',
                token,
                newPassword
            })

            if (response.data.success) {
                setSuccess(true)
                toast.success(response.data.msg)
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                toast.error(response.data.msg)
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <svg className='animate-spin h-10 w-10 text-purple-600 mx-auto' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    <p className='mt-4 text-gray-600'>Verifying reset link...</p>
                </div>
            </div>
        )
    }

    if (!tokenValid) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
                <div className='max-w-md w-full space-y-8 text-center'>
                    <div>
                        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                            <svg className='h-6 w-6 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </div>
                        <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
                            Invalid Reset Link
                        </h2>
                        <p className='mt-2 text-sm text-gray-600'>
                            This password reset link is invalid or has expired.
                        </p>
                    </div>
                    <div className='space-y-3'>
                        <Link 
                            href='/forgot-password'
                            className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                        >
                            Request New Reset Link
                        </Link>
                        <Link 
                            href='/login'
                            className='block text-sm font-medium text-gray-600 hover:text-gray-900'
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
                <div className='max-w-md w-full space-y-8 text-center'>
                    <div>
                        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
                            <svg className='h-6 w-6 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                        <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
                            Password Reset Successful!
                        </h2>
                        <p className='mt-2 text-sm text-gray-600'>
                            Your password has been updated. Redirecting to login...
                        </p>
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
                        Reset Your Password
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-600'>
                        Resetting password for <span className='font-semibold'>{email}</span>
                    </p>
                </div>
                
                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    <div className='rounded-md shadow-sm space-y-4'>
                        <div>
                            <label htmlFor='new-password' className='block text-sm font-medium text-gray-700 mb-1'>
                                New Password
                            </label>
                            <input
                                id='new-password'
                                name='new-password'
                                type='password'
                                autoComplete='new-password'
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm'
                                placeholder='Enter new password (min. 6 characters)'
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor='confirm-password' className='block text-sm font-medium text-gray-700 mb-1'>
                                Confirm Password
                            </label>
                            <input
                                id='confirm-password'
                                name='confirm-password'
                                type='password'
                                autoComplete='new-password'
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm'
                                placeholder='Confirm new password'
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
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <svg className='animate-spin h-10 w-10 text-purple-600 mx-auto' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    <p className='mt-4 text-gray-600'>Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
