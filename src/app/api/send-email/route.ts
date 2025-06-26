import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { BookingConfirmationEmail } from '@/components/BookingConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { name, email, timeSlot, editUrl, company } = await request.json();

        if (!name || !email || !timeSlot || !editUrl) {
            return NextResponse.json({ message: 'Missing required fields for email' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'DistriBrain - Booking Confirmation <noreply@distribrain.com>',
            to: [email],
            subject: '您的专属时间预订成功！',
            react: BookingConfirmationEmail({ name, email, timeSlot, editUrl, company }),
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ message: 'Error sending email', error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Email sent successfully', data });
    } catch (error) {
        console.error('Error in send-email route:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
} 