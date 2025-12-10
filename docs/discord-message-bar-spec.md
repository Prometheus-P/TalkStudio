# Discord Mobile Message Bar 디자인 스펙

## 개요
Discord 모바일 앱(Android)의 DM 메시지 입력 바(footer) 컴포넌트 디자인 스펙입니다.
실제 앱 스크린샷 기반으로 분석하였습니다.

## 레이아웃 구조

```
[+] [👥] [🎮] | [@username에 메시지...] | [😊] [🎤]
 ↑    ↑    ↑           ↑                   ↑    ↑
32px 26px 26px      flex-1              26px 26px
```

## 컨테이너 스타일

```css
/* Message Bar Container */
display: flex;
flex-direction: row;
align-items: center;
padding: 10px 12px;
gap: 16px;

background: #313338;  /* backgroundPrimary */
```

## 색상 팔레트 (Dark Mode - Mobile)

| 용도 | 색상 코드 | 변수명 |
|------|-----------|--------|
| 배경 (컨테이너) | `#313338` | `backgroundPrimary` |
| + 버튼 배경 | `#3f4147` | `backgroundDivider` |
| 입력창 배경 | `#1e1f22` | `backgroundTertiary` |
| 아이콘 | `#b5bac1` | `interactiveNormal` |
| 플레이스홀더 | `#5d5f67` | `textPlaceholder` |

## 컴포넌트 상세

### 1. Plus 버튼 (첨부)
```css
width: 32px;
height: 32px;
border-radius: 50%;
background-color: #3f4147;

/* 내부 아이콘 */
icon-size: 20px;
icon-color: #b5bac1;
```

### 2. Activity 아이콘 (두 사람)
- Size: 26x26px
- Color: `#b5bac1`
- SVG: 세 명의 사람이 연결된 형태

### 3. Gamepad 아이콘 (게임/니트로)
- Size: 26x26px
- Color: `#b5bac1`
- SVG: 게임 컨트롤러 형태

### 4. Input Field (입력창)
```css
flex: 1;
height: 40px;
border-radius: 20px;  /* pill shape */
padding: 0 16px;
background-color: #1e1f22;

/* 플레이스홀더 */
font-size: 15px;
font-weight: 400;
color: #5d5f67;
```

플레이스홀더 텍스트: `@{username}에 메시지...`

### 5. Emoji 아이콘
- Size: 26x26px
- Color: `#b5bac1`
- lucide-react: `Smile`

### 6. Microphone 아이콘
- Size: 26x26px
- Color: `#b5bac1`
- lucide-react: `Mic`

## SVG Icons

### Activity Icon (두 사람 연결)
```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  {/* 중앙 메인 사람 */}
  <path d="M14.5 8.5C14.5 9.88071 13.3807 11 12 11C10.6193 11 9.5 9.88071 9.5 8.5C9.5 7.11929 10.6193 6 12 6C13.3807 6 14.5 7.11929 14.5 8.5Z" fill="currentColor"/>
  <path d="M7.5 14C7.5 12.067 9.067 10.5 11 10.5H13C14.933 10.5 16.5 12.067 16.5 14V14.5C16.5 15.0523 16.0523 15.5 15.5 15.5H8.5C7.94772 15.5 7.5 15.0523 7.5 14.5V14Z" fill="currentColor"/>
  {/* 오른쪽 사람 */}
  <path d="M20 10.5C20 11.3284 19.3284 12 18.5 12C17.6716 12 17 11.3284 17 10.5C17 9.67157 17.6716 9 18.5 9C19.3284 9 20 9.67157 20 10.5Z" fill="currentColor"/>
  <path d="M18 13C19.1046 13 20 13.8954 20 15V15.5H17.5V14C17.5 13.6203 17.4398 13.2552 17.3283 12.9134C17.5387 12.9691 17.7598 13 17.9888 13H18Z" fill="currentColor"/>
  {/* 왼쪽 사람 */}
  <path d="M7 10.5C7 11.3284 6.32843 12 5.5 12C4.67157 12 4 11.3284 4 10.5C4 9.67157 4.67157 9 5.5 9C6.32843 9 7 9.67157 7 10.5Z" fill="currentColor"/>
  <path d="M6 13C4.89543 13 4 13.8954 4 15V15.5H6.5V14C6.5 13.6203 6.56023 13.2552 6.67172 12.9134C6.46128 12.9691 6.24021 13 6.01124 13H6Z" fill="currentColor"/>
</svg>
```

### Gamepad Icon (게임 컨트롤러)
```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20.9752 17.7144C20.5765 19.4354 19.0004 20.5 17.2 20.5C15.8618 20.5 14.6718 19.767 13.7683 18.5H10.2317C9.32816 19.767 8.13822 20.5 6.8 20.5C4.99961 20.5 3.42352 19.4354 3.02478 17.7144C2.70759 16.3437 2.5 14.9377 2.5 13.5C2.5 10.2783 4.51472 7.5 7.5 7.5H16.5C19.4853 7.5 21.5 10.2783 21.5 13.5C21.5 14.9377 21.2924 16.3437 20.9752 17.7144Z" stroke="currentColor" stroke-width="1.5"/>
  {/* 왼쪽 D-패드 */}
  <circle cx="8" cy="12" r="1" fill="currentColor"/>
  <circle cx="8" cy="15" r="1" fill="currentColor"/>
  <circle cx="6.5" cy="13.5" r="1" fill="currentColor"/>
  <circle cx="9.5" cy="13.5" r="1" fill="currentColor"/>
  {/* 오른쪽 버튼 */}
  <circle cx="15" cy="12.5" r="1.25" fill="currentColor"/>
  <circle cx="17.5" cy="14.5" r="1.25" fill="currentColor"/>
</svg>
```

## 구현 코드

```jsx
// ChatPreview.jsx - InputAreaDecoration 컴포넌트
const InputAreaDecoration = ({ theme, title }) => {
  if (theme.id === 'discord') {
    return (
      <div
        className="flex items-center"
        style={{
          backgroundColor: discordColors.backgroundPrimary,
          padding: '10px 12px',
          gap: 16,
        }}
      >
        {/* + 버튼 (원형) */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: discordColors.backgroundDivider,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Plus size={20} color={discordColors.interactiveNormal} />
        </div>

        {/* 활동 아이콘 */}
        <DiscordActivityIcon color={discordColors.interactiveNormal} size={26} />

        {/* 게임패드 아이콘 */}
        <DiscordGamepadIcon color={discordColors.interactiveNormal} size={26} />

        {/* 입력 필드 */}
        <div style={{
          flex: 1,
          height: 40,
          borderRadius: 20,
          backgroundColor: discordColors.backgroundTertiary,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            color: discordColors.textPlaceholder,
            fontSize: 15,
          }}>
            @{title}에 메시지...
          </span>
        </div>

        {/* 이모지 */}
        <Smile size={26} color={discordColors.interactiveNormal} />

        {/* 마이크 */}
        <Mic size={26} color={discordColors.interactiveNormal} />
      </div>
    );
  }
};
```

## 참고: 데스크탑 vs 모바일 차이점

| 항목 | 데스크탑 | 모바일 (현재 구현) |
|------|----------|-------------------|
| 배경색 | `#40444B` | `#313338` |
| 레이아웃 | 단일 바 | 분리된 요소들 |
| Plus 버튼 | 아이콘만 | 원형 컨테이너 |
| 입력창 | 직사각형 | Pill 형태 (rounded) |
| 아이콘 | Gift, GIF, Sticker, Emoji | Activity, Gamepad, Emoji, Mic |
| Send 버튼 | 있음 (Blurple) | 없음 (마이크로 대체) |
| 아이콘 크기 | 15-18px | 26px |

## 파일 위치

- 컴포넌트: `src/components/preview/ChatPreview.jsx`
- 색상 정의: `src/themes/presets.js` (discordColors)
