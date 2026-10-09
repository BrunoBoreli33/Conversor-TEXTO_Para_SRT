export const CARACTERES_POR_BLOCO = 500;
export const PALAVRAS_MAX_BLOCO = 100;
export const DURACAO_BLOCO = 30;
export const INTERVALO_ENTRE_BLOCOS = 10;
export interface SrtResult {
  srt: string;
  count: number;
  duration: number;
}
export const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export function formatarTempo(segundos: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(segundos / 3600))}:${pad(Math.floor((segundos % 3600) / 60))}:${pad(segundos % 60)},000`;
}
// Keep the original timing and sentence-aware splitting; yield during long scripts.
export async function converterParaSRT(
  texto: string,
  onProgress: (value: number) => void = () => {},
): Promise<SrtResult> {
  if (!texto.trim()) return { srt: "", count: 0, duration: 0 };
  const palavras = texto.trim().split(/\s+/);
  const blocos: string[] = [];
  let bloco = "";
  let totalPalavras = 0;
  const emit = (text: string) => {
    if (text.trim()) blocos.push(text.trim());
  };
  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    if (
      bloco &&
      (bloco.length + 1 + palavra.length > CARACTERES_POR_BLOCO ||
        totalPalavras >= PALAVRAS_MAX_BLOCO)
    ) {
      const ponto = bloco.lastIndexOf(".");
      const resto = ponto >= 0 ? bloco.slice(ponto + 1).trim() : "";
      if (
        ponto >= 0 &&
        resto.length + 1 + palavra.length <= CARACTERES_POR_BLOCO
      ) {
        emit(bloco.slice(0, ponto + 1));
        bloco = resto;
        totalPalavras = resto ? resto.split(/\s+/).length : 0;
      } else {
        emit(bloco);
        bloco = "";
        totalPalavras = 0;
      }
    }
    // A single unusually long token must not create an empty cue or exceed the limit.
    if (palavra.length > CARACTERES_POR_BLOCO) {
      emit(bloco);
      const chars = Array.from(palavra);
      for (let n = 0; n < chars.length; n += CARACTERES_POR_BLOCO)
        emit(chars.slice(n, n + CARACTERES_POR_BLOCO).join(""));
      bloco = "";
      totalPalavras = 0;
    } else {
      bloco += (bloco ? " " : "") + palavra;
      totalPalavras++;
    }
    if (i % 500 === 0) {
      onProgress(12 + Math.round(((i + 1) / palavras.length) * 73));
      await pause(0);
    }
  }
  emit(bloco);
  const cues: string[] = [];
  for (let i = 0; i < blocos.length; i++) {
    const inicio = i * (DURACAO_BLOCO + INTERVALO_ENTRE_BLOCOS);
    cues.push(
      `${i + 1}\n${formatarTempo(inicio)} --> ${formatarTempo(inicio + DURACAO_BLOCO)}\n${blocos[i]}`,
    );
    if (i % 500 === 0) await pause(0);
  }
  return {
    srt: cues.join("\n\n"),
    count: blocos.length,
    duration: (blocos.length - 1) * 40 + 30,
  };
}
