'use client';

import React, { useState, useEffect } from 'react';
import { useSystem } from '../lib/store';
import LoginModal from '../components/auth/LoginModal';
import ParentView from '../components/views/ParentView';
import DriverView from '../components/views/DriverView';
import AdminView from '../components/views/AdminView';

export default function Home() {
  const { currentUser, role } = useSystem();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

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
