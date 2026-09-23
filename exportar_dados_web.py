"""
Exporta os resultados do pipeline de ML em formato JSON para o dashboard web
(pasta web/). Reaproveita as funções de pré-processamento do main.py e treina
os modelos novamente para obter previsões, probabilidades e importância das
features — dados que o pipeline principal não precisa gerar.

Como rodar: python exportar_dados_web.py
"""

import json
import os

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from xgboost import XGBClassifier

from main import (
    carregar_dados,
    limpar_dados,
    balancear_dados,
    normalizar_dados,
    dividir_treino_teste,
    SEMENTE_ALEATORIA,
)

CAMINHO_SAIDA = os.path.join("web", "public", "dados", "resultados.json")


def treinar_modelos_detalhado(X_treino, X_teste, y_treino, y_teste):
    """Treina os 3 modelos e retorna métricas, matrizes de confusão, previsões,
    probabilidades e importância das features de cada um."""
    modelos = {
        "Random Forest": RandomForestClassifier(random_state=SEMENTE_ALEATORIA),
        "XGBoost": XGBClassifier(random_state=SEMENTE_ALEATORIA, eval_metric="logloss"),
        "Decision Tree": DecisionTreeClassifier(random_state=SEMENTE_ALEATORIA),
    }

    metricas = []
    matrizes = {}
    previsoes = {}
    probabilidades = {}
    importancias = {}

    for nome, modelo in modelos.items():
        print(f"Treinando modelo: {nome}...")
        modelo.fit(X_treino, y_treino)
        pred = modelo.predict(X_teste)
        prob = modelo.predict_proba(X_teste)[:, 1]

        previsoes[nome] = pred
        probabilidades[nome] = prob
        matrizes[nome] = confusion_matrix(y_teste, pred).tolist()

        importancia_ordenada = sorted(
            zip(X_treino.columns, modelo.feature_importances_.tolist()),
            key=lambda item: item[1],
            reverse=True,
        )
        importancias[nome] = [
            {"feature": nome_feature, "importancia": round(valor, 4)}
            for nome_feature, valor in importancia_ordenada[:10]
        ]

        metricas.append(
            {
                "modelo": nome,
                "acuracia": round(accuracy_score(y_teste, pred), 4),
                "precisao": round(precision_score(y_teste, pred), 4),
                "recall": round(recall_score(y_teste, pred), 4),
                "f1": round(f1_score(y_teste, pred), 4),
            }
        )

    return metricas, matrizes, previsoes, probabilidades, importancias


def montar_amostra_transacoes(
    valores_originais, y_teste, previsoes, probabilidades, n_fraude=15, n_legitima=15
):
    """Seleciona uma amostra de transações do conjunto de teste (com valores
    originais de Amount/Time, antes da normalização) para exibir no dashboard,
    junto com a previsão de cada modelo."""
    rng = np.random.RandomState(SEMENTE_ALEATORIA)

    indices_fraude = y_teste[y_teste == 1].index.to_numpy()
    indices_legitima = y_teste[y_teste == 0].index.to_numpy()

    escolhidos_fraude = rng.choice(
        indices_fraude, size=min(n_fraude, len(indices_fraude)), replace=False
    )
    escolhidos_legitima = rng.choice(
        indices_legitima, size=min(n_legitima, len(indices_legitima)), replace=False
    )

    indices_escolhidos = np.concatenate([escolhidos_fraude, escolhidos_legitima])
    rng.shuffle(indices_escolhidos)

    nomes_modelos = list(previsoes.keys())
    amostras = []
    for idx in indices_escolhidos:
        posicao = y_teste.index.get_loc(idx)
        amostras.append(
            {
                "id": int(idx),
                "valor": round(float(valores_originais.loc[idx, "Amount"]), 2),
                "tempoSegundos": round(float(valores_originais.loc[idx, "Time"]), 0),
                "classeReal": int(y_teste.loc[idx]),
                "previsoes": {
                    nome: {
                        "classePrevista": int(previsoes[nome][posicao]),
                        "probabilidadeFraude": round(
                            float(probabilidades[nome][posicao]), 4
                        ),
                    }
                    for nome in nomes_modelos
                },
            }
        )
    return amostras


def main():
    os.makedirs(os.path.dirname(CAMINHO_SAIDA), exist_ok=True)

    df = carregar_dados()
    total_transacoes_original = len(df)
    total_fraudes_original = int(df["Class"].sum())

    df = limpar_dados(df)
    df = balancear_dados(df)

    # Guarda os valores originais de Amount/Time (antes da normalização) para
    # exibir de forma legível no dashboard
    valores_originais = df[["Amount", "Time"]].copy()

    df_normalizado = normalizar_dados(df)
    X_treino, X_teste, y_treino, y_teste = dividir_treino_teste(df_normalizado)

    metricas, matrizes, previsoes, probabilidades, importancias = (
        treinar_modelos_detalhado(X_treino, X_teste, y_treino, y_teste)
    )

    amostras = montar_amostra_transacoes(
        valores_originais, y_teste, previsoes, probabilidades
    )

    dados_export = {
        "infoDataset": {
            "totalTransacoesOriginal": total_transacoes_original,
            "totalFraudesOriginal": total_fraudes_original,
            "totalAposBalanceamento": len(df),
            "totalFraudesBalanceamento": int(df["Class"].sum()),
            "totalTeste": len(y_teste),
            "totalFraudesTeste": int(y_teste.sum()),
        },
        "metricas": metricas,
        "matrizesConfusao": matrizes,
        "importanciaFeatures": importancias,
        "amostrasTransacoes": amostras,
    }

    with open(CAMINHO_SAIDA, "w", encoding="utf-8") as arquivo:
        json.dump(dados_export, arquivo, ensure_ascii=False, indent=2)

    print(f"\nDados exportados para: {CAMINHO_SAIDA}")


if __name__ == "__main__":
    main()
