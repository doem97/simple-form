'use client';

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// --- Data Types ---
interface BookingDetails {
    id: string;
    name: string;
    email: string;
    company?: string;
    timeSlot: string;
}

// --- Data & Configuration ---
// This should probably be shared between pages
const timeSlotsByDay: { [key: string]: string[] } = {
    '2024-06-25': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
    '2024-06-26': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
    '2024-06-27': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
};

const dayNames: { [key: string]: string } = {
    '2024-06-25': '6月25日 (周二)',
    '2024-06-26': '6月26日 (周三)',
    '2024-06-27': '6月27日 (周四)',
};

// --- Main Component ---
export default function EditBookingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // --- State Management ---
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // --- Effects ---
    useEffect(() => {
        if (!id) return;

        const fetchBookingDetails = async () => {
            try {
                const res = await fetch(`/api/bookings/${id}`);
                if (!res.ok) throw new Error('Could not fetch booking details.');
                const data: BookingDetails = await res.json();
                setBooking(data);
                setName(data.name);
                setEmail(data.email);
                setCompany(data.company || '');
                const [date, slotTime] = data.timeSlot.split(' ');
                const fullSlot = `${date} ${slotTime}`;
                setSelectedDate(date);
                setSelectedSlot(fullSlot);

                // Fetch booked slots, excluding the current one so it appears available
                const bookedSlotsRes = await fetch(`/api/bookings?excludeTimeSlot=${encodeURIComponent(data.timeSlot)}`);
                if (!bookedSlotsRes.ok) throw new Error('Could not fetch booked slots.');
                const bookedSlotsData: { timeSlot: string }[] = await bookedSlotsRes.json();
                setBookedSlots(bookedSlotsData.map(b => b.timeSlot));

            } catch (e: any) {
                setError(e.message || 'Failed to load booking information.');
            } finally {
                setIsFetching(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    // --- Event Handlers ---
    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setError('');
        setMessage('');
    };

    const handleSlotSelect = (slot: string) => {
        if (!selectedDate) return;
        const timeSlotId = `${selectedDate} ${slot}`;
        setSelectedSlot(timeSlotId);
        setError('');
        setMessage('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!name || !email || !selectedSlot) {
            setError('请完整填写信息并选择一个时间段。');
            return;
        }
        setIsLoading(true);
        const response = await fetch(`/api/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, timeSlot: selectedSlot }),
        });
        const result = await response.json();
        setIsLoading(false);
        if (response.ok) {
            setMessage('更新成功！');
            // maybe redirect or show a success message
        } else {
            setError(result.message || '更新失败，请刷新后重试。');
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Loading booking information...</p>
            </div>
        )
    }

    if (error && !isFetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600">Error</h2>
                    <p className="text-gray-600 mt-2">{error}</p>
                    <button onClick={() => router.push('/')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    // --- Render Logic ---
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-2xl">
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 md:p-10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">修改您的预订</h1>
                        <p className="mt-3 text-base text-gray-600">请更新您的信息，并可重新选择时间段</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* User Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">1. 您的信息</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">公司</label>
                                    <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">2. 选择时间</h2>
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">选择日期 *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.keys(timeSlotsByDay).map((day) => (
                                        <button type="button" key={day} onClick={() => handleDateSelect(day)}
                                            className={`p-3 rounded-lg font-medium text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        ${selectedDate === day
                                                    ? 'bg-indigo-600 text-white shadow-lg'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                                                }`}>
                                            {dayNames[day]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slot Selection */}
                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">选择时间段 *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {timeSlotsByDay[selectedDate].map((slot) => {
                                            const timeSlotId = `${selectedDate} ${slot}`;
                                            const isBooked = bookedSlots.includes(timeSlotId);
                                            const isSelected = selectedSlot === timeSlotId;
                                            return (
                                                <button type="button" key={timeSlotId} onClick={() => !isBooked && handleSlotSelect(slot)} disabled={isBooked}
                                                    className={`p-3 rounded-lg font-medium text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                            ${isBooked
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                                                            : isSelected
                                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                                                        }`}>
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- Messages & Submit --- */}
                        <div className="pt-6 border-t border-gray-200">
                            {error && <p className="text-red-700 bg-red-100 border border-red-200 p-3 rounded-md text-center text-sm mb-4">{error}</p>}
                            {message && <p className="text-green-700 bg-green-100 border border-green-200 p-3 rounded-md text-center text-sm mb-4">{message}</p>}
                            <button type="submit" disabled={isLoading || !selectedSlot}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg hover:shadow-indigo-500/40 disabled:shadow-none">
                                {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isLoading ? '正在处理...' : '确认修改'}
                            </button>
                        </div>
                    </form>
                </div>
                <footer className="text-center mt-8">
                    <a
                        href="https://www.distribrain.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Powered by
                        <Image src="/logo_gradient.svg" alt="Logo" width={95} height={100} />
                    </a>
                </footer>
            </main>
        </div>
    );
} 