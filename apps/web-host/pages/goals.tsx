import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useForm } from "react-hook-form";
import styles from "./goals.module.css";

type Goal = {
  id: string;
  type: string;
  product_id: string;
  target_quantity: number;
  start_date: string;
  end_date: string;
  notified: boolean;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const form = useForm<Partial<Goal>>({
    defaultValues: {
      type: "venda",
      product_id: "",
      target_quantity: 0,
      start_date: "",
      end_date: "",
      notified: false,
    },
  });

  const fetchGoals = async () => {
    setLoading(true);
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.reset(editing);
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
        await fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...data }),
        });
      } else {
        await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      await fetchGoals();
      setModalOpen(false);
      setEditing(null);
      setSucesso(editing ? "Meta atualizada!" : "Meta cadastrada!");
    } catch (e) {
      setErro("Erro ao salvar meta.");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditing(goal);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover esta meta?")) return;
    try {
      await fetch("/api/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchGoals();
      setSucesso("Meta removida!");
    } catch {
      setErro("Erro ao remover meta.");
    }
  };

  function renderDate(date: any) {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (typeof date === "object" && "_seconds" in date)
      return new Date(date._seconds * 1000).toLocaleDateString("pt-BR");
    return "";
  }

  function renderProductId(product_id: any) {
    if (!product_id) return "";
    if (typeof product_id === "string") return product_id;
    if (typeof product_id === "object" && "id" in product_id)
      return product_id.id;
    return "";
  }

  return (
    <Sidebar>
      <div className={styles.container}>
        <h1>Metas</h1>
        <p style={{ color: "#64748b" }}>
          {goals.length} meta{goals.length !== 1 ? "s" : ""} cadastrada
          {goals.length !== 1 ? "s" : ""}
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
                {editing ? "Editar Meta" : "Nova Meta"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <input
                  {...form.register("type")}
                  placeholder="Tipo"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  {...form.register("product_id")}
                  placeholder="ID do Produto"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  type="number"
                  {...form.register("target_quantity", { valueAsNumber: true })}
                  placeholder="Quantidade Alvo"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  type="date"
                  {...form.register("start_date")}
                  placeholder="Data de Início"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  type="date"
                  {...form.register("end_date")}
                  placeholder="Data de Fim"
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

        {/* Lista de metas */}
        <div className={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>Metas Cadastradas</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Tipo</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Produto</th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Quantidade Alvo
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Início</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Fim</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => (
                    <tr
                      key={goal.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: 12 }}>{goal.type}</td>
                      <td style={{ padding: 12 }}>
                        {renderProductId(goal.product_id)}
                      </td>
                      <td style={{ padding: 12 }}>{goal.target_quantity}</td>
                      <td style={{ padding: 12 }}>
                        {renderDate(goal.start_date)}
                      </td>
                      <td style={{ padding: 12 }}>
                        {renderDate(goal.end_date)}
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
                            onClick={() => handleEdit(goal)}
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
                            onClick={() => handleDelete(goal.id)}
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
