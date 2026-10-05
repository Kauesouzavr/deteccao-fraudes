"""
Validação cruzada e otimização de hiperparâmetros para os 3 modelos.
Extensão do pipeline principal (main.py): primeiro mede a estabilidade dos
modelos com validação cruzada estratificada (5 folds), depois busca os
melhores hiperparâmetros de cada um via RandomizedSearchCV e compara o
resultado no conjunto de teste contra os parâmetros padrão.

Como rodar: python validacao_cruzada.py
"""

import os

import pandas as pd
from sklearn.base import clone
from sklearn.model_selection import StratifiedKFold, cross_validate, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from main import (
    carregar_dados,
    limpar_dados,
    balancear_dados,
    normalizar_dados,
    dividir_treino_teste,
    SEMENTE_ALEATORIA,
)

PASTA_SAIDA = "outputs"
N_FOLDS = 5
N_ITER_BUSCA = 20
METRICAS_CV = ["accuracy", "precision", "recall", "f1"]

ESPACOS_BUSCA = {
    "Random Forest": {
        "estimador": RandomForestClassifier(random_state=SEMENTE_ALEATORIA),
        "parametros": {
            "n_estimators": [100, 200, 300, 400],
            "max_depth": [None, 5, 10, 15, 20],
            "min_samples_split": [2, 5, 10],
            "min_samples_leaf": [1, 2, 4],
            "max_features": ["sqrt", "log2"],
        },
    },
    "XGBoost": {
        "estimador": XGBClassifier(random_state=SEMENTE_ALEATORIA, eval_metric="logloss"),
        "parametros": {
            "n_estimators": [100, 200, 300],
            "max_depth": [3, 5, 7, 9],
            "learning_rate": [0.01, 0.05, 0.1, 0.2],
            "subsample": [0.7, 0.8, 0.9, 1.0],
            "colsample_bytree": [0.7, 0.8, 0.9, 1.0],
        },
    },
    "Decision Tree": {
        "estimador": DecisionTreeClassifier(random_state=SEMENTE_ALEATORIA),
        "parametros": {
            "max_depth": [None, 5, 10, 15, 20, 30],
            "min_samples_split": [2, 5, 10, 20],
            "min_samples_leaf": [1, 2, 4, 8],
            "criterion": ["gini", "entropy"],
        },
    },
}


def rodar_validacao_cruzada(X, y):
    """Roda validação cruzada estratificada (5 folds) com os parâmetros
    padrão dos 3 modelos, pra medir o quão estável é o desempenho de cada um
    (em vez de depender de uma única divisão treino/teste)."""
    print("\n" + "=" * 70)
    print(f"VALIDAÇÃO CRUZADA ESTRATIFICADA ({N_FOLDS} folds)")
    print("=" * 70)

    kfold = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=SEMENTE_ALEATORIA)

    linhas = []
    for nome, config in ESPACOS_BUSCA.items():
        print(f"\nValidando {nome}...")
        resultado = cross_validate(
            config["estimador"], X, y, cv=kfold, scoring=METRICAS_CV, n_jobs=-1
        )
        linha = {"modelo": nome}
        for metrica in METRICAS_CV:
            valores = resultado[f"test_{metrica}"]
            linha[f"{metrica}_media"] = round(valores.mean(), 4)
            linha[f"{metrica}_desvio"] = round(valores.std(), 4)
            print(
                f"  {metrica:>9}: {valores.mean():.4f} ± {valores.std():.4f} "
                f"(folds: {', '.join(f'{v:.4f}' for v in valores)})"
            )
        linhas.append(linha)

    return linhas


def avaliar(modelo, X_teste, y_teste):
    previsoes = modelo.predict(X_teste)
    return {
        "acuracia": round(accuracy_score(y_teste, previsoes), 4),
        "precisao": round(precision_score(y_teste, previsoes), 4),
        "recall": round(recall_score(y_teste, previsoes), 4),
        "f1": round(f1_score(y_teste, previsoes), 4),
    }


def rodar_otimizacao_hiperparametros(X_treino, X_teste, y_treino, y_teste):
    """Pra cada modelo, treina a versão com parâmetros padrão e busca os
    melhores hiperparâmetros via RandomizedSearchCV, depois compara os dois
    no mesmo conjunto de teste."""
    print("\n" + "=" * 70)
    print(f"OTIMIZAÇÃO DE HIPERPARÂMETROS (RandomizedSearchCV, {N_ITER_BUSCA} combinações)")
    print("=" * 70)

    kfold = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=SEMENTE_ALEATORIA)
    linhas_comparacao = []
    melhores_parametros = {}

    for nome, config in ESPACOS_BUSCA.items():
        print(f"\nOtimizando {nome}...")

        modelo_padrao = clone(config["estimador"])
        modelo_padrao.fit(X_treino, y_treino)
        metricas_padrao = avaliar(modelo_padrao, X_teste, y_teste)

        busca = RandomizedSearchCV(
            estimator=clone(config["estimador"]),
            param_distributions=config["parametros"],
            n_iter=N_ITER_BUSCA,
            scoring="f1",
            cv=kfold,
            random_state=SEMENTE_ALEATORIA,
            n_jobs=-1,
        )
        busca.fit(X_treino, y_treino)
        metricas_otimizado = avaliar(busca.best_estimator_, X_teste, y_teste)

        melhores_parametros[nome] = busca.best_params_
        print(f"  Melhores parâmetros: {busca.best_params_}")
        print(
            f"  F1-Score padrão: {metricas_padrao['f1']:.4f}  ->  "
            f"otimizado: {metricas_otimizado['f1']:.4f} "
            f"({'+' if metricas_otimizado['f1'] >= metricas_padrao['f1'] else ''}"
            f"{(metricas_otimizado['f1'] - metricas_padrao['f1']):.4f})"
        )

        for versao, metricas in [("padrão", metricas_padrao), ("otimizado", metricas_otimizado)]:
            linhas_comparacao.append({"modelo": nome, "versao": versao, **metricas})

    return linhas_comparacao, melhores_parametros


def main():
    os.makedirs(PASTA_SAIDA, exist_ok=True)

    df = carregar_dados()
    df = limpar_dados(df)
    df = balancear_dados(df)
    df_normalizado = normalizar_dados(df)

    X = df_normalizado.drop(columns=["Class"])
    y = df_normalizado["Class"]

    linhas_cv = rodar_validacao_cruzada(X, y)
    caminho_cv = os.path.join(PASTA_SAIDA, "validacao_cruzada.csv")
    pd.DataFrame(linhas_cv).to_csv(caminho_cv, index=False)
    print(f"\nResultados da validação cruzada salvos em: {caminho_cv}")

    X_treino, X_teste, y_treino, y_teste = dividir_treino_teste(df_normalizado)
    linhas_comparacao, melhores_parametros = rodar_otimizacao_hiperparametros(
        X_treino, X_teste, y_treino, y_teste
    )
    caminho_comparacao = os.path.join(PASTA_SAIDA, "comparacao_hiperparametros.csv")
    pd.DataFrame(linhas_comparacao).to_csv(caminho_comparacao, index=False)
    print(f"Comparação padrão vs. otimizado salva em: {caminho_comparacao}")

    print("\n" + "=" * 70)
    print("MELHORES HIPERPARÂMETROS ENCONTRADOS")
    print("=" * 70)
    for nome, parametros in melhores_parametros.items():
        print(f"{nome}: {parametros}")

    print("\nValidação cruzada e otimização de hiperparâmetros concluídas!")


if __name__ == "__main__":
    main()
