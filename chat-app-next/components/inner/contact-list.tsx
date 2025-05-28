'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  username: string;
}

interface ContactListProps {
  onSelectContact: (contactId: string | null) => void;
  selectedContact: string | null;
}

export default function ContactList({ onSelectContact, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/auth/users');
        const data = await response.json();
        if (response.ok) {
          setContacts(data);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Contacts</h3>
      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onSelectContact(contact.id)}
          className={`w-full text-left p-2 rounded-md ${
            selectedContact === contact.id ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          {contact.username}
        </button>
      ))}
    </div>
  );
}