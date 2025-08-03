import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useProductForm } from "../src/hooks/useProductForm";
import styles from "./products.module.css";

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

  const handleEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

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

  const calcMargin = (p: Product) =>
    p.unit_price > 0 ? ((p.unit_price - p.cost_price) / p.unit_price) * 100 : 0;

  return (
    <Sidebar>
      <div className={styles.container}>
        <h1>Produtos</h1>
        <p style={{ color: "#64748b" }}>
          {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado
          {products.length !== 1 ? "s" : ""}
        </p>

        <button
          className={styles.fab}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          +
        </button>

        {modalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setModalOpen(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                {editing ? "Editar Produto" : "Novo Produto"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <label htmlFor="name">Nome do Produto</label>
                <input
                  id="name"
                  {...form.register("name")}
                  className={styles.input}
                />
                {form.formState.errors.name && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.name.message}
                  </span>
                )}

                <label htmlFor="category">Categoria</label>
                <input
                  id="category"
                  {...form.register("category")}
                  className={styles.input}
                />
                {form.formState.errors.category && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.category.message}
                  </span>
                )}

                <label htmlFor="unit_price">Preço de Venda (R$)</label>
                <input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  {...form.register("unit_price", { valueAsNumber: true })}
                  className={styles.input}
                />
                {form.formState.errors.unit_price && (
                  <span style={{ color: "red", fontSize: 12 }}>
                    {form.formState.errors.unit_price.message}
                  </span>
                )}

                <label htmlFor="cost_price">Preço de Custo (R$)</label>
                <input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...form.register("cost_price", { valueAsNumber: true })}
                  className={styles.input}
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
                    className={styles.actionBtn}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.actionBtn}>
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

        <div className={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>
            Produtos Cadastrados
          </h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
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
                              className={styles.editBtn}
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
                              className={styles.deleteBtn}
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
