export interface NoArvore {
  folha: boolean;
  probFraude?: number;
  feature?: number;
  limite?: number;
  esquerda?: NoArvore;
  direita?: NoArvore;
}

export interface ExemploTransacao {
  id: number;
  classeReal: 0 | 1;
  valorOriginal: number;
  tempoOriginalSegundos: number;
  features: number[];
}

export interface ModeloDemo {
  featureNames: string[];
  indiceAmount: number;
  indiceTime: number;
  scaler: {
    amountMean: number;
    amountScale: number;
    timeMean: number;
    timeScale: number;
  };
  arvores: NoArvore[];
  exemplos: ExemploTransacao[];
}

function percorrerArvore(no: NoArvore, features: number[]): number {
  if (no.folha) return no.probFraude ?? 0;
  const valor = features[no.feature ?? 0];
  return valor <= (no.limite ?? 0)
    ? percorrerArvore(no.esquerda!, features)
    : percorrerArvore(no.direita!, features);
}

/** Roda o mesmo algoritmo do RandomForestClassifier.predict_proba do
 * scikit-learn: a probabilidade final é a média das probabilidades de
 * todas as árvores da floresta. */
export function preverProbabilidade(modelo: ModeloDemo, features: number[]): number {
  const soma = modelo.arvores.reduce((acc, arvore) => acc + percorrerArvore(arvore, features), 0);
  return soma / modelo.arvores.length;
}

/** Reproduz o StandardScaler do scikit-learn: (x - média) / desvio padrão. */
export function normalizarValor(valorOriginal: number, media: number, escala: number): number {
  return (valorOriginal - media) / escala;
}
