import { ProtectedRoute } from "@web-host/components/ProtectedRoute";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "/dashboard";
  }, []);
  return (
    <ProtectedRoute>
      <div>Redirecionando...</div>
    </ProtectedRoute>
  );
}
