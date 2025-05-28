'use client';

import { MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  contactId: string | null;
  groupId: string | null;
  username: string | null;
}

export default function ChatHeader({ contactId, groupId, username }: ChatHeaderProps) {
  const displayName = contactId ? `User ${contactId}` : groupId ? `Group ${groupId}` : 'ZapLink';

  return (
    <div className="p-3 bg-[#075e54] text-white flex items-center justify-between shadow-sm">
      <h2 className="text-base font-medium">{displayName}</h2>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-[#064e45]"
          onClick={() => alert('Search feature coming soon!')}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-[#064e45]"
          onClick={() => alert('More options coming soon!')}
        >
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </div>
    </div>
  );
}