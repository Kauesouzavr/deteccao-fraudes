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

## Validação cruzada e otimização de hiperparâmetros

Além do pipeline principal, `validacao_cruzada.py` faz duas análises extras:

```bash
python validacao_cruzada.py
```

1. **Validação cruzada estratificada** (5 folds) com os parâmetros padrão
   dos 3 modelos, pra confirmar que o desempenho é estável e não depende de
   uma única divisão treino/teste sortuda:

   | Modelo        | F1-Score (média ± desvio) |
   |---------------|----------------------------|
   | XGBoost       | 91,28% ± 1,69%             |
   | Random Forest | 90,71% ± 1,38%             |
   | Decision Tree | 84,43% ± 3,67%             |

2. **Otimização de hiperparâmetros** via `RandomizedSearchCV` (20
   combinações, 5 folds), comparando o modelo padrão com o otimizado no
   mesmo conjunto de teste. Random Forest e XGBoost já estavam bem
   ajustados (variação dentro da margem de ruído), mas a **Decision Tree
   tinha overfitting** — sem limite de profundidade, ela decorava o
   conjunto de treino. Limitando a profundidade (`max_depth=5`) o F1-Score
   subiu de 86,44% para 89,81%.

Os resultados completos ficam salvos em `outputs/validacao_cruzada.csv` e
`outputs/comparacao_hiperparametros.csv`.

## Undersampling vs. SMOTE

`comparacao_balanceamento.py` testa uma estratégia de balanceamento
diferente — **SMOTE** (gera transações fraudulentas sintéticas por
interpolação, em vez de descartar transações legítimas) — contra o
undersampling manual usado no pipeline principal.

```bash
python comparacao_balanceamento.py
```

Para essa comparação ser justa e sem vazamento de dados, a metodologia aqui
é **diferente** da do `main.py`: os dados são divididos em treino/teste
**antes** de balancear, o balanceamento (undersampling ou SMOTE) é aplicado
só no treino, e a avaliação usa o conjunto de teste com a distribuição real
de fraude (~0,17%) — bem mais desbalanceado que o teste de ~10% usado no
pipeline principal e no `validacao_cruzada.py`. Por isso os números abaixo
não são diretamente comparáveis à tabela de "Resultados esperados" acima.

| Estratégia     | Modelo        | Acurácia | Precisão | Recall | F1-Score |
|----------------|---------------|----------|----------|--------|----------|
| Undersampling  | Random Forest | 99,87%   | 57,58%   | 80,51% | 67,14%   |
| Undersampling  | XGBoost       | 99,74%   | 37,69%   | 83,05% | 51,85%   |
| Undersampling  | Decision Tree | 97,90%   | 6,20%    | 82,20% | 11,53%   |
| SMOTE          | Random Forest | 99,95%   | 91,00%   | 77,12% | 83,49%   |
| SMOTE          | XGBoost       | 99,94%   | 86,67%   | 77,12% | 81,61%   |
| SMOTE          | Decision Tree | 99,71%   | 33,33%   | 74,58% | 46,07%   |

**SMOTE vence com folga em todos os modelos.** O undersampling descarta
~98% das transações legítimas de treino (fica só com 3.550 registros), então
o modelo vê pouquíssima variedade de padrões "normais" e erra muito mais
quando confrontado com o volume real de transações legítimas — a precisão
da Decision Tree despenca pra 6%, ou seja, a cada ~16 alertas de fraude, só
1 é real. O SMOTE mantém todas as transações legítimas reais e só
complementa a classe minoritária, generalizando muito melhor para o cenário
real de produção. Resultados completos em
`outputs/comparacao_balanceamento.csv`.

## Simulador ao vivo no dashboard

`exportar_modelo_web.py` exporta o Random Forest com os melhores
hiperparâmetros (encontrados em `validacao_cruzada.py`) em formato JSON —
cada árvore vira uma estrutura de nós que o próprio navegador percorre em
JavaScript, sem precisar de um backend Python em produção.

```bash
python exportar_modelo_web.py
```

No dashboard, a seção "Teste você mesmo" deixa escolher uma transação real
de exemplo e ajustar **Valor** e **Horário** (os únicos dois campos com
significado no mundo real — as outras 28 variáveis, V1-V28, são componentes
anonimizados por PCA e não têm um valor "editável" que faça sentido) pra ver
a previsão de fraude mudar instantaneamente.

## Limitações

Esse projeto treina e valida tudo usando **um único dataset** (o Credit Card
Fraud Detection do Kaggle). Isso não é uma falha específica deste projeto —
é a realidade de praticamente qualquer projeto público de detecção de
fraude: dados reais de transações bancárias são extremamente sigilosos (por
lei e por concorrência entre instituições), então não existe forma de uma
pessoa física conseguir dados de múltiplos bancos pra treinar um modelo mais
"universal". Os datasets públicos disponíveis (como este) são praticamente
os únicos usados pela comunidade de ML pra esse tipo de estudo.

Na prática, isso significa que os modelos aqui **não têm garantia de
generalizar** para:

- Transações de outro banco ou bandeira de cartão (padrões de fraude variam
  entre instituições).
- Outro período de tempo (os padrões de fraude mudam — novas técnicas de
  golpe surgem constantemente, e o dataset é de uma janela de tempo fixa).
- Outro país ou perfil de consumo.

Um sistema de detecção de fraude em produção de verdade é treinado e
re-treinado continuamente com os dados internos e atualizados do próprio
banco, geralmente combinado com outras informações que não estão neste
dataset (geolocalização, dispositivo usado, histórico do cliente, etc.).
Este projeto deve ser entendido como uma **prova de conceito educacional**
da metodologia de ML aplicada a esse tipo de problema, não como um sistema
pronto para produção.

## Extensões futuras (fora do escopo atual)

Todos os itens planejados originalmente já foram implementados (validação
cruzada, otimização de hiperparâmetros, comparação com SMOTE, e um
simulador interativo — que acabou substituindo a ideia original de uma
interface separada em Streamlit, já que roda direto no dashboard, no
navegador, sem servidor).
