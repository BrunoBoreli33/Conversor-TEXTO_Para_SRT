import { describe, expect, it } from "vitest";
import { converterParaSRT, formatarTempo } from "./srt";

const defaults = { blockSeconds: 5, gapSeconds: 0 };
const roteiro = `Cansei de perder tempo no fogão, errar o ponto do recheio e ainda gastar gás à toa. Até conhecer esse livro com 147 receitas de recheios, com opções práticas, cremosas e até receitas sem fogo. Preparei recheios super cremosos, estáveis e com textura de confeitaria. Tem opção sem panela, sem complicação. E são receitas para tudo. Bolo de festa, bolo de andar com pasta americana, churros, bombom, torta, copo da felicidade, é só escolher a receita e fazer.
Ficou tão perfeito que virou meu segredo de ouro. Eu mesma digo, foi uma bênção encontrar esse livro. Fiz para os encontros da igreja e foi um sucesso. Todo mundo quis saber qual era o segredo de tantos recheios tão cremosos. Se quiser aprender agora, clique no botão do WhatsApp. Você vai receber o livro completo com as 147 receitas de recheios para conhecer e começar a fazer também. Quer fazer também? É só clicar no botão e o material chega no seu WhatsApp rapidinho.
Mas corre, porque o acesso é limitado.`;
const contents = (srt: string) =>
  srt.split("\n\n").map((block) => block.split("\n")[2]);

describe("conversão SRT", () => {
  it("preserva acentos e aplica a duração escolhida", async () => {
    const result = await converterParaSRT(
      "Olá, mundo! A criação começa aqui.",
      defaults,
    );
    expect(result.srt).toBe(
      "1\n00:00:00,000 --> 00:00:05,000\nOlá, mundo! A criação começa aqui.",
    );
    expect(result.duration).toBe(5);
    expect(result.count).toBe(1);
  });
  it("preserva o roteiro longo com limites e intervalos corretos", async () => {
    const text =
      "O ataque dos sonhos inspira novas histórias. A torcida acompanha cada momento com emoção. "
        .repeat(180)
        .trim();
    const result = await converterParaSRT(text, defaults);
    const blocks = result.srt.split("\n\n");
    expect(blocks.length).toBeGreaterThan(10);
    const recovered = blocks
      .map((block, index) => {
        const [number, , content] = block.split("\n");
        expect(Number(number)).toBe(index + 1);
        expect(content.length).toBeLessThanOrEqual(75);
        expect(content.split(/\s+/).length).toBeLessThanOrEqual(12);
        return content;
      })
      .join(" ");
    expect(recovered).toBe(text);
    expect(blocks[1]).toContain("00:00:05,000 --> 00:00:10,000");
  });
  it("não cria blocos vazios para texto vazio ou palavra muito longa", async () => {
    expect((await converterParaSRT(" \n ", defaults)).count).toBe(0);
    const result = await converterParaSRT("a".repeat(1100), defaults);
    const content = result.srt
      .split("\n\n")
      .map((block) => block.split("\n")[2]);
    expect(content.map((block) => block.length)).toEqual([
      ...Array<number>(14).fill(75),
      50,
    ]);
    expect(content.join("")).toBe("a".repeat(1100));
  });
  it("usa segundos fracionados e intervalo configurável em todos os blocos", async () => {
    const result = await converterParaSRT("a".repeat(68), {
      blockSeconds: 4.5,
      gapSeconds: 0.3,
    });
    expect(result.srt).toContain("00:00:00,000 --> 00:00:04,500");
    expect(result.srt).toContain("00:00:04,800 --> 00:00:09,300");
    expect(result.duration).toBeCloseTo(9.3);
    expect(formatarTempo(59.9996)).toBe("00:01:00,000");
  });
  it("divide o mesmo roteiro em textos menores com 3s do que com 10s", async () => {
    const short = await converterParaSRT(roteiro, {
      blockSeconds: 3,
      gapSeconds: 1,
    });
    const long = await converterParaSRT(roteiro, {
      blockSeconds: 10,
      gapSeconds: 1,
    });
    const shortText = contents(short.srt);
    const longText = contents(long.srt);
    expect(short.count).toBeGreaterThan(long.count);
    expect(shortText[0]).toBe("Cansei de perder tempo no fogão, errar");
    expect(longText[0]).toBe(
      "Cansei de perder tempo no fogão, errar o ponto do recheio e ainda gastar gás à toa.",
    );
    for (const [texts, maxChars, maxWords] of [
      [shortText, 45, 7],
      [longText, 150, 25],
    ] as const) {
      expect(texts.join(" ")).toBe(roteiro.replace(/\s+/g, " "));
      for (const text of texts) {
        expect(text.length).toBeLessThanOrEqual(maxChars);
        expect(text.split(/\s+/).length).toBeLessThanOrEqual(maxWords);
      }
    }
    expect(short.srt).toContain("00:00:04,000 --> 00:00:07,000");
    expect(long.srt).toContain("00:00:11,000 --> 00:00:21,000");
    expect(short.duration).toBe((short.count - 1) * 4 + 3);
    expect(long.duration).toBe((long.count - 1) * 11 + 10);
  });
  it("mudar apenas o intervalo preserva a divisão do texto", async () => {
    const withoutGap = await converterParaSRT(roteiro, {
      blockSeconds: 3,
      gapSeconds: 0,
    });
    const withGap = await converterParaSRT(roteiro, {
      blockSeconds: 3,
      gapSeconds: 1,
    });
    expect(contents(withoutGap.srt)).toEqual(contents(withGap.srt));
    expect(withGap.duration - withoutGap.duration).toBe(withGap.count - 1);
  });
  it("preserva números decimais e não corta pares Unicode", async () => {
    const text = "O preço é 1.234,56 reais e o prazo é 3.5 dias.";
    const result = await converterParaSRT(text, {
      blockSeconds: 3,
      gapSeconds: 0,
    });
    expect(contents(result.srt).join(" ")).toBe(text);
    const unicode = await converterParaSRT("😀".repeat(100), defaults);
    expect(contents(unicode.srt)).toEqual(["😀".repeat(75), "😀".repeat(25)]);
  });
  it("recusa tempos inválidos", async () => {
    await expect(
      converterParaSRT("texto", { blockSeconds: 0, gapSeconds: 0 }),
    ).rejects.toThrow(RangeError);
    await expect(
      converterParaSRT("texto", { blockSeconds: 5, gapSeconds: -1 }),
    ).rejects.toThrow(RangeError);
  });
});
