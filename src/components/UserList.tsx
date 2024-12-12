import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(`${process.env.BACKEND_URL}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-2 rounded">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>User Name:</strong> {user.userName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

