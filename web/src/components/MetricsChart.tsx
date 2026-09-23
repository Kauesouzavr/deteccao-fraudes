"use client";

import type { MetricaModelo, NomeModelo } from "@/lib/types";

const CORES: Record<NomeModelo, string> = {
  "Random Forest": "var(--series-1)",
  XGBoost: "var(--series-2)",
  "Decision Tree": "var(--series-3)",
};

const METRICAS: { chave: "acuracia" | "precisao" | "recall" | "f1"; rotulo: string }[] = [
  { chave: "acuracia", rotulo: "Acurácia" },
  { chave: "precisao", rotulo: "Precisão" },
  { chave: "recall", rotulo: "Recall" },
  { chave: "f1", rotulo: "F1-Score" },
];

const ALTURA_UTIL = 180;

export function MetricsChart({ metricas }: { metricas: MetricaModelo[] }) {
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8 text-sm">
        {metricas.map((m) => (
          <div key={m.modelo} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: CORES[m.modelo] }}
            />
            <span style={{ color: "var(--text-secondary)" }}>{m.modelo}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8">
        {METRICAS.map(({ chave, rotulo }) => (
          <div key={chave} className="flex flex-col items-center">
            <div
              className="flex items-end gap-2 w-full justify-center border-b"
              style={{ height: ALTURA_UTIL + 24, borderColor: "var(--baseline)" }}
            >
              {metricas.map((m) => {
                const valor = m[chave];
                return (
                  <div
                    key={m.modelo}
                    className="group relative flex flex-col items-center justify-end h-full w-7"
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
                        {m.modelo}: {(valor * 100).toFixed(2)}%
                      </span>
                    </div>
                    <span
                      className="text-[10px] mb-1 font-medium tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {(valor * 100).toFixed(1)}
                    </span>
                    <div
                      className="w-full rounded-t-[4px] transition-[height] duration-500 ease-out"
                      style={{ height: `${valor * ALTURA_UTIL}px`, background: CORES[m.modelo] }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="mt-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {rotulo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
