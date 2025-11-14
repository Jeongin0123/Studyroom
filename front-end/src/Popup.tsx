import PokemonSelectPopup from "./components/PokemonSelectPopup";
import React, { useEffect } from 'react'
// import styled from 'styled-components'
// import PropTypes from 'prop-types'

export default function Popup() {
  return(
    <>
      {/* <ModalOverlay/>
      <ModalWrapper> */}
        <PokemonSelectPopup />
      {/* </ModalWrapper> */}
    </>
  )
}

// const ModalWrapper = styled.div`
//     box-sizing: border-box;
//     display: ${(props) => (props.visible ? 'block' : 'none')};
//     position: fixed;
//     top: 0;
//     right: 0;
//     bottom: 0;
//     left: 0;
//     z-index: 1000;
//     overflow: auto;
//     outline: 0;
// `

// const ModalOverlay = styled.div`
//     box-sizing: border-box;
//     display: ${(props) => (props.visible ? 'block' : 'none')};
//     position: fixed;
//     top: 0;
//     left: 0;
//     bottom: 0;
//     right: 0;
//     background-color: rgba(0, 0, 0, 0.6);
//     z-index: 999;
// `