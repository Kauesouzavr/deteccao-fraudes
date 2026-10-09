import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Detecção de Fraudes com Machine Learning",
  description:
    "Dashboard comparando Random Forest, XGBoost e Decision Tree na detecção de fraudes em transações de cartão de crédito.",
};

const SCRIPT_TEMA = `
  try {
    var t = localStorage.getItem("tema");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
`;

const DIRECTION_CONTRACT = `<!--
THESIS: a portfolio dashboard that proves its mechanism instead of reporting it —
the first viewport is a live trained model, not a metrics card grid.
OWN-WORLD: fintech-grade product UI (Nubank/Inter/Stripe Dashboard register):
IBM Plex Sans + Plex Mono for data, one committed indigo accent (#2f3ced /
#7b86ff dark), near-black/cool-gray neutrals, soft-offset card shadows, sticky
top nav with live-status pill and light/dark toggle.
STORY: a recruiter sees a real trained Random Forest answer live, in-browser,
then skims rigorous evidence (cross-validation, tuning, SMOTE comparison).
FIRST VIEWPORT: two columns — headline + ticker stat row (left), the live
predictor panel (right); no eyebrow label, no isolated stat-card grid.
FORM: fintech-dashboard direction, user-pinned brief ("como site de banco"),
code-led (no image generation available this session). seed: deteccao-fraudes-fintech-v1
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "var(--surface-page)" }}>
        <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
