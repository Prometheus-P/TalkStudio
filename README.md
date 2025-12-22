# TalkStudio

대화 스크린샷 생성기 - 카카오톡, 텔레그램, 인스타그램, 디스코드 스타일의 대화 이미지를 생성합니다.

## 주요 기능

- **멀티 플랫폼 지원**: 카카오톡, 텔레그램, 인스타그램, 디스코드 테마
- **실시간 미리보기**: 편집 내용이 즉시 iPhone 프레임에 반영
- **메시지 관리**: 추가, 수정, 삭제, 순서 변경
- **발화자 커스터마이징**: 이름, 프로필 이미지 설정 (최대 10명)
- **프로젝트 저장**: localStorage 기반 자동/수동 저장
- **PNG 내보내기**: 고품질 이미지로 저장
- **AI 대화 생성**: Upstage API를 활용한 대화 자동 생성 (scripts/)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 + Vite 7 (Rolldown) |
| 상태 관리 | Zustand 5 |
| 스타일링 | Tailwind CSS 4 |
| 이미지 생성 | html-to-image |
| 아이콘 | Lucide React |
| Backend | FastAPI (Python) |
| AI | Upstage Solar API |

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
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | Vitest 테스트 실행 |

## 프로젝트 구조

```
TalkStudio/
├── src/                    # Frontend 소스
│   ├── components/
│   │   ├── editor/         # 에디터 컴포넌트
│   │   ├── preview/        # 미리보기 컴포넌트
│   │   └── layout/         # 레이아웃 컴포넌트
│   ├── store/              # Zustand 상태 관리
│   ├── themes/             # 플랫폼별 테마 프리셋
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티 함수
│   └── App.jsx             # 루트 컴포넌트
├── backend/                # FastAPI 백엔드
│   └── app/                # API 엔드포인트
├── scripts/                # 유틸리티 스크립트
│   ├── generate_maple_chats.py  # AI 대화 생성
│   └── capture_discord_chats.cjs # 스크린샷 캡처
├── specs/                  # 기능 스펙 문서
├── docs/                   # 문서
└── legacy/                 # 레거시 코드
```

## 사용 방법

1. **플랫폼 선택**: 좌측 사이드바에서 원하는 플랫폼 테마 선택
2. **메시지 작성**: 에디터에서 발화자 선택 후 메시지 입력
3. **미리보기 확인**: 우측 iPhone 프레임에서 실시간 확인
4. **이미지 저장**: "PNG 저장" 버튼 클릭

## 보안

보안 취약점 발견 시 [SECURITY.md](./SECURITY.md)를 참고하세요.

## 라이선스

Copyright (c) 2024-2025 TalkStudio. All Rights Reserved.

이 소프트웨어는 TalkStudio의 독점 소유입니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.
