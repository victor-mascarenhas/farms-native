import { useProductionForm } from "../src/hooks/useProductionForm";
import { useProductionStore } from "../src/stores/productionStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useState } from "react";

export default function ProductionFormPage() {
  const form = useProductionForm();
  const { addProduction, loading } = useProductionStore();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const onSubmit = async (data: any) => {
    setSucesso("");
    setErro("");
    try {
      await addProduction({
        nome: data.product_id,
        status: data.status,
        data: data.start_date.toISOString(),
      });
      setSucesso("Produção cadastrada com sucesso!");
      form.reset();
    } catch (e) {
      setErro("Erro ao cadastrar produção.");
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
        <h1>Cadastrar Produção</h1>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 12 }}>
            <label>Produto:</label>
            <input {...form.register("product_id")} style={{ width: "100%" }} />
            {form.formState.errors.product_id && (
              <span style={{ color: "red" }}>
                {form.formState.errors.product_id.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Status:</label>
            <select {...form.register("status")} style={{ width: "100%" }}>
              <option value="">Selecione</option>
              <option value="aguardando">Aguardando</option>
              <option value="em_producao">Em Produção</option>
              <option value="colhido">Colhido</option>
            </select>
            {form.formState.errors.status && (
              <span style={{ color: "red" }}>
                {form.formState.errors.status.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Quantidade:</label>
            <input
              type="number"
              {...form.register("quantity", { valueAsNumber: true })}
              style={{ width: "100%" }}
            />
            {form.formState.errors.quantity && (
              <span style={{ color: "red" }}>
                {form.formState.errors.quantity.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Data de Início:</label>
            <input
              type="date"
              {...form.register("start_date", { valueAsDate: true })}
              style={{ width: "100%" }}
            />
            {form.formState.errors.start_date && (
              <span style={{ color: "red" }}>
                {form.formState.errors.start_date.message}
              </span>
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
