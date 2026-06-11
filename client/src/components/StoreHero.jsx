import { AnimatedMarqueeHero } from "./ui/hero-3.jsx";

export default function StoreHero({ images = [] }) {
  return (
    <AnimatedMarqueeHero
      title={
        <>
          Vista o seu
          <br />
          <span className="text-yellow-300">manto.</span>
        </>
      }
      description="Produtos essenciais, conforto e visual minimalista para acompanhar o seu dia a dia com presença."
      ctaText="Ver coleção"
      images={images}
    />
  );
}
