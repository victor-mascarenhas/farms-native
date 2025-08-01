import { useEffect, useMemo, useState } from "react";
import { useSalesStore, Sale } from "./stores/salesStore";
import { useProductsStore } from "./stores/productsStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Sidebar from "./components/Sidebar";

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

export default function DashboardPage() {
  const { sales, loading, fetchSales } = useSalesStore();
  const { products, fetchProducts } = useProductsStore();
  const [periodo, setPeriodo] = useState("30"); // dias
  const [filtroProduto, setFiltroProduto] = useState("todos");

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  // Filtrar vendas por período
  const vendasFiltradas = useMemo(() => {
    const hoje = new Date();
    const diasAtras = new Date(hoje.getTime() - parseInt(periodo) * 24 * 60 * 60 * 1000);
    
    return sales.filter((sale) => {
      const dataVenda = new Date(sale.data);
      const dentroDoPeriodo = dataVenda >= diasAtras;
      const produtoCorreto = filtroProduto === "todos" || sale.produto === filtroProduto;
      return dentroDoPeriodo && produtoCorreto;
    });
  }, [sales, periodo, filtroProduto]);

  // Calcular lucro por produto
  const lucroPorProduto = useMemo(() => {
    const map: Record<string, { vendas: number; lucro: number; quantidade: number }> = {};
    
    vendasFiltradas.forEach((sale) => {
      const produto = products.find(p => p.nome === sale.produto);
      const custoUnitario = produto?.preco || 0; // Usando preco como custo por enquanto
      const lucroUnitario = (sale.valor / sale.quantidade) - custoUnitario;
      const lucroTotal = lucroUnitario * sale.quantidade;
      
      if (!map[sale.produto]) {
        map[sale.produto] = { vendas: 0, lucro: 0, quantidade: 0 };
      }
      
      map[sale.produto].vendas += sale.valor;
      map[sale.produto].lucro += lucroTotal;
      map[sale.produto].quantidade += sale.quantidade;
    });
    
    return map;
  }, [vendasFiltradas, products]);

  // Dados para gráficos
  const chartDataLucro = {
    labels: Object.keys(lucroPorProduto),
    datasets: [
      {
        label: "Lucro por Produto (R$)",
        data: Object.values(lucroPorProduto).map(p => p.lucro),
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 1,
      },
    ],
  };

  const chartDataVendas = {
    labels: Object.keys(lucroPorProduto),
    datasets: [
      {
        label: "Vendas por Produto (R$)",
        data: Object.values(lucroPorProduto).map(p => p.vendas),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de linha para evolução temporal
  const vendasPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    vendasFiltradas.forEach((sale) => {
      const data = sale.data.split('T')[0]; // Pegar apenas a data
      map[data] = (map[data] || 0) + sale.valor;
    });
    return map;
  }, [vendasFiltradas]);

  const chartDataEvolucao = {
    labels: Object.keys(vendasPorDia).sort(),
    datasets: [
      {
        label: "Vendas por Dia (R$)",
        data: Object.keys(vendasPorDia).sort().map(data => vendasPorDia[data]),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Gráfico de rosca para distribuição
  const chartDataDistribuicao = {
    labels: Object.keys(lucroPorProduto),
    datasets: [
      {
        data: Object.values(lucroPorProduto).map(p => p.quantidade),
        backgroundColor: [
          "#ef4444", "#f97316", "#eab308", "#84cc16",
          "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
          "#8b5cf6", "#ec4899"
        ],
      },
    ],
  };

  // Configuração do mapa
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const markers = vendasFiltradas.filter((s: Sale) => s.lat && s.lng);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalVendas = vendasFiltradas.reduce((sum, sale) => sum + sale.valor, 0);
    const totalLucro = Object.values(lucroPorProduto).reduce((sum, p) => sum + p.lucro, 0);
    const totalQuantidade = vendasFiltradas.reduce((sum, sale) => sum + sale.quantidade, 0);
    const mediaTicket = totalVendas / vendasFiltradas.length || 0;
    
    return {
      totalVendas,
      totalLucro,
      totalQuantidade,
      mediaTicket,
      totalVendasCount: vendasFiltradas.length,
    };
  }, [vendasFiltradas, lucroPorProduto]);

  return (
    <Sidebar>
      <ProtectedRoute>
        <div style={{ maxWidth: 1200, margin: "auto", padding: 24 }}>
          <h1>Dashboard de Vendas</h1>
          
          {/* Filtros */}
          <div style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
            <div>
              <label>Período: </label>
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)}
                style={{ padding: "8px", marginLeft: "8px" }}
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </select>
            </div>
            <div>
              <label>Produto: </label>
              <select 
                value={filtroProduto} 
                onChange={(e) => setFiltroProduto(e.target.value)}
                style={{ padding: "8px", marginLeft: "8px" }}
              >
                <option value="todos">Todos os produtos</option>
                {products.map(product => (
                  <option key={product.id} value={product.nome}>
                    {product.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              {/* Cards de estatísticas */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: 16, 
                marginBottom: 32 
              }}>
                <div style={{ 
                  background: "#f8fafc", 
                  padding: 20, 
                  borderRadius: 8, 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h3 style={{ margin: 0, color: "#64748b" }}>Total de Vendas</h3>
                  <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0", color: "#3b82f6" }}>
                    R$ {estatisticas.totalVendas.toFixed(2)}
                  </p>
                </div>
                <div style={{ 
                  background: "#f8fafc", 
                  padding: 20, 
                  borderRadius: 8, 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h3 style={{ margin: 0, color: "#64748b" }}>Lucro Total</h3>
                  <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0", color: "#10b981" }}>
                    R$ {estatisticas.totalLucro.toFixed(2)}
                  </p>
                </div>
                <div style={{ 
                  background: "#f8fafc", 
                  padding: 20, 
                  borderRadius: 8, 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h3 style={{ margin: 0, color: "#64748b" }}>Quantidade Vendida</h3>
                  <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0", color: "#f59e0b" }}>
                    {estatisticas.totalQuantidade}
                  </p>
                </div>
                <div style={{ 
                  background: "#f8fafc", 
                  padding: 20, 
                  borderRadius: 8, 
                  border: "1px solid #e2e8f0" 
                }}>
                  <h3 style={{ margin: 0, color: "#64748b" }}>Ticket Médio</h3>
                  <p style={{ fontSize: 24, fontWeight: "bold", margin: "8px 0", color: "#8b5cf6" }}>
                    R$ {estatisticas.mediaTicket.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Gráficos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3>Lucro por Produto</h3>
                  <Bar data={chartDataLucro} />
                </div>
                <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3>Vendas por Produto</h3>
                  <Bar data={chartDataVendas} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3>Evolução das Vendas</h3>
                  <Line data={chartDataEvolucao} />
                </div>
                <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3>Distribuição por Quantidade</h3>
                  <Doughnut data={chartDataDistribuicao} />
                </div>
              </div>

              {/* Mapa */}
              <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 32 }}>
                <h3>Mapa das Vendas</h3>
                <div style={{ height: 400, width: "100%" }}>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={{ lat: -14.235, lng: -51.9253 }}
                      zoom={4}
                    >
                      {markers.map((sale: Sale, idx: number) => (
                        <Marker
                          key={sale.id || idx}
                          position={{ lat: sale.lat!, lng: sale.lng! }}
                          title={`${sale.produto} - R$ ${sale.valor}`}
                        />
                      ))}
                    </GoogleMap>
                  ) : (
                    <p>Carregando mapa...</p>
                  )}
                </div>
              </div>

              {/* Tabela de vendas recentes */}
              <div style={{ background: "white", padding: 20, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <h3>Vendas Recentes</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>Produto</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Quantidade</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Valor</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Data</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Localização</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasFiltradas.slice(0, 10).map((sale: Sale) => (
                        <tr key={sale.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px" }}>{sale.produto}</td>
                          <td style={{ padding: "12px" }}>{sale.quantidade}</td>
                          <td style={{ padding: "12px" }}>R$ {sale.valor.toFixed(2)}</td>
                          <td style={{ padding: "12px" }}>{sale.data}</td>
                          <td style={{ padding: "12px" }}>
                            {sale.lat && sale.lng ? (
                              <span style={{ fontSize: "12px", color: "#64748b" }}>
                                ({sale.lat.toFixed(4)}, {sale.lng.toFixed(4)})
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>Não informado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </ProtectedRoute>
    </Sidebar>
  );
}
