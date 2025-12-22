#!/usr/bin/env python3
"""
메이플스토리 아이템 거래 대화 생성 스크립트
Upstage API를 사용하여 5개의 거래 대화를 생성합니다.
"""

import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
import random

# API 설정
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY", "up_s6jaSOWL3snV5H57lLvyBgKMtsAIf")
UPSTAGE_BASE_URL = "https://api.upstage.ai/v1/solar"

# 거래 설정
TRADE_AMOUNTS = [50000, 70000, 100000, 100000, 100000]  # 5만, 7만, 10만, 10만, 10만원

# 메이플 아이템 목록
MAPLE_ITEMS = [
    {"name": "아케인셰이드 튜너", "type": "무기", "stats": "17성 공격력 30%"},
    {"name": "앱솔랩스 나이트케이프", "type": "망토", "stats": "22성 올스탯 12%"},
    {"name": "아케인셰이드 아처후드", "type": "모자", "stats": "유니크 3줄 덱스 33%"},
    {"name": "제네시스 보우", "type": "활", "stats": "8성 레전 공퍼 2줄"},
    {"name": "칠흑의 보스셋", "type": "세트템", "stats": "귀고리+펜던트+얼장"}
]

# 닉네임 목록
NICKNAMES_SELLER = ["레전드헌터", "메이플상인", "거래왕김씨", "다크나이트99", "히어로전사"]
NICKNAMES_BUYER = ["초보모험가", "불독마법사", "윈드슈터쨩", "아크메이지", "나이트워커"]


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
    """Upstage API를 사용하여 대화 생성"""

    amount_display = f"{amount // 10000}만원"

    prompt = f"""당신은 메이플스토리 게임 아이템 거래 대화를 생성하는 AI입니다.
디스코드에서 이루어지는 자연스러운 대화를 JSON 형식으로 생성해주세요.

거래 정보:
- 아이템: {item['name']} ({item['type']}, {item['stats']})
- 거래 금액: {amount_display} (현금거래)
- 거래 날짜: {format_korean_date(trade_date)}

대화 규칙:
1. 구매자가 먼저 아이템 구매 의사를 밝힘
2. 판매자가 아이템 정보와 가격 제시
3. 간단한 가격 흥정 (1-2회)
4. 최종 {amount_display}에 합의
5. 거래 장소/방법 약속
6. 6-10개의 메시지로 구성
7. 자연스러운 반말/존댓말 혼용
8. 메이플 용어 사용 (메소, 현거래, 정보, 등)

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
    print("메이플스토리 거래 대화 생성 시작")
    print("=" * 50)

    all_chats = []

    for i, amount in enumerate(TRADE_AMOUNTS):
        item = MAPLE_ITEMS[i]
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
