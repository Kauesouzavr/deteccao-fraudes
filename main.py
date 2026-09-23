"""
Detecção de Fraudes em Transações Financeiras com Machine Learning
=====================================================================
Implementação prática do TCC "Detecção de Atividades Fraudulentas em
Transações Financeiras Utilizando Inteligência Artificial".

Pipeline: carregar dados -> limpar -> balancear -> normalizar ->
dividir treino/teste -> treinar 3 modelos -> avaliar -> gerar gráficos.

Como rodar: python main.py
"""

import os
import sys

# Garante que acentos apareçam corretamente no terminal do Windows
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

# Caminhos usados pelo projeto
CAMINHO_DADOS = os.path.join("data", "creditcard.csv")
PASTA_SAIDA = "outputs"
SEMENTE_ALEATORIA = 42  # fixa em toda amostragem/divisão/modelo para reprodutibilidade


def carregar_dados():
    """Carrega o dataset do Kaggle. Avisa claramente se o arquivo não existir."""
    if not os.path.exists(CAMINHO_DADOS):
        print("=" * 70)
        print("ERRO: arquivo 'data/creditcard.csv' não encontrado.")
        print()
        print("Baixe o dataset 'Credit Card Fraud Detection' no Kaggle:")
        print("https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
        print()
        print("Depois, coloque o arquivo creditcard.csv dentro da pasta 'data/'.")
        print("=" * 70)
        sys.exit(1)

    print("Carregando o dataset...")
    df = pd.read_csv(CAMINHO_DADOS)
    print(f"Dataset carregado: {len(df)} transações, {df['Class'].sum()} fraudes.")
    return df


def limpar_dados(df):
    """Remove linhas duplicadas do dataset."""
    print("\nRemovendo linhas duplicadas...")
    linhas_antes = len(df)
    df = df.drop_duplicates()
    linhas_removidas = linhas_antes - len(df)
    print(f"Duplicadas removidas: {linhas_removidas}. Restaram {len(df)} linhas.")
    return df


def balancear_dados(df):
    """
    Undersampling manual: mantém todas as transações fraudulentas e
    seleciona aleatoriamente uma amostra das legítimas até chegar a
    uma proporção de ~10% de fraude no total.
    """
    print("\nBalanceando os dados (undersampling manual)...")

    fraudes = df[df["Class"] == 1]
    legitimas = df[df["Class"] == 0]

    # Para ter 10% de fraude no total: total = fraudes * 10 -> legítimas = fraudes * 9
    n_legitimas_desejado = len(fraudes) * 9
    legitimas_amostradas = legitimas.sample(
        n=n_legitimas_desejado, random_state=SEMENTE_ALEATORIA
    )

    df_balanceado = pd.concat([fraudes, legitimas_amostradas])
    # Embaralha o resultado final
    df_balanceado = df_balanceado.sample(
        frac=1, random_state=SEMENTE_ALEATORIA
    ).reset_index(drop=True)

    proporcao_fraude = df_balanceado["Class"].mean() * 100
    print(
        f"Dados balanceados: {len(df_balanceado)} transações "
        f"({len(fraudes)} fraudes + {len(legitimas_amostradas)} legítimas), "
        f"{proporcao_fraude:.2f}% de fraude."
    )
    return df_balanceado


def normalizar_dados(df):
    """Aplica StandardScaler nas colunas Amount e Time (V1-V28 já vêm normalizadas via PCA)."""
    print("\nNormalizando as colunas 'Amount' e 'Time'...")
    df = df.copy()
    scaler = StandardScaler()
    df[["Amount", "Time"]] = scaler.fit_transform(df[["Amount", "Time"]])
    return df


def dividir_treino_teste(df):
    """Divide os dados em treino (75%) e teste (25%), mantendo a proporção de classes."""
    print("\nDividindo em treino (75%) e teste (25%)...")
    X = df.drop(columns=["Class"])
    y = df["Class"]

    X_treino, X_teste, y_treino, y_teste = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=SEMENTE_ALEATORIA
    )

    print(
        f"Treino: {len(X_treino)} registros | "
        f"Teste: {len(X_teste)} registros ({y_teste.sum()} fraudes)."
    )
    return X_treino, X_teste, y_treino, y_teste


def treinar_e_avaliar_modelos(X_treino, X_teste, y_treino, y_teste):
    """Treina os 3 modelos e calcula as métricas de avaliação para cada um."""
    modelos = {
        "Random Forest": RandomForestClassifier(random_state=SEMENTE_ALEATORIA),
        "XGBoost": XGBClassifier(random_state=SEMENTE_ALEATORIA, eval_metric="logloss"),
        "Decision Tree": DecisionTreeClassifier(random_state=SEMENTE_ALEATORIA),
    }

    resultados = []
    matrizes_confusao = {}

    for nome, modelo in modelos.items():
        print(f"\nTreinando modelo: {nome}...")
        modelo.fit(X_treino, y_treino)
        previsoes = modelo.predict(X_teste)

        acuracia = accuracy_score(y_teste, previsoes)
        precisao = precision_score(y_teste, previsoes)
        recall = recall_score(y_teste, previsoes)
        f1 = f1_score(y_teste, previsoes)

        resultados.append(
            {
                "Modelo": nome,
                "Acuracia": acuracia,
                "Precisao": precisao,
                "Recall": recall,
                "F1-Score": f1,
            }
        )
        matrizes_confusao[nome] = confusion_matrix(y_teste, previsoes)

        print(
            f"  Acurácia: {acuracia:.4f} | Precisão: {precisao:.4f} | "
            f"Recall: {recall:.4f} | F1-Score: {f1:.4f}"
        )

    return pd.DataFrame(resultados), matrizes_confusao


def exibir_tabela_comparativa(df_resultados):
    """Imprime no terminal a tabela comparando os 3 modelos."""
    print("\n" + "=" * 70)
    print("TABELA COMPARATIVA DE DESEMPENHO DOS MODELOS")
    print("=" * 70)
    tabela = df_resultados.copy()
    for coluna in ["Acuracia", "Precisao", "Recall", "F1-Score"]:
        tabela[coluna] = (tabela[coluna] * 100).round(2).astype(str) + "%"
    print(tabela.to_string(index=False))
    print("=" * 70)


def salvar_matrizes_confusao(matrizes_confusao):
    """Gera e salva um heatmap da matriz de confusão para cada modelo."""
    print("\nGerando matrizes de confusão...")
    for nome, matriz in matrizes_confusao.items():
        plt.figure(figsize=(5, 4))
        sns.heatmap(
            matriz,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=["Legítima", "Fraude"],
            yticklabels=["Legítima", "Fraude"],
        )
        plt.title(f"Matriz de Confusão - {nome}")
        plt.xlabel("Previsto")
        plt.ylabel("Real")
        plt.tight_layout()

        nome_arquivo = nome.lower().replace(" ", "_")
        caminho = os.path.join(PASTA_SAIDA, f"matriz_confusao_{nome_arquivo}.png")
        plt.savefig(caminho)
        plt.close()
        print(f"  Salvo: {caminho}")


def salvar_grafico_comparativo(df_resultados):
    """Gera e salva um gráfico de barras comparando as 4 métricas entre os modelos."""
    print("\nGerando gráfico comparativo...")
    metricas = ["Acuracia", "Precisao", "Recall", "F1-Score"]
    df_plot = df_resultados.set_index("Modelo")[metricas]

    df_plot.plot(kind="bar", figsize=(9, 6), rot=0)
    plt.title("Comparação de Desempenho entre os Modelos")
    plt.ylabel("Valor da Métrica")
    plt.ylim(0, 1)
    plt.legend(title="Métrica")
    plt.tight_layout()

    caminho = os.path.join(PASTA_SAIDA, "comparacao_modelos.png")
    plt.savefig(caminho)
    plt.close()
    print(f"  Salvo: {caminho}")


def salvar_resultados_csv(df_resultados):
    """Salva a tabela de métricas em outputs/resultados.csv."""
    caminho = os.path.join(PASTA_SAIDA, "resultados.csv")
    df_resultados.to_csv(caminho, index=False)
    print(f"\nResultados salvos em: {caminho}")


def main():
    os.makedirs(PASTA_SAIDA, exist_ok=True)

    df = carregar_dados()
    df = limpar_dados(df)
    df = balancear_dados(df)
    df = normalizar_dados(df)

    X_treino, X_teste, y_treino, y_teste = dividir_treino_teste(df)

    df_resultados, matrizes_confusao = treinar_e_avaliar_modelos(
        X_treino, X_teste, y_treino, y_teste
    )

    exibir_tabela_comparativa(df_resultados)
    salvar_matrizes_confusao(matrizes_confusao)
    salvar_grafico_comparativo(df_resultados)
    salvar_resultados_csv(df_resultados)

    print("\nPipeline concluído com sucesso!")


if __name__ == "__main__":
    main()
