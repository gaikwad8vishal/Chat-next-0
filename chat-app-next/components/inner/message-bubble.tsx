'use client';

interface MessageBubbleProps {
  content: string;
  sender: string;
  isOwnMessage: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function MessageBubble({ content, sender, isOwnMessage, timestamp, status }: MessageBubbleProps) {
  const renderTicks = () => {
    if (!isOwnMessage) return null;
    if (status === 'sent') return '✓';
    if (status === 'delivered') return '✓✓';
    if (status === 'read') return <span className="text-blue-500">✓✓</span>;
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] rounded-lg p-2 shadow-sm ${
          isOwnMessage ? 'bg-[#dcf8c6] text-[#111b21]' : 'bg-white text-[#111b21]'
        }`}
        style={{ borderRadius: isOwnMessage ? '8px 8px 0 8px' : '8px 8px 8px 0' }}
      >
        {!isOwnMessage && <p className="text-xs font-medium text-[#075e54]">{sender}</p>}
        <p className="text-sm">{content}</p>
        <div className="flex justify-end items-center mt-1">
          <p className="text-xs text-[#54656f]">{timestamp}</p>
          <span className="ml-1 text-xs">{renderTicks()}</span>
        </div>
      </div>
    </div>
  );
}