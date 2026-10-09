import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "#simulador", rotulo: "Simulador" },
  { href: "#desempenho", rotulo: "Desempenho" },
  { href: "#validacao", rotulo: "Validação" },
  { href: "#transacoes", rotulo: "Transações" },
];

export function Nav() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--brand-navy-1) 92%, transparent)",
        borderBottom: "1px solid var(--brand-divider)",
        color: "var(--brand-text)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 h-[64px] flex items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2 4 5v6c0 5.2 3.4 9.4 8 11 4.6-1.6 8-5.8 8-11V5l-8-3Z"
              fill="var(--accent)"
            />
            <path
              d="m9 12 2 2 4-4"
              stroke="var(--brand-text)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-bold tracking-tight">Detecção de Fraudes</span>
        </a>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-accent rounded-full px-3.5 py-1.5 font-semibold transition-colors"
            >
              {link.rotulo}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "var(--brand-alert-soft)", color: "var(--brand-alert)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "currentColor" }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
            </span>
            Monitoramento ativo
          </span>
          <a
            href="https://github.com/Kauesouzavr/deteccao-fraudes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Código no GitHub"
            className="nav-icon-accent flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.57.1.78-.25.78-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
          </a>
          <ThemeToggle variant="accent" />
        </div>
      </div>
    </header>
  );
}
