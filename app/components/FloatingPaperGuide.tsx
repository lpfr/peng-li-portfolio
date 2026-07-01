export default function FloatingPaperGuide() {
  return (
    <svg
      className="floatingPaperGuide"
      viewBox="0 0 140 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="paperBallBase"
        d="M34 38L28 30L42 24L51 12L64 20L76 12L87 25L101 28L98 42L116 51L107 64L116 77L99 83L92 101L76 96L61 109L50 96L31 100L29 84L13 76L24 62L15 48L29 45L34 38Z"
      />
      <path className="paperBallPlane planeA" d="M34 38L49 32L57 55L36 70L24 62L15 48L29 45L34 38Z" />
      <path className="paperBallPlane planeB" d="M49 32L64 20L76 12L84 35L66 48L57 55L49 32Z" />
      <path className="paperBallPlane planeC" d="M84 35L101 28L98 42L116 51L101 62L79 55L66 48L84 35Z" />
      <path className="paperBallPlane planeD" d="M36 70L57 55L64 82L50 96L31 100L29 84L13 76L36 70Z" />
      <path className="paperBallPlane planeE" d="M64 82L79 55L101 62L116 77L99 83L92 101L76 96L64 82Z" />
      <path className="paperBallPlane planeF" d="M57 55L66 48L79 55L64 82L57 55Z" />
      <path className="paperBallPlane planeG" d="M28 30L42 24L49 32L34 38L29 45L15 48L28 30Z" />
      <path className="paperBallPlane planeH" d="M76 12L87 25L101 28L84 35L76 12Z" />

      <path className="paperBallEdge" d="M34 38L28 30L42 24L51 12L64 20L76 12L87 25L101 28L98 42L116 51L107 64L116 77L99 83L92 101L76 96L61 109L50 96L31 100L29 84L13 76L24 62L15 48L29 45L34 38Z" />
      <path className="paperBallRoughEdge" d="M42 24L47 29L51 12" />
      <path className="paperBallRoughEdge" d="M98 42L105 48L116 51" />
      <path className="paperBallRoughEdge" d="M107 64L100 70L116 77" />
      <path className="paperBallRoughEdge" d="M31 100L39 91L50 96" />
      <path className="paperBallRoughEdge" d="M13 76L26 75L24 62" />
      <path className="paperBallCrease" d="M34 38L47 50L40 64" />
      <path className="paperBallCrease" d="M51 12L56 38L76 12" />
      <path className="paperBallCrease" d="M66 48L84 35L90 48" />
      <path className="paperBallCrease" d="M79 55L94 70L101 62" />
      <path className="paperBallCrease" d="M57 55L64 82L76 66" />
      <path className="paperBallCrease" d="M36 70L50 96L54 76" />
      <path className="paperBallCrease" d="M76 96L73 84L99 83" />
      <path className="paperBallCrease" d="M87 25L84 35L101 28" />
      <path className="paperBallCrease" d="M29 45L49 32L42 24" />
      <path className="paperBallCrease softCrease" d="M43 86L59 86" />
      <path className="paperBallCrease softCrease" d="M71 29L82 31" />
      <path className="paperBallCrease softCrease" d="M88 82L96 76" />
    </svg>
  );
}
