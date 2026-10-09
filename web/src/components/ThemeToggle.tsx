"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

function lerTemaAtual(): Tema {
  if (typeof document === "undefined") return "dark";
  const atributo = document.documentElement.getAttribute("data-theme");
  if (atributo === "light" || atributo === "dark") return atributo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ variant = "default" }: { variant?: "default" | "accent" }) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema(lerTemaAtual());
  }, []);

  function alternar() {
    const proximo: Tema = (tema ?? lerTemaAtual()) === "dark" ? "light" : "dark";
    setTema(proximo);
    document.documentElement.setAttribute("data-theme", proximo);
    try {
      localStorage.setItem("tema", proximo);
    } catch {}
  }

  return (
    <button
      onClick={alternar}
      aria-label={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
        variant === "accent" ? "nav-icon-accent" : ""
      }`}
      style={
        variant === "accent"
          ? undefined
          : { background: "var(--surface-card-hover)", color: "var(--text-secondary)" }
      }
    >
      {tema === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
