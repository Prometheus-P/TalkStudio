/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      // Claymorphism 커스텀 색상
      colors: {
        clay: {
          purple: {
            DEFAULT: '#A855F7',
            dark: '#8B5CF6',
            light: '#C084FC',
          },
          amber: {
            DEFAULT: '#FBBF24',
            dark: '#92400E',
          },
        },
      },
      // Claymorphism 배경 그라데이션
      backgroundImage: {
        // 메인 페이지 배경
        'clay-main': 'linear-gradient(135deg, #FFF5F0 0%, #F0F7FF 50%, #F5F0FF 100%)',
        // 카드 배경
        'clay-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8F4FF 100%)',
        'clay-card-white': 'linear-gradient(145deg, #FFFFFF 0%, #F0F0F0 100%)',
        'clay-card-light': 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
        // 헤더/버튼 퍼플 그라데이션
        'clay-purple': 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
        'clay-purple-145': 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
        // 프리뷰 영역 배경
        'clay-preview': 'linear-gradient(145deg, #E0F2FE 0%, #DBEAFE 50%, #EDE9FE 100%)',
        // 폰 프레임 배경
        'clay-phone': 'linear-gradient(145deg, #2D3748 0%, #1A202C 100%)',
        // 데코 그라데이션
        'clay-deco-pink': 'linear-gradient(135deg, #FF6B9D 0%, #FFB3CC 100%)',
        'clay-deco-green': 'linear-gradient(135deg, #4ADE80 0%, #22D3EE 100%)',
      },
      // Claymorphism 박스 섀도우
      boxShadow: {
        // 기본 clay 섀도우 (퍼플)
        'clay-xs': '0px 2px 0px rgba(139, 92, 246, 0.4)',
        'clay-sm': '0px 3px 0px rgba(146, 64, 14, 0.3)',
        'clay-md': '0px 4px 0px rgba(139, 92, 246, 0.3)',
        'clay-lg': '0px 8px 0px rgba(168, 85, 247, 0.2), 0px 16px 40px rgba(168, 85, 247, 0.1)',
        // 블루 계열
        'clay-blue': '0px 8px 0px rgba(59, 130, 246, 0.15)',
        // 뉴트럴 (검정)
        'clay-neutral-xs': '0px 2px 0px rgba(0, 0, 0, 0.08)',
        'clay-neutral-sm': '0px 4px 0px rgba(0, 0, 0, 0.1)',
        'clay-neutral-md': '0px 4px 0px rgba(0, 0, 0, 0.08)',
        // 폰 프레임
        'clay-phone': '0px 12px 0px rgba(0, 0, 0, 0.25), 0px 24px 50px rgba(0, 0, 0, 0.15)',
      },
      // Claymorphism 보더 레디어스
      borderRadius: {
        'clay': '32px',
        'clay-sm': '16px',
        'clay-md': '20px',
        'clay-lg': '44px',
        'clay-xl': '52px',
      },
    },
  },
  plugins: [],
}
