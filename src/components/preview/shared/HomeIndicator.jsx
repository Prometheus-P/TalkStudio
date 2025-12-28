/**
 * HomeIndicator - iOS 홈 인디케이터 (통합 컴포넌트)
 */
import React from 'react';

const HomeIndicator = ({ color = '#000000', height = 20, paddingBottom = 8 }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height, paddingBottom }}
    >
      <div
        style={{
          width: 134,
          height: 5,
          backgroundColor: color,
          borderRadius: 100,
        }}
      />
    </div>
  );
};

export default HomeIndicator;
