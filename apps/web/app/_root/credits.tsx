import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { localePath, type Locale } from '../../i18n/config';
import { en } from '../../i18n/en';
import { es } from '../../i18n/es';
import { fill } from '../../i18n/format';
import { LanguageSwitch } from '../../i18n/language-switch';
import styles from './credits.module.css';

// Keep this list in sync with the attribution inventory in CREDITS.md.
const models = [
  { name: 'Black Honey - Robotic Arm', author: 're1monsen', url: 'https://sketchfab.com/3d-models/black-honey-robotic-arm-c50671f2a8e74de2a2e687103fdc93ab' },
  { name: 'Industrial robot arm', author: 'olofunot', url: 'https://sketchfab.com/3d-models/industrial-robot-arm-b4b5931851754747a734f72234c87e38' },
  { name: 'Mech Drone', author: 'Willy Decarpentrie', url: 'https://sketchfab.com/3d-models/mech-drone-8d06874aac5246c59edb4adbe3606e0e' },
  { name: 'K07 Drone', author: 'KBM7', url: 'https://sketchfab.com/3d-models/k07-drone-ca849f95d9874d58a19324eec223ccdf' },
  { name: 'An Animated Cat', author: 'Evil_Katz', url: 'https://sketchfab.com/3d-models/an-animated-cat-aec25699660043a29595f9572149d1e8' },
  { name: 'Black Piano', author: 'Shaboldik', url: 'https://sketchfab.com/3d-models/black-piano-19b494e186d0402e818254958d2fed75' },
  { name: 'Acoustic Guitar', author: 'afurokn', url: 'https://sketchfab.com/3d-models/b52fcec4b641493f8939c50c253c4ac3' },
  { name: 'Tama Drum Kit', author: 'robcantuart', url: 'https://sketchfab.com/3d-models/219c9a6e10f44283b044d46ad8420598' },
  { name: 'Guitar amplifier', author: 'victorhugohc', url: 'https://sketchfab.com/3d-models/986c95d1d84e44929f6cebfc170fe71b' },
  { name: 'Floor Globe', author: 'ctorre', url: 'https://sketchfab.com/3d-models/0318ad51a7294885b452ff4f408353ba' },
  { name: 'Gaming Desktop PC', author: 'Yolala3d', url: 'https://sketchfab.com/3d-models/d1d8282c9916438091f11aeb28787b66' },
  { name: 'Gaming chair', author: 'Man1ac', url: 'https://sketchfab.com/3d-models/024da6d26b5b460790cacca36d86a3e2' },
  { name: 'Ultrawide Monitor with Desk Mount', author: 'samhatesham', url: 'https://sketchfab.com/3d-models/9829c68b241e4242a7ec178965d1ed26' },
] as const;

/** Shared by `/creditos` and `/en/creditos`; links stay in the page's language. */
export function Credits({ locale }: { locale: Locale }) {
  const home = localePath(locale);
  const { credits: t } = locale === 'en' ? en : es;
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.back} href={home}><ArrowLeft size={16} aria-hidden="true" /> {t.back}</Link>
          <span>Daniel Cantor <LanguageSwitch path="/creditos" /></span>
        </header>

        <section className={styles.intro} aria-labelledby="credits-title">
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 id="credits-title">{t.title}</h1>
          <p>{t.intro}</p>
        </section>

        <section className={styles.section} aria-labelledby="attribution-title">
          <div className={styles.sectionIntro}>
            <h2 id="attribution-title">{t.attribution}</h2>
            <div>
              <p>{t.license} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 (CC BY 4.0)<ArrowUpRight size={14} aria-hidden="true" /></a>.</p>
              <p>{t.changes}</p>
            </div>
          </div>
          <ul className={styles.models}>
            {models.map((model, index) => (
              <li className={styles.model} key={model.name}>
                <div><h3>{model.name}</h3><p>{t.uses[index]}</p></div>
                <p className={styles.author}>{fill(t.by, { author: model.author })}</p>
                <a href={model.url} target="_blank" rel="noopener noreferrer" aria-label={fill(t.viewLabel, { name: model.name, author: model.author })}>
                  {t.view} <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.section} ${styles.community}`} aria-labelledby="community-title">
          <div className={styles.sectionIntro}>
            <h2 id="community-title">{t.community}</h2>
            <p>{t.communityIntro}</p>
          </div>
          <div className={styles.communityLinks}>
            <div><h3><a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer">Poly Haven <ArrowUpRight size={15} aria-hidden="true" /></a></h3><p>{t.polyHaven}</p></div>
            <div><h3><a href="https://quaternius.com" target="_blank" rel="noopener noreferrer">Quaternius <ArrowUpRight size={15} aria-hidden="true" /></a></h3><p>{t.quaterniusKit} {t.and} <a href="https://quaternius.itch.io/lowpoly-robot" target="_blank" rel="noopener noreferrer">Animated Robot</a>.</p></div>
          </div>
        </section>
        <footer className={styles.footer}><span>{t.kicker}</span><Link href={home}>{t.back} <ArrowUpRight size={14} aria-hidden="true" /></Link></footer>
      </div>
    </main>
  );
}
