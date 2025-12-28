/**
 * PhoneFrame - 폰 프레임 캔버스 래퍼 (통합 컴포넌트)
 * 스케일링 및 트랜스폼 로직을 캡슐화
 */
import React from 'react';

const PhoneFrame = ({
  width,
  height,
  scale = 0.75,
  bgStyle = {},
  fontFamily,
  children,
}) => {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: scaledWidth,
        height: scaledHeight,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          id="chat-canvas"
          className="overflow-hidden flex flex-col"
          style={{
            width,
            height,
            fontFamily,
            ...bgStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
