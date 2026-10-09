export const CARACTERES_POR_BLOCO = 500;
export const PALAVRAS_MAX_BLOCO = 100;
// Estimated reading pace; the gap is silence and does not add text capacity.
export const CARACTERES_POR_SEGUNDO = 15;
export const PALAVRAS_POR_SEGUNDO = 2.5;
export const DEFAULT_BLOCK_SECONDS = 5;
export const DEFAULT_GAP_SECONDS = 0;
export interface SrtTiming {
  blockSeconds: number;
  gapSeconds: number;
}
export interface SrtResult {
  srt: string;
  count: number;
  duration: number;
}
export const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export function formatarTempo(segundos: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const totalMs = Math.max(0, Math.round(segundos * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const milliseconds = String(totalMs % 1000).padStart(3, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${milliseconds}`;
}
// Size each cue for its display duration, preferring sentence boundaries.
export async function converterParaSRT(
  texto: string,
  timing: SrtTiming,
  onProgress: (value: number) => void = () => {},
): Promise<SrtResult> {
  if (
    !Number.isFinite(timing.blockSeconds) ||
    timing.blockSeconds < 0.001 ||
    timing.blockSeconds > 600 ||
    !Number.isFinite(timing.gapSeconds) ||
    timing.gapSeconds < 0 ||
    timing.gapSeconds > 60
  ) {
    throw new RangeError("Invalid SRT timing");
  }
  if (!texto.trim()) return { srt: "", count: 0, duration: 0 };
  const limiteCaracteres = Math.max(
    1,
    Math.min(
      CARACTERES_POR_BLOCO,
      Math.floor(timing.blockSeconds * CARACTERES_POR_SEGUNDO),
    ),
  );
  const limitePalavras = Math.max(
    1,
    Math.min(
      PALAVRAS_MAX_BLOCO,
      Math.floor(timing.blockSeconds * PALAVRAS_POR_SEGUNDO),
    ),
  );
  const tamanho = (value: string) => Array.from(value).length;
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
      (tamanho(bloco) + 1 + tamanho(palavra) > limiteCaracteres ||
        totalPalavras >= limitePalavras)
    ) {
      const ponto =
        Array.from(bloco.matchAll(/[.!?](?=\s|$)/g)).at(-1)?.index ?? -1;
      const resto = ponto >= 0 ? bloco.slice(ponto + 1).trim() : "";
      if (
        ponto >= 0 &&
        tamanho(resto) + 1 + tamanho(palavra) <= limiteCaracteres
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
    if (tamanho(palavra) > limiteCaracteres) {
      emit(bloco);
      const chars = Array.from(palavra);
      for (let n = 0; n < chars.length; n += limiteCaracteres)
        emit(chars.slice(n, n + limiteCaracteres).join(""));
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
    const inicio = i * (timing.blockSeconds + timing.gapSeconds);
    cues.push(
      `${i + 1}\n${formatarTempo(inicio)} --> ${formatarTempo(inicio + timing.blockSeconds)}\n${blocos[i]}`,
    );
    if (i % 500 === 0) await pause(0);
  }
  return {
    srt: cues.join("\n\n"),
    count: blocos.length,
    duration:
      (blocos.length - 1) * (timing.blockSeconds + timing.gapSeconds) +
      timing.blockSeconds,
  };
}
