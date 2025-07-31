"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@farms/firebase";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard de Vendas" },
  { href: "/production-dashboard", label: "Dashboard de Produção" },
  { href: "/stock", label: "Estoque e Vendas" },
  { href: "/goals", label: "Metas" },
  { href: "/products", label: "Produtos" },
  { href: "/production-form", label: "Nova Produção" },
];

function Sidebar({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (!mounted) return;
    try {
      await signOut(auth);
      router().push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Só exibe o sidebar após o componente estar montado
  if (!mounted) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav style={{ width: 220, background: "#f3f4f6", padding: 24 }}>
          <div>Carregando...</div>
        </nav>
        <main style={{ flex: 1, padding: 32 }}>{children}</main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          background: "#f3f4f6",
          padding: 24,
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: 32, fontSize: 20 }}>Menu</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {links.map((link) => (
              <li key={link.href} style={{ marginBottom: 16 }}>
                <Link
                  href={link.href}
                  style={{
                    color: "#111827",
                    fontWeight: "normal",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 32,
            width: "100%",
            padding: 10,
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Sair
        </button>
      </nav>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}

export default Sidebar;
