'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/api/groups', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200) {
          setGroups(response.data);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch groups');
        }
      } catch (err: any) {
        const errorDetails = {
          message: err.message || 'Unknown error',
          status: err.response?.status || 'No status',
          statusText: err.response?.statusText || 'No status text',
          data: err.response?.data ? err.response.data : 'No response data',
          responseText: err.response?.data
            ? String(err.response.data).slice(0, 200)
            : 'No response body',
          requestUrl: err.config?.url || 'No URL',
          requestMethod: err.config?.method || 'No method',
        };
        console.error('Error fetching groups:', errorDetails);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Network error or invalid response from server. Please try again later.'
        );
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium">Groups</h3>
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
      {groups.length === 0 && !error ? (
        <p className="text-sm text-gray-500">No groups available</p>
      ) : (
        groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`w-full text-left p-2 rounded-md ${
              selectedGroup === group.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            {group.name}
          </button>
        ))
      )}
    </div>
  );
}