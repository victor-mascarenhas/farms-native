import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useForm } from "react-hook-form";
import styles from "./sales.module.css";
import { Product } from "@farms/schemas";

interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  client_name: string;
  sale_date: string | { _seconds: number };
  location?: { latitude: number; longitude: number };
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const form = useForm<Partial<Sale>>({
    defaultValues: {
      product_id: "",
      quantity: 0,
      total_price: 0,
      client_name: "",
      sale_date: "",
      location: { latitude: 0, longitude: 0 },
    },
  });
  const [autoTotal, setAutoTotal] = useState(0);

  useEffect(() => {
    console.log(autoTotal);
  }, [autoTotal]);

  const fetchSales = async () => {
    setLoading(true);
    const res = await fetch("/api/sales");
    const data = await res.json();
    setSales(data);
    setLoading(false);
  };
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        const foundProduct = products.find((p) => p.id === editing.product_id);
        form.reset({
          product_id: foundProduct ? foundProduct.id : "",
          quantity: editing.quantity,
          total_price: editing.total_price,
          client_name: editing.client_name,
          sale_date:
            typeof editing.sale_date === "object" &&
            editing.sale_date !== null &&
            "_seconds" in editing.sale_date
              ? new Date((editing.sale_date as any)._seconds * 1000)
                  .toISOString()
                  .slice(0, 10)
              : editing.sale_date,
          location: editing.location || { latitude: 0, longitude: 0 },
        });
      } else {
        form.reset({
          product_id: "",
          quantity: 0,
          total_price: 0,
          client_name: "",
          sale_date: new Date().toISOString().slice(0, 10),
          location: { latitude: 0, longitude: 0 },
        });
      }
    }
  }, [modalOpen, editing, products]);

  useEffect(() => {
    const prod = products.find((p) => p.id === form.watch("product_id"));
    const qty = Number(form.watch("quantity"));
    if (prod && qty > 0) {
      setAutoTotal(prod.unit_price * qty);
      form.setValue("total_price", prod.unit_price * qty);
    } else {
      setAutoTotal(0);
      form.setValue("total_price", 0);
    }
  }, [form.watch("product_id"), form.watch("quantity"), products]);

  const handleSave = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      const foundProduct = products.find((p) => p.id === data.product_id);
      if (!foundProduct) {
        setErro("Produto selecionado não existe.");
        return;
      }
      const payload = {
        ...data,
        produto: foundProduct.name,
        quantidade: data.quantity,
        valor: data.total_price,
        data: data.sale_date,
        lat: data.location?.latitude,
        lng: data.location?.longitude,
      };
      if (editing) {
        await fetch("/api/sales", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await fetchSales();
      setModalOpen(false);
      setEditing(null);
      setSucesso(editing ? "Venda atualizada!" : "Venda registrada!");
    } catch (e) {
      setErro("Erro ao salvar venda.");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditing(sale);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover esta venda?")) return;
    try {
      await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchSales();
      setSucesso("Venda removida!");
    } catch {
      setErro("Erro ao remover venda.");
    }
  };

  function renderDate(date: any) {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (typeof date === "object" && "_seconds" in date)
      return new Date(date._seconds * 1000).toLocaleDateString("pt-BR");
    return "";
  }

  return (
    <Sidebar>
      <div className={styles.container}>
        <h1>Vendas</h1>
        <p style={{ color: "#64748b" }}>
          {sales.length} venda{sales.length !== 1 ? "s" : ""} registrada
          {sales.length !== 1 ? "s" : ""}
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
                {editing ? "Editar Venda" : "Nova Venda"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className={styles.form}
              >
                <label htmlFor="client_name">Nome do Cliente</label>
                <input
                  id="client_name"
                  {...form.register("client_name", { required: true })}
                  className={styles.input}
                />
                {form.formState.errors.client_name && (
                  <span className={styles.error}>
                    {form.formState.errors.client_name.message}
                  </span>
                )}

                <label htmlFor="product_id">Produto</label>
                <select
                  id="product_id"
                  {...form.register("product_id", { required: true })}
                  className={styles.input}
                  defaultValue={form.getValues("product_id") || ""}
                >
                  <option value="">Selecione o produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.product_id && (
                  <span className={styles.error}>
                    {form.formState.errors.product_id.message}
                  </span>
                )}

                <label htmlFor="quantity">Quantidade</label>
                <input
                  id="quantity"
                  type="number"
                  {...form.register("quantity", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  className={styles.input}
                />
                {form.formState.errors.quantity && (
                  <span className={styles.error}>
                    {form.formState.errors.quantity.message}
                  </span>
                )}

                <label htmlFor="total_price">Valor Total (R$)</label>
                <input
                  id="total_price"
                  type="number"
                  step="0.01"
                  value={autoTotal}
                  readOnly
                  className={styles.input}
                />
                {form.formState.errors.total_price && (
                  <span className={styles.error}>
                    {form.formState.errors.total_price.message}
                  </span>
                )}

                <label htmlFor="sale_date">Data da Venda</label>
                <input
                  id="sale_date"
                  type="date"
                  {...form.register("sale_date", { required: true })}
                  className={styles.input}
                />
                {form.formState.errors.sale_date && (
                  <span className={styles.error}>
                    {form.formState.errors.sale_date.message}
                  </span>
                )}

                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  {...form.register("location.latitude", {
                    valueAsNumber: true,
                  })}
                  className={styles.input}
                />
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  {...form.register("location.longitude", {
                    valueAsNumber: true,
                  })}
                  className={styles.input}
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

        <div className={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>Vendas Registradas</h2>
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
                    <th style={{ padding: 12, textAlign: "left" }}>Valor</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Cliente</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Data</th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Localização
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: 12, fontWeight: 600 }}>
                        {(() => {
                          const found = products.find(
                            (p) => p.id === sale.product_id
                          );
                          return found ? found.name : sale.product_id;
                        })()}
                      </td>
                      <td style={{ padding: 12 }}>{sale.quantity}</td>
                      <td
                        style={{
                          padding: 12,
                          color: "#10b981",
                          fontWeight: 600,
                        }}
                      >
                        R$ {sale.total_price?.toFixed(2)}
                      </td>
                      <td style={{ padding: 12 }}>{sale.client_name}</td>
                      <td style={{ padding: 12 }}>
                        {renderDate(sale.sale_date)}
                      </td>
                      <td style={{ padding: 12 }}>
                        {sale.location &&
                        sale.location.latitude &&
                        sale.location.longitude ? (
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            ({sale.location.latitude?.toFixed(4)},{" "}
                            {sale.location.longitude?.toFixed(4)})
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>
                            Não informado
                          </span>
                        )}
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
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                            onClick={() => handleDelete(sale.id)}
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
