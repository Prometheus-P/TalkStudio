# TalkStudio

대화 스크린샷 생성기 - 카카오톡, 텔레그램, 인스타그램, 디스코드 스타일의 대화 이미지를 생성합니다.

## 주요 기능

- **멀티 플랫폼 지원**: 카카오톡, 텔레그램, 인스타그램, 디스코드 테마
- **실시간 미리보기**: 편집 내용이 즉시 iPhone 프레임에 반영
- **메시지 관리**: 추가, 수정, 삭제, 순서 변경
- **발화자 커스터마이징**: 이름, 프로필 이미지 설정 (최대 10명)
- **프로젝트 저장**: localStorage 기반 자동/수동 저장
- **PNG 내보내기**: 고품질 이미지로 저장

## 기술 스택

- **Frontend**: React 19 + Vite 7 (Rolldown)
- **상태 관리**: Zustand 5
- **스타일링**: Tailwind CSS 4
- **이미지 생성**: html2canvas
- **아이콘**: Lucide React

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:5173) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | Vitest 테스트 실행 |

## 프로젝트 구조

```
src/
├── components/
│   ├── editor/           # 에디터 컴포넌트
│   │   ├── LeftPanel.jsx       # 탭 기반 편집 패널
│   │   ├── MessageEditor.jsx   # 메시지 편집기
│   │   ├── ProfileEditor.jsx   # 프로필 편집기
│   │   ├── ThemeControls.jsx   # 테마/상태바 설정
│   │   ├── ExportButton.jsx    # 이미지 내보내기
│   │   └── ProjectListModal.jsx # 프로젝트 관리 모달
│   ├── preview/          # 미리보기 컴포넌트
│   │   ├── ChatPreview.jsx     # 플랫폼별 미리보기
│   │   ├── MessageBubble.jsx   # 메시지 버블
│   │   └── StatusBar.jsx       # 상태바
│   └── layout/           # 레이아웃 컴포넌트
│       └── Sidebar.jsx         # 플랫폼 선택 사이드바
├── store/
│   └── useChatStore.js   # Zustand 전역 상태
├── themes/
│   └── presets.js        # 플랫폼별 테마 프리셋
├── hooks/
│   └── useAutoSave.js    # 자동 저장 훅
├── utils/
│   ├── storage.js        # localStorage 유틸리티
│   └── timeValidation.js # 시간 검증 유틸리티
└── App.jsx               # 3-Column 레이아웃
```

## 사용 방법

1. **플랫폼 선택**: 좌측 사이드바에서 원하는 플랫폼 테마 선택
2. **메시지 작성**: 에디터에서 발화자 선택 후 메시지 입력
3. **미리보기 확인**: 우측 iPhone 프레임에서 실시간 확인
4. **이미지 저장**: "PNG 저장" 버튼 클릭

## 디자인 스타일

Claymorphism 디자인 시스템 적용:
- 부드러운 그라데이션 배경
- 입체적인 박스 섀도우
- 둥근 모서리 (16px ~ 32px)
- 파스텔 톤 색상 팔레트

## 라이선스

MIT License
