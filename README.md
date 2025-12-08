# TalkStudio (톡스튜디오) 🎨

> **Multi-Platform Chat Simulator & Generator**
> 카카오톡, 텔레그램, 인스타그램, 디스코드의 대화 화면을 웹에서 완벽하게 시뮬레이션하고 이미지로 소장하세요.

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)

## ✨ 프로젝트 소개 (Introduction)

**TalkStudio**는 복잡한 이미지 편집 툴 없이도, 웹 브라우저 상에서 실제 메신저와 동일한 UI의 대화 내용을 생성할 수 있는 도구입니다.
사용자 편의성을 위해 **좌측 에디터 - 우측 미리보기(Split View)** 구조를 채택했으며, 서버 없이 클라이언트(브라우저)에서 모든 데이터가 처리되는 **Privacy-First** 아키텍처입니다.

### 🌟 핵심 기능 (Key Features)

* **4-in-1 Multi Theme:** 탭 전환만으로 카카오톡, 텔레그램, 인스타DM, 디스코드 테마 즉시 변경.
* **Real-time Preview:** 에디터에서 입력하는 내용이 스마트폰 프레임 안에 실시간으로 렌더링.
* **Full Customization:**
    * 상단바 (시간, 배터리, 와이파이 상태) 조작.
    * 프로필 (이미지, 이름, 상태메시지) 변경.
    * 대화 (말풍선 스타일, 읽음 확인 숫자, 타임스탬프) 디테일 설정.
* **High Quality Export:** `html2canvas`를 활용한 픽셀 퍼펙트 이미지 다운로드.

## 🛠 기술 스택 (Tech Stack)

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Core** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Vite 기반의 SPA 개발 |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 유틸리티 퍼스트 CSS 프레임워크 |
| **State** | ![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat-square) | 가볍고 직관적인 전역 상태 관리 |
| **Icons** | **Lucide React** | 깔끔하고 통일감 있는 아이콘셋 |
| **Export** | **html2canvas** | DOM 요소 이미지 변환 라이브러리 |

## 📂 폴더 구조 (Directory Structure)

```bash
src/
├── assets/          # 정적 파일 (이미지, 폰트)
├── components/
│   ├── layout/      # 핵심 레이아웃 (Sidebar, Editor, Preview)
│   ├── editor/      # 입력 폼 컴포넌트 모음
│   ├── preview/     # 테마별 말풍선 및 화면 컴포넌트
│   └── ui/          # 재사용 가능한 UI (Button, Input)
├── store/           # Zustand 상태 관리 (useChatStore)
├── App.jsx          # 메인 컨테이너
└── main.jsx         # 진입점
