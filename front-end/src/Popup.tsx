import PokemonSelectPopup from "./components/PokemonSelectPopup";
import React, { useEffect } from 'react'
// import styled from 'styled-components'
// import PropTypes from 'prop-types'

export default function Popup({ onClose } : {onClose: () => void}) {
  return(
    <>
      <PokemonSelectPopup onClose = { onClose }/>
    </>
  )
}