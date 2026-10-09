import { describe, expect, it } from "vitest";
import { converterParaSRT, formatarTempo } from "./srt";

const defaults = { blockSeconds: 5, gapSeconds: 0 };

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
        expect(content.length).toBeLessThanOrEqual(500);
        expect(content.split(/\s+/).length).toBeLessThanOrEqual(100);
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
    expect(content.map((block) => block.length)).toEqual([500, 500, 100]);
    expect(content.join("")).toBe("a".repeat(1100));
  });
  it("usa segundos fracionados e intervalo configurável em todos os blocos", async () => {
    const result = await converterParaSRT("a".repeat(501), {
      blockSeconds: 4.5,
      gapSeconds: 0.3,
    });
    expect(result.srt).toContain("00:00:00,000 --> 00:00:04,500");
    expect(result.srt).toContain("00:00:04,800 --> 00:00:09,300");
    expect(result.duration).toBeCloseTo(9.3);
    expect(formatarTempo(59.9996)).toBe("00:01:00,000");
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
