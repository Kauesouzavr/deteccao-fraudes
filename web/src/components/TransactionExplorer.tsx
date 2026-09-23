"use client";

import { useMemo, useState } from "react";
import type { AmostraTransacao, NomeModelo } from "@/lib/types";

const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];
type Filtro = "todas" | "fraude" | "legitima" | "erros";

const OPCOES_FILTRO: [Filtro, string][] = [
  ["todas", "Todas"],
  ["fraude", "Fraudes reais"],
  ["legitima", "Legítimas reais"],
  ["erros", "Com erro de algum modelo"],
];

export function TransactionExplorer({ amostras }: { amostras: AmostraTransacao[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const filtradas = useMemo(() => {
    return amostras.filter((a) => {
      if (filtro === "fraude") return a.classeReal === 1;
      if (filtro === "legitima") return a.classeReal === 0;
      if (filtro === "erros")
        return MODELOS.some((m) => a.previsoes[m].classePrevista !== a.classeReal);
      return true;
    });
  }, [filtro, amostras]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {OPCOES_FILTRO.map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={
              filtro === valor
                ? { background: "var(--series-1)", color: "white" }
                : { background: "var(--surface-card-hover)", color: "var(--text-secondary)" }
            }
          >
            {rotulo}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
          {filtradas.length} transações
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtradas.map((a) => (
          <TransactionCard key={a.id} amostra={a} />
        ))}
      </div>
    </div>
  );
}

function TransactionCard({ amostra }: { amostra: AmostraTransacao }) {
  const fraude = amostra.classeReal === 1;
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
            R$ {amostra.valor.toFixed(2)}
          </p>
          <p className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            t = {amostra.tempoSegundos.toLocaleString("pt-BR")}s
          </p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
          style={
            fraude
              ? { background: "var(--status-critical-bg)", color: "var(--status-critical)" }
              : { background: "var(--status-good-bg)", color: "var(--status-good)" }
          }
        >
          {fraude ? "Fraude real" : "Legítima real"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {MODELOS.map((modelo) => {
          const previsao = amostra.previsoes[modelo];
          const acertou = previsao.classePrevista === amostra.classeReal;
          return (
            <div key={modelo} className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-secondary)" }}>{modelo}</span>
              <span className="flex items-center gap-1.5">
                <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {(previsao.probabilidadeFraude * 100).toFixed(0)}%
                </span>
                <span
                  className="font-medium"
                  style={{ color: acertou ? "var(--status-good)" : "var(--status-critical)" }}
                >
                  {acertou ? "✓" : "✗"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
