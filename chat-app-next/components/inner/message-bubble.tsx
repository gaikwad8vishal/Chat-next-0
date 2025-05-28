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
    if (status === 'read') return <span className="text-blue-600">✓✓</span>;
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs rounded-lg p-3 ${
          isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-foreground'
        }`}
      >
        {!isOwnMessage && <p className="text-sm font-medium">{sender}</p>}
        <p>{content}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">{timestamp}</p>
          {renderTicks()}
        </div>
      </div>
    </div>
  );
}