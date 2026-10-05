import type { NomeModelo, ValidacaoCruzadaLinha } from "@/lib/types";

const CORES: Record<NomeModelo, string> = {
  "Random Forest": "var(--series-1)",
  XGBoost: "var(--series-2)",
  "Decision Tree": "var(--series-3)",
};

type ChaveNumerica = Exclude<keyof ValidacaoCruzadaLinha, "modelo">;

const COLUNAS: { rotulo: string; media: ChaveNumerica; desvio: ChaveNumerica }[] = [
  { rotulo: "Acurácia", media: "accuracy_media", desvio: "accuracy_desvio" },
  { rotulo: "Precisão", media: "precision_media", desvio: "precision_desvio" },
  { rotulo: "Recall", media: "recall_media", desvio: "recall_desvio" },
  { rotulo: "F1-Score", media: "f1_media", desvio: "f1_desvio" },
];

export function CrossValidationTable({ linhas }: { linhas: ValidacaoCruzadaLinha[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th className="text-left py-2.5 pr-4 font-medium" style={{ color: "var(--text-muted)" }}>
              Modelo
            </th>
            {COLUNAS.map((c) => (
              <th
                key={c.media}
                className="text-right py-2.5 px-3 font-medium whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                {c.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.modelo} style={{ borderBottom: "1px solid var(--border)" }}>
              <td className="py-3 pr-4">
                <span className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: CORES[linha.modelo] }} />
                  {linha.modelo}
                </span>
              </td>
              {COLUNAS.map((c) => (
                <td key={c.media} className="text-right py-3 px-3 tabular-nums whitespace-nowrap">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {(linha[c.media] * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: "var(--text-muted)" }}> ± {(linha[c.desvio] * 100).toFixed(1)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
