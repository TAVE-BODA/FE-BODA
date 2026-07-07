import './CoverageCard.css';
import InsuranceBadge from './InsuranceBadge';

export default function CoverageCard({ icon, category, amount, companies = [], inactive = false, onClick }) {
  return (
    <div
      className={['coverage-card', inactive ? 'coverage-card--inactive' : ''].filter(Boolean).join(' ')}
      onClick={!inactive ? onClick : undefined}
      role={!inactive ? 'button' : undefined}
      tabIndex={!inactive ? 0 : undefined}
      onKeyDown={!inactive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="coverage-card__icon">{icon}</div>
      <p className="coverage-card__category">{category}</p>
      <p className="coverage-card__amount">{inactive ? '감지 안됨' : amount}</p>
      {!inactive && (
        <div className="coverage-card__footer">
          <div className="coverage-card__badges">
            {companies.map((c) => (
              <InsuranceBadge key={c} company={c} />
            ))}
          </div>
          <span className="coverage-card__arrow">›</span>
        </div>
      )}
    </div>
  );
}
