import './Character.css';
import ahaImg               from '../assets/images/characters/character_aha.png';
import angryImg             from '../assets/images/characters/character_angry.png';
import attentionImg         from '../assets/images/characters/character_attention.png';
import backViewImg          from '../assets/images/characters/character_back_view.png';
import celebratingImg       from '../assets/images/characters/character_celebrating.png';
import confusedImg          from '../assets/images/characters/character_confused.png';
import cryingFrontImg       from '../assets/images/characters/character_crying_front.png';
import cryingThreeQImg      from '../assets/images/characters/character_crying_three_quarter_view.png';
import curiousImg           from '../assets/images/characters/character_curious.png';
import frontViewImg         from '../assets/images/characters/character_front_view.png';
import frontViewGrayImg     from '../assets/images/characters/character_front_view_gray.png';
import helloImg             from '../assets/images/characters/character_hello.png';
import laughingImg          from '../assets/images/characters/character_laughing.png';
import laughingGrayImg      from '../assets/images/characters/character_laughing_gray.png';
import leftViewImg          from '../assets/images/characters/character_left_view.png';
import listeningImg         from '../assets/images/characters/character_listening.png';
import notAllowedImg        from '../assets/images/characters/character_not_allowed.png';
import rightViewImg         from '../assets/images/characters/character_right_view.png';
import sadImg               from '../assets/images/characters/character_sad.png';
import surprisedImg         from '../assets/images/characters/character_surprised.png';
import thinkingImg          from '../assets/images/characters/character_thinking.png';
import threeQuarterViewImg  from '../assets/images/characters/character_three_quarter_view.png';
import waitingImg           from '../assets/images/characters/character_waiting.png';

const VARIANTS = {
  aha:                  ahaImg,
  angry:                angryImg,
  attention:            attentionImg,
  back_view:            backViewImg,
  celebrating:          celebratingImg,
  confused:             confusedImg,
  crying_front:         cryingFrontImg,
  crying_three_quarter: cryingThreeQImg,
  curious:              curiousImg,
  front_view:           frontViewImg,
  front_view_gray:      frontViewGrayImg,
  hello:                helloImg,
  laughing:             laughingImg,
  laughing_gray:        laughingGrayImg,
  left_view:            leftViewImg,
  listening:            listeningImg,
  not_allowed:          notAllowedImg,
  right_view:           rightViewImg,
  sad:                  sadImg,
  surprised:            surprisedImg,
  thinking:             thinkingImg,
  three_quarter_view:   threeQuarterViewImg,
  waiting:              waitingImg,
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
