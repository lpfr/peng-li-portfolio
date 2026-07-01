const fragments = [
  {
    kind: "image",
    className: "wide",
    src: "/assets/work/voyages-interieurs-home.png",
    label: "Voyages Intérieurs"
  },
  {
    kind: "video",
    className: "tall",
    src: "/assets/work/book-nook-preview-5s.mp4",
    label: "Book Nook"
  },
  {
    kind: "image",
    className: "square",
    src: "/assets/work/workflow-n8n-reservation.png",
    label: "n8n Reservation"
  },
  {
    kind: "image",
    className: "soft",
    src: "/assets/work/workflow-n8n-video-agent.png",
    label: "n8n Video Agent"
  },
  {
    kind: "video",
    className: "long",
    src: "/assets/hero/paper-unfold.mp4",
    label: "Map Portrait"
  },
  {
    kind: "image",
    className: "small containMedia paperAsset",
    src: "/assets/hero/paper-ball.png",
    label: "Paper Object"
  },
  {
    kind: "image",
    className: "portrait",
    src: "/assets/work/workflow-n8n-ai-agent.png",
    label: "AI Agent"
  },
  {
    kind: "placeholder",
    className: "tiny",
    label: "Motion Draft"
  }
];

export default function VisualGlimpse() {
  return (
    <section className="visualGlimpse" id="glimpse" aria-labelledby="glimpse-title">
      <div>
        <p className="sectionKicker">[04] Aperçu / fragments</p>
        <h2 id="glimpse-title">
          Images, vidéos, workflows,
          <br />
          tests d’interaction.
        </h2>
        <p className="sectionLead">Des fragments de reprise.</p>
      </div>
      <div className="glimpseGrid">
        {fragments.map((fragment, index) => (
          <div className={`glimpseBlock ${fragment.className}`} key={`${fragment.label}-${index}`}>
            {fragment.kind === "video" && (
              <video src={fragment.src} muted loop playsInline autoPlay preload="metadata" />
            )}
            {fragment.kind === "image" && <img src={fragment.src} alt="" />}
            <span>
              {String(index + 1).padStart(2, "0")} / {fragment.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
