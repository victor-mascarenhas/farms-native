import dynamic from "next/dynamic";

const RemoteDashboard = dynamic(() => import("remote/DashboardPage"), { ssr: false });

export default function Dashboard() {
  return <RemoteDashboard />;
}
