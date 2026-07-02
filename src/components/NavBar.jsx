import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import bodaLogoImg from '../assets/images/bodalogo.png';

const NAV_ITEMS = [
  { label: '서비스 소개', href: '#' },
  { label: 'FAQ', path: '/faq' },
  { label: 'MY PAGE', href: '#' },
];

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <img src={bodaLogoImg} alt="BODA 로고" className="navbar-logo" />
      <div className="navbar-links">
        {NAV_ITEMS.map(({ label, href, path }) => (
          
            <a key={label}
            href={href || '#'}
            className="navbar-btn"
            onClick={(e) => {
              if (path) {
                e.preventDefault();
                navigate(path);
              }
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}