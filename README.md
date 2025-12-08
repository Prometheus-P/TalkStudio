# TalkStudio

> 다양한 메시징 플랫폼 스타일의 대화 스크린샷을 손쉽게 생성하는 웹 시뮬레이터

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**TalkStudio**는 콘텐츠 크리에이터, 마케터, 디자이너를 위한 대화 스크린샷 생성 도구입니다.

실제 메시징 앱 없이도 **카카오톡, 텔레그램, 인스타그램, 디스코드** 스타일의 자연스러운 대화 이미지를 빠르게 제작할 수 있습니다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| **멀티 테마** | 4개 메시징 플랫폼 테마 지원 |
| **실시간 미리보기** | 폰 프레임에서 즉시 확인 |
| **이미지 내보내기** | PNG 형식으로 고품질 저장 |
| **커스터마이징** | 프로필, 상태바, 메시지 자유롭게 편집 |

### 지원 플랫폼

<table>
  <tr>
    <td align="center"><strong>카카오톡</strong><br/><code>#FEE500</code></td>
    <td align="center"><strong>텔레그램</strong><br/><code>#2AABEE</code></td>
    <td align="center"><strong>인스타그램</strong><br/>Gradient</td>
    <td align="center"><strong>디스코드</strong><br/><code>#5865F2</code></td>
  </tr>
</table>

---

## Quick Start

### 필수 요구사항

- **Node.js** 18.0.0 이상 (권장: 20.x LTS)
- **npm** 9.0.0 이상

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/[username]/TalkStudio.git
cd TalkStudio

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

### 프로덕션 빌드

```bash
# 빌드 생성
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## Project Structure

```
TalkStudio/
├── src/
│   ├── main.jsx              # React 엔트리포인트
│   ├── App.jsx               # 루트 컴포넌트 (3-column 레이아웃)
│   ├── index.css             # 글로벌 스타일
│   ├── components/           # UI 컴포넌트
│   │   └── layout/
│   │       └── Sidebar.jsx   # 테마 선택 사이드바
│   └── store/
│       └── useChatStore.js   # Zustand 상태 관리
├── public/                   # 정적 에셋
├── docs/                     # 프로젝트 문서
├── index.html                # HTML 템플릿
├── package.json              # 의존성 정의
├── vite.config.js            # Vite 설정
├── tailwind.config.js        # Tailwind 설정
└── eslint.config.js          # ESLint 설정
```

---

## Tech Stack

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| UI Framework | React | 19.2.0 |
| Build Tool | Vite (Rolldown) | 7.2.5 |
| State Management | Zustand | 5.0.9 |
| Styling | Tailwind CSS | 4.1.17 |
| Icons | Lucide React | 0.556.0 |
| Screenshot | html2canvas | 1.4.1 |

---

## Available Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (HMR 활성화) |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run lint` | ESLint 코드 검사 |

---

## Usage

### 1. 테마 선택
좌측 사이드바에서 원하는 메시징 플랫폼 테마를 클릭합니다.

### 2. 메시지 작성
중앙 에디터 영역에서 대화 내용을 입력합니다.
- 발신자(나/상대방) 선택
- 메시지 내용 입력
- 시간 설정

### 3. 미리보기 확인
우측 폰 프레임에서 실시간으로 대화 미리보기를 확인합니다.

### 4. 이미지 내보내기
내보내기 버튼을 클릭하여 PNG 이미지로 저장합니다.

---

## Documentation

상세 문서는 다음을 참조하세요:

| 문서 | 설명 |
|------|------|
| [CONTEXT.md](./CONTEXT.md) | 프로젝트 전체 맥락 (Single Source of Truth) |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | 개발 환경 설정 가이드 |
| [plan.md](./plan.md) | TDD 개발 계획 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 기여 가이드 |

---

## Development Status

### Phase 1: MVP (진행 중)
- [x] 기본 UI 레이아웃
- [x] 테마 전환 기능
- [x] Zustand 상태 관리
- [ ] 메시지 에디터 구현
- [ ] 테마별 채팅 렌더링
- [ ] 이미지 내보내기

### Phase 2: 기능 확장 (예정)
- [ ] 이미지/이모지 메시지
- [ ] 대화 저장/불러오기
- [ ] 다국어 지원

---

## Contributing

기여를 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조해주세요.

### 기여 프로세스

1. Fork & Clone
2. Feature 브랜치 생성 (`git checkout -b feat/feature-name`)
3. 변경사항 커밋 (`git commit -m 'feat: add feature'`)
4. 브랜치 푸시 (`git push origin feat/feature-name`)
5. Pull Request 생성

---

## License

이 프로젝트는 MIT 라이선스 하에 배포됩니다. [LICENSE](./LICENSE) 파일을 참조하세요.

---

## Contact

- **프로젝트 오너**: @haseongpark
- **이슈 리포트**: [GitHub Issues](https://github.com/[username]/TalkStudio/issues)

---

<p align="center">
  Made with React + Vite + Tailwind CSS
</p>
