#!/usr/bin/env python3
"""
TalkStudio - Chat Data Generator

Copyright (c) 2024-2025 TalkStudio. All Rights Reserved.
PROPRIETARY AND CONFIDENTIAL. See LICENSE file for details.

온라인 게임 아이템 거래 대화 생성 스크립트 (데모용)
Upstage API를 사용하여 가상의 거래 대화를 생성합니다.

⚠️ DISCLAIMER / 면책조항:
- 이 스크립트로 생성된 대화는 데모/테스트 목적으로만 사용됩니다.
- 실제 대화가 아닌 AI가 생성한 가상의 샘플 데이터입니다.
- 사기, 허위 증거 조작 등 불법적인 용도로 사용을 금지합니다.
- 모든 게임명, 아이템명, 닉네임은 가상이며 실제와 무관합니다.

⚠️ COPYRIGHT NOTICE:
- This is a sample chat generator for demonstration purposes only.
- All game names, item names, and nicknames are fictional.
- Not affiliated with any game companies.
- "TalkStudio" is a trademark of the TalkStudio project.
"""

import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
import random

# API 설정 (환경변수에서만 로드 - 하드코딩 금지)
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")
if not UPSTAGE_API_KEY:
    raise ValueError("UPSTAGE_API_KEY 환경변수가 설정되지 않았습니다.")
UPSTAGE_BASE_URL = "https://api.upstage.ai/v1/solar"

# 거래 설정
TRADE_AMOUNTS = [50000, 70000, 100000, 100000, 100000]  # 5만, 7만, 10만, 10만, 10만원

# 가상 게임 아이템 목록 (실제 게임과 무관한 가상의 아이템)
GAME_ITEMS = [
    {"name": "전설의 검 [데모]", "type": "무기", "stats": "강화+17 공격력 30%"},
    {"name": "신비의 망토 [데모]", "type": "망토", "stats": "강화+22 올스탯 12%"},
    {"name": "마법사 모자 [데모]", "type": "모자", "stats": "레어 3옵션"},
    {"name": "영웅의 활 [데모]", "type": "활", "stats": "강화+8 공격력 2옵션"},
    {"name": "보스 세트 [데모]", "type": "세트템", "stats": "귀걸이+목걸이+반지"}
]

# 가상 닉네임 목록 (실제와 무관)
NICKNAMES_SELLER = ["판매자A_demo", "상인B_demo", "거래자C_demo", "유저D_demo", "플레이어E_demo"]
NICKNAMES_BUYER = ["구매자1_demo", "유저2_demo", "신규3_demo", "모험가4_demo", "초보5_demo"]


def get_random_date():
    """1달~2달 전 사이의 랜덤 날짜 생성"""
    today = datetime.now()
    days_ago = random.randint(30, 60)
    past_date = today - timedelta(days=days_ago)
    return past_date


def format_korean_time(dt: datetime):
    """한국식 시간 포맷"""
    hour = dt.hour
    minute = dt.minute
    period = "오전" if hour < 12 else "오후"
    display_hour = hour if hour <= 12 else hour - 12
    if display_hour == 0:
        display_hour = 12
    return f"{period} {display_hour}:{minute:02d}"


def format_korean_date(dt: datetime):
    """한국식 날짜 포맷"""
    return f"{dt.month}월 {dt.day}일"


async def generate_chat_with_upstage(item: dict, amount: int, trade_date: datetime):
    """Upstage API를 사용하여 가상 대화 생성 (데모용)"""

    amount_display = f"{amount // 10000}만원"

    prompt = f"""당신은 가상의 온라인 게임 아이템 거래 대화를 생성하는 AI입니다.
채팅 앱에서 이루어지는 자연스러운 대화를 JSON 형식으로 생성해주세요.

[데모 목적 - 실제 거래가 아님]

거래 정보:
- 아이템: {item['name']} ({item['type']}, {item['stats']})
- 거래 금액: {amount_display} (가상 거래)
- 거래 날짜: {format_korean_date(trade_date)} (가상 날짜)

대화 규칙:
1. 구매자가 먼저 아이템 구매 의사를 밝힘
2. 판매자가 아이템 정보와 가격 제시
3. 간단한 가격 흥정 (1-2회)
4. 최종 {amount_display}에 합의
5. 거래 장소/방법 약속
6. 6-10개의 메시지로 구성
7. 자연스러운 반말/존댓말 혼용
8. 일반적인 온라인 게임 용어 사용 (골드, 현거래, 강화 등)

JSON 형식으로만 응답하세요:
{{"messages": [
  {{"sender": "buyer", "text": "메시지내용"}},
  {{"sender": "seller", "text": "메시지내용"}}
]}}"""

    headers = {
        "Authorization": f"Bearer {UPSTAGE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "solar-pro",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "max_tokens": 1000
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{UPSTAGE_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                # JSON 파싱
                try:
                    # JSON 블록 추출
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0]

                    chat_data = json.loads(content.strip())
                    return chat_data.get("messages", [])
                except json.JSONDecodeError as e:
                    print(f"JSON 파싱 실패: {e}")
                    print(f"원본 응답: {content}")
                    return None

            return None
        except httpx.HTTPStatusError as e:
            print(f"HTTP 오류: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            print(f"오류 발생: {e}")
            return None


def create_fallback_chat(item: dict, amount: int, trade_date: datetime):
    """API 실패 시 사용할 기본 대화"""
    amount_display = f"{amount // 10000}만원"

    messages = [
        {"sender": "buyer", "text": f"{item['name']} 아직 파시나요?"},
        {"sender": "seller", "text": f"네 있어요 {item['stats']} 짜리"},
        {"sender": "buyer", "text": "얼마에 파실 생각이세요?"},
        {"sender": "seller", "text": f"현거래 {amount_display} 생각중입니다"},
        {"sender": "buyer", "text": "조금만 깎아주시면 안될까요 ㅠㅠ"},
        {"sender": "seller", "text": f"음.. {amount_display}이 최저에요 시세가 그래요"},
        {"sender": "buyer", "text": f"알겠습니다 {amount_display}에 할게요!"},
        {"sender": "seller", "text": "넵 안전거래 사이트 보내드릴게요"},
    ]
    return messages


def build_chat_store_data(
    messages: list,
    seller_name: str,
    buyer_name: str,
    trade_date: datetime
):
    """TalkStudio store 형식으로 변환"""

    base_time = trade_date.replace(
        hour=random.randint(14, 22),
        minute=random.randint(0, 59)
    )

    store_messages = []
    for i, msg in enumerate(messages):
        msg_time = base_time + timedelta(minutes=i)
        sender = "other" if msg["sender"] == "buyer" else "me"

        store_messages.append({
            "id": i + 1,
            "sender": sender,
            "type": "text",
            "text": msg["text"],
            "time": format_korean_time(msg_time)
        })

    return {
        "config": {
            "theme": "discord",
            "capturedImage": None
        },
        "statusBar": {
            "time": format_korean_time(base_time),
            "battery": random.randint(30, 95),
            "isWifi": True
        },
        "profiles": {
            "me": {
                "id": "me",
                "name": seller_name,
                "avatar": f"https://api.dicebear.com/7.x/pixel-art/svg?seed={seller_name}"
            },
            "other": {
                "id": "other",
                "name": buyer_name,
                "avatar": f"https://api.dicebear.com/7.x/pixel-art/svg?seed={buyer_name}"
            }
        },
        "messages": store_messages,
        "metadata": {
            "trade_date": trade_date.strftime("%Y-%m-%d"),
            "trade_date_korean": format_korean_date(trade_date)
        }
    }


async def main():
    print("=" * 50)
    print("가상 게임 아이템 거래 대화 생성 (데모용)")
    print("⚠️  이 데이터는 실제 거래가 아닌 샘플입니다.")
    print("=" * 50)

    all_chats = []

    for i, amount in enumerate(TRADE_AMOUNTS):
        item = GAME_ITEMS[i]
        trade_date = get_random_date()
        seller = NICKNAMES_SELLER[i]
        buyer = NICKNAMES_BUYER[i]

        print(f"\n[{i+1}/5] 생성 중...")
        print(f"  아이템: {item['name']}")
        print(f"  금액: {amount // 10000}만원")
        print(f"  날짜: {format_korean_date(trade_date)}")

        # Upstage API로 대화 생성
        messages = await generate_chat_with_upstage(item, amount, trade_date)

        if not messages:
            print("  -> API 실패, 기본 대화 사용")
            messages = create_fallback_chat(item, amount, trade_date)
        else:
            print(f"  -> 성공! {len(messages)}개 메시지 생성")

        # Store 형식으로 변환
        chat_data = build_chat_store_data(messages, seller, buyer, trade_date)
        chat_data["metadata"]["item"] = item
        chat_data["metadata"]["amount"] = amount
        chat_data["metadata"]["amount_display"] = f"{amount // 10000}만원"
        chat_data["metadata"]["disclaimer"] = "SAMPLE DATA - 데모용 가상 대화. 실제 거래가 아님."
        chat_data["metadata"]["is_sample"] = True

        all_chats.append(chat_data)

    # JSON 파일로 저장
    output_path = "scripts/generated_chats.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_chats, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 50)
    print(f"완료! {len(all_chats)}개 대화 생성됨")
    print(f"저장 위치: {output_path}")
    print("=" * 50)

    # 요약 출력
    print("\n생성된 대화 요약:")
    for i, chat in enumerate(all_chats):
        meta = chat["metadata"]
        print(f"  {i+1}. {meta['item']['name']} - {meta['amount_display']} ({meta['trade_date_korean']})")

    return all_chats


if __name__ == "__main__":
    asyncio.run(main())
