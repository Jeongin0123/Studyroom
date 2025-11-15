import { useState, useEffect } from 'react';
import ReactDOM from "react-dom"
import './Modal.css'
import PokemonSelectPopup from "./components/PokemonSelectPopup";

function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div onClick={(e) => e.stopPropagation()}>
      {children}
    </div>,
    document.body
  );
}

export default Modal;

