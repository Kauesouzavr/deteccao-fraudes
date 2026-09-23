const ETAPAS = [
  {
    titulo: "Carregamento e limpeza",
    descricao: "284.807 transações reais de cartão de crédito, com remoção de duplicatas.",
  },
  {
    titulo: "Balanceamento (undersampling)",
    descricao:
      "O dataset original tem apenas 0,17% de fraudes. Todas as transações fraudulentas foram mantidas e uma amostra aleatória das legítimas foi selecionada até atingir ~10% de fraude.",
  },
  {
    titulo: "Normalização",
    descricao:
      "StandardScaler aplicado às colunas Amount e Time. As variáveis V1–V28 já vêm normalizadas via PCA.",
  },
  {
    titulo: "Divisão treino/teste",
    descricao: "75% treino / 25% teste, com estratificação para preservar a proporção de fraudes.",
  },
  {
    titulo: "Treinamento dos modelos",
    descricao: "Random Forest, XGBoost e Decision Tree, cada um com random_state fixo para reprodutibilidade.",
  },
  {
    titulo: "Avaliação comparativa",
    descricao: "Acurácia, precisão, recall e F1-score calculados no conjunto de teste para cada modelo.",
  },
];

export function Methodology() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {ETAPAS.map((etapa, i) => (
        <li
          key={etapa.titulo}
          className="rounded-xl p-5"
          style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums"
              style={{ background: "var(--series-1)", color: "white" }}
            >
              {i + 1}
            </span>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {etapa.titulo}
            </h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {etapa.descricao}
          </p>
        </li>
      ))}
    </ol>
  );
}
