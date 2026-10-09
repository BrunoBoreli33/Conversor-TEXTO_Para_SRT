import { useEffect, useRef, useState } from "react";
import { converterParaSRT, pause, type SrtResult } from "@/lib/srt";

export function useConverter() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SrtResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLPreElement>(null);
  const busyRef = useRef(false);
  const generation = useRef(0);
  const copyVersion = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(
    () => () => {
      generation.current++;
      copyVersion.current++;
      clearTimeout(copyTimer.current);
    },
    [],
  );

  function resetCopy() {
    copyVersion.current++;
    clearTimeout(copyTimer.current);
    setCopyLabel("Copiar");
  }

  function updateText(value: string) {
    if (busyRef.current) return;
    setText(value);
    setResult(null);
    setError("");
    resetCopy();
    if (result)
      setAnnouncement(
        "Texto alterado. Converta novamente para atualizar as legendas.",
      );
  }

  async function convert() {
    if (busyRef.current) return;
    if (!text.trim()) {
      setError("Escreva ou cole um texto para começar.");
      inputRef.current?.focus();
      return;
    }
    const id = ++generation.current;
    const active = () => generation.current === id;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    setProgress(0);
    resetCopy();
    setAnnouncement("Conversão iniciada. Criando suas legendas.");
    try {
      await pause(240);
      if (!active()) return;
      setProgress(12);
      const converted = await converterParaSRT(text, (value) => {
        if (active()) setProgress(value);
      });
      if (!active()) return;
      await pause(280);
      if (!active()) return;
      setProgress(92);
      await pause(280);
      if (!active()) return;
      setProgress(100);
      await pause(180);
      if (!active()) return;
      setResult(converted);
      setAnnouncement(
        `Conversão concluída. ${converted.count} ${converted.count === 1 ? "bloco gerado" : "blocos gerados"}. Seu arquivo SRT está pronto para baixar.`,
      );
    } catch {
      if (!active()) return;
      setError(
        "Não foi possível converter. Tente novamente com um texto menor.",
      );
      setAnnouncement("Não foi possível concluir a conversão.");
    } finally {
      if (active()) {
        setBusy(false);
        busyRef.current = false;
      }
    }
  }

  function download() {
    if (!result || busyRef.current) return;
    const blob = new Blob([result.srt + "\n"], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "legendas.srt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement("Download do arquivo legendas.srt iniciado.");
  }

  async function copy() {
    if (!result || busyRef.current) return;
    const version = copyVersion.current;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(result.srt);
      if (version !== copyVersion.current) return;
      setCopyLabel("Copiado!");
      setAnnouncement("Legendas copiadas.");
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyLabel("Copiar"), 2000);
    } catch {
      if (version !== copyVersion.current || !previewRef.current) return;
      const range = document.createRange();
      range.selectNodeContents(previewRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      previewRef.current.focus();
      setCopyLabel("Ctrl+C para copiar");
      setAnnouncement(
        "Selecionei as legendas. Pressione Ctrl+C ou use a opção Copiar do seu dispositivo.",
      );
    }
  }

  function clear() {
    if (busyRef.current) return;
    updateText("");
    setAnnouncement("Texto e legendas limpos. Pronto para uma nova criação.");
    inputRef.current?.focus();
  }

  return {
    text,
    result,
    busy,
    progress,
    error,
    announcement,
    copyLabel,
    inputRef,
    previewRef,
    updateText,
    convert,
    download,
    copy,
    clear,
  };
}
