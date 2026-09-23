export function Section({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14 border-t" style={{ borderColor: "var(--gridline)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {titulo}
        </h2>
        {descricao && (
          <p className="text-sm mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            {descricao}
          </p>
        )}
        {!descricao && <div className="mb-8" />}
        {children}
      </div>
    </section>
  );
}
