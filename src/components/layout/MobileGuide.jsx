/**
 * MobileGuide - 모바일 온보딩 가이드
 * 3단계 위자드: 프로필 → 메시지 → 저장
 */
import React, { useState } from 'react';
import { Users, MessageSquare, Download, ChevronRight, X, Sparkles } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Users,
    title: '프로필 설정',
    description: '대화 참여자의 이름과 프로필 사진을 설정하세요',
    tip: '프로필 탭에서 참여자를 추가하고 편집할 수 있어요',
    color: '#4ADE80',
  },
  {
    id: 2,
    icon: MessageSquare,
    title: '메시지 작성',
    description: '대화 내용을 입력하고 순서를 조정하세요',
    tip: '메시지 탭에서 새 메시지를 추가하고 편집할 수 있어요',
    color: '#FF6B9D',
  },
  {
    id: 3,
    icon: Download,
    title: '이미지 저장',
    description: '완성된 대화를 PNG 이미지로 저장하세요',
    tip: '저장하기 버튼을 눌러 이미지를 다운로드하세요',
    color: '#A855F7',
  },
];

const MobileGuide = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #F3E8FF 0%, #E9D5FF 50%, #DDD6FE 100%)',
      }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} style={{ color: '#A855F7' }} />
          <span className="font-bold text-lg" style={{ color: '#7C3AED' }}>
            TalkStudio
          </span>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7C3AED',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          건너뛰기
          <X size={14} />
        </button>
      </header>

      {/* 진행 표시 */}
      <div className="flex items-center justify-center gap-2 px-8 py-4">
        {steps.map((s, index) => (
          <div
            key={s.id}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: index <= currentStep
                ? 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)'
                : 'rgba(124, 58, 237, 0.2)',
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* 아이콘 */}
        <div
          className="w-28 h-28 flex items-center justify-center mb-8"
          style={{
            background: `linear-gradient(145deg, ${step.color} 0%, ${step.color}dd 100%)`,
            borderRadius: '32px',
            boxShadow: `0px 8px 0px ${step.color}50`,
          }}
        >
          <Icon size={48} style={{ color: '#FFFFFF' }} />
        </div>

        {/* 단계 번호 */}
        <div
          className="px-4 py-1 rounded-full mb-4"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.08)',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: step.color,
            }}
          >
            STEP {step.id} / {steps.length}
          </span>
        </div>

        {/* 제목 */}
        <h2
          className="text-2xl font-bold text-center mb-3"
          style={{ color: '#374151' }}
        >
          {step.title}
        </h2>

        {/* 설명 */}
        <p
          className="text-center mb-6"
          style={{
            fontSize: '15px',
            color: '#6B7280',
            lineHeight: 1.6,
          }}
        >
          {step.description}
        </p>

        {/* 팁 카드 */}
        <div
          className="w-full max-w-sm p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.08)',
          }}
        >
          <p
            className="text-center"
            style={{
              fontSize: '13px',
              color: '#9CA3AF',
              fontWeight: 500,
            }}
          >
            💡 {step.tip}
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="p-6 flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-4 rounded-2xl font-semibold"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
              boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.08)',
              color: '#6B7280',
              fontSize: '15px',
            }}
          >
            이전
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
            boxShadow: '0px 6px 0px rgba(124, 58, 237, 0.4)',
            color: '#FFFFFF',
            fontSize: '15px',
          }}
        >
          {isLastStep ? '시작하기' : '다음'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MobileGuide;
