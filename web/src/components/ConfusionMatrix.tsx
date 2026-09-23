import type { MatrizConfusao, NomeModelo } from "@/lib/types";

const SEQ = ["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"];

function corParaValor(valor: number, max: number) {
  const proporcao = valor / max;
  if (proporcao > 0.8) return SEQ[4];
  if (proporcao > 0.55) return SEQ[3];
  if (proporcao > 0.3) return SEQ[2];
  if (proporcao > 0.1) return SEQ[1];
  return SEQ[0];
}

function corTexto(valor: number, max: number) {
  return valor / max > 0.55 ? "#ffffff" : "var(--text-primary)";
}

export function ConfusionMatrix({
  nome,
  matriz,
}: {
  nome: NomeModelo;
  matriz: MatrizConfusao;
}) {
  const [[tn, fp], [fn, tp]] = matriz;
  const max = Math.max(tn, fp, fn, tp);

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        {nome}
      </h3>
      <div className="grid grid-cols-[52px_1fr_1fr] gap-1">
        <div />
        <div className="text-center pb-1 text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
          Previu
          <br />
          Legítima
        </div>
        <div className="text-center pb-1 text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
          Previu
          <br />
          Fraude
        </div>

        <div className="flex items-center text-[10px] leading-tight text-right pr-1" style={{ color: "var(--text-muted)" }}>
          Real Legítima
        </div>
        <MatrixCell valor={tn} max={max} />
        <MatrixCell valor={fp} max={max} />

        <div className="flex items-center text-[10px] leading-tight text-right pr-1" style={{ color: "var(--text-muted)" }}>
          Real Fraude
        </div>
        <MatrixCell valor={fn} max={max} />
        <MatrixCell valor={tp} max={max} />
      </div>
    </div>
  );
}

function MatrixCell({ valor, max }: { valor: number; max: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[4px] py-4 text-base font-semibold tabular-nums"
      style={{ background: corParaValor(valor, max), color: corTexto(valor, max) }}
    >
      {valor}
    </div>
  );
}
