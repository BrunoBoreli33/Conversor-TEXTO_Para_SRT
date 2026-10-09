export default function ConversionProgress({ progress }: { progress: number }) {
  return (
    <div className="processing-state" id="processingState">
      <div className="waveform" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <p>Convertendo…</p>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progresso da conversão"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
