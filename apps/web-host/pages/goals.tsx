import { useEffect, useState } from "react";
import { useGoalsStore, Goal } from "../src/stores/goalsStore";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { useForm } from "react-hook-form";
import Sidebar from "../src/components/Sidebar";

export default function GoalsPage() {
  const { goals, loading, fetchGoals, addGoal, updateGoal, deleteGoal } =
    useGoalsStore();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Omit<Goal, "id" | "progresso" | "atingida">>();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Simulação de progresso (em produção real, calcule a partir dos dados)
  const calcularProgresso = (goal: Goal) => {
    // Exemplo: progresso aleatório para demonstração
    return Math.min(goal.progresso ?? 0, goal.valor);
  };

  const onSubmit = async (
    data: Omit<Goal, "id" | "progresso" | "atingida">
  ) => {
    setSucesso("");
    setErro("");
    try {
      if (editId) {
        await updateGoal(editId, { ...data, progresso: 0, atingida: false });
        setSucesso("Meta editada com sucesso!");
        setEditId(null);
      } else {
        await addGoal({ ...data, progresso: 0, atingida: false });
        setSucesso("Meta cadastrada com sucesso!");
      }
      reset();
    } catch (e) {
      setErro("Erro ao salvar meta.");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditId(goal.id!);
    setValue("tipo", goal.tipo);
    setValue("descricao", goal.descricao);
    setValue("valor", goal.valor);
    setSucesso("");
    setErro("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta meta?")) {
      try {
        await deleteGoal(id);
        setSucesso("Meta removida com sucesso!");
        if (editId === id) {
          setEditId(null);
          reset();
        }
      } catch {
        setErro("Erro ao remover meta.");
      }
    }
  };

  return (
    <Sidebar>
      <ProtectedRoute>
        <div style={{ maxWidth: 600, margin: "auto", padding: 24 }}>
          <h1>Metas</h1>
          <h2 style={{ marginTop: 32 }}>
            {editId ? "Editar Meta" : "Cadastrar Nova Meta"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}>
              <label>Tipo:</label>
              <select
                {...register("tipo", { required: true })}
                style={{ width: "100%" }}
              >
                <option value="">Selecione</option>
                <option value="venda">Venda</option>
                <option value="producao">Produção</option>
              </select>
              {errors.tipo && (
                <span style={{ color: "red" }}>Campo obrigatório</span>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Descrição:</label>
              <input
                {...register("descricao", { required: true })}
                style={{ width: "100%" }}
              />
              {errors.descricao && (
                <span style={{ color: "red" }}>Campo obrigatório</span>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Valor da Meta:</label>
              <input
                type="number"
                {...register("valor", { required: true, min: 1 })}
                style={{ width: "100%" }}
              />
              {errors.valor && (
                <span style={{ color: "red" }}>Campo obrigatório</span>
              )}
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
          <h2>Metas Cadastradas</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <ul>
              {goals.slice(0, 20).map((goal) => {
                const progresso = calcularProgresso(goal);
                const atingida = progresso >= goal.valor;
                return (
                  <li key={goal.id} style={{ marginBottom: 16 }}>
                    <strong>{goal.descricao}</strong> ({goal.tipo})<br />
                    Progresso: {progresso} / {goal.valor}
                    <div
                      style={{
                        background: "#e5e7eb",
                        borderRadius: 4,
                        height: 16,
                        margin: "4px 0",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: `${(progresso / goal.valor) * 100}%`,
                          background: atingida ? "#22c55e" : "#3b82f6",
                          height: "100%",
                          borderRadius: 4,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    {atingida && (
                      <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                        Meta atingida!
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
                        marginRight: 4,
                      }}
                      onClick={() => handleEdit(goal)}
                    >
                      Editar
                    </button>
                    <button
                      style={{
                        marginLeft: 4,
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 8px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDelete(goal.id!)}
                    >
                      Remover
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ProtectedRoute>
    </Sidebar>
  );
}
