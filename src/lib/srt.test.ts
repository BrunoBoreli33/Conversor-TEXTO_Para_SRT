import { describe, expect, it } from "vitest";
import { converterParaSRT } from "./srt";

describe("conversão SRT", () => {
  it("preserva acentos e os tempos usados pelo projeto", async () => {
    const result = await converterParaSRT("Olá, mundo! A criação começa aqui.");
    expect(result.srt).toBe(
      "1\n00:00:00,000 --> 00:00:30,000\nOlá, mundo! A criação começa aqui.",
    );
    expect(result.duration).toBe(30);
    expect(result.count).toBe(1);
  });
  it("preserva o roteiro longo com limites e intervalos corretos", async () => {
    const text =
      "O ataque dos sonhos inspira novas histórias. A torcida acompanha cada momento com emoção. "
        .repeat(180)
        .trim();
    const result = await converterParaSRT(text);
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
    expect(blocks[1]).toContain("00:00:40,000 --> 00:01:10,000");
  });
  it("não cria blocos vazios para texto vazio ou palavra muito longa", async () => {
    expect((await converterParaSRT(" \n ")).count).toBe(0);
    const result = await converterParaSRT("a".repeat(1100));
    const content = result.srt
      .split("\n\n")
      .map((block) => block.split("\n")[2]);
    expect(content.map((block) => block.length)).toEqual([500, 500, 100]);
    expect(content.join("")).toBe("a".repeat(1100));
  });
});
