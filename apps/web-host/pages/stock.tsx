import { useEffect, useState } from "react";
import { useSalesStore, Sale } from "../src/stores/salesStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useForm } from "react-hook-form";

export default function StockPage() {
  const { sales, loading, fetchSales, addSale, updateSale, deleteSale } =
    useSalesStore();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Omit<Sale, "id">>();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const onSubmit = async (data: Omit<Sale, "id">) => {
    setSucesso("");
    setErro("");
    try {
      if (editId) {
        await updateSale(editId, {
          ...data,
          valor: Number(data.valor),
          quantidade: Number(data.quantidade),
        });
        setSucesso("Venda editada com sucesso!");
        setEditId(null);
      } else {
        await addSale({
          ...data,
          valor: Number(data.valor),
          quantidade: Number(data.quantidade),
        });
        setSucesso("Venda cadastrada com sucesso!");
      }
      reset();
    } catch (e) {
      setErro("Erro ao salvar venda.");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditId(sale.id!);
    setValue("produto", sale.produto);
    setValue("quantidade", sale.quantidade);
    setValue("valor", sale.valor);
    setValue("data", sale.data);
    setValue("lat", sale.lat);
    setValue("lng", sale.lng);
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
          reset();
        }
      } catch {
        setErro("Erro ao remover venda.");
      }
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 700, margin: "auto", padding: 24 }}>
        <h1>Controle de Estoque e Vendas</h1>
        <h2 style={{ marginTop: 32 }}>
          {editId ? "Editar Venda" : "Cadastrar Nova Venda"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <label>Produto:</label>
            <input
              {...register("produto", { required: true })}
              style={{ width: "100%" }}
            />
            {errors.produto && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Quantidade:</label>
            <input
              type="number"
              {...register("quantidade", { required: true, min: 1 })}
              style={{ width: "100%" }}
            />
            {errors.quantidade && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Valor (R$):</label>
            <input
              type="number"
              step="0.01"
              {...register("valor", { required: true, min: 0 })}
              style={{ width: "100%" }}
            />
            {errors.valor && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Data:</label>
            <input
              type="date"
              {...register("data", { required: true })}
              style={{ width: "100%" }}
            />
            {errors.data && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Latitude (opcional):</label>
            <input
              type="number"
              step="any"
              {...register("lat")}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Longitude (opcional):</label>
            <input
              type="number"
              step="any"
              {...register("lng")}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit" style={{ width: "100%" }}>
            {editId ? "Salvar Alterações" : "Cadastrar"}
          </button>
          {editId && (
            <button
              type="button"
              style={{
                width: "100%",
                marginTop: 8,
                background: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: 4,
                padding: 10,
                cursor: "pointer",
              }}
              onClick={() => {
                setEditId(null);
                reset();
                setSucesso("");
                setErro("");
              }}
            >
              Cancelar Edição
            </button>
          )}
          {sucesso && (
            <div style={{ color: "green", marginTop: 8 }}>{sucesso}</div>
          )}
          {erro && <div style={{ color: "red", marginTop: 8 }}>{erro}</div>}
        </form>
        <h2>Vendas Cadastradas</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <ul>
            {sales.slice(0, 20).map((sale) => (
              <li key={sale.id}>
                <strong>{sale.produto}</strong> - {sale.quantidade} un - R${" "}
                {sale.valor} - {sale.data}
                {sale.lat && sale.lng && (
                  <span>
                    {" "}
                    ({sale.lat}, {sale.lng})
                  </span>
                )}
                <button
                  style={{
                    marginLeft: 8,
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEdit(sale)}
                >
                  Editar
                </button>
                <button
                  style={{
                    marginLeft: 8,
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(sale.id!)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProtectedRoute>
  );
}
