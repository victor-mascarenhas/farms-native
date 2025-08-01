import { useEffect, useState } from "react";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useProductForm } from "../src/hooks/useProductForm";
import { useProducts } from "../src/presentation/hooks/useProducts";
import { container } from "../src/infrastructure/di/container";
import Sidebar from "../src/components/Sidebar";

export default function ProductsPage() {
  const productUseCase = container.getProductUseCase();
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    calculateMargin,
  } = useProducts(productUseCase);

  const form = useProductForm();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      if (editId) {
        await updateProduct(editId, data);
        setSucesso("Produto editado com sucesso!");
        setEditId(null);
      } else {
        await createProduct(data);
        setSucesso("Produto cadastrado com sucesso!");
      }
      form.reset();
    } catch (e) {
      setErro("Erro ao salvar produto.");
    }
  };

  const handleEdit = (product: any) => {
    setEditId(product.id!);
    form.reset({
      name: product.name,
      category: product.category,
      unit_price: product.unit_price,
      cost_price: product.cost_price,
    });
    setSucesso("");
    setErro("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este produto?")) {
      try {
        await deleteProduct(id);
        setSucesso("Produto removido com sucesso!");
        if (editId === id) {
          setEditId(null);
          form.reset();
        }
      } catch {
        setErro("Erro ao remover produto.");
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);
    form.reset();
    setSucesso("");
    setErro("");
  };

  if (error) {
    return (
      <Sidebar>
        <ProtectedRoute>
          <div style={{ padding: 24, textAlign: "center" }}>
            <h2>Erro ao carregar produtos</h2>
            <p style={{ color: "red" }}>{error}</p>
          </div>
        </ProtectedRoute>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <ProtectedRoute>
        <div className="container">
          <h1>Controle de Produtos</h1>

          {/* Formulário */}
          <div className="card" style={{ marginBottom: 32 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              {editId ? "Editar Produto" : "Cadastrar Novo Produto"}
            </h2>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}
                >
                  Nome do Produto *
                </label>
                <input
                  {...form.register("name")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Ex: Tomate"
                />
                {form.formState.errors.name && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.name.message}
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
                  Categoria *
                </label>
                <input
                  {...form.register("category")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="Ex: Hortaliças"
                />
                {form.formState.errors.category && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.category.message}
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
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("unit_price", { valueAsNumber: true })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="0.00"
                />
                {form.formState.errors.unit_price && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.unit_price.message}
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
                  Preço de Custo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("cost_price", { valueAsNumber: true })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                  placeholder="0.00"
                />
                {form.formState.errors.cost_price && (
                  <span style={{ color: "red", fontSize: "12px" }}>
                    {form.formState.errors.cost_price.message}
                  </span>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {editId ? "Salvar Alterações" : "Cadastrar Produto"}
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

          {/* Lista de produtos */}
          <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>
              Produtos Cadastrados
            </h2>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Nome
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Categoria
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Preço de Venda
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Preço de Custo
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Margem
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const margem = calculateMargin(product);
                      return (
                        <tr
                          key={product.id}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "12px", fontWeight: "600" }}>
                            {product.name}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {product.category}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              color: "#10b981",
                              fontWeight: "600",
                            }}
                          >
                            R$ {product.unit_price.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px", color: "#ef4444" }}>
                            R$ {product.cost_price.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                backgroundColor:
                                  margem > 50
                                    ? "#dcfce7"
                                    : margem > 30
                                    ? "#fef3c7"
                                    : "#fef2f2",
                                color:
                                  margem > 50
                                    ? "#166534"
                                    : margem > 30
                                    ? "#92400e"
                                    : "#991b1b",
                              }}
                            >
                              {margem.toFixed(1)}%
                            </span>
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
                                onClick={() => handleEdit(product)}
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
                                onClick={() => handleDelete(product.id!)}
                              >
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
