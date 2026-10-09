"use client";

import { useState } from "react";
import type { ImportanciaFeature, NomeModelo } from "@/lib/types";

const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];

export function FeatureImportanceChart({
  dados,
}: {
  dados: Record<NomeModelo, ImportanciaFeature[]>;
}) {
  const [modeloAtivo, setModeloAtivo] = useState<NomeModelo>("Random Forest");
  const features = dados[modeloAtivo];
  const maxImportancia = Math.max(...features.map((f) => f.importancia));

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {MODELOS.map((modelo) => (
          <button
            key={modelo}
            onClick={() => setModeloAtivo(modelo)}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={
              modeloAtivo === modelo
                ? { background: "var(--accent)", color: "var(--accent-contrast)" }
                : { background: "var(--surface-card-hover)", color: "var(--text-secondary)" }
            }
          >
            {modelo}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {features.map((f) => (
          <div key={f.feature} className="flex items-center gap-3">
            <span
              className="w-11 shrink-0 text-xs font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {f.feature}
            </span>
            <div
              className="flex-1 h-4 rounded-[4px] overflow-hidden"
              style={{ background: "var(--surface-card-hover)" }}
            >
              <div
                className="h-full rounded-[4px] transition-[width] duration-500 ease-out"
                style={{
                  width: `${(f.importancia / maxImportancia) * 100}%`,
                  background: "var(--series-1)",
                }}
              />
            </div>
            <span
              className="font-mono w-14 shrink-0 text-right text-xs tabular-nums font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {(f.importancia * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
        V1–V28 são componentes de PCA (nomes originais anonimizados pelo dataset).
      </p>
    </div>
  );
}
