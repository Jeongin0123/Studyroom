# .env 파일에 아래 두줄 추가하기
# OPENAI_API_KEY=키 입력하기
# OPENAI_MODEL=gpt-4o

from openai import OpenAI
from dotenv import load_dotenv
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


load_dotenv()
llm = ChatOpenAI(model="gpt-4o")  

messages = [
    SystemMessage("너는 온라인 스터디룸 사용자를 도와주는 학습 코치야."),  # 초기 시스템 메시지
]

while True:
    user_input = input("사용자: ")  # 사용자 입력 받기

    if user_input == "exit":  # 사용자가 대화를 종료하려는지 확인
        break
    
    messages.append(
        HumanMessage(user_input)
    )  # 사용자 메시지를 대화 기록에 추가 
    
    ai_response = llm.invoke(messages)  # 대화 기록을 기반으로 AI 응답 가져오기
    messages.append(
        ai_response
    )  # AI 응답 대화 기록에 추가하기

    print("AI: " + ai_response.content)  # AI 응답 출력