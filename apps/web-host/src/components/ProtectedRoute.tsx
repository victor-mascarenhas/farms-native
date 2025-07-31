"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Usar window.location em vez de useRouter para evitar problemas de hidratação
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) return <div>Carregando...</div>;
  if (!user) return null;

  return <>{children}</>;
}
