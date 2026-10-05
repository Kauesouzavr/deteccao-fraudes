export type NomeModelo = "Random Forest" | "XGBoost" | "Decision Tree";

export interface InfoDataset {
  totalTransacoesOriginal: number;
  totalFraudesOriginal: number;
  totalAposBalanceamento: number;
  totalFraudesBalanceamento: number;
  totalTeste: number;
  totalFraudesTeste: number;
}

export interface MetricaModelo {
  modelo: NomeModelo;
  acuracia: number;
  precisao: number;
  recall: number;
  f1: number;
}

export type MatrizConfusao = [[number, number], [number, number]];

export interface ImportanciaFeature {
  feature: string;
  importancia: number;
}

export interface PrevisaoModelo {
  classePrevista: 0 | 1;
  probabilidadeFraude: number;
}

export interface AmostraTransacao {
  id: number;
  valor: number;
  tempoSegundos: number;
  classeReal: 0 | 1;
  previsoes: Record<NomeModelo, PrevisaoModelo>;
}

export interface ValidacaoCruzadaLinha {
  modelo: NomeModelo;
  accuracy_media: number;
  accuracy_desvio: number;
  precision_media: number;
  precision_desvio: number;
  recall_media: number;
  recall_desvio: number;
  f1_media: number;
  f1_desvio: number;
}

export interface ComparacaoHiperparametroLinha {
  modelo: NomeModelo;
  versao: "padrão" | "otimizado";
  acuracia: number;
  precisao: number;
  recall: number;
  f1: number;
}

export interface ComparacaoBalanceamentoLinha {
  estrategia: "Undersampling" | "SMOTE";
  modelo: NomeModelo;
  acuracia: number;
  precisao: number;
  recall: number;
  f1: number;
}

export interface DadosResultados {
  infoDataset: InfoDataset;
  metricas: MetricaModelo[];
  matrizesConfusao: Record<NomeModelo, MatrizConfusao>;
  importanciaFeatures: Record<NomeModelo, ImportanciaFeature[]>;
  amostrasTransacoes: AmostraTransacao[];
  validacaoCruzada: ValidacaoCruzadaLinha[] | null;
  comparacaoHiperparametros: ComparacaoHiperparametroLinha[] | null;
  comparacaoBalanceamento: ComparacaoBalanceamentoLinha[] | null;
}
