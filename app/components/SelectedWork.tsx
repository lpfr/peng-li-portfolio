const works = [
  {
    title: "Voyages Intérieurs",
    type: "Expérience de réflexion personnelle / Test interactif",
    year: "2026",
    role: "Concept, direction visuelle, interface, prompts IA",
    href: "https://inner-journey-tests.vercel.app/",
    image: "/assets/work/voyages-interieurs-home.png",
    description:
      "Une expérience interactive autour des rôles, des masques sociaux, de la fatigue émotionnelle et du retour à soi."
  },
  {
    title: "Portrait en mouvement",
    type: "Geste / Vidéo IA / Prototype web",
    year: "2026",
    role: "Interaction, direction visuelle, prototype",
    href: "#top",
    image: "/assets/hero/paper-ball.png",
    description:
      "Un portrait cartographique qui se déplie à travers un geste de la main, entre papier, visage et mémoire."
  },
  {
    title: "Workflow Systems",
    type: "Processus IA / Prototypage / Automatisation créative",
    year: "2026",
    role: "Prompt design, image, vidéo, interface",
    href: "#process",
    image: "/assets/work/workflow-n8n-video-agent.png",
    description:
      "Des workflows pour transformer une idée en image, vidéo, interaction puis site web."
  }
];

export default function SelectedWork() {
  return (
    <section className="selectedWork" id="work" aria-labelledby="work-title">
      <div className="sectionHeader">
        <p className="sectionKicker">[03] Projets après</p>
        <div>
          <h2 id="work-title">Ce ne sont pas beaucoup de projets. Ce sont des traces.</h2>
          <p className="darkLead">
            Des choses construites après le doute.
            <br />
            Après le silence.
            <br />
            Après le pli.
          </p>
        </div>
      </div>
      <div className="workIndex">
        {works.map((work, index) => (
          <a
            className="workRow"
            href={work.href}
            key={work.title}
            data-title={work.title}
            data-tags={work.type}
            data-preview={work.image}
            target={work.href.startsWith("http") ? "_blank" : undefined}
            rel={work.href.startsWith("http") ? "noreferrer" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{work.title}</strong>
            <em>
              {work.type}
              <br />
              {work.description}
            </em>
            <small>{work.year}</small>
            <small>{work.role}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
