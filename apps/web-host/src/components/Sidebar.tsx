"use client";
import Link from "next/link";
import { ReactNode } from "react";
import styles from "./Sidebar.module.css";

const links = [
  { href: "/dashboard", label: "Dashboard de Vendas" },
  { href: "/production-dashboard", label: "Dashboard de Produção" },
  { href: "/sales", label: "Controle de Vendas" },
  { href: "/stock", label: "Estoque e Vendas" },
  { href: "/goals", label: "Metas" },
  { href: "/products", label: "Produtos" },
  { href: "/productions", label: "Produções" },
  { href: "/production-form", label: "Nova Produção" },
];

function Sidebar({ children }: { children: ReactNode }) {
  const handleLogout = async () => {
    await fetch("/api/logout");
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebarNav}>
        <div>
          <h2 className={styles.menuTitle}>Menu</h2>
          <ul className={styles.menuList}>
            {links.map((link) => (
              <li key={link.href} className={styles.menuItem}>
                <Link href={link.href} className={styles.menuLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={() => handleLogout()} className={styles.logoutBtn}>
          Sair
        </button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default Sidebar;
