import { useEffect } from "react";
import { useProductionStore } from "../src/stores/productionStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import Sidebar from "../src/components/Sidebar";

Chart.register(ArcElement, Tooltip, Legend);

export default function ProductionDashboardPage() {
  const { productions, loading, fetchProductions } = useProductionStore();

  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  const statusCount = {
    aguardando: productions.filter((p) => p.status === "aguardando").length,
    em_producao: productions.filter((p) => p.status === "em_producao").length,
    colhido: productions.filter((p) => p.status === "colhido").length,
  };

  const data = {
    labels: ["Aguardando", "Em Produção", "Colhido"],
    datasets: [
      {
        data: [
          statusCount.aguardando,
          statusCount.em_producao,
          statusCount.colhido,
        ],
        backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e"],
      },
    ],
  };

  return (
    <Sidebar>
      <ProtectedRoute>
        <div style={{ maxWidth: 600, margin: "auto", padding: 24 }}>
          <h1>Dashboard de Produção</h1>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              <Pie data={data} />
              <h2 style={{ marginTop: 32 }}>Produções Recentes</h2>
              <ul>
                {productions.slice(0, 10).map((prod) => (
                  <li key={prod.id}>
                    <strong>{prod.nome}</strong> - {prod.status} - {prod.data}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </ProtectedRoute>
    </Sidebar>
  );
}
