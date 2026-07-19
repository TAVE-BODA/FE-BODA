import LottieImport from 'lottie-react';
import waitingAnimation from '../assets/lottie/waiting.json';

// Vite(rolldown)의 CJS/UMD 인터롭 처리 차이로 default export가
// 이중으로 감싸져 들어올 때가 있어 두 경우를 모두 처리합니다.
const Lottie = LottieImport.default ?? LottieImport;

export default function AnalyzingLottie({ className }) {
  return (
    <Lottie
      animationData={waitingAnimation}
      loop
      className={className}
      aria-label="분석 중 애니메이션"
    />
  );
}
