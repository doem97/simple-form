import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Initialize Redis client from environment variables
const redis = Redis.fromEnv();

interface BookingDetails {
    id: string;
    name: string;
    email: string;
    company?: string;
    timeSlot: string;
}

// The key for the Redis Set that stores all booked time slots
const BOOKED_SLOTS_KEY = 'booked-time-slots';

// A prefix for keys that store booking details by ID
const BOOKING_ID_PREFIX = 'booking:';

// A key for the Redis Hash that maps time slots to booking IDs
const SLOT_TO_ID_MAP_KEY = 'slot-to-id-map';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const excludeTimeSlot = searchParams.get('excludeTimeSlot');

    try {
        // Fetch all members from the 'booked-time-slots' set
        let bookedSlots = await redis.smembers(BOOKED_SLOTS_KEY);

        if (excludeTimeSlot) {
            bookedSlots = bookedSlots.filter(slot => slot !== excludeTimeSlot);
        }

        if (bookedSlots.length === 0) {
            return NextResponse.json([]);
        }

        const slotToIdMap = await redis.hgetall<Record<string, string>>(SLOT_TO_ID_MAP_KEY);

        if (!slotToIdMap) {
            console.error("FATAL: `slot-to-id-map` hash does not exist in Redis, but `booked-time-slots` set does. Data is inconsistent.");
            return NextResponse.json([]);
        }

        const bookingIds = bookedSlots
            .map(slot => slotToIdMap[slot])
            .filter(id => id); // Filter out any falsy values (null, undefined)

        if (bookingIds.length === 0) {
            // This can happen if the slots exist in the set but not in the map.
            // It's an inconsistent state, but we should handle it gracefully.
            return NextResponse.json([]);
        }

        // Create keys to fetch all booking details
        const validBookingIds = bookingIds.map(id => `${BOOKING_ID_PREFIX}${id}`);

        if (validBookingIds.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch all booking details in one go
        const bookingDetailsJson = await redis.mget<BookingDetails[]>(...validBookingIds);

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
        const newBookingRequest: Omit<BookingDetails, 'id'> = await request.json();

        if (!newBookingRequest.name || !newBookingRequest.email || !newBookingRequest.timeSlot) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const { timeSlot } = newBookingRequest;

        const isMember = await redis.sismember(BOOKED_SLOTS_KEY, timeSlot);

        if (isMember) {
            return NextResponse.json({ message: 'This time slot is already booked' }, { status: 409 });
        }

        const bookingId = randomUUID();
        const newBooking: BookingDetails = { id: bookingId, ...newBookingRequest };
        const bookingDetailsKey = `${BOOKING_ID_PREFIX}${bookingId}`;

        const transaction = redis.multi();
        transaction.sadd(BOOKED_SLOTS_KEY, timeSlot);
        transaction.hset(SLOT_TO_ID_MAP_KEY, { [timeSlot]: bookingId });
        transaction.set(bookingDetailsKey, JSON.stringify(newBooking));

        await transaction.exec();

        // Fire-and-forget call to send email
        const origin = request.headers.get('origin');
        if (origin) {
            fetch(`${origin}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBooking,
                    editUrl: `${origin}/edit-booking/${bookingId}`,
                }),
            }).catch(emailError => {
                // Log the error but don't block the response
                console.error('Failed to send confirmation email:', emailError);
            });
        }

        return NextResponse.json(newBooking, { status: 201 });
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
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
        }

        const bookingDetailsKey = `${BOOKING_ID_PREFIX}${id}`;
        const booking: BookingDetails | null = await redis.get(bookingDetailsKey);

        if (!booking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        // Use a transaction to remove the slot from the set and delete the details
        const transaction = redis.multi();
        transaction.srem(BOOKED_SLOTS_KEY, booking.timeSlot); // Remove from set
        transaction.hdel(SLOT_TO_ID_MAP_KEY, booking.timeSlot); // Remove from map
        transaction.del(bookingDetailsKey); // Delete the details 

        await transaction.exec();

        return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
} 