import { useState, useEffect } from 'react'
import styles from './HeroUI.module.css'
import fordLogo from '../assets/Ford-Logo-PNG-Isolated-Image.webp'

const specs = [
  { label: 'Motor', value: '3.0 V6 Bi-turbo' },
  { label: 'Potência', value: '397 cv' },
  { label: 'Torque', value: '583 Nm' },
  { label: 'Tração', value: '4x4 inteligente' },
]

export default function HeroUI({ onViewSpecs, onViewReport, onHome }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`${styles.ui} ${visible ? styles.visible : ''}`}>

      <header className={styles.header}>
        <button className={styles.logo} onClick={onHome}>
          <img src={fordLogo} alt="Ford Logo" className={styles.logoImg} />
        </button>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Modelos</a>
          <a href="#" className={styles.navLink}>Configurar</a>
          <a href="#" className={styles.navLink}>Dealer</a>
          <button className={styles.ctaSmall}>Solicitar Proposta</button>
        </nav>
      </header>

      <div className={styles.leftPanel}>
        <p className={styles.eyebrow}>Built Ford Tough™</p>
        <h1 className={styles.title}>
          <span className={styles.titleF}>Ranger</span>
          <span className={styles.titleSub}>Raptor</span>
        </h1>
        <p className={styles.description}>
          A pickup mais capaz fora de estrada. Design agressivo,
          suspensão Fox Racing e tecnologia de última geração para
          dominar qualquer terreno.
        </p>

        <div className={styles.specsGrid}>
          {specs.map((s) => (
            <div key={s.label} className={styles.specItem}>
              <span className={styles.specValue}>{s.value}</span>
              <span className={styles.specLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={onViewSpecs}>Ver Specs</button>
          <button className={styles.btnSecondary} onClick={onViewReport}>Relatório</button>
        </div>
      </div>

      <div className={styles.hint}>
        <div className={styles.hintIcon}>⟳</div>
        <span>Arraste para explorar o veículo</span>
      </div>

      <div className={styles.badge}>
        <span className={styles.badgeYear}>2026</span>
        <div className={styles.badgeLine} />
        <span className={styles.badgeText}>SÉRIE<br/>ESPECIAL</span>
      </div>

    </div>
  )
}
