import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useProductForm } from "../src/hooks/useProductForm";

type Product = {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const form = useProductForm();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset form on modal open
  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          category: editing.category,
          unit_price: editing.unit_price,
          cost_price: editing.cost_price,
        });
      } else {
        form.reset();
      }
    }
  }, [modalOpen, editing]);

  // Save or update product
  const handleSave = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      if (editing) {
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...data }),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      await fetchProducts();
      setModalOpen(false);
      setEditing(null);
      setSucesso(editing ? "Produto atualizado!" : "Produto cadastrado!");
    } catch (e) {
      setErro("Erro ao salvar produto.");
    }
  };

  // Edit
  const handleEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este produto?")) return;
    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchProducts();
      setSucesso("Produto removido!");
    } catch {
      setErro("Erro ao remover produto.");
    }
  };

  // Margin calculation
  const calcMargin = (p: Product) =>
    p.unit_price > 0 ? ((p.unit_price - p.cost_price) / p.unit_price) * 100 : 0;

  return (
    <Sidebar>
      <div className="container" style={{ padding: 24 }}>
        <h1>Produtos</h1>
        <p style={{ color: "#64748b" }}>
          {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado
          {products.length !== 1 ? "s" : ""}
        </p>

        {/* Botão flutuante */}
        <button
          style={{
            position: "fixed",
            right: 32,
            bottom: 32,
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: 56,
            height: 56,
            fontSize: 32,
            cursor: "pointer",
            boxShadow: "0 2px 8px #0002",
          }}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          +
        </button>

        {/* Modal */}
        {modalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "#0008",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                minWidth: 320,
                minHeight: 320,
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                {editing ? "Editar Produto" : "Novo Produto"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <input
                  {...form.register("name")}
                  placeholder="Nome do Produto"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                {form.formState.errors.name && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.name.message}
                  </span>
                )}

                <input
                  {...form.register("category")}
                  placeholder="Categoria"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                {form.formState.errors.category && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.category.message}
                  </span>
                )}

                <input
                  type="number"
                  step="0.01"
                  {...form.register("unit_price", { valueAsNumber: true })}
                  placeholder="Preço de Venda (R$)"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                {form.formState.errors.unit_price && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.unit_price.message}
                  </span>
                )}

                <input
                  type="number"
                  step="0.01"
                  {...form.register("cost_price", { valueAsNumber: true })}
                  placeholder="Preço de Custo (R$)"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                {form.formState.errors.cost_price && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.cost_price.message}
                  </span>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: "#e5e7eb",
                      color: "#374151",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: 12,
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {editing ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
              {sucesso && (
                <div style={{ color: "green", marginTop: 16 }}>{sucesso}</div>
              )}
              {erro && (
                <div style={{ color: "red", marginTop: 16 }}>{erro}</div>
              )}
            </div>
          </div>
        )}

        {/* Lista de produtos */}
        <div className="card" style={{ marginTop: 32 }}>
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
                    <th style={{ padding: 12, textAlign: "left" }}>Nome</th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Categoria
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Preço de Venda
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Preço de Custo
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Margem</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const margin = calcMargin(product);
                    return (
                      <tr
                        key={product.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: 12, fontWeight: 600 }}>
                          {product.name}
                        </td>
                        <td style={{ padding: 12 }}>{product.category}</td>
                        <td
                          style={{
                            padding: 12,
                            color: "#10b981",
                            fontWeight: 600,
                          }}
                        >
                          R$ {product.unit_price.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, color: "#ef4444" }}>
                          R$ {product.cost_price.toFixed(2)}
                        </td>
                        <td style={{ padding: 12 }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: "bold",
                              backgroundColor:
                                margin > 50
                                  ? "#dcfce7"
                                  : margin > 30
                                  ? "#fef3c7"
                                  : "#fef2f2",
                              color:
                                margin > 50
                                  ? "#166534"
                                  : margin > 30
                                  ? "#92400e"
                                  : "#991b1b",
                            }}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 12,
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
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                              onClick={() => handleDelete(product.id)}
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
    </Sidebar>
  );
}
