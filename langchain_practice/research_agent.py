# langchain_practice/research_agent.py
"""
검색 리서치용 모듈 (단순 체인 버전)
- DuckDuckGo로 웹 검색을 하고
- 그 결과를 프롬프트에 넣어서 LLM이
  "개념 설명 + [유사한 검색결과]" 형식으로 답을 만들어 주도록 함.
"""

import os
from typing import Any, Dict, List

# 🔹 [추가] .env 파일에서 OPENAI_API_KEY, OPENAI_MODEL 읽어오기
from dotenv import load_dotenv
load_dotenv()

from duckduckgo_search import DDGS

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


# -----------------------------
# 1) 웹 검색 함수
# -----------------------------
def run_research_search(query: str) -> str:
    """
    DuckDuckGo에서 질의어를 검색해서
    "1. 제목 - URL" 형식으로 최대 3개를 문자열로 만들어 준다.
    """
    results: List[Dict[str, Any]] = []

    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=3):
                results.append(r)
    except Exception as e:
        return f"웹 검색 중 오류가 발생했습니다: {e}"

    if not results:
        return "검색 결과를 찾지 못했습니다."

    lines: List[str] = []
    for i, r in enumerate(results, start=1):
        title = r.get("title", "제목 없음")
        url = r.get("href") or r.get("url") or ""
        lines.append(f"{i}. {title} - {url}")

    return "\n".join(lines)


# -----------------------------
# 2) 리서치용 LLM 체인 정의
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
# 3) 외부에서 사용하는 함수
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
