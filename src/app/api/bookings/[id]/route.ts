import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const BOOKING_ID_PREFIX = 'booking:';
const BOOKED_SLOTS_KEY = 'booked-time-slots';
const SLOT_TO_ID_MAP_KEY = 'slot-to-id-map';

interface BookingDetails {
    id: string;
    name: string;
    email: string;
    company?: string;
    timeSlot: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    try {
        const bookingDetailsKey = `${BOOKING_ID_PREFIX}${id}`;
        const booking = await redis.get<BookingDetails>(bookingDetailsKey);

        if (!booking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error(`Error fetching booking ${id}:`, error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    try {
        const updatedBookingData: Partial<BookingDetails> = await request.json();
        const { timeSlot: newTimeSlot } = updatedBookingData;

        const bookingDetailsKey = `${BOOKING_ID_PREFIX}${id}`;
        const oldBooking = await redis.get<BookingDetails>(bookingDetailsKey);

        if (!oldBooking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        const finalBooking = { ...oldBooking, ...updatedBookingData, id };

        const transaction = redis.multi();

        // If time slot has changed, we need to update the indexes
        if (newTimeSlot && newTimeSlot !== oldBooking.timeSlot) {
            // Check if the new time slot is available
            const isNewSlotBooked = await redis.sismember(BOOKED_SLOTS_KEY, newTimeSlot);
            if (isNewSlotBooked) {
                return NextResponse.json({ message: 'The new time slot is already booked' }, { status: 409 });
            }
            // Free up the old slot
            transaction.srem(BOOKED_SLOTS_KEY, oldBooking.timeSlot);
            transaction.hdel(SLOT_TO_ID_MAP_KEY, oldBooking.timeSlot);
            // Book the new slot
            transaction.sadd(BOOKED_SLOTS_KEY, newTimeSlot);
            transaction.hset(SLOT_TO_ID_MAP_KEY, { [newTimeSlot]: id });
        }

        // Update booking details
        transaction.set(bookingDetailsKey, JSON.stringify(finalBooking));

        await transaction.exec();

        return NextResponse.json(finalBooking);
    } catch (error) {
        console.error(`Error updating booking ${id}:`, error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
} 