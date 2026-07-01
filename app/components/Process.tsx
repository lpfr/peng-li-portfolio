const principles = [
  {
    title: "Observer",
    text: "Voir ce qui reste."
  },
  {
    title: "Transformer",
    text: "Donner une forme au fragile."
  },
  {
    title: "Révéler",
    text: "Laisser l’expérience s’ouvrir."
  }
];

export default function Process() {
  return (
    <section className="processSection" id="process" aria-labelledby="process-title">
      <p className="sectionKicker">[05] Processus</p>
      <div className="processGrid">
        {principles.map((principle, index) => (
          <article key={principle.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{principle.title}</h3>
            <p>{principle.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
