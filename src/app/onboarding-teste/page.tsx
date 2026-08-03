import type { Metadata } from "next";
import { Experience } from "@/components/Experience";

/**
 * Rota de AVALIAÇÃO do onboarding — fora dos mecanismos de busca (noindex/
 * nofollow) e sem link de nenhum lugar do app. Sempre mostra o onboarding
 * completo e nunca marca como visto: replay infinito.
 */
export const metadata: Metadata = {
  title: "Collection — Onboarding (teste)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Experience forceOnboarding />;
}
