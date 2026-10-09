"use client";

import { useEffect, useMemo, useState } from "react";
import {
  normalizarValor,
  preverProbabilidade,
  type ExemploTransacao,
  type ModeloDemo,
} from "@/lib/randomForest";

const VALOR_MAXIMO = 5000;
const HORAS_MAXIMO = 48;

export function PredictorDemo() {
  const [modelo, setModelo] = useState<ModeloDemo | null>(null);
  const [erro, setErro] = useState(false);
  const [exemploId, setExemploId] = useState<number | null>(null);
  const [valor, setValor] = useState(0);
  const [horas, setHoras] = useState(0);

  useEffect(() => {
    fetch("/dados/modelo_demo.json")
      .then((r) => r.json())
      .then((dados: ModeloDemo) => {
        setModelo(dados);
        const primeiro = dados.exemplos[0];
        setExemploId(primeiro.id);
        setValor(primeiro.valorOriginal);
        setHoras(primeiro.tempoOriginalSegundos / 3600);
      })
      .catch(() => setErro(true));
  }, []);

  const exemploAtivo = modelo?.exemplos.find((e) => e.id === exemploId) ?? null;

  const resultado = useMemo(() => {
    if (!modelo || !exemploAtivo) return null;
    const features = [...exemploAtivo.features];
    features[modelo.indiceAmount] = normalizarValor(
      valor,
      modelo.scaler.amountMean,
      modelo.scaler.amountScale
    );
    features[modelo.indiceTime] = normalizarValor(
      horas * 3600,
      modelo.scaler.timeMean,
      modelo.scaler.timeScale
    );
    const prob = preverProbabilidade(modelo, features);
    return { prob, fraude: prob >= 0.5 };
  }, [modelo, exemploAtivo, valor, horas]);

  function selecionarExemplo(ex: ExemploTransacao) {
    setExemploId(ex.id);
    setValor(ex.valorOriginal);
    setHoras(ex.tempoOriginalSegundos / 3600);
  }

  if (erro) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Não foi possível carregar o modelo. Rode <code>python exportar_modelo_web.py</code> e
        tente novamente.
      </p>
    );
  }

  if (!modelo) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Carregando modelo...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          1. Escolha o perfil da transação
        </p>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {modelo.exemplos.map((ex, i) => {
            const ativo = ex.id === exemploId;
            return (
              <button
                key={ex.id}
                onClick={() => selecionarExemplo(ex)}
                aria-label={`Perfil ${i + 1}`}
                className="rounded-lg py-2.5 text-center text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: ativo ? "var(--accent)" : "var(--surface-sunken)",
                  color: ativo ? "var(--accent-contrast)" : "var(--text-secondary)",
                  border: ativo ? "1px solid var(--accent)" : "1px solid var(--border)",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          2. Ajuste os dados da transação
        </p>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>Valor da transação</span>
              <span className="font-mono tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                R$ {valor.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={VALOR_MAXIMO}
              step={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>Horário da transação</span>
              <span className="font-mono tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                {horas.toFixed(1)}h
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={HORAS_MAXIMO}
              step={0.5}
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      </div>

      <div
        className="rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors duration-300"
        style={{
          background: resultado?.fraude ? "var(--status-critical-bg)" : "var(--status-good-bg)",
          border: `1px solid ${resultado?.fraude ? "var(--status-critical)" : "var(--status-good)"}`,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          Análise de risco em tempo real
        </p>
        <p
          className="font-mono text-4xl font-semibold tabular-nums mb-1"
          style={{ color: resultado?.fraude ? "var(--status-critical)" : "var(--status-good)" }}
        >
          {resultado ? `${(resultado.prob * 100).toFixed(1)}%` : "—"}
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: resultado?.fraude ? "var(--status-critical)" : "var(--status-good)" }}
        >
          {resultado?.fraude ? "Risco alto de fraude" : "Transação segura"}
        </p>
        <p className="mt-4 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Demais dados da transação permanecem fixos no perfil escolhido. Processado 100% no seu
          navegador — nenhum dado sai do seu dispositivo.
        </p>
      </div>
    </div>
  );
}
