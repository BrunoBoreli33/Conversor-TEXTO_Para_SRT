import { useEffect, useRef, useState } from "react";
import {
  converterParaSRT,
  DEFAULT_BLOCK_SECONDS,
  DEFAULT_GAP_SECONDS,
  pause,
  type SrtResult,
} from "@/lib/srt";

export function useConverter() {
  const [text, setText] = useState("");
  const [blockSeconds, setBlockSeconds] = useState(
    String(DEFAULT_BLOCK_SECONDS),
  );
  const [gapSeconds, setGapSeconds] = useState(String(DEFAULT_GAP_SECONDS));
  const [result, setResult] = useState<SrtResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [invalidSetting, setInvalidSetting] = useState<"block" | "gap" | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLInputElement>(null);
  const gapRef = useRef<HTMLInputElement>(null);
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

  function updateTiming(field: "block" | "gap", value: string) {
    if (busyRef.current) return;
    if (field === "block") setBlockSeconds(value);
    else setGapSeconds(value);
    setResult(null);
    setSettingsError("");
    setInvalidSetting(null);
    resetCopy();
    if (result)
      setAnnouncement(
        "Tempos alterados. Converta novamente para atualizar as legendas.",
      );
  }

  function stepTiming(field: "block" | "gap", direction: -1 | 1) {
    if (busyRef.current) return;
    const value = field === "block" ? blockSeconds : gapSeconds;
    const parsed = Number(value.replace(",", "."));
    const fallback =
      field === "block" ? DEFAULT_BLOCK_SECONDS : DEFAULT_GAP_SECONDS;
    const current = value.trim() && Number.isFinite(parsed) ? parsed : fallback;
    const minimum = field === "block" ? 0.001 : 0;
    const maximum = field === "block" ? 600 : 60;
    const next = Math.min(
      maximum,
      Math.max(minimum, Math.round((current + direction) * 1000) / 1000),
    );
    updateTiming(field, String(next));
  }

  async function convert() {
    if (busyRef.current) return;
    if (!text.trim()) {
      setError("Escreva ou cole um texto para começar.");
      inputRef.current?.focus();
      return;
    }
    const duration = blockSeconds.trim()
      ? Number(blockSeconds.replace(",", "."))
      : NaN;
    const interval = gapSeconds.trim()
      ? Number(gapSeconds.replace(",", "."))
      : NaN;
    if (!Number.isFinite(duration) || duration < 0.001 || duration > 600) {
      setInvalidSetting("block");
      setSettingsError("Defina uma duração entre 0,001 e 600 segundos.");
      blockRef.current?.focus();
      return;
    }
    if (!Number.isFinite(interval) || interval < 0 || interval > 60) {
      setInvalidSetting("gap");
      setSettingsError("Defina um intervalo entre 0 e 60 segundos.");
      gapRef.current?.focus();
      return;
    }
    const id = ++generation.current;
    const active = () => generation.current === id;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    setSettingsError("");
    setInvalidSetting(null);
    setProgress(0);
    resetCopy();
    setAnnouncement("Conversão iniciada. Criando suas legendas.");
    try {
      await pause(240);
      if (!active()) return;
      setProgress(12);
      const converted = await converterParaSRT(
        text,
        { blockSeconds: duration, gapSeconds: interval },
        (value) => {
          if (active()) setProgress(value);
        },
      );
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
    blockSeconds,
    gapSeconds,
    result,
    busy,
    progress,
    error,
    settingsError,
    invalidSetting,
    announcement,
    copyLabel,
    inputRef,
    blockRef,
    gapRef,
    previewRef,
    updateText,
    updateTiming,
    stepTiming,
    convert,
    download,
    copy,
    clear,
  };
}
