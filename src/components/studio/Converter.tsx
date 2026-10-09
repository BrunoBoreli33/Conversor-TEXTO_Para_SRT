import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useConverter } from "@/hooks/use-converter";
import { formatarTempo } from "@/lib/srt";
import { cn } from "@/lib/utils";
import EmptyPreview from "./EmptyPreview";
import ConversionProgress from "./ConversionProgress";

export default function Converter() {
  const {
    text,
    result,
    busy,
    error,
    progress,
    announcement,
    copyLabel,
    inputRef,
    previewRef,
    updateText,
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
        <span className="timing-note">30 s/bloco · 10 s de intervalo</span>
      </header>

      <form
        id="conversorForm"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void convert();
        }}
      >
        <div className="editors">
          <div className="input-pane">
            <div className="pane-heading">
              <label htmlFor="textoInput">Seu texto</label>
              <button
                className="icon-button"
                type="button"
                id="limparBtn"
                title="Limpar texto"
                aria-label="Limpar texto e resultado"
                disabled={busy || !text.length}
                onClick={clear}
              >
                <Icon name="trash" />
              </button>
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
                  {formatarTempo(result.duration).slice(0, 8)}
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
                <button
                  type="button"
                  className="copy-button"
                  id="copyBtn"
                  onClick={() => void copy()}
                >
                  <Icon name="copy" />
                  <span>{copyLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="action-bar">
          <div className="actions">
            <Button
              type="button"
              id="downloadBtn"
              variant="secondary"
              disabled={!result || busy}
              onClick={download}
            >
              <Icon name="download" /> Baixar .SRT
            </Button>
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
          </div>
        </div>
      </form>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
}
