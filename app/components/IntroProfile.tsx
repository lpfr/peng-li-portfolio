const skills = [
  "Mouvement",
  "UI/UX",
  "Code créatif",
  "Images IA",
  "Prototyping",
  "Design interactif",
  "Workflow"
];

export default function IntroProfile() {
  return (
    <section className="introProfile" aria-labelledby="intro-title">
      <div className="studioStatement">
        <p className="sectionKicker">[02] Studio personnel</p>
        <h2 id="intro-title">
          Je construis des expériences numériques sensibles,
          <br />
          entre image, interface, IA et interaction.
        </h2>
      </div>

      <div className="studioFlow">
        <p>Une idée devient image.</p>
        <p>Une image devient mouvement.</p>
        <p>Un mouvement devient interface.</p>
      </div>

      <div className="studioMeta">
        <div className="skillCloud" aria-label="Compétences créatives">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <aside className="coordinatesMini" aria-label="Coordonnées">
          <span>Coordonnées</span>
          <p>Entre image, interface et mémoire.</p>
          <strong>45.7567° N / 126.6424° E</strong>
        </aside>
      </div>
    </section>
  );
}
