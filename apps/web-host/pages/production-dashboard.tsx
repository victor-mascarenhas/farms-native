import dynamic from "next/dynamic";

const RemoteProductionDashboard = dynamic(() => import("remote/ProductionDashboardPage"), { ssr: false });

export default function ProductionDashboard() {
  return <RemoteProductionDashboard />;
}
