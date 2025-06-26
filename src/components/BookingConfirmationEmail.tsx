import React from 'react';

interface BookingConfirmationEmailProps {
    name: string;
    email: string;
    timeSlot: string;
    editUrl: string;
    company?: string;
}

export const BookingConfirmationEmail: React.FC<Readonly<BookingConfirmationEmailProps>> = ({
    name,
    timeSlot,
    editUrl,
}) => {
    const [date, time] = timeSlot.split(' ');

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: '#4F46E5' }}>预订成功！</h1>
            <p>您好 {name},</p>
            <p>我们很高兴地通知您，您的专属时间已成功预订。</p>
            <p><strong>预订时间:</strong> {date} {time}</p>
            <p>我们期待与您在 {timeSlot}见面。</p>
            <p>
                如果您的计划有变，或希望修改预订信息，可以通过下方的专属链接进行操作：
            </p>
            <p>
                <a
                    href={editUrl}
                    style={{
                        display: 'inline-block',
                        padding: '10px 15px',
                        backgroundColor: '#4F46E5',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}
                >
                    修改我的预订
                </a>
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                如果您没有进行此项预订，请忽略本邮件。
            </p>
        </div>
    );
}; 