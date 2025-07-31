import { useEffect, useMemo } from "react";
import { useSalesStore } from "../src/stores/salesStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardPage() {
  const { sales, loading, fetchSales } = useSalesStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Agrupar vendas por produto e calcular lucro total
  const lucroPorProduto = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((sale) => {
      map[sale.produto] = (map[sale.produto] || 0) + (sale.valor || 0);
    });
    return map;
  }, [sales]);

  const chartData = {
    labels: Object.keys(lucroPorProduto),
    datasets: [
      {
        label: "Lucro por Produto (R$)",
        data: Object.values(lucroPorProduto),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // Configuração do mapa
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  // Supondo que cada venda tem lat/lng
  const markers = sales.filter((s) => s.lat && s.lng);

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
        <h1>Dashboard de Vendas</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div style={{ marginBottom: 40 }}>
              <Bar data={chartData} />
            </div>
            <h2>Mapa das Vendas</h2>
            <div style={{ height: 400, width: "100%", marginBottom: 32 }}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{ lat: -14.235, lng: -51.9253 }} // Centro do Brasil
                  zoom={4}
                >
                  {markers.map((sale, idx) => (
                    <Marker
                      key={sale.id || idx}
                      position={{ lat: sale.lat, lng: sale.lng }}
                      title={sale.produto}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <p>Carregando mapa...</p>
              )}
            </div>
            <h2>Vendas Recentes</h2>
            <ul>
              {sales.slice(0, 10).map((sale) => (
                <li key={sale.id}>
                  <strong>{sale.produto}</strong> - R$ {sale.valor} -{" "}
                  {sale.data}
                  {sale.lat && sale.lng && (
                    <span>
                      {" "}
                      ({sale.lat}, {sale.lng})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
