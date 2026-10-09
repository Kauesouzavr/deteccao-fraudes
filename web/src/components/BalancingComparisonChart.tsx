"use client";

import type { ComparacaoBalanceamentoLinha, NomeModelo } from "@/lib/types";

const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];

const ESTRATEGIAS: { chave: "Undersampling" | "SMOTE"; cor: string }[] = [
  { chave: "Undersampling", cor: "var(--baseline)" },
  { chave: "SMOTE", cor: "var(--series-1)" },
];

const METRICAS: { chave: "precisao" | "f1"; rotulo: string }[] = [
  { chave: "precisao", rotulo: "Precisão" },
  { chave: "f1", rotulo: "F1-Score" },
];

const ALTURA_UTIL = 160;

export function BalancingComparisonChart({ linhas }: { linhas: ComparacaoBalanceamentoLinha[] }) {
  function valor(modelo: NomeModelo, estrategia: "Undersampling" | "SMOTE", chave: "precisao" | "f1") {
    return linhas.find((l) => l.modelo === modelo && l.estrategia === estrategia)?.[chave] ?? 0;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8 text-sm">
        {ESTRATEGIAS.map((e) => (
          <div key={e.chave} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: e.cor }} />
            <span style={{ color: "var(--text-secondary)" }}>{e.chave}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {METRICAS.map(({ chave, rotulo }) => (
          <div key={chave}>
            <p className="text-xs font-medium mb-4 text-center" style={{ color: "var(--text-muted)" }}>
              {rotulo}
            </p>
            <div
              className="flex items-end justify-around border-b"
              style={{ height: ALTURA_UTIL + 28, borderColor: "var(--baseline)" }}
            >
              {MODELOS.map((modelo) => (
                <div key={modelo} className="flex flex-col items-center">
                  <div className="flex items-end gap-1.5" style={{ height: ALTURA_UTIL }}>
                    {ESTRATEGIAS.map((e) => {
                      const v = valor(modelo, e.chave, chave);
                      return (
                        <div
                          key={e.chave}
                          className="group relative flex flex-col items-center justify-end h-full w-5"
                        >
                          <div className="pointer-events-none absolute -top-9 z-10 hidden whitespace-nowrap group-hover:block">
                            <span
                              className="rounded-md px-2 py-1 text-[11px] font-medium shadow-sm"
                              style={{
                                background: "var(--surface-card)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {modelo} · {e.chave}: {(v * 100).toFixed(1)}%
                            </span>
                          </div>
                          <span
                            className="font-mono text-[9px] mb-1 font-medium tabular-nums"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {(v * 100).toFixed(0)}
                          </span>
                          <div
                            className="w-full rounded-t-[3px] transition-[height] duration-500 ease-out"
                            style={{ height: `${v * ALTURA_UTIL}px`, background: e.cor }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span
                    className="mt-2.5 text-[10px] font-medium text-center leading-tight max-w-16"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {modelo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
