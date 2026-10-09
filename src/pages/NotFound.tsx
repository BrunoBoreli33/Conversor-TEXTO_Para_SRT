import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow">404 · FORA DO ROTEIRO</p>
      <h1>
        Essa cena não existe<span>.</span>
      </h1>
      <p>A página que você procura não foi encontrada.</p>
      <Button asChild>
        <Link to="/">Voltar para o conversor</Link>
      </Button>
    </main>
  );
}
