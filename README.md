# Detecção de Fraudes em Transações Financeiras

Projeto prático que reproduz a metodologia do TCC "Detecção de Atividades
Fraudulentas em Transações Financeiras Utilizando Inteligência Artificial".
O pipeline carrega os dados de transações de cartão de crédito, faz o
pré-processamento (limpeza, balanceamento e normalização), treina três
modelos de aprendizado supervisionado (Random Forest, XGBoost e Decision
Tree) e compara o desempenho deles através de métricas e gráficos.

## Dataset

O dataset usado é o **Credit Card Fraud Detection**, disponível publicamente
no Kaggle:

https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

1. Baixe o arquivo `creditcard.csv` do link acima (é necessário uma conta no Kaggle).
2. Coloque o arquivo dentro da pasta `data/`, de forma que o caminho final seja:

```
data/creditcard.csv
```

Se o arquivo não for encontrado, o script avisa claramente e mostra o link
para download, em vez de quebrar com um erro genérico.

## Instalação

```bash
pip install -r requirements.txt
```

## Como rodar

```bash
python main.py
```

O script executa todo o pipeline (carregamento, limpeza, balanceamento,
normalização, divisão treino/teste, treinamento dos 3 modelos e avaliação)
e ao final:

- Imprime no terminal uma tabela comparando os 3 modelos nas métricas de
  acurácia, precisão, recall e F1-score.
- Salva em `outputs/`:
  - Uma matriz de confusão (heatmap) para cada modelo.
  - Um gráfico de barras comparando as 4 métricas entre os 3 modelos.
  - Um arquivo `resultados.csv` com a tabela de métricas.

## Resultados esperados

Os resultados abaixo são os obtidos no TCC original. Como o balanceamento
usa amostragem aleatória, os resultados desta execução podem variar
ligeiramente, mas devem ficar numa faixa parecida.

| Modelo        | Acurácia | Precisão | Recall | F1-Score |
|---------------|----------|----------|--------|----------|
| Random Forest | 98,30%   | 98,43%   | 84,46% | 90,91%   |
| XGBoost       | 98,10%   | 96,15%   | 84,46% | 89,93%   |
| Decision Tree | 97,36%   | 86,09%   | 87,84% | 86,96%   |

Random Forest teve o melhor desempenho geral; Decision Tree teve o melhor
recall, mas a menor precisão.

## Extensões futuras (fora do escopo atual)

- Interface simples (ex.: Streamlit) para testar uma transação manualmente.
- Validação cruzada e otimização de hiperparâmetros.
- Testar um método de balanceamento diferente (ex.: SMOTE) e comparar com
  o undersampling manual.
