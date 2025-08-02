import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setSucesso("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error || "Erro ao cadastrar");
      } else {
        setSucesso("Usuário cadastrado com sucesso! Faça login.");
      }
    } catch (err) {
      setErro("Erro de rede");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" disabled={carregando} style={{ width: "100%" }}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
        {erro && <div style={{ color: "red", marginTop: 8 }}>{erro}</div>}
        {sucesso && (
          <div style={{ color: "green", marginTop: 8 }}>{sucesso}</div>
        )}
      </form>
      <button
        style={{
          width: "100%",
          marginTop: 12,
          background: "#e5e7eb",
          color: "#111827",
          border: "none",
          borderRadius: 4,
          padding: 10,
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/login")}
        type="button"
      >
        Voltar para Login
      </button>
    </div>
  );
}
