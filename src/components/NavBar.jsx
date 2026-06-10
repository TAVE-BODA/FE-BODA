import './NavBar.css';
import bodaLogoImg from '../assets/images/bodalogo.png';

const NAV_ITEMS = [
  { label: '서비스 소개', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'MY PAGE', href: '#' },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      <img src={bodaLogoImg} alt="BODA 로고" className="navbar-logo" />
      <div className="navbar-links">
        {NAV_ITEMS.map(({ label, href }) => (
          <a key={label} href={href} className="navbar-btn">
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
