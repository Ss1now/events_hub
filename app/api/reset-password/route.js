import { NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import userModel from "@/lib/models/usermodel";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST - Request password reset (send reset link)
export async function POST(request) {
    try {
        await connectDB();
        const { action, email, token, newPassword } = await request.json();

        if (action === 'request-reset') {
            // Find user by email
            const user = await userModel.findOne({ email });
            
            if (!user) {
                // Don't reveal if email exists for security
                return NextResponse.json({ 
                    success: true, 
                    msg: 'If an account with that email exists, a password reset link has been sent.' 
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            
            // Set token and expiration (1 hour)
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // Create reset URL
            const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            // Send email with Resend
            if (resend) {
                try {
                    await resend.emails.send({
                        from: 'Rice Events <onboarding@resend.dev>', // Use your verified domain in production
                        to: email,
                        subject: 'Reset Your Password - Rice Events',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #7c3aed; margin: 0;">Rice Events</h1>
                                </div>
                                <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px;">
                                    <h2 style="color: #7c3aed; margin-top: 0;">Password Reset Request</h2>
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi there,</p>
                                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                                        You requested to reset your password for Rice Events. Click the button below to reset it:
                                    </p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${resetURL}" 
                                           style="display: inline-block; background-color: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </div>
                                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                        Or copy and paste this URL into your browser:
                                    </p>
                                    <p style="color: #7c3aed; font-size: 14px; word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
                                        ${resetURL}
                                    </p>
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                                            This link will expire in <strong>1 hour</strong>.<br>
                                            If you didn't request this, please ignore this email and your password will remain unchanged.
                                        </p>
                                    </div>
                                </div>
                                <div style="text-align: center; margin-top: 20px;">
                                    <p style="color: #9ca3af; font-size: 12px;">
                                        © 2026 Rice Events. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        `
                    });
                    console.log('Password reset email sent to:', email);
                } catch (emailError) {
                    console.error('Failed to send email:', emailError);
                    // Still return success to not reveal if email exists
                }
            } else {
                // Development mode - log URL to console
                console.log('Password reset URL:', resetURL);
            }

            return NextResponse.json({ 
                success: true, 
                msg: 'Password reset link has been sent to your email.',
                // Remove resetURL in production - only for development
                resetURL: process.env.NODE_ENV === 'development' ? resetURL : undefined
            });
        }

        if (action === 'reset-password') {
            // Hash the token from URL
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            
            // Find user with valid token that hasn't expired
            const user = await userModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return NextResponse.json({ 
                    success: false, 
                    msg: 'Invalid or expired reset token.' 
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password and clear reset token
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return NextResponse.json({ 
                success: true, 
                msg: 'Password has been reset successfully! You can now login with your new password.' 
            });
        }

        return NextResponse.json({ success: false, msg: 'Invalid action' });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'An error occurred. Please try again later.' 
        });
    }
}

// GET - Verify reset token
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ success: false, msg: 'Token is required' });
        }

        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with valid token
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                msg: 'Invalid or expired reset token.' 
            });
        }

        return NextResponse.json({ 
            success: true, 
            msg: 'Token is valid',
            email: user.email
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ 
            success: false, 
            msg: 'An error occurred verifying the token.' 
        });
    }
}
