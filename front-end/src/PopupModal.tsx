import React, { useEffect, useRef } from "react";

export default function Modal() {
  // dialog 참조 ref
  const dialogRef = useRef<HTMLDialogElement>(null);

  // modal 오픈 함수
  const showModal = () => {
    dialogRef.current?.showModal(); // 모달창 노출. show() 호출하면 다이얼로그 노출
  };

  // Modal 닫기 함수
  const closeModal = () => {
    dialogRef.current?.close(); // 모달창 닫기
  };

  return (
    <div>
      {/* 모달 노출 버튼 */}
      <button onClick={showModal}>Open Modal</button>

      {/* dialog 엘리먼트 - 모달창 영역  */}
      <dialog ref={dialogRef}>
        <div>
          {/* 제목 + X버튼 영역 */}
          <span>기본 타이틀</span>
          <button onClick={closeModal}>X버튼</button>
        </div>

        <div>
          {/* 컨텐츠 영역 */}
          <p>기본 컨텐츠가 표시됩니다</p>
        </div>

        <div>
          {/* 확인 버튼 영역 */}
          <button onClick={closeModal}>확인</button>
        </div>
      </dialog>
    </div>
  );
}