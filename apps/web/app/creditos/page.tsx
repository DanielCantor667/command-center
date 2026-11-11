import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Créditos de modelos',
  description: 'Autores y licencias de los modelos utilizados en el taller de Daniel Cantor.',
  alternates: { canonical: '/creditos' },
};

// Keep this list in sync with the attribution inventory in CREDITS.md.
const models = [
  { name: 'Black Honey - Robotic Arm', author: 're1monsen', url: 'https://sketchfab.com/3d-models/black-honey-robotic-arm-c50671f2a8e74de2a2e687103fdc93ab', use: 'Brazo del banco de trabajo' },
  { name: 'Industrial robot arm', author: 'olofunot', url: 'https://sketchfab.com/3d-models/industrial-robot-arm-b4b5931851754747a734f72234c87e38', use: 'Brazo industrial amarillo' },
  { name: 'Mech Drone', author: 'Willy Decarpentrie', url: 'https://sketchfab.com/3d-models/mech-drone-8d06874aac5246c59edb4adbe3606e0e', use: 'Dron frente a las pantallas' },
  { name: 'K07 Drone', author: 'KBM7', url: 'https://sketchfab.com/3d-models/k07-drone-ca849f95d9874d58a19324eec223ccdf', use: 'Dron flotante' },
  { name: 'An Animated Cat', author: 'Evil_Katz', url: 'https://sketchfab.com/3d-models/an-animated-cat-aec25699660043a29595f9572149d1e8', use: 'Gato del taller' },
  { name: 'Black Piano', author: 'Shaboldik', url: 'https://sketchfab.com/3d-models/black-piano-19b494e186d0402e818254958d2fed75', use: 'Piano de 4U Studio Academy' },
  { name: 'Acoustic Guitar', author: 'afurokn', url: 'https://sketchfab.com/3d-models/b52fcec4b641493f8939c50c253c4ac3', use: 'Guitarra de 4U Studio Academy' },
  { name: 'Tama Drum Kit', author: 'robcantuart', url: 'https://sketchfab.com/3d-models/219c9a6e10f44283b044d46ad8420598', use: 'Batería de 4U Studio Academy' },
  { name: 'Guitar amplifier', author: 'victorhugohc', url: 'https://sketchfab.com/3d-models/986c95d1d84e44929f6cebfc170fe71b', use: 'Amplificador de 4U Studio Academy' },
  { name: 'Floor Globe', author: 'ctorre', url: 'https://sketchfab.com/3d-models/0318ad51a7294885b452ff4f408353ba', use: 'Globo de Drokex' },
  { name: 'Gaming Desktop PC', author: 'Yolala3d', url: 'https://sketchfab.com/3d-models/d1d8282c9916438091f11aeb28787b66', use: 'Torre y accesorios del escritorio' },
  { name: 'Gaming chair', author: 'Man1ac', url: 'https://sketchfab.com/3d-models/024da6d26b5b460790cacca36d86a3e2', use: 'Silla del escritorio' },
  { name: 'Ultrawide Monitor with Desk Mount', author: 'samhatesham', url: 'https://sketchfab.com/3d-models/9829c68b241e4242a7ec178965d1ed26', use: 'Monitor del escritorio' },
] as const;

export default function CreditsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.back} href="/"><ArrowLeft size={16} aria-hidden="true" /> Volver al taller</Link>
          <span>Daniel Cantor</span>
        </header>

        <section className={styles.intro} aria-labelledby="credits-title">
          <p className={styles.kicker}>El taller de Daniel</p>
          <h1 id="credits-title">Créditos de modelos</h1>
          <p>Este taller también existe gracias al trabajo de artistas y creadores que comparten sus recursos.</p>
        </section>

        <section className={styles.section} aria-labelledby="attribution-title">
          <div className={styles.sectionIntro}>
            <h2 id="attribution-title">Modelos con atribución</h2>
            <div>
              <p>Estos modelos se comparten bajo la licencia <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 (CC BY 4.0)<ArrowUpRight size={14} aria-hidden="true" /></a>.</p>
              <p>Para integrarlos al taller se reescalaron, se redujeron sus polígonos, se recomprimieron sus texturas y se horneó la iluminación.</p>
            </div>
          </div>
          <ul className={styles.models}>
            {models.map(model => (
              <li className={styles.model} key={model.name}>
                <div><h3>{model.name}</h3><p>{model.use}</p></div>
                <p className={styles.author}>Por {model.author}</p>
                <a href={model.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver modelo ${model.name} por ${model.author} en Sketchfab`}>
                  Ver modelo <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.section} ${styles.community}`} aria-labelledby="community-title">
          <div className={styles.sectionIntro}>
            <h2 id="community-title">Recursos de dominio público</h2>
            <p>También agradezco a los creadores de estos recursos compartidos bajo CC0.</p>
          </div>
          <div className={styles.communityLinks}>
            <div><h3><a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer">Poly Haven <ArrowUpRight size={15} aria-hidden="true" /></a></h3><p>Objetos, plantas, lámparas, texturas y el entorno nocturno Shanghai Bund.</p></div>
            <div><h3><a href="https://quaternius.com" target="_blank" rel="noopener noreferrer">Quaternius <ArrowUpRight size={15} aria-hidden="true" /></a></h3><p>Sci-Fi Essentials Kit y <a href="https://quaternius.itch.io/lowpoly-robot" target="_blank" rel="noopener noreferrer">Animated Robot</a>.</p></div>
          </div>
        </section>
        <footer className={styles.footer}><span>El taller de Daniel</span><Link href="/">Volver al taller <ArrowUpRight size={14} aria-hidden="true" /></Link></footer>
      </div>
    </main>
  );
}
