---
title: TalkStudio - Environment Setup Guide
version: 1.0.0
status: Approved
owner: @haseongpark
created: 2025-12-08
updated: 2025-12-08
reviewers: []
---

# Environment Setup Guide

> 이 문서는 TalkStudio 개발 환경 설정을 위한 상세 가이드입니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-08 | @haseongpark | 최초 작성 |

---

## 관련 문서

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 전체 맥락
- [README.md](./README.md) - 빠른 시작 가이드
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드

---

## 1. 시스템 요구사항

### 1.1 필수 소프트웨어

| 소프트웨어 | 최소 버전 | 권장 버전 | 확인 명령어 |
|-----------|----------|----------|------------|
| Node.js | 18.0.0 | 20.x LTS | `node --version` |
| npm | 9.0.0 | 10.x | `npm --version` |
| Git | 2.30.0 | 최신 | `git --version` |

### 1.2 권장 운영체제

| OS | 지원 여부 | 비고 |
|----|----------|------|
| macOS 12+ | ✅ 완전 지원 | 기본 개발 환경 |
| Windows 10/11 | ✅ 완전 지원 | WSL2 권장 |
| Ubuntu 20.04+ | ✅ 완전 지원 | - |

### 1.3 권장 하드웨어

| 항목 | 최소 사양 | 권장 사양 |
|------|----------|----------|
| RAM | 4GB | 8GB 이상 |
| 디스크 공간 | 1GB | 2GB 이상 |
| CPU | 듀얼 코어 | 쿼드 코어 이상 |

---

## 2. Node.js 설치

### 2.1 macOS (Homebrew)

```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js LTS 설치
brew install node@20

# 버전 확인
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 2.2 Windows

**방법 1: 공식 설치 프로그램**
1. [Node.js 공식 사이트](https://nodejs.org/) 접속
2. LTS 버전 다운로드 및 설치
3. 설치 완료 후 PowerShell에서 버전 확인

**방법 2: Chocolatey**
```powershell
# Chocolatey로 설치
choco install nodejs-lts

# 버전 확인
node --version
npm --version
```

### 2.3 Linux (Ubuntu/Debian)

```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 2.4 nvm 사용 (권장)

여러 Node.js 버전 관리가 필요한 경우 nvm 사용을 권장합니다.

```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 터미널 재시작 후
nvm install 20
nvm use 20
nvm alias default 20

# 버전 확인
node --version
```

---

## 3. 프로젝트 설정

### 3.1 저장소 클론

```bash
# HTTPS
git clone https://github.com/[username]/TalkStudio.git

# SSH (권장)
git clone git@github.com:[username]/TalkStudio.git

# 프로젝트 디렉토리로 이동
cd TalkStudio
```

### 3.2 의존성 설치

```bash
# npm 의존성 설치
npm install

# 설치 확인 (node_modules 폴더 생성됨)
ls -la node_modules/
```

### 3.3 환경 변수 설정 (선택사항)

현재 TalkStudio는 환경 변수가 필요하지 않습니다. 향후 기능 확장 시 `.env` 파일이 필요할 수 있습니다.

```bash
# .env.example이 있는 경우
cp .env.example .env

# .env 파일 편집
vim .env  # 또는 선호하는 편집기 사용
```

---

## 4. 개발 서버 실행

### 4.1 개발 모드

```bash
# Vite 개발 서버 시작
npm run dev

# 출력 예시:
#   VITE v7.2.5  ready in 500 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

### 4.2 HMR (Hot Module Replacement)

개발 서버는 HMR을 지원합니다:
- 코드 변경 시 자동으로 브라우저에 반영
- React 컴포넌트 상태 유지
- CSS 변경 즉시 적용

### 4.3 개발 서버 옵션

```bash
# 특정 포트로 실행
npm run dev -- --port 3000

# 네트워크에서 접근 가능하게 실행
npm run dev -- --host

# HTTPS로 실행 (인증서 필요)
npm run dev -- --https
```

---

## 5. 빌드 및 배포

### 5.1 프로덕션 빌드

```bash
# 빌드 실행
npm run build

# 빌드 결과물 확인
ls -la dist/
```

빌드 결과물은 `dist/` 폴더에 생성됩니다:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

### 5.2 빌드 미리보기

```bash
# 프로덕션 빌드 로컬 미리보기
npm run preview

# 출력:
#   ➜  Local:   http://localhost:4173/
```

### 5.3 정적 호스팅 배포

빌드된 `dist/` 폴더는 정적 호스팅 서비스에 배포할 수 있습니다:

| 서비스 | 배포 방법 |
|--------|----------|
| Vercel | `vercel deploy` |
| Netlify | `netlify deploy --prod --dir=dist` |
| GitHub Pages | `gh-pages -d dist` |
| Cloudflare Pages | Dashboard에서 연결 |

---

## 6. 코드 품질 도구

### 6.1 ESLint

```bash
# 린트 검사 실행
npm run lint

# 자동 수정 (--fix 옵션)
npx eslint . --fix
```

### 6.2 ESLint 설정

프로젝트는 다음 ESLint 규칙을 사용합니다:
- `eslint:recommended` - 기본 권장 규칙
- `plugin:react-hooks/recommended` - React Hooks 규칙
- `plugin:react-refresh/recommended` - Fast Refresh 호환성

### 6.3 추가 도구 설치 (선택사항)

```bash
# Prettier (코드 포매터) - 필요시 설치
npm install -D prettier eslint-config-prettier

# Husky (Git hooks) - 필요시 설치
npm install -D husky lint-staged
npx husky init
```

---

## 7. IDE 설정

### 7.1 VS Code (권장)

**필수 확장 프로그램:**

| 확장 프로그램 | ID | 용도 |
|-------------|-----|------|
| ESLint | `dbaeumer.vscode-eslint` | 린트 표시 |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind 자동완성 |
| ES7+ React Snippets | `dsznajder.es7-react-js-snippets` | React 스니펫 |
| Prettier | `esbenp.prettier-vscode` | 코드 포매팅 |

**권장 설정 (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "javascriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 7.2 WebStorm / IntelliJ IDEA

1. **Settings > Languages & Frameworks > JavaScript**
   - Language version: `ECMAScript 6+`

2. **Settings > Languages & Frameworks > Node.js**
   - Node.js 인터프리터 경로 설정

3. **Settings > Tools > File Watchers**
   - ESLint 활성화

### 7.3 Vim/Neovim

```lua
-- lazy.nvim 예시
{
  "neovim/nvim-lspconfig",
  opts = {
    servers = {
      eslint = {},
      tailwindcss = {},
    },
  },
}
```

---

## 8. 브라우저 개발 도구

### 8.1 React Developer Tools

React 컴포넌트 디버깅을 위해 브라우저 확장 프로그램을 설치하세요:

- [Chrome용 React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox용 React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### 8.2 사용 방법

1. 브라우저 개발자 도구 열기 (F12)
2. "Components" 탭에서 컴포넌트 트리 확인
3. "Profiler" 탭에서 렌더링 성능 분석

---

## 9. 문제 해결

### 9.1 일반적인 문제

#### npm install 실패

```bash
# node_modules 및 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 포트 충돌

```bash
# 5173 포트 사용 중인 프로세스 확인
lsof -i :5173

# 다른 포트로 실행
npm run dev -- --port 3000
```

#### HMR이 작동하지 않음

```bash
# Vite 캐시 삭제
rm -rf node_modules/.vite
npm run dev
```

### 9.2 macOS 관련

#### Xcode Command Line Tools 오류

```bash
xcode-select --install
```

### 9.3 Windows 관련

#### PowerShell 스크립트 실행 정책

```powershell
# 관리자 권한으로 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 긴 경로 문제

```powershell
# 레지스트리에서 긴 경로 활성화
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

---

## 10. 지원되는 브라우저

개발 및 테스트 시 다음 브라우저를 사용하세요:

| 브라우저 | 최소 버전 | 비고 |
|---------|----------|------|
| Chrome | 100+ | 기본 개발 브라우저 |
| Firefox | 100+ | 크로스 브라우저 테스트 |
| Safari | 15+ | macOS 테스트 |
| Edge | 100+ | Windows 테스트 |

---

## 11. 다음 단계

환경 설정이 완료되면:

1. **[README.md](./README.md)** - 프로젝트 개요 확인
2. **[CONTEXT.md](./CONTEXT.md)** - 상세 맥락 파악
3. **[plan.md](./plan.md)** - 개발 태스크 확인
4. `npm run dev`로 개발 시작

---

## 12. 도움말

문제가 해결되지 않으면:

1. [GitHub Issues](https://github.com/[username]/TalkStudio/issues)에서 유사 이슈 검색
2. 새 이슈 생성 시 다음 정보 포함:
   - 운영체제 및 버전
   - Node.js 및 npm 버전
   - 에러 메시지 전문
   - 재현 단계
