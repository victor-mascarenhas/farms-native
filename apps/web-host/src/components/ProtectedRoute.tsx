"use client";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/me").then((res) => {
      if (res.status !== 200) {
        window.location.href = "/login";
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return <div>Verificando autenticação...</div>;
  }

  return <>{children}</>;
}
