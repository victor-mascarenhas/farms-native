import { useEffect, useState } from "react";
import Sidebar from "../src/components/Sidebar";
import { useForm } from "react-hook-form";

type Production = {
  id: string;
  product_id: string;
  status: string;
  quantity: number;
  start_date: string | { _seconds: number };
  harvest_date: string | { _seconds: number } | null;
};

// Adicione o tipo Product

type Product = {
  id: string;
  name: string;
  // outros campos se necessário
};

export default function ProductionsPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Production | null>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const form = useForm<Partial<Production>>({
    defaultValues: {
      product_id: "",
      status: "aguardando",
      quantity: 0,
      start_date: "",
      harvest_date: "",
    },
  });
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch productions
  const fetchProductions = async () => {
    setLoading(true);
    const res = await fetch("/api/productions");
    const data = await res.json();
    setProductions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.reset({
          ...editing,
          start_date:
            typeof editing.start_date === "object" &&
            editing.start_date !== null &&
            "_seconds" in editing.start_date
              ? new Date((editing.start_date as any)._seconds * 1000)
                  .toISOString()
                  .slice(0, 10)
              : editing.start_date,
          harvest_date:
            editing.harvest_date &&
            typeof editing.harvest_date === "object" &&
            "_seconds" in editing.harvest_date
              ? new Date((editing.harvest_date as any)._seconds * 1000)
                  .toISOString()
                  .slice(0, 10)
              : editing.harvest_date || "",
        });
      } else {
        form.reset();
      }
    }
  }, [modalOpen, editing]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  // Save or update production
  const handleSave = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      if (editing) {
        await fetch("/api/productions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...data }),
        });
      } else {
        await fetch("/api/productions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      await fetchProductions();
      setModalOpen(false);
      setEditing(null);
      setSucesso(editing ? "Produção atualizada!" : "Produção cadastrada!");
    } catch (e) {
      setErro("Erro ao salvar produção.");
    }
  };

  // Edit
  const handleEdit = (prod: Production) => {
    setEditing(prod);
    setModalOpen(true);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover esta produção?"))
      return;
    try {
      await fetch("/api/productions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchProductions();
      setSucesso("Produção removida!");
    } catch {
      setErro("Erro ao remover produção.");
    }
  };

  // Utilitário para exibir datas
  function renderDate(date: any) {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (typeof date === "object" && "_seconds" in date)
      return new Date(date._seconds * 1000).toLocaleDateString("pt-BR");
    return "";
  }

  // Status helpers
  function getStatusColor(status: string) {
    switch (status) {
      case "aguardando":
        return "#f59e0b";
      case "em_andamento":
        return "#3b82f6";
      case "concluida":
        return "#10b981";
      default:
        return "#64748b";
    }
  }
  function getStatusText(status: string) {
    switch (status) {
      case "aguardando":
        return "Aguardando";
      case "em_andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      default:
        return status;
    }
  }

  // Função utilitária para extrair o id do product_id
  function getProductId(product_id: any) {
    if (!product_id) return "";
    if (typeof product_id === "string") return product_id;
    if (typeof product_id === "object" && "id" in product_id)
      return product_id.id;
    if (
      typeof product_id === "object" &&
      "_path" in product_id &&
      typeof product_id._path === "object" &&
      "segments" in product_id._path
    ) {
      // Firestore DocumentReference pode ter _path: {segments: [...]}
      return product_id._path.segments?.at?.(-1) || "";
    }
    return "";
  }
  // Função para buscar o nome do produto
  function getProductName(product_id: any) {
    const id = getProductId(product_id);
    const found = products.find((p) => p.id === id);
    return found ? found.name : id || "-";
  }

  return (
    <Sidebar>
      <div className="container" style={{ padding: 24 }}>
        <h1>Produções</h1>
        <p style={{ color: "#64748b" }}>
          {productions.length} produção{productions.length !== 1 ? "ões" : ""}{" "}
          registrada{productions.length !== 1 ? "s" : ""}
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
                {editing ? "Editar Produção" : "Nova Produção"}
              </h2>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <input
                  {...form.register("product_id")}
                  placeholder="Produto"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  {...form.register("status")}
                  placeholder="Status"
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
                <input
                  type="number"
                  {...form.register("quantity", { valueAsNumber: true })}
                  placeholder="Quantidade"
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
                  {...form.register("harvest_date")}
                  placeholder="Data de Colheita (opcional)"
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

        {/* Lista de produções */}
        <div className="card" style={{ marginTop: 32 }}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>
            Produções Cadastradas
          </h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Produto</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 12, textAlign: "left" }}>
                      Quantidade
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Início</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Colheita</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((prod) => (
                    <tr
                      key={prod.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td style={{ padding: 12 }}>
                        {getProductName(prod.product_id)}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: "bold",
                            backgroundColor: getStatusColor(prod.status) + "20",
                            color: getStatusColor(prod.status),
                          }}
                        >
                          {getStatusText(prod.status)}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{prod.quantity}</td>
                      <td style={{ padding: 12 }}>
                        {renderDate(prod.start_date)}
                      </td>
                      <td style={{ padding: 12 }}>
                        {renderDate(prod.harvest_date)}
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
                            onClick={() => handleEdit(prod)}
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
                            onClick={() => handleDelete(prod.id)}
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
