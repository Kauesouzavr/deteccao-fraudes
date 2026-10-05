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
import { CrossValidationTable } from "@/components/CrossValidationTable";
import { HyperparameterTuningTable } from "@/components/HyperparameterTuningTable";
import { BalancingComparisonChart } from "@/components/BalancingComparisonChart";
import { PredictorDemo } from "@/components/PredictorDemo";

const dadosResultados = dados as DadosResultados;
const MODELOS: NomeModelo[] = ["Random Forest", "XGBoost", "Decision Tree"];

export default function Home() {
  const {
    infoDataset,
    metricas,
    matrizesConfusao,
    importanciaFeatures,
    amostrasTransacoes,
    validacaoCruzada,
    comparacaoHiperparametros,
    comparacaoBalanceamento,
  } = dadosResultados;

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
        titulo="Teste você mesmo"
        descricao="Simulador do Random Forest otimizado rodando ao vivo no seu navegador (sem servidor). Escolha uma transação real e ajuste valor e horário pra ver a previsão mudar na hora."
      >
        <div
          className="rounded-xl p-6 sm:p-8"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
        >
          <PredictorDemo />
        </div>
      </Section>

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

      {validacaoCruzada && comparacaoHiperparametros && (
        <Section
          titulo="Validação cruzada e otimização de hiperparâmetros"
          descricao="5-fold cross-validation confirma que as métricas são estáveis, e uma busca de hiperparâmetros (RandomizedSearchCV, 20 combinações) testa se dá pra melhorar os modelos padrão."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div
              className="rounded-xl p-6 sm:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                Estabilidade (média ± desvio em 5 folds)
              </h3>
              <CrossValidationTable linhas={validacaoCruzada} />
            </div>
            <div
              className="rounded-xl p-6 sm:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                Parâmetros padrão vs. otimizados
              </h3>
              <HyperparameterTuningTable linhas={comparacaoHiperparametros} />
              <p className="mt-5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Random Forest e XGBoost já estavam bem ajustados. A Decision Tree tinha
                overfitting sem limite de profundidade — otimizada, ganhou quase 3,4 pontos de F1.
              </p>
            </div>
          </div>
        </Section>
      )}

      {comparacaoBalanceamento && (
        <Section
          titulo="Undersampling vs. SMOTE"
          descricao="Metodologia mais rigorosa: balanceamento aplicado só no treino, avaliado contra a distribuição real de fraude (~0,17%) — bem mais desafiadora que o teste balanceado usado acima."
        >
          <div
            className="rounded-xl p-6 sm:p-8"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
          >
            <BalancingComparisonChart linhas={comparacaoBalanceamento} />
            <p className="mt-8 text-xs leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              O undersampling descarta ~98% das transações legítimas de treino, então os
              modelos veem pouca variedade de padrões normais e erram muito mais contra o
              volume real — a precisão da Decision Tree despenca pra 6% (1 em cada 16 alertas é
              real). O SMOTE mantém todos os dados legítimos reais e só complementa a classe
              minoritária com exemplos sintéticos, generalizando bem melhor.
            </p>
          </div>
        </Section>
      )}

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
