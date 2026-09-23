import dados from "../../public/dados/resultados.json";
import type { DadosResultados, NomeModelo } from "@/lib/types";
import { StatTile } from "@/components/StatTile";
import { MetricsChart } from "@/components/MetricsChart";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { TransactionExplorer } from "@/components/TransactionExplorer";
import { Methodology } from "@/components/Methodology";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";

const dadosResultados = dados as DadosResultados;
const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];

export default function Home() {
  const { infoDataset, metricas, matrizesConfusao, importanciaFeatures, amostrasTransacoes } =
    dadosResultados;

  const melhorModelo = [...metricas].sort((a, b) => b.f1 - a.f1)[0];
  const taxaFraudeOriginal = (
    (infoDataset.totalFraudesOriginal / infoDataset.totalTransacoesOriginal) *
    100
  ).toFixed(2);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="pt-20 pb-14">
        <div className="mx-auto max-w-5xl px-6">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: "var(--series-1)" }}
          >
            Machine Learning · Detecção de Fraudes
          </p>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4 max-w-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            Detectando fraudes em transações de cartão de crédito com três modelos
            supervisionados
          </h1>
          <p className="text-sm sm:text-base max-w-2xl leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
            Reprodução prática de um TCC que avaliou Random Forest, XGBoost e Decision Tree
            no dataset público{" "}
            <span style={{ color: "var(--text-primary)" }}>Credit Card Fraud Detection</span> (Kaggle),
            com {infoDataset.totalTransacoesOriginal.toLocaleString("pt-BR")} transações reais e
            apenas {taxaFraudeOriginal}% de fraude.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatTile rotulo="Melhor F1-Score" valor={`${(melhorModelo.f1 * 100).toFixed(1)}%`} destaque />
            <StatTile rotulo="Modelo destaque" valor={melhorModelo.modelo} />
            <StatTile
              rotulo="Transações analisadas"
              valor={infoDataset.totalTransacoesOriginal.toLocaleString("pt-BR")}
            />
            <StatTile
              rotulo="Fraudes no dataset"
              valor={infoDataset.totalFraudesOriginal.toLocaleString("pt-BR")}
            />
          </div>
        </div>
      </section>

      <Section
        titulo="Metodologia"
        descricao="Pipeline de pré-processamento e treinamento, na mesma ordem usada no TCC original."
      >
        <Methodology />
      </Section>

      <Section
        titulo="Comparação de desempenho"
        descricao={`Métricas calculadas no conjunto de teste (${infoDataset.totalTeste.toLocaleString(
          "pt-BR"
        )} transações, ${infoDataset.totalFraudesTeste} fraudes).`}
      >
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
        >
          <MetricsChart metricas={metricas} />
        </div>
      </Section>

      <Section
        titulo="Matrizes de confusão"
        descricao="Como cada modelo classificou as transações reais do conjunto de teste."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {MODELOS.map((modelo) => (
            <ConfusionMatrix key={modelo} nome={modelo} matriz={matrizesConfusao[modelo]} />
          ))}
        </div>
      </Section>

      <Section
        titulo="Importância das features"
        descricao="Quais variáveis mais pesaram na decisão de cada modelo (top 10)."
      >
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
        >
          <FeatureImportanceChart dados={importanciaFeatures} />
        </div>
      </Section>

      <Section
        titulo="Explorador de transações"
        descricao="Transações reais do conjunto de teste — veja o que cada modelo previu e compare com o valor real."
      >
        <TransactionExplorer amostras={amostrasTransacoes} />
      </Section>

      <Footer />
    </main>
  );
}
