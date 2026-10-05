"""
Exporta o Random Forest com os melhores hiperparâmetros (encontrados em
validacao_cruzada.py) em formato JSON, pra rodar inferência direto no
navegador (TypeScript) sem precisar de um backend Python em produção.
Também exporta algumas transações reais de exemplo pro simulador
interativo do dashboard.

Como rodar: python exportar_modelo_web.py
"""

import json
import os

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from main import carregar_dados, limpar_dados, balancear_dados, SEMENTE_ALEATORIA

CAMINHO_SAIDA = os.path.join("web", "public", "dados", "modelo_demo.json")
FEATURES_V = [f"V{i}" for i in range(1, 29)]
COLUNAS_MODELO = FEATURES_V + ["Amount", "Time"]
N_EXEMPLOS_POR_CLASSE = 4

# Melhores parâmetros encontrados pelo RandomizedSearchCV em validacao_cruzada.py
MELHORES_PARAMETROS = {
    "n_estimators": 100,
    "min_samples_split": 5,
    "min_samples_leaf": 2,
    "max_features": "log2",
    "max_depth": 5,
}


def exportar_arvore(arvore):
    """Converte uma árvore (sklearn.tree_) numa estrutura de nós aninhados
    simples o bastante pra percorrer em JavaScript."""
    t = arvore.tree_

    def no(indice):
        if t.children_left[indice] == t.children_right[indice]:
            valores = t.value[indice][0]
            prob_fraude = float(valores[1] / valores.sum())
            return {"folha": True, "probFraude": round(prob_fraude, 6)}
        return {
            "folha": False,
            "feature": int(t.feature[indice]),
            "limite": float(t.threshold[indice]),
            "esquerda": no(t.children_left[indice]),
            "direita": no(t.children_right[indice]),
        }

    return no(0)


def selecionar_exemplos(df_normalizado, valores_originais):
    """Escolhe algumas transações reais (fraude e legítimas) pra servir de
    ponto de partida no simulador interativo."""
    rng = np.random.RandomState(SEMENTE_ALEATORIA)

    indices_fraude = df_normalizado[df_normalizado["Class"] == 1].index.to_numpy()
    indices_legitima = df_normalizado[df_normalizado["Class"] == 0].index.to_numpy()
    escolhidos = np.concatenate(
        [
            rng.choice(indices_fraude, size=N_EXEMPLOS_POR_CLASSE, replace=False),
            rng.choice(indices_legitima, size=N_EXEMPLOS_POR_CLASSE, replace=False),
        ]
    )
    rng.shuffle(escolhidos)

    exemplos = []
    for idx in escolhidos:
        linha = df_normalizado.loc[idx]
        exemplos.append(
            {
                "id": int(idx),
                "classeReal": int(linha["Class"]),
                "valorOriginal": round(float(valores_originais.loc[idx, "Amount"]), 2),
                "tempoOriginalSegundos": round(float(valores_originais.loc[idx, "Time"]), 0),
                "features": [round(float(linha[c]), 6) for c in COLUNAS_MODELO],
            }
        )
    return exemplos


def main():
    os.makedirs(os.path.dirname(CAMINHO_SAIDA), exist_ok=True)

    df = carregar_dados()
    df = limpar_dados(df)
    df = balancear_dados(df)

    valores_originais = df[["Amount", "Time"]].copy()

    scaler = StandardScaler()
    df_normalizado = df.copy()
    df_normalizado[["Amount", "Time"]] = scaler.fit_transform(df[["Amount", "Time"]])

    X = df_normalizado[COLUNAS_MODELO]
    y = df_normalizado["Class"]

    print("Treinando Random Forest com os melhores hiperparâmetros encontrados...")
    modelo = RandomForestClassifier(random_state=SEMENTE_ALEATORIA, **MELHORES_PARAMETROS)
    modelo.fit(X, y)

    print(f"Exportando {len(modelo.estimators_)} árvores...")
    arvores = [exportar_arvore(arvore) for arvore in modelo.estimators_]

    exemplos = selecionar_exemplos(df_normalizado, valores_originais)

    dados_export = {
        "featureNames": COLUNAS_MODELO,
        "indiceAmount": COLUNAS_MODELO.index("Amount"),
        "indiceTime": COLUNAS_MODELO.index("Time"),
        "scaler": {
            "amountMean": float(scaler.mean_[0]),
            "amountScale": float(scaler.scale_[0]),
            "timeMean": float(scaler.mean_[1]),
            "timeScale": float(scaler.scale_[1]),
        },
        "arvores": arvores,
        "exemplos": exemplos,
    }

    with open(CAMINHO_SAIDA, "w", encoding="utf-8") as arquivo:
        json.dump(dados_export, arquivo, ensure_ascii=False)

    tamanho_kb = os.path.getsize(CAMINHO_SAIDA) / 1024
    print(f"\nModelo exportado para: {CAMINHO_SAIDA} ({tamanho_kb:.0f} KB)")


if __name__ == "__main__":
    main()
