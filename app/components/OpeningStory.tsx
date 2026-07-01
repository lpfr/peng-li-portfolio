export default function OpeningStory() {
  return (
    <section className="openingStory" aria-labelledby="opening-title">
      <p className="sectionKicker">[01] Ouverture / le papier</p>
      <div className="openingStoryBody">
        <div className="openingStoryText">
          <p>
            Après le chômage,
            <br />
            je me suis senti comme une feuille froissée.
          </p>
          <p>
            Mis de côté.
            <br />
            Mais pas effacé.
          </p>
          <p>Alors j’ai recommencé.</p>
          <p>
            Une image.
            <br />
            Un geste.
            <br />
            Un site.
            <br />
            Un retour.
          </p>
        </div>

        <div className="openingCapability">
          <p className="practicePosition">
            Je crée des expériences visuelles et interactives avec l’IA, le web et le mouvement.
          </p>
          <div className="openingMediums">
            <p>Cette ouverture interactive combine :</p>
            <ul aria-label="Médiums de l’ouverture interactive">
              <li>Image IA</li>
              <li>Animation web</li>
              <li>Détection de la main</li>
              <li>Narration personnelle</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
