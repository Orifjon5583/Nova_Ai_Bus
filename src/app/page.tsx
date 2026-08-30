'use client';

import React from 'react';
import { useSystem } from '../lib/store';
import LoginModal from '../components/auth/LoginModal';
import ParentView from '../components/views/ParentView';
import DriverView from '../components/views/DriverView';
import AdminView from '../components/views/AdminView';

export default function Home() {
  const { currentUser, role } = useSystem();

  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="w-full" suppressHydrationWarning>
      {role === 'parent' && <ParentView />}
      {role === 'driver' && <DriverView />}
      {role === 'admin' && <AdminView />}
    </div>
  );
}
