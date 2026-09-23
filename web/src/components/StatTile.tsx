export function StatTile({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface-card)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {rotulo}
      </p>
      <p
        className="text-2xl font-semibold tabular-nums"
        style={{ color: destaque ? "var(--series-1)" : "var(--text-primary)" }}
      >
        {valor}
      </p>
    </div>
  );
}
