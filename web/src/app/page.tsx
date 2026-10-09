import dados from "../../public/dados/resultados.json";
import type { DadosResultados, NomeModelo } from "@/lib/types";
import { Nav } from "@/components/Nav";
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
import { NetworkScene } from "@/components/NetworkScene";

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
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero — faixa de marca forte, estilo site institucional de banco, com o mecanismo
            do produto (modelo rodando ao vivo) flutuando por cima como o "produto em destaque" */}
        <section
          id="simulador"
          className="relative overflow-hidden scroll-mt-[60px]"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <NetworkScene />
          </div>
          <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pb-24">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold mb-5"
                  style={{ background: "var(--brand-alert-soft)", color: "var(--brand-alert)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
                  Análise de risco em tempo real
                </span>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[0.98] mb-5 text-white">
                  Pare a fraude antes dela acontecer.
                </h1>
                <p
                  className="text-base sm:text-lg max-w-md leading-relaxed mb-9"
                  style={{ color: "var(--hero-text-secondary)" }}
                >
                  Um modelo de machine learning treinado pra identificar risco de fraude em
                  transações de cartão, rodando ao vivo — direto no seu navegador, sem enviar
                  nenhum dado pra fora. Simule uma transação ao lado e veja a análise na hora.
                </p>

                <dl className="flex flex-wrap gap-3">
                  {[
                    { rotulo: "Melhor F1-Score", valor: `${(melhorModelo.f1 * 100).toFixed(1)}%` },
                    { rotulo: "Modelo destaque", valor: melhorModelo.modelo },
                    {
                      rotulo: "Transações analisadas",
                      valor: infoDataset.totalTransacoesOriginal.toLocaleString("pt-BR"),
                    },
                    { rotulo: "Taxa real de fraude", valor: `${taxaFraudeOriginal}%` },
                  ].map((item) => (
                    <div
                      key={item.rotulo}
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--accent) 35%, transparent), color-mix(in srgb, var(--accent) 8%, transparent))",
                        border: "1px solid color-mix(in srgb, var(--accent) 45%, transparent)",
                      }}
                    >
                      <dt className="text-[10px] mb-1" style={{ color: "var(--hero-text-secondary)" }}>
                        {item.rotulo}
                      </dt>
                      <dd className="font-mono text-xl font-bold tabular-nums text-white">{item.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div
                className="rounded-2xl p-5 sm:p-6 lg:-my-6"
                style={{ background: "var(--surface-card)", boxShadow: "0 24px 60px -16px rgba(5, 7, 20, 0.55)" }}
              >
                <PredictorDemo />
              </div>
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
          id="desempenho"
          titulo="Comparação de desempenho"
          descricao={`Métricas calculadas no conjunto de teste (${infoDataset.totalTeste.toLocaleString(
            "pt-BR"
          )} transações, ${infoDataset.totalFraudesTeste} fraudes).`}
        >
          <div className="panel p-6 sm:p-8">
            <MetricsChart metricas={metricas} />
          </div>
        </Section>

        {validacaoCruzada && comparacaoHiperparametros && (
          <Section
            id="validacao"
            titulo="Validação cruzada e otimização de hiperparâmetros"
            descricao="5-fold cross-validation confirma que as métricas são estáveis, e uma busca de hiperparâmetros (RandomizedSearchCV, 20 combinações) testa se dá pra melhorar os modelos padrão."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="panel p-6 sm:p-8">
                <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                  Estabilidade (média ± desvio em 5 folds)
                </h3>
                <CrossValidationTable linhas={validacaoCruzada} />
              </div>
              <div className="panel p-6 sm:p-8">
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
            id="balanceamento"
            titulo="Undersampling vs. SMOTE"
            descricao="Metodologia mais rigorosa: balanceamento aplicado só no treino, avaliado contra a distribuição real de fraude (~0,17%) — bem mais desafiadora que o teste balanceado usado acima."
          >
            <div className="panel p-6 sm:p-8">
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
          id="matrizes"
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
          <div className="panel p-6 sm:p-8">
            <FeatureImportanceChart dados={importanciaFeatures} />
          </div>
        </Section>

        <Section
          id="transacoes"
          titulo="Explorador de transações"
          descricao="Transações reais do conjunto de teste — veja o que cada modelo previu e compare com o valor real."
        >
          <TransactionExplorer amostras={amostrasTransacoes} />
        </Section>

        <Footer />
      </main>
    </>
  );
}
