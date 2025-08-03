import { useEffect, useMemo, useState } from "react";
import { useProductionStore } from "./stores/productionStore";
import { useProductsStore } from "./stores/productsStore";
import { Pie, Bar, Line } from "react-chartjs-2";
import { type Product, type Production } from "@farms/schemas";

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

export default function ProductionDashboardPage() {
  const { productions, loading, fetchProductions } = useProductionStore();
  const { products, fetchProducts } = useProductsStore();
  const [filtroProduto, setFiltroProduto] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    fetchProductions();
    fetchProducts();
  }, [fetchProductions, fetchProducts]);

  const producoesFiltradas = useMemo(() => {
    return productions.filter((prod: Production) => {
      const produtoCorreto =
        filtroProduto === "todos" || prod.product_id === filtroProduto;
      const statusCorreto =
        filtroStatus === "todos" || prod.status === filtroStatus;
      return produtoCorreto && statusCorreto;
    });
  }, [productions, filtroProduto, filtroStatus]);

  const statusCount = useMemo(() => {
    return {
      aguardando: producoesFiltradas.filter(
        (p: Production) => p.status === "aguardando"
      ).length,
      em_producao: producoesFiltradas.filter(
        (p: Production) => p.status === "em_producao"
      ).length,
      colhido: producoesFiltradas.filter(
        (p: Production) => p.status === "colhido"
      ).length,
    };
  }, [producoesFiltradas]);

  const quantidadePorProduto = useMemo(() => {
    const map: Record<string, number> = {};
    producoesFiltradas.forEach((prod: Production) => {
      const product = products.find((p) => p.id === prod.product_id);
      const productName = product ? product.name : prod.product_id;
      map[productName] = (map[productName] || 0) + 1;
    });
    return map;
  }, [producoesFiltradas, products]);

  const producoesPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    producoesFiltradas.forEach((prod: Production) => {
      const data = new Date(prod.start_date);
      const mesAno = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;
      map[mesAno] = (map[mesAno] || 0) + 1;
    });
    return map;
  }, [producoesFiltradas]);

  const chartDataStatus = {
    labels: ["Aguardando", "Em Produção", "Colhido"],
    datasets: [
      {
        data: [
          statusCount.aguardando,
          statusCount.em_producao,
          statusCount.colhido,
        ],
        backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e"],
        borderColor: ["#f59e0b", "#2563eb", "#16a34a"],
        borderWidth: 2,
      },
    ],
  };

  const chartDataQuantidade = {
    labels: Object.keys(quantidadePorProduto),
    datasets: [
      {
        label: "Quantidade Total por Produto",
        data: Object.values(quantidadePorProduto),
        backgroundColor: "#8b5cf6",
        borderColor: "#7c3aed",
        borderWidth: 1,
      },
    ],
  };

  const chartDataEvolucao = {
    labels: Object.keys(producoesPorMes).sort(),
    datasets: [
      {
        label: "Produções por Mês",
        data: Object.keys(producoesPorMes)
          .sort()
          .map((mes) => producoesPorMes[mes]),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const estatisticas = useMemo(() => {
    const totalProducoes = producoesFiltradas.length;
    const totalQuantidade = producoesFiltradas.length;
    const producoesAguardando = statusCount.aguardando;
    const producoesEmProducao = statusCount.em_producao;
    const producoesColhidas = statusCount.colhido;
    const taxaConclusao =
      totalProducoes > 0 ? (producoesColhidas / totalProducoes) * 100 : 0;

    return {
      totalProducoes,
      totalQuantidade,
      producoesAguardando,
      producoesEmProducao,
      producoesColhidas,
      taxaConclusao,
    };
  }, [producoesFiltradas, statusCount]);

  return (
    <div className="container">
      <h1>Dashboard de Produção</h1>

      {/* Filtros */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div>
          <label>Produto: </label>
          <select
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            style={{ padding: "8px", marginLeft: "8px" }}
          >
            <option value="todos">Todos os produtos</option>
            {products.map((product: Product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Status: </label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ padding: "8px", marginLeft: "8px" }}
          >
            <option value="todos">Todos os status</option>
            <option value="aguardando">Aguardando</option>
            <option value="em_producao">Em Produção</option>
            <option value="colhido">Colhido</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {/* Cards de estatísticas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div className="card">
              <h3 style={{ margin: 0, color: "#64748b" }}>
                Total de Produções
              </h3>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#3b82f6",
                }}
              >
                {estatisticas.totalProducoes}
              </p>
            </div>
            <div className="card">
              <h3 style={{ margin: 0, color: "#64748b" }}>Quantidade Total</h3>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#10b981",
                }}
              >
                {estatisticas.totalQuantidade}
              </p>
            </div>
            <div className="card">
              <h3 style={{ margin: 0, color: "#64748b" }}>Taxa de Conclusão</h3>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#f59e0b",
                }}
              >
                {estatisticas.taxaConclusao.toFixed(1)}%
              </p>
            </div>
            <div className="card">
              <h3 style={{ margin: 0, color: "#64748b" }}>Em Produção</h3>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#8b5cf6",
                }}
              >
                {estatisticas.producoesEmProducao}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 32,
            }}
          >
            <div className="card">
              <h3>Distribuição por Status</h3>
              <Pie data={chartDataStatus} />
            </div>
            <div className="card">
              <h3>Quantidade por Produto</h3>
              <Bar data={chartDataQuantidade} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 32 }}>
            <h3>Evolução das Produções</h3>
            <Line data={chartDataEvolucao} />
          </div>

          {/* Tabela de produções */}
          <div className="card">
            <h3>Produções Recentes</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Produto
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Quantidade
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Data de Início
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Data da Colheita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {producoesFiltradas.slice(0, 10).map((prod: Production) => {
                    const product = products.find(
                      (p) => p.id === prod.product_id
                    );
                    const productName = product
                      ? product.name
                      : prod.product_id;

                    return (
                      <tr
                        key={prod.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px" }}>{productName}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              backgroundColor:
                                prod.status === "aguardando"
                                  ? "#fef3c7"
                                  : prod.status === "em_producao"
                                  ? "#dbeafe"
                                  : "#dcfce7",
                              color:
                                prod.status === "aguardando"
                                  ? "#92400e"
                                  : prod.status === "em_producao"
                                  ? "#1e40af"
                                  : "#166534",
                            }}
                          >
                            {prod.status === "aguardando"
                              ? "Aguardando"
                              : prod.status === "em_producao"
                              ? "Em Produção"
                              : "Colhido"}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>-</td>
                        <td style={{ padding: "12px" }}>
                          {new Date(prod.start_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {prod.harvest_date ? (
                            new Date(prod?.harvest_date).toLocaleDateString()
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
