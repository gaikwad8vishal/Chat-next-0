'use client';

import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
}

interface GroupListProps {
  onSelectGroup: (groupId: string | null) => void;
  selectedGroup: string | null;
}

export default function GroupList({ onSelectGroup, selectedGroup }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        const data = await response.json();
        if (response.ok) {
          setGroups(data);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium">Groups</h3>
      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onSelectGroup(group.id)}
          className={`w-full text-left p-2 rounded-md ${
            selectedGroup === group.id ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          {group.name}
        </button>
      ))}
    </div>
  );
}