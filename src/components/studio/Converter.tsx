import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useConverter } from "@/hooks/use-converter";
import { formatarTempo } from "@/lib/srt";
import { cn } from "@/lib/utils";
import EmptyPreview from "./EmptyPreview";
import ConversionProgress from "./ConversionProgress";
import { motion } from "framer-motion";

export default function Converter() {
  const {
    text,
    blockSeconds,
    gapSeconds,
    result,
    busy,
    error,
    settingsError,
    invalidSetting,
    progress,
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
  } = useConverter();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <section
      className={cn("workspace", busy && "is-converting")}
      aria-label="Conversor de texto para SRT"
    >
      <header className="workspace-header">
        <h1>Texto para SRT</h1>
      </header>

      <form
        id="conversorForm"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void convert();
        }}
      >
        <div className="settings-bar">
          <div className="setting-field">
            <label htmlFor="blockSeconds">Duração por bloco</label>
            <span className="setting-control">
              <input
                id="blockSeconds"
                ref={blockRef}
                type="number"
                min="0.001"
                max="600"
                step="any"
                inputMode="decimal"
                value={blockSeconds}
                onChange={(event) => updateTiming("block", event.target.value)}
                disabled={busy}
                aria-invalid={invalidSetting === "block"}
                aria-describedby={
                  settingsError && invalidSetting === "block"
                    ? "settingsError"
                    : undefined
                }
              />
              <span>s</span>
              <span className="setting-stepper">
                <button
                  type="button"
                  className="step-button step-up"
                  aria-label="Aumentar duração por bloco em 1 segundo"
                  disabled={
                    busy ||
                    (blockSeconds.trim() !== "" && Number(blockSeconds) >= 600)
                  }
                  onClick={() => stepTiming("block", 1)}
                />
                <button
                  type="button"
                  className="step-button step-down"
                  aria-label="Diminuir duração por bloco em 1 segundo"
                  disabled={
                    busy ||
                    (blockSeconds.trim() !== "" &&
                      Number(blockSeconds) <= 0.001)
                  }
                  onClick={() => stepTiming("block", -1)}
                />
              </span>
            </span>
          </div>
          <div className="setting-field">
            <label htmlFor="gapSeconds">Intervalo entre blocos</label>
            <span className="setting-control">
              <input
                id="gapSeconds"
                ref={gapRef}
                type="number"
                min="0"
                max="60"
                step="any"
                inputMode="decimal"
                value={gapSeconds}
                onChange={(event) => updateTiming("gap", event.target.value)}
                disabled={busy}
                aria-invalid={invalidSetting === "gap"}
                aria-describedby={
                  settingsError && invalidSetting === "gap"
                    ? "settingsError"
                    : undefined
                }
              />
              <span>s</span>
              <span className="setting-stepper">
                <button
                  type="button"
                  className="step-button step-up"
                  aria-label="Aumentar intervalo entre blocos em 1 segundo"
                  disabled={
                    busy ||
                    (gapSeconds.trim() !== "" && Number(gapSeconds) >= 60)
                  }
                  onClick={() => stepTiming("gap", 1)}
                />
                <button
                  type="button"
                  className="step-button step-down"
                  aria-label="Diminuir intervalo entre blocos em 1 segundo"
                  disabled={
                    busy ||
                    (gapSeconds.trim() !== "" && Number(gapSeconds) <= 0)
                  }
                  onClick={() => stepTiming("gap", -1)}
                />
              </span>
            </span>
          </div>
          {settingsError && (
            <p id="settingsError" className="settings-error" role="alert">
              {settingsError}
            </p>
          )}
        </div>
        <div className="editors">
          <div className="input-pane">
            <div className="pane-heading">
              <label htmlFor="textoInput">Seu texto</label>
              <motion.button
                className="icon-button"
                type="button"
                id="limparBtn"
                title="Limpar texto"
                aria-label="Limpar texto e resultado"
                disabled={busy || !text.length}
                onClick={clear}
                whileHover={
                  text && !busy ? { scale: 1.16, rotate: -8 } : undefined
                }
                whileTap={text && !busy ? { scale: 0.9 } : undefined}
              >
                <Icon name="trash" />
              </motion.button>
            </div>
            <div className="textarea-wrap">
              <textarea
                id="textoInput"
                ref={inputRef}
                value={text}
                onChange={(event) => updateText(event.target.value)}
                readOnly={busy}
                placeholder="Cole ou digite seu texto aqui…"
                aria-describedby={error ? "inputHint inputError" : "inputHint"}
                aria-invalid={Boolean(error)}
                spellCheck
              />
            </div>
            <div className="input-meta" id="inputHint">
              <span>
                <b id="wordCount">{words.toLocaleString("pt-BR")}</b> palavras
              </span>
              <span>
                <b id="charCount">{text.length.toLocaleString("pt-BR")}</b>{" "}
                caracteres
              </span>
            </div>
            {error && (
              <p id="inputError" className="error-message" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="output-pane" id="outputPane" aria-busy={busy}>
            <div className="pane-heading">
              <h2>Prévia SRT</h2>
              {result && (
                <span className="result-count">
                  {result.count} {result.count === 1 ? "bloco" : "blocos"} ·{" "}
                  {formatarTempo(result.duration)}
                </span>
              )}
            </div>
            <div className="preview-area">
              {busy ? (
                <ConversionProgress progress={progress} />
              ) : result ? (
                <pre
                  id="resultado"
                  ref={previewRef}
                  tabIndex={0}
                  aria-label="Prévia do arquivo SRT"
                >
                  {result.srt}
                </pre>
              ) : (
                <EmptyPreview />
              )}
            </div>
            <div className="output-meta">
              {result && (
                <motion.button
                  type="button"
                  className="copy-button"
                  id="copyBtn"
                  onClick={() => void copy()}
                  whileHover={{ x: 3, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Icon name="copy" />
                  <span>{copyLabel}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="action-bar">
          <div className="actions">
            <motion.div
              className="motion-button"
              whileHover={result && !busy ? { y: -3, scale: 1.025 } : undefined}
              whileTap={result && !busy ? { scale: 0.97 } : undefined}
            >
              <Button
                type="button"
                id="downloadBtn"
                variant="secondary"
                disabled={!result || busy}
                onClick={download}
              >
                <Icon name="download" /> Baixar .SRT
              </Button>
            </motion.div>
            <motion.div
              className="motion-button"
              whileHover={!busy ? { y: -3, scale: 1.035 } : undefined}
              whileTap={!busy ? { scale: 0.96 } : undefined}
            >
              <Button type="submit" id="convertBtn" disabled={busy}>
                <span>
                  {busy
                    ? "Convertendo…"
                    : result
                      ? "Converter novamente"
                      : "Converter em SRT"}
                </span>
                <span className="button-spinner" aria-hidden="true" />
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
}
