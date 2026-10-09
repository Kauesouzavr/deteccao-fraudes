export function Footer() {
  return (
    <footer className="border-t py-10" style={{ borderColor: "var(--gridline)" }}>
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Projeto acadêmico — reprodução prática do TCC &ldquo;Detecção de Atividades Fraudulentas em
          Transações Financeiras Utilizando Inteligência Artificial&rdquo;.
        </p>
        <div className="flex gap-4 text-xs">
          <a
            href="https://github.com/Kauesouzavr/deteccao-fraudes"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Código no GitHub
          </a>
          <a
            href="https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Dataset no Kaggle
          </a>
        </div>
      </div>
    </footer>
  );
}
