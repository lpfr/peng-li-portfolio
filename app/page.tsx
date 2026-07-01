import FloatingPaperGuide from "./components/FloatingPaperGuide";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import IntroProfile from "./components/IntroProfile";
import OpeningStory from "./components/OpeningStory";
import Process from "./components/Process";
import PortfolioEffects from "./components/PortfolioEffects";
import SelectedWork from "./components/SelectedWork";
import VisualGlimpse from "./components/VisualGlimpse";

export default function Home() {
  return (
    <main>
      <FloatingPaperGuide />
      <PortfolioEffects />
      <Hero />
      <OpeningStory />
      <IntroProfile />
      <SelectedWork />
      <VisualGlimpse />
      <Process />
      <Footer />
    </main>
  );
}
