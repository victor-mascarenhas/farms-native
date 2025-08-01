import dynamic from "next/dynamic";
import Sidebar from "../src/components/Sidebar";
import { ProtectedRoute } from "../src/components/ProtectedRoute";

const RemoteProductionDashboard = dynamic(() => import("remote/ProductionDashboardPage"), { ssr: false });

export default function ProductionDashboard() {
  return (
    <Sidebar>
      <ProtectedRoute>
        <RemoteProductionDashboard />
      </ProtectedRoute>
    </Sidebar>
  );
}
