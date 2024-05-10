import React from "react"

export const ArrowUpIcon : React.FC<{stroke? : string}> = ({stroke = "#494a4d"})=>{
 return    <svg width="25px"    height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

<g id="SVGRepo_bgCarrier" stroke-width="#494a4d"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#000CCCCCC" stroke-width="2.4"> <path d="M12 3L21 10L16.0104 10L16 21L8 21L8 10L3 10L12 3Z" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>

<g id="SVGRepo_iconCarrier"> <path d="M12 3L21 10L16.0104 10L16 21L8 21L8 10L3 10L12 3Z" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>

</svg>
}