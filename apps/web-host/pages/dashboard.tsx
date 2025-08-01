import dynamic from "next/dynamic";
import Sidebar from "../src/components/Sidebar";
import { ProtectedRoute } from "../src/components/ProtectedRoute";

const RemoteDashboard = dynamic(() => import("remote/DashboardPage"), { ssr: false });

export default function Dashboard() {
  return (
    <Sidebar>
      <ProtectedRoute>
        <RemoteDashboard />
      </ProtectedRoute>
    </Sidebar>
  );
}
