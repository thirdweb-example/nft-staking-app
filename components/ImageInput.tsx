import { useState } from "react"
import FaIcon from "./FaIcon"


export default function ImageInput(options) {
  const {
    value,
    onChange
  } = options
  
  const [ newValue, setNewValue ] = useState(value)
  
  const updateValue = (value) => {
    setNewValue(value)
    onChange(value)
  }
  return (
    <>
      <style jsx>
      {`
        .imageInput {
          display: flex;
          position: relative;
          width: 100%;
          align-items: center;
        }
        .imageInput INPUT {
          width: 100%;
        }
        .imageInput A {
          display: inline-block;
          width: 24px;
          height: 24px;
          line-height: 20px;
          vertical-align: baseline;
          text-align: center;
          margin-left: 5px;
          padding: 2px;
          border: 1px solid #FFF;
          cursor: pointer;
          color: #FFF;
        }
        .imageInput A:hover {
          background: #1762bf;
        }
        .imageInput DIV {
          display: none;
          position: absolute;
          bottom: 0px;
          left: 0px;
          max-width: 310px;
          max-height: 315px;
          padding: 5px;
          background: #000;
          border: 2px solid #FFF;
        }
        .imageInput DIV IMG {
          display: block;
          max-width: 300px;
          max-height: 300px;
        }
        .imageInput A:hover+DIV {
          display: block;
        }
      `}
      </style>
      <div className="imageInput">
        <input type="text" value={newValue} onChange={(e) => { updateValue(e.target.value) }} />
        <a href={newValue} target="_blank" title="Open in new tab">
          <FaIcon icon="image" />
        </a>
        <div>
          <img src={newValue} />
        </div>
      </div>
    </>
  )
}