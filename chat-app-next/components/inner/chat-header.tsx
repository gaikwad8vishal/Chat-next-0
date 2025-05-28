'use client';

interface ChatHeaderProps {
  contactId: string | null;
  groupId: string | null;
  username: string | null;
}

export default function ChatHeader({ contactId, groupId, username }: ChatHeaderProps) {
  // Placeholder: Fetch contact or group name based on ID
  const displayName = contactId ? `User ${contactId}` : groupId ? `Group ${groupId}` : 'ZapLink';

  return (
    <div className="p-4 border-b bg-background">
      <h2 className="text-lg font-semibold">{displayName}</h2>
      <p className="text-sm text-muted-foreground">Logged in as {username}</p>
    </div>
  );
}