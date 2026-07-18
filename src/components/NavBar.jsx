import { useNavigate } from 'react-router-dom';
import './NavBar.css';
import bodaLogoImg from '../assets/images/bodalogo.png';

const NAV_ITEMS = [
  { label: '서비스 소개', href: '/service' },
  { label: 'FAQ', href: '/faq' },
  { label: 'MY PAGE', href: '/mypage' },
];

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo-btn"
        onClick={() => navigate('/home')}
        aria-label="홈으로 이동"
      >
        <img src={bodaLogoImg} alt="BODA 로고" className="navbar-logo" />
      </button>
      <div className="navbar-links">
        {NAV_ITEMS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="navbar-btn"
            onClick={(e) => {
              if (href.startsWith('/')) {
                e.preventDefault();
                navigate(href);
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