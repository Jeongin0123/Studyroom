# langchain_practice/pdf_agent.py
"""
PDF 기반 질의응답 모듈 (RetrievalQA 없이 LCEL로 직접 구성)

- create_pdf_store(file_path):
    PDF를 로드해서 텍스트를 청크로 나누고
    임베딩 + FAISS 벡터스토어를 만든 뒤 doc_id를 반환

- ask_pdf(doc_id, question):
    doc_id에 해당하는 벡터스토어에서 관련 텍스트를 찾고
    그 내용을 LLM에 넣어서 답변을 생성
"""

import os
import uuid
from typing import Dict

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# -----------------------------
# 전역 벡터스토어 저장소 (메모리)
# -----------------------------
pdf_stores: Dict[str, FAISS] = {}

# 임베딩 & LLM 설정
embeddings = OpenAIEmbeddings()

PDF_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
llm = ChatOpenAI(model=PDF_MODEL, temperature=0)


def create_pdf_store(file_path: str) -> str:
    """
    PDF 파일 경로를 받아서:
    1) 페이지 로드
    2) 텍스트 청크로 분할
    3) 임베딩 + FAISS 벡터스토어 생성
    4) doc_id를 만들어 전역 dict에 저장 후 반환
    """
    # 1) PDF 로드
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    # 2) 텍스트 청크 분할
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
    )
    chunks = splitter.split_documents(docs)

    # 3) 벡터스토어 생성
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # 4) doc_id 발급 후 전역 dict에 저장
    doc_id = str(uuid.uuid4())
    pdf_stores[doc_id] = vectorstore

    return doc_id


def ask_pdf(doc_id: str, question: str) -> str:
    """
    이미 만들어진 doc_id에 대해 질문하고 답을 생성한다.
    - 해당 doc_id의 벡터스토어에서 관련 청크 k개 검색
    - 그 내용을 LLM 프롬프트에 넣어 답변 생성
    """
    if doc_id not in pdf_stores:
        return "해당 문서를 찾을 수 없습니다. 다시 업로드 해 주세요."

    vectorstore = pdf_stores[doc_id]

    # 1) 관련 청크 검색
    docs = vectorstore.similarity_search(question, k=4)
    if not docs:
        return "문서에서 관련 내용을 찾지 못했습니다."

    context_text = "\n\n---\n\n".join(d.page_content for d in docs)

    # 2) 프롬프트 정의 (문서 안 내용만 근거로 답하도록 안내)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "너는 사용자가 업로드한 PDF 문서를 바탕으로만 답변하는 조교야. "
                    "반드시 아래 [문서 발췌 내용] 범위 안에서 근거를 찾아 한국어로 설명해. "
                    "모르면 모른다고 말하고, 문서에 없는 내용은 지어내지 마."
                ),
            ),
            (
                "human",
                (
                    "[문서 발췌 내용]\n"
                    "{context}\n\n"
                    "[질문]\n"
                    "{question}\n\n"
                    "위 문서 내용을 기준으로, 질문에 대한 답을 한국어로 자세히 설명해줘."
                ),
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    # 3) LLM에 context + question 전달
    answer = chain.invoke({"context": context_text, "question": question})
    return answer
