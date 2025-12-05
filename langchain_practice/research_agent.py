# langchain_practice/research_agent.py 
"""
Brave Search 기반 웹 리서치 모듈
- Brave Search API로 웹 검색을 하고
- 그 결과를 프롬프트에 넣어서 LLM이
  "개념 설명 + [유사한 검색결과]" 형식으로 답을 만들어 주도록 함.
"""

import os
import re
import requests
from typing import Any, Dict, List

from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


# -----------------------------
# 0) 질문 전처리: 핵심 키워드 추출
# -----------------------------
def extract_core_topic(query: str) -> str:
    """
    자연어 질문에서 검색용 핵심 키워드만 뽑아낸다.
    예) "지구온난화 관련 기사 찾아줘" -> "지구온난화"
    """
    if not query:
        return ""

    msg = query.strip()

    # 1) "~ 관련 기사/뉴스", "~에 대한 기사/뉴스" 패턴 처리
    patterns = [
        r"(.+?)\s*관련\s*기사",
        r"(.+?)\s*관련\s*뉴스",
        r"(.+?)에\s*대한\s*(기사|뉴스)",
        r"(.+?)에\s*관한\s*(기사|뉴스)",
    ]
    for pat in patterns:
        m = re.search(pat, msg)
        if m:
            topic = m.group(1).strip()
            if topic:
                return topic

    # 2) 끝에 붙는 "찾아줘/알려줘/검색해줘/말해줘" 제거
    tails = ["찾아줘", "찾아 줘", "알려줘", "알려 줘", "검색해줘", "검색해 줘", "말해줘", "말해 줘"]
    for tail in tails:
        if msg.endswith(tail):
            msg = msg[: -len(tail)].strip()
            break

    return msg


# -----------------------------
# 1) Brave Search API 호출 함수
# -----------------------------
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
BRAVE_ENDPOINT = os.getenv("BRAVE_ENDPOINT", "https://api.search.brave.com/res/v1/web/search")


def brave_search(query: str, count: int = 5) -> List[Dict[str, Any]]:
    """
    Brave Search API를 호출하여 검색 결과 목록을 반환한다.
    반환 형식: [{ "title": str, "url": str, "snippet": str }, ...]
    """
    if not BRAVE_API_KEY:
        # 키가 없으면 명시적으로 알려줌
        return [{
            "title": "Brave API Key 없음",
            "url": "",
            "snippet": "BRAVE_API_KEY 환경변수가 설정되어 있지 않습니다."
        }]

    headers = {
        "X-Subscription-Token": BRAVE_API_KEY,
        "Accept": "application/json",
    }
    params = {
        "q": query,
        "count": count,
        "format": "json",
    }

    try:
        resp = requests.get(BRAVE_ENDPOINT, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # Brave 응답 구조: data["web"]["results"] 안에 title, url, description 있음
        items = data.get("web", {}).get("results", [])

        results: List[Dict[str, Any]] = []
        for item in items:
            results.append({
                "title": item.get("title", "제목 없음"),
                "url": item.get("url", ""),
                "snippet": item.get("description", ""),
            })
        return results

    except Exception as e:
        return [{
            "title": "검색 오류",
            "url": "",
            "snippet": f"Brave Search 호출 중 오류: {e}",
        }]


# -----------------------------
# 2) Brave 기반 검색 래퍼 함수
# -----------------------------
def run_research_search(query: str) -> str:
    """
    Brave Search 기반 검색 함수.
    - 질문을 정리해서 핵심 키워드로 만들고
    - 한국어/영어 조합으로 몇 번 재검색해서
      "1. 제목 - URL" 형식의 문자열을 만든다.
    """
    core = extract_core_topic(query)
    if not core:
        return "검색어가 비어 있습니다."

    # 앞에서부터 순서대로 시도할 검색어들
    candidate_queries = [
        core,
        f"{core} 최신 뉴스",
        f"{core} 최근 기사",
        f"{core} 관련 뉴스",
        f"{core} news",
        f"{core} latest news",
        f"{core} article",
    ]

    for q in candidate_queries:
        results = brave_search(q, count=5)

        # API 키 없음/검색 오류인 경우는 그대로 메시지로 돌려보냄
        if results and results[0].get("title") in ["Brave API Key 없음", "검색 오류"]:
            # 이 경우에는 바로 문자열로 변환해서 리턴
            lines = []
            for i, r in enumerate(results, start=1):
                lines.append(f"{i}. {r['title']} - {r['url']}")
            return "\n".join(lines)

        # 정상 결과가 있는 경우
        if results:
            lines: List[str] = []
            for i, r in enumerate(results[:5], start=1):
                title = r.get("title") or "제목 없음"
                url = r.get("url") or ""
                lines.append(f"{i}. {title} - {url}")
            return "\n".join(lines)

    # 여기까지 왔다는 건 Brave에서 결과를 못 찾았다는 뜻
    return "관련된 기사를 찾지 못했습니다. 다른 키워드로 다시 시도해 보세요."


# -----------------------------
# 3) 리서치용 LLM 체인 정의
# -----------------------------
PRIMARY_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

llm = ChatOpenAI(
    model=PRIMARY_MODEL,
    temperature=0.3,
    timeout=60,
)

system_prompt = """
너는 사용자의 정보 탐색을 도와주는 조교이다.

역할:
1) 사용자가 어떤 개념/서비스/주제를 물어보면,
   먼저 한국어로 그 개념을 이해하기 쉽게 설명해 준다.
2) 이어서 한 줄 띄우고, 아래 형식으로 유사한 검색결과를 보여준다.

[유사한 검색결과]
1. 제목1 - URL1
2. 제목2 - URL2
3. 제목3 - URL3

규칙:
- 아래에 제공되는 검색결과 문자열을 참고하여 링크를 선정한다.
- 설명 부분에는 URL을 넣지 말고, 개념/특징 위주로 정리한다.
- 너무 장황하지 않게 핵심 위주로 정리한다.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        (
            "human",
            "사용자 질문:\n{question}\n\n"
            "아래는 이 질문에 대해 웹에서 찾은 검색결과 목록이다.\n"
            "[검색결과]\n{search_results}\n\n"
            "위 정보를 참고해서 역할과 형식에 맞게 답변해 줘.",
        ),
    ]
)

research_chain = prompt | llm | StrOutputParser()


# -----------------------------
# 4) 외부에서 사용하는 함수
# -----------------------------
def get_research_answer(question: str) -> str:
    """
    langchain_chatbot.py 에서 호출하는 진입 함수.
    - question: 사용자의 질문
    - 반환: 개념 설명 + [유사한 검색결과] 형식의 문자열
    """
    search_results = run_research_search(question)

    answer = research_chain.invoke(
        {
            "question": question,
            "search_results": search_results,
        }
    )
    return answer
