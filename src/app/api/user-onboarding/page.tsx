'use client';

import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hash } from 'crypto';

const MiddlewarePage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      axios
        .post(
          'http://localhost:8000/users', //kts.testcode.tools
          {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.username,
            imageUrl: user.imageUrl,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        .then((response) => {
          console.log('User data sent successfully:', response.data);
          router.push('/');
        })
        .catch((error) => {
          console.error('Error sending user data:', error);
          router.push('/');
        });
    }
  }, [user, router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Processing...</h1>
      <p>Please wait while we process your data.</p>
    </div>
  );
};

export default MiddlewarePage;
