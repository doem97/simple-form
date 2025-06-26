import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Initialize Redis client from environment variables
const redis = Redis.fromEnv();

interface BookingDetails {
    name: string;
    email: string;
    company?: string;
    timeSlot: string;
}

// The key for the Redis Set that stores all booked time slots
const BOOKED_SLOTS_KEY = 'booked-time-slots';

// A prefix for keys that store booking details
const BOOKING_DETAILS_PREFIX = 'booking:';

export async function GET() {
    try {
        // Fetch all members from the 'booked-time-slots' set
        const bookedSlots = await redis.smembers(BOOKED_SLOTS_KEY);
        if (bookedSlots.length === 0) {
            return NextResponse.json([]);
        }

        // Create keys to fetch all booking details
        const detailKeys = bookedSlots.map(slot => `${BOOKING_DETAILS_PREFIX}${slot}`);

        // Fetch all booking details in one go
        const bookingDetailsJson = await redis.mget<BookingDetails[]>(...detailKeys);

        // Filter out any null results and return
        const bookingDetails = bookingDetailsJson.filter(details => details !== null);

        return NextResponse.json(bookingDetails);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newBooking: BookingDetails = await request.json();

        if (!newBooking.name || !newBooking.email || !newBooking.timeSlot) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const { timeSlot } = newBooking;
        const bookingDetailsKey = `${BOOKING_DETAILS_PREFIX}${timeSlot}`;

        // Use a transaction to ensure atomicity
        const transaction = redis.multi();

        // Check if the slot is already in the set
        transaction.sismember(BOOKED_SLOTS_KEY, timeSlot);

        const [isMember] = await transaction.exec() as [number];

        if (isMember) {
            return NextResponse.json({ message: 'This time slot is already booked' }, { status: 409 });
        }

        // If not booked, add it to the set and save the details
        const finalTransaction = redis.multi();
        finalTransaction.sadd(BOOKED_SLOTS_KEY, timeSlot);
        finalTransaction.set(bookingDetailsKey, JSON.stringify(newBooking));

        await finalTransaction.exec();

        return NextResponse.json({ message: 'Booking successful!' }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { timeSlot } = await request.json();

        if (!timeSlot) {
            return NextResponse.json({ message: 'Time slot is required' }, { status: 400 });
        }

        const bookingDetailsKey = `${BOOKING_DETAILS_PREFIX}${timeSlot}`;

        // Use a transaction to remove the slot from the set and delete the details
        const transaction = redis.multi();
        transaction.srem(BOOKED_SLOTS_KEY, timeSlot); // Remove from set
        transaction.del(bookingDetailsKey); // Delete the details hash

        await transaction.exec();

        return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
} 