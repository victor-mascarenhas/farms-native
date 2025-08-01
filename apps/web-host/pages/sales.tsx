import { useEffect, useState } from "react";
import { useSalesStore, Sale } from "../src/stores/salesStore";
import { useProductsStore } from "../src/stores/productsStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useSaleForm } from "../src/hooks/useSaleForm";
import Sidebar from "../src/components/Sidebar";

export default function SalesPage() {
  const { sales, loading, fetchSales, addSale, updateSale, deleteSale } =
    useSalesStore();
  const { products, fetchProducts } = useProductsStore();
  const form = useSaleForm();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  const onSubmit = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      if (editId) {
        await updateSale(editId, data);
        setSucesso("Venda editada com sucesso!");
        setEditId(null);
      } else {
        await addSale(data);
        setSucesso("Venda registrada com sucesso!");
      }
      form.reset();
    } catch (e) {
      setErro("Erro ao salvar venda.");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditId(sale.id!);
    form.reset({
      product_id: sale.produto,
      quantity: sale.quantidade,
      total_price: sale.valor,
      client_name: "", // Campo não existe no tipo Sale
      sale_date: new Date(sale.data),
      location: {
        latitude: sale.lat || 0,
        longitude: sale.lng || 0,
      },
    });
    setSucesso("");
    setErro("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta venda?")) {
      try {
        await deleteSale(id);
        setSucesso("Venda removida com sucesso!");
        if (editId === id) {
          setEditId(null);
          form.reset();
        }
      } catch {
        setErro("Erro ao remover venda.");
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);
    form.reset();
    setSucesso("");
    setErro("");
  };

  return (
    <Sidebar>
      <ProtectedRoute>
        <div style={{ maxWidth: 1200, margin: "auto", padding: 24 }}>
          <h1>Controle de Vendas</h1>

          {/* Formulário */}
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              marginBottom: 32,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              {editId ? "Editar Venda" : "Registrar Nova Venda"}
            </h2>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Produto *
                </label>
                <select
                  {...form.register("product_id")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.nome}>
                      {product.nome} - R$ {product.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
                {form.formState.errors.product_id && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.product_id.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  {...form.register("quantity", { valueAsNumber: true })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="1"
                />
                {form.formState.errors.quantity && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.quantity.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("total_price", { valueAsNumber: true })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="0.00"
                />
                {form.formState.errors.total_price && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.total_price.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Nome do Cliente *
                </label>
                <input
                  {...form.register("client_name")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Nome do comprador"
                />
                {form.formState.errors.client_name && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.client_name.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Data da Venda *
                </label>
                <input
                  type="date"
                  {...form.register("sale_date", { valueAsDate: true })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                {form.formState.errors.sale_date && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.sale_date.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...form.register("location.latitude", {
                    valueAsNumber: true,
                  })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="-23.5505"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...form.register("location.longitude", {
                    valueAsNumber: true,
                  })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="-46.6333"
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {editId ? "Salvar Alterações" : "Registrar Venda"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#e5e7eb",
                      color: "#374151",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {sucesso && (
              <div
                style={{
                  color: "green",
                  marginTop: 16,
                  padding: "12px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0",
                }}
              >
                {sucesso}
              </div>
            )}
            {erro && (
              <div
                style={{
                  color: "red",
                  marginTop: 16,
                  padding: "12px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "6px",
                  border: "1px solid #fecaca",
                }}
              >
                {erro}
              </div>
            )}
          </div>

          {/* Lista de vendas */}
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              Vendas Registradas
            </h2>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Produto
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Quantidade
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Valor
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Cliente
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Data
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Localização
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr
                        key={sale.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px", fontWeight: "600" }}>
                          {sale.produto}
                        </td>
                        <td style={{ padding: "12px" }}>{sale.quantidade}</td>
                        <td
                          style={{
                            padding: "12px",
                            color: "#10b981",
                            fontWeight: "600",
                          }}
                        >
                          R$ {sale.valor.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px" }}>-</td>
                        <td style={{ padding: "12px" }}>{sale.data}</td>
                        <td style={{ padding: "12px" }}>
                          {sale.lat && sale.lng ? (
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              ({sale.lat.toFixed(4)}, {sale.lng.toFixed(4)})
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>
                              Não informado
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                              onClick={() => handleEdit(sale)}
                            >
                              Editar
                            </button>
                            <button
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                              onClick={() => handleDelete(sale.id!)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </Sidebar>
  );
}
