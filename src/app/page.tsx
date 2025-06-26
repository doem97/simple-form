'use client';

import { useState, useEffect, Fragment } from 'react';
import Image from 'next/image';

// --- Data Types ---
interface BookingDetails {
  name: string;
  email: string;
  company?: string;
  timeSlot: string;
}

// --- Data & Configuration ---
const timeSlotsByDay: { [key: string]: string[] } = {
  '2024-06-25': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
  '2024-06-26': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
  '2024-06-27': ['09:00-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-16:30', '16:30-18:00'],
  // Future dates can be added here. The UI will adapt.
};

const dayNames: { [key: string]: string } = {
  '2024-06-25': '6月25日 (周二)',
  '2024-06-26': '6月26日 (周三)',
  '2024-06-27': '6月27日 (周四)',
};

// --- Main Component ---
export default function Home() {
  // --- State Management ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data: BookingDetails[]) => {
        // We now receive an array of objects, so we need to extract the timeSlot string
        const slots = data.map(booking => booking.timeSlot);
        setBookedSlots(slots);
      });
  }, []);

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
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, timeSlot: selectedSlot }),
    });
    const result = await response.json();
    setIsLoading(false);
    if (response.ok) {
      setMessage('预订成功！我们期待与您见面。');
      setBookedSlots([...bookedSlots, selectedSlot]);
      setSelectedSlot(null);
      setSelectedDate(null);
      setName('');
      setEmail('');
      setCompany('');
    } else {
      setError(result.message || '预订失败，请刷新后重试。');
    }
  };

  // --- Render Logic ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 border border-white/20">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">预约您的专属时间</h1>
            <p className="mt-3 text-base text-white/80">请填写以下信息，并选择一个方便的时间段</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">1. 您的信息</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">姓名 *</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 transition-shadow" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">邮箱 *</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 transition-shadow" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="company" className="block text-sm font-medium text-white/80 mb-1">公司</label>
                  <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/70 border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 transition-shadow" />
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">2. 选择时间</h2>
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">选择日期 *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(timeSlotsByDay).map((day) => (
                    <button type="button" key={day} onClick={() => handleDateSelect(day)}
                      className={`p-3 rounded-lg font-medium text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80 backdrop-blur-md
                        ${selectedDate === day
                          ? 'bg-white text-violet-600 shadow-lg'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}>
                      {dayNames[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 mt-4">选择时间段 *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlotsByDay[selectedDate].map((slot) => {
                      const timeSlotId = `${selectedDate} ${slot}`;
                      const isBooked = bookedSlots.includes(timeSlotId);
                      const isSelected = selectedSlot === timeSlotId;
                      return (
                        <button type="button" key={timeSlotId} onClick={() => !isBooked && handleSlotSelect(slot)} disabled={isBooked}
                          className={`p-3 rounded-lg font-medium text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80 backdrop-blur-md
                            ${isBooked
                              ? 'bg-black/20 text-white/40 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-white text-violet-600 shadow-lg'
                                : 'bg-white/20 hover:bg-white/30 text-white'
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
            <div className="pt-6 border-t border-white/30">
              {error && <p className="text-red-300 bg-red-900/50 p-2 rounded-md text-center text-sm mb-4">{error}</p>}
              {message && <p className="text-green-300 bg-green-900/50 p-2 rounded-md text-center text-sm mb-4">{message}</p>}
              <button type="submit" disabled={isLoading || !selectedSlot}
                className="w-full bg-white hover:bg-gray-100 text-violet-600 font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-white/40 disabled:text-white/70 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-lg hover:shadow-white/40 disabled:shadow-none">
                {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isLoading ? '正在处理...' : '确认预订'}
              </button>
            </div>
          </form>
        </div>
        <footer className="text-center mt-8">
          <a
            href="https://www.distribrain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            Powered by
            <Image src="/logo_gradient.svg" alt="Logo" width={95} height={100} />
          </a>
        </footer>
      </main>
    </div>
  );
}
