import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Converter from "./Converter";

afterEach(() => vi.restoreAllMocks());

describe("fluxo do conversor", () => {
  it("valida entrada, mostra progresso e invalida legendas após editar", async () => {
    const user = userEvent.setup();
    render(<Converter />);
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Escreva ou cole um texto",
    );
    const input = screen.getByRole("textbox", { name: /Seu texto/ });
    expect(
      screen.getByRole("spinbutton", { name: /Duração por bloco/ }),
    ).toHaveValue(5);
    expect(
      screen.getByRole("spinbutton", { name: /Intervalo entre blocos/ }),
    ).toHaveValue(0);
    fireEvent.change(input, {
      target: { value: "Olá, mundo! Nosso sonho começa agora." },
    });
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Convertendo…" })).toBeDisabled();
    await waitFor(
      () =>
        expect(
          screen.getByLabelText("Prévia do arquivo SRT"),
        ).toHaveTextContent("00:00:00,000 --> 00:00:05,000"),
      { timeout: 4000 },
    );
    expect(screen.getByRole("button", { name: /Baixar/ })).toBeEnabled();
    fireEvent.change(input, { target: { value: "Outro roteiro." } });
    expect(
      screen.queryByLabelText("Prévia do arquivo SRT"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Baixar/ })).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Limpar texto e resultado" }),
    );
    expect(input).toHaveValue("");
  });
  it("aplica tempos personalizados e invalida a prévia quando eles mudam", async () => {
    const user = userEvent.setup();
    render(<Converter />);
    const duration = screen.getByRole("spinbutton", {
      name: /Duração por bloco/,
    });
    const gap = screen.getByRole("spinbutton", {
      name: /Intervalo entre blocos/,
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Seu texto/ }), {
      target: {
        value: "Uma receita deliciosa para preparar em casa. ".repeat(8),
      },
    });
    fireEvent.change(duration, { target: { value: "4.5" } });
    fireEvent.change(gap, { target: { value: "0.3" } });
    await user.click(
      screen.getByRole("button", {
        name: "Aumentar duração por bloco em 1 segundo",
      }),
    );
    expect(duration).toHaveValue(5.5);
    await user.click(
      screen.getByRole("button", {
        name: "Diminuir duração por bloco em 1 segundo",
      }),
    );
    expect(duration).toHaveValue(4.5);
    await user.click(
      screen.getByRole("button", {
        name: "Aumentar intervalo entre blocos em 1 segundo",
      }),
    );
    expect(gap).toHaveValue(1.3);
    await user.click(
      screen.getByRole("button", {
        name: "Diminuir intervalo entre blocos em 1 segundo",
      }),
    );
    expect(gap).toHaveValue(0.3);
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    expect(duration).toBeDisabled();
    expect(gap).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: "Aumentar duração por bloco em 1 segundo",
      }),
    ).toBeDisabled();
    const preview = await screen.findByLabelText(
      "Prévia do arquivo SRT",
      {},
      { timeout: 4000 },
    );
    expect(preview).toHaveTextContent("00:00:04,800 --> 00:00:09,300");
    const originalBlocks = preview.textContent!.split("\n\n");
    expect(screen.getByRole("button", { name: /Baixar/ })).toBeEnabled();
    fireEvent.change(gap, { target: { value: "1" } });
    expect(
      screen.queryByLabelText("Prévia do arquivo SRT"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Baixar/ })).toBeDisabled();
    fireEvent.change(duration, { target: { value: "10" } });
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    const updatedPreview = await screen.findByLabelText(
      "Prévia do arquivo SRT",
      {},
      { timeout: 4000 },
    );
    const updatedBlocks = updatedPreview.textContent!.split("\n\n");
    expect(updatedBlocks.length).toBeLessThan(originalBlocks.length);
    expect(updatedBlocks[0].split("\n")[2].length).toBeGreaterThan(
      originalBlocks[0].split("\n")[2].length,
    );
    expect(updatedPreview).toHaveTextContent("00:00:11,000 --> 00:00:21,000");
    fireEvent.change(duration, { target: { value: "0" } });
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    expect(screen.getByRole("alert")).toHaveTextContent("duração entre");
    expect(duration).toHaveFocus();
  });
  it("copia e baixa SRT sem interpretar HTML colado", async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const createUrl = vi.fn<(blob: Blob) => string>(() => "blob:test");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    let filename = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      filename = this.download;
    });
    render(<Converter />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: '<img src=x onerror="alert(1)"> Olá!' },
    });
    await user.click(screen.getByRole("button", { name: "Converter em SRT" }));
    const preview = await screen.findByLabelText(
      "Prévia do arquivo SRT",
      {},
      { timeout: 4000 },
    );
    expect(preview.querySelector("img")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Copiar" }));
    expect(copy).toHaveBeenCalledWith(preview.textContent);
    await user.click(screen.getByRole("button", { name: /Baixar/ }));
    expect(filename).toBe("legendas.srt");
    const blob = createUrl.mock.calls[0][0];
    expect(blob.type).toBe("text/plain;charset=utf-8");
    const contents = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(blob);
    });
    expect(contents).toBe(preview.textContent + "\n");
  });
});
