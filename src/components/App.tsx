import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { UserList } from '@/components/UserList';

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey!}>
      <div className="App">
        <UserList />
      </div>
    </ClerkProvider>
  );
}

export default App;

