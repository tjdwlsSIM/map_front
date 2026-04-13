import brandFlag from './assets/brand-flag.png'

export function LogoHeader({ compact = false }) {
  return (
    <header className={`brand-header ${compact ? 'brand-header--compact' : 'brand-header--hero'}`}>
      {!compact && <img src={brandFlag} alt="" className="brand-mark" aria-hidden="true" />}
      <div className="brand-title-row">
        <h1 className="brand-logo">망한지도</h1>
        <div className="brand-dots" aria-label="page indicator">
          <span className="brand-dot brand-dot--active"></span>
          <span className="brand-dot"></span>
          <span className="brand-dot"></span>
        </div>
      </div>
    </header>
  )
}

export function FooterSchoolButton({ schoolName, onClick }) {
  return (
    <footer className="footer-bar">
      <button type="button" className="footer-bar__button" onClick={onClick}>
        {schoolName}
      </button>
    </footer>
  )
}
