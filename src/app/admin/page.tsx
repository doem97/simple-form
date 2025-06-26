'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Login from './Login'; // The login component we just created

interface BookingDetails {
    id: string;
    name: string;
    email: string;
    company?: string;
    timeSlot: string;
}

function AdminDashboard() {
    const [bookings, setBookings] = useState<BookingDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/bookings');
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await response.json();
            setBookings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDelete = async (bookingId: string, timeSlot: string) => {
        if (!confirm(`确定要删除 ${timeSlot} 这个时间段的预订吗?`)) {
            return;
        }

        try {
            const response = await fetch('/api/bookings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bookingId }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete booking');
            }

            alert('删除成功！');
            fetchBookings();
        } catch (err: any) {
            setError(err.message);
            alert(`删除失败: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">预订管理后台</h1>
                        <p className="mt-2 text-sm text-gray-600">在这里您可以查看和删除已有的预订。</p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin' })}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        登出
                    </button>
                </header>

                {isLoading && <p className="text-center text-gray-500">正在加载预订信息...</p>}
                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg">{`加载出错: ${error}`}</p>}

                {!isLoading && !error && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <ul role="list" className="divide-y divide-gray-200">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <li key={booking.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-primary">{booking.timeSlot}</p>
                                            <p className="mt-1 text-sm text-gray-800 truncate">{`姓名: ${booking.name}`}</p>
                                            <p className="mt-1 text-sm text-gray-500 truncate">{`邮箱: ${booking.email}`}</p>
                                            {booking.company && <p className="mt-1 text-sm text-gray-500 truncate">{`公司: ${booking.company}`}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(booking.id, booking.timeSlot)}
                                            className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                                            删除
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-8 text-center text-gray-500">
                                    当前没有预订信息。
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function AdminPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p className="text-center mt-20">正在加载会话...</p>;
    }

    if (session) {
        return <AdminDashboard />;
    }

    return <Login />;
} 