import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useForm } from "react-hook-form";
import styles from "./stock.module.css";

interface StockItem {
  id: string;
  product_id: string;
  available_quantity: number;
  last_updated: string | { _seconds: number };
}
interface Product {
  id: string;
  name: string;
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const form = useForm<Partial<StockItem>>({
    defaultValues: {
      product_id: "",
      available_quantity: 0,
      last_updated: "",
    },
  });

  const fetchStock = async () => {
    setLoading(true);
    const res = await fetch("/api/stock");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchStock();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.reset({
          ...editing,
          last_updated:
            typeof editing.last_updated === "object" &&
            editing.last_updated !== null &&
            "_seconds" in editing.last_updated
              ? new Date((editing.last_updated as any)._seconds * 1000)
                  .toISOString()
                  .slice(0, 10)
              : editing.last_updated,
        });
      } else {
        form.reset({
          product_id: "",
          available_quantity: 0,
          last_updated: new Date().toISOString().slice(0, 10),
        });
      }
    }
  }, [modalOpen, editing]);

  const handleSave = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      if (editing) {
        await fetch("/api/stock", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...data }),
        });
      } else {
        await fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      await fetchStock();
      setModalOpen(false);
      setEditing(null);
      setSucesso(editing ? "Estoque atualizado!" : "Estoque cadastrado!");
    } catch (e) {
      setErro("Erro ao salvar estoque.");
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este item?")) return;
    try {
      await fetch("/api/stock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchStock();
      setSucesso("Item removido!");
    } catch {
      setErro("Erro ao remover item.");
    }
  };

  function renderDate(date: any) {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (typeof date === "object" && "_seconds" in date)
      return new Date(date._seconds * 1000).toLocaleDateString("pt-BR");
    return "";
  }
  function getProductName(product_id: any) {
    if (!product_id) return "-";
    const id =
      typeof product_id === "string"
        ? product_id
        : product_id.id || product_id._path?.segments?.at?.(-1) || "";
    const found = products.find((p) => p.id === id);
    return found ? found.name : id || "-";
  }

  return (
    <Sidebar>
      <div className={styles.container}>
        <h1>Estoque</h1>
        <p style={{ color: "#64748b" }}>
          {items.length} item{items.length !== 1 ? "s" : ""} em estoque
        </p>

        {/* Botão flutuante */}
        <button
          className={styles.fab}
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
            className={styles.modalOverlay}
            onClick={() => setModalOpen(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                {editing ? "Editar Estoque" : "Novo Estoque"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <select
                  {...form.register("product_id", { required: true })}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                  defaultValue={form.getValues("product_id") || ""}
                >
                  <option value="">Selecione o produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  {...form.register("available_quantity", {
                    valueAsNumber: true,
                    required: true,
                    min: 0,
                  })}
                  placeholder="Quantidade disponível"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  type="date"
                  {...form.register("last_updated")}
                  placeholder="Última atualização"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
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

        {/* Lista de estoque */}
        <div className={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>Itens em Estoque</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Produto</th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Quantidade
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Última Atualização
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: 12 }}>
                        {getProductName(item.product_id)}
                      </td>
                      <td style={{ padding: 12 }}>{item.available_quantity}</td>
                      <td style={{ padding: 12 }}>
                        {renderDate(item.last_updated)}
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
                            onClick={() => handleEdit(item)}
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
                            onClick={() => handleDelete(item.id)}
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
    </Sidebar>
  );
}
