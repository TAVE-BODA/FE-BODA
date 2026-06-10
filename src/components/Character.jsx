import './Character.css';
import curiousImg from '../assets/images/characters/character_curious.png';

const VARIANTS = {
  curious: curiousImg,
};

export default function Character({ variant = 'curious', size = 'sm', animate = false }) {
  const classes = [
    'character',
    `character--${size}`,
    animate ? 'character--animated' : '',
  ].filter(Boolean).join(' ');

  return (
    <img
      src={VARIANTS[variant]}
      alt="보다 캐릭터"
      className={classes}
    />
  );
}
