"use client";
import { ReactNode, useEffect } from "react";

function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(';').some(c => c.trim().startsWith('token='));
}

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  useEffect(() => {
    if (!hasAuthCookie()) {
      //window.location.href = "/login";
    }
  }, []);


  return <>{children}</>;
}
