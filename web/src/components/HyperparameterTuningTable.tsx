import type { ComparacaoHiperparametroLinha, NomeModelo } from "@/lib/types";

const CORES: Record<NomeModelo, string> = {
  "Random Forest": "var(--series-1)",
  XGBoost: "var(--series-2)",
  "Decision Tree": "var(--series-3)",
};

const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];

export function HyperparameterTuningTable({ linhas }: { linhas: ComparacaoHiperparametroLinha[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th className="text-left py-2.5 pr-4 font-medium" style={{ color: "var(--text-muted)" }}>
              Modelo
            </th>
            <th className="text-right py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              F1 padrão
            </th>
            <th className="text-right py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              F1 otimizado
            </th>
            <th className="text-right py-2.5 pl-3 font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              Variação
            </th>
          </tr>
        </thead>
        <tbody>
          {MODELOS.map((modelo) => {
            const padrao = linhas.find((l) => l.modelo === modelo && l.versao === "padrão");
            const otimizado = linhas.find((l) => l.modelo === modelo && l.versao === "otimizado");
            if (!padrao || !otimizado) return null;

            const delta = otimizado.f1 - padrao.f1;
            const melhorou = delta > 0.005;

            return (
              <tr key={modelo} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-3 pr-4">
                  <span className="flex items-center gap-2 font-medium" style={{ color: "var(--text-primary)" }}>
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: CORES[modelo] }} />
                    {modelo}
                  </span>
                </td>
                <td className="text-right py-3 px-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {(padrao.f1 * 100).toFixed(2)}%
                </td>
                <td className="text-right py-3 px-3 tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                  {(otimizado.f1 * 100).toFixed(2)}%
                </td>
                <td
                  className="text-right py-3 pl-3 tabular-nums font-medium whitespace-nowrap"
                  style={{ color: melhorou ? "var(--status-good)" : "var(--text-muted)" }}
                >
                  {delta >= 0 ? "+" : ""}
                  {(delta * 100).toFixed(2)}pp
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
