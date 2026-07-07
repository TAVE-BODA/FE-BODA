import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/bodalogo.png';
import iconFaq from '../assets/images/side_icon_faq.png';
import iconUpload from '../assets/images/side_icon_upload.png';
import iconResult from '../assets/images/side_icon_result.png';
import iconPrivacy from '../assets/images/side_icon_privacy.png';
import iconCoverage from '../assets/images/side_icon_coverage.png';
import iconCs from '../assets/images/side_icon_cs.png';

export default function Sidebar({ currentMenu, onMenuChange }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'faq', name: '자주 묻는 질문', icon: iconFaq },
    { id: 'upload', name: '파일 업로드', icon: iconUpload },
    { id: 'result', name: '분석 결과', icon: iconResult },
    { id: 'privacy', name: '개인정보 보호', icon: iconPrivacy },
    { id: 'coverage', name: '지원 범위', icon: iconCoverage },
    { id: 'cs', name: '고객센터', icon: iconCs },
  ];

  return (
    <aside className="boda-sidebar">
      <div className="sidebar-logo-area" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="boda 로고" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-menu-btn ${currentMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuChange(item.id)}
          >
            <img src={item.icon} alt={item.name} className="sidebar-menu-icon" />
            <span className="sidebar-menu-text">{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}