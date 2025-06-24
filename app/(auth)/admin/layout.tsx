'use client';

import ProtectedRoute from '@/app/protected/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="Administrador">
      {children}
    </ProtectedRoute>
  );
}
