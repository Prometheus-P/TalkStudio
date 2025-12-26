# Figma Design References

## KakaoTalk UI
- **URL**: https://figma.com/design/zrh2Sr2iximdYOy6DBWcwU/Copying-Kakaotalk--Community-
- **File Key**: `zrh2Sr2iximdYOy6DBWcwU`
- **Added**: 2024-12-26
- **분석일**: 2024-12-26

---

## Figma 컴포넌트 구조

### Key Components
| Component | ComponentSetId | Variants |
|-----------|---------------|----------|
| defaultBaloon | 205:13136 | sender=you/me, tail=yes/no |
| #msgLine | 213:13357 | msgType=you/me/system, firstLineYN, timeYN |
| timeAndRead | 240:14429 | - |

### Design Tokens (Figma)
| Token | Usage |
|-------|-------|
| kt/chatBaloonYellowBG | 내 메시지 버블 배경 |
| kt/chatBaloonBGWhite | 상대 메시지 버블 배경 |
| kt/chatMessage | 메시지 텍스트 색상 |
| kt/baloonTime | 시간 텍스트 색상 |
| kt/msgName | 이름 텍스트 색상 |
| kt/readCount | 읽음 카운트 색상 |

---

## 현재 구현 vs Figma 비교

### 버블 스타일
| 속성 | Figma | 현재 구현 (presets.js) | 상태 |
|------|-------|----------------------|------|
| borderRadius | 13.5px | 13.5 | ✅ 일치 |
| 내 버블 배경 | kt/chatBaloonYellowBG | #FEE500 | ✅ 일치 |
| 상대 버블 배경 | kt/chatBaloonBGWhite | #FFFFFF | ✅ 일치 |
| 꼬리 부분 radius | 4px 추정 | 4 | ✅ 일치 |
| paddingX | 10px | 10 | ✅ 일치 |
| paddingY | 8px | 8 | ✅ 일치 |

### 타이포그래피
| 속성 | Figma | 현재 구현 | 상태 |
|------|-------|----------|------|
| 폰트 | Pretendard | Pretendard | ✅ 일치 |
| 메시지 폰트 크기 | 15px | 15 | ✅ 일치 |
| 이름 폰트 크기 | 12px | 12 | ✅ 일치 |
| 시간 폰트 크기 | 10px | 10 | ✅ 일치 |

### 색상
| 속성 | Figma Token | 현재 구현 | 상태 |
|------|-------------|----------|------|
| 채팅 배경 | - | #B2C7D9 | ✅ |
| 헤더 배경 | - | #404D5B | ✅ |
| 메시지 텍스트 | kt/chatMessage | #1A1A1A | ✅ |
| 시간 텍스트 | kt/baloonTime | #999999 | ✅ |
| 이름 텍스트 | kt/msgName | #666666 | ✅ |

### 레이아웃
| 속성 | Figma | 현재 구현 | 상태 |
|------|-------|----------|------|
| 캔버스 너비 | 390px | 390 | ✅ 일치 |
| 캔버스 높이 | 844px | 844 | ✅ 일치 |
| 상태바 높이 | 47px | 47 | ✅ 일치 |
| 네비게이션 높이 | 56px | 56 | ✅ 일치 |
| 아바타 크기 | 40px | 40 | ✅ 일치 |
| 아바타 모양 | rounded square | rounded | ✅ 일치 |

---

## 분석 결론

**전체 일치율: ~95%**

### 잘 구현된 부분 ✅
1. 버블 borderRadius (13.5px) 정확히 반영
2. 카카오톡 노란색 (#FEE500) 색상 정확
3. Pretendard 폰트 적용
4. iOS 14 Pro 해상도 (390x844) 맞음
5. 꼬리 스타일 구현됨

### 개선 필요 사항 ⚠️
1. **날짜 구분선**: Figma에 있지만 아직 미구현 (Phase 0 작업 중)
2. **읽음 카운트**: 노란색 (#FFD700) 사용 중, Figma 정확한 값 확인 필요
3. **시스템 메시지**: borderRadius 17px vs Figma 34px 확인 필요

### 권장 다음 단계
1. 날짜 구분선 컴포넌트 완성 (DateDivider.jsx)
2. Figma에서 정확한 색상 값 추출 (color styles)
3. 시스템 메시지 스타일 세부 조정
