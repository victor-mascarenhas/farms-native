import { useForm } from "react-hook-form";
import { useProductionStore, Production } from "../src/stores/productionStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useState } from "react";

export default function ProductionFormPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<Production, "id">>();
  const { addProduction, loading } = useProductionStore();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const onSubmit = async (data: Omit<Production, "id">) => {
    setSucesso("");
    setErro("");
    try {
      await addProduction(data);
      setSucesso("Produção cadastrada com sucesso!");
      reset();
    } catch (e) {
      setErro("Erro ao cadastrar produção.");
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
        <h1>Cadastrar Produção</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 12 }}>
            <label>Nome:</label>
            <input
              {...register("nome", { required: true })}
              style={{ width: "100%" }}
            />
            {errors.nome && (
              <span style={{ color: "red" }}>Campo obrigatório</span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Status:</label>
            <select
              {...register("status", { required: true })}
              style={{ width: "100%" }}
            >
              <option value="">Selecione</option>
              <option value="aguardando">Aguardando</option>
              <option value="em_producao">Em Produção</option>
              <option value="colhido">Colhido</option>
            </select>
            {errors.status && (
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
          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
          {sucesso && (
            <div style={{ color: "green", marginTop: 8 }}>{sucesso}</div>
          )}
          {erro && <div style={{ color: "red", marginTop: 8 }}>{erro}</div>}
        </form>
      </div>
    </ProtectedRoute>
  );
}
