"""
Compara duas estratégias de balanceamento de classes: o undersampling manual
usado no pipeline principal (main.py) e o SMOTE (oversampling sintético da
classe minoritária). Para uma comparação justa e sem vazamento de dados, o
balanceamento é aplicado só no conjunto de treino; o teste fica com a
distribuição real e desbalanceada de fraudes (~0,17%), diferente do main.py
(que balanceia antes de dividir).

Como rodar: python comparacao_balanceamento.py
"""

import os

import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from main import carregar_dados, limpar_dados, balancear_dados, SEMENTE_ALEATORIA

PASTA_SAIDA = "outputs"
RAZAO_BALANCEAMENTO = 1 / 9  # mesma proporção do undersampling do main.py (~10% de fraude)

MODELOS = {
    "Random Forest": RandomForestClassifier(random_state=SEMENTE_ALEATORIA),
    "XGBoost": XGBClassifier(random_state=SEMENTE_ALEATORIA, eval_metric="logloss"),
    "Decision Tree": DecisionTreeClassifier(random_state=SEMENTE_ALEATORIA),
}


def preparar_treino_teste(df):
    """Divide os dados limpos (ainda desbalanceados) em treino/teste e
    normaliza Amount/Time ajustando o scaler só no treino, pra não vazar
    informação do teste."""
    X = df.drop(columns=["Class"])
    y = df["Class"]

    X_treino, X_teste, y_treino, y_teste = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=SEMENTE_ALEATORIA
    )

    scaler = StandardScaler()
    X_treino = X_treino.copy()
    X_teste = X_teste.copy()
    X_treino[["Amount", "Time"]] = scaler.fit_transform(X_treino[["Amount", "Time"]])
    X_teste[["Amount", "Time"]] = scaler.transform(X_teste[["Amount", "Time"]])

    print(
        f"Treino: {len(X_treino)} registros ({y_treino.sum()} fraudes, "
        f"desbalanceado) | Teste: {len(X_teste)} registros ({y_teste.sum()} "
        f"fraudes) — o teste mantém a distribuição real."
    )
    return X_treino, X_teste, y_treino, y_teste


def balancear_com_undersampling(X_treino, y_treino):
    """Reaproveita a lógica de undersampling do main.py, aplicada só no treino."""
    df_treino = X_treino.copy()
    df_treino["Class"] = y_treino.values
    df_balanceado = balancear_dados(df_treino)
    return df_balanceado.drop(columns=["Class"]), df_balanceado["Class"]


def balancear_com_smote(X_treino, y_treino):
    """Gera transações fraudulentas sintéticas via SMOTE até atingir a mesma
    proporção (~10% de fraude) usada no undersampling, pra comparação justa."""
    smote = SMOTE(sampling_strategy=RAZAO_BALANCEAMENTO, random_state=SEMENTE_ALEATORIA)
    X_bal, y_bal = smote.fit_resample(X_treino, y_treino)
    return X_bal, y_bal


def avaliar_estrategia(nome_estrategia, X_treino_bal, y_treino_bal, X_teste, y_teste):
    print(f"\n--- {nome_estrategia} ({len(X_treino_bal)} registros de treino após balanceamento) ---")
    linhas = []
    for nome_modelo, modelo in MODELOS.items():
        modelo = clone(modelo)
        modelo.fit(X_treino_bal, y_treino_bal)
        previsoes = modelo.predict(X_teste)
        linha = {
            "estrategia": nome_estrategia,
            "modelo": nome_modelo,
            "acuracia": round(accuracy_score(y_teste, previsoes), 4),
            "precisao": round(precision_score(y_teste, previsoes), 4),
            "recall": round(recall_score(y_teste, previsoes), 4),
            "f1": round(f1_score(y_teste, previsoes), 4),
        }
        linhas.append(linha)
        print(
            f"  {nome_modelo:>14}: acurácia={linha['acuracia']:.4f} "
            f"precisão={linha['precisao']:.4f} recall={linha['recall']:.4f} "
            f"f1={linha['f1']:.4f}"
        )
    return linhas


def main():
    os.makedirs(PASTA_SAIDA, exist_ok=True)

    df = carregar_dados()
    df = limpar_dados(df)

    X_treino, X_teste, y_treino, y_teste = preparar_treino_teste(df)

    print("\n" + "=" * 70)
    print("COMPARAÇÃO: UNDERSAMPLING MANUAL vs. SMOTE")
    print("(balanceamento aplicado só no treino; teste com distribuição real)")
    print("=" * 70)

    X_under, y_under = balancear_com_undersampling(X_treino, y_treino)
    linhas_under = avaliar_estrategia("Undersampling", X_under, y_under, X_teste, y_teste)

    X_smote, y_smote = balancear_com_smote(X_treino, y_treino)
    linhas_smote = avaliar_estrategia("SMOTE", X_smote, y_smote, X_teste, y_teste)

    df_resultados = pd.DataFrame(linhas_under + linhas_smote)
    caminho = os.path.join(PASTA_SAIDA, "comparacao_balanceamento.csv")
    df_resultados.to_csv(caminho, index=False)
    print(f"\nResultados salvos em: {caminho}")

    print("\nComparação de balanceamento concluída!")


if __name__ == "__main__":
    main()
