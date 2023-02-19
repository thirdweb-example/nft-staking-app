import { useState, useEffect } from "react"

import FaIcon from "./FaIcon"

export default function InputImage(options) {
  const {
    data,
    setData,
    placeholder
  } = {
    data: null,
    setData: () => {},
    ...options
  }
  
  const [ image, setImage ] = useState(null)
  const [ imageData, setImageData ] = useState(null)
  const [ imageDataBuffer, setImageDataBuffer ] = useState(data)
  
  
  useEffect(() => {
    let fileReader, isCancel = false
    let fileReaderBuffer, isCancelBuffer = false

    if (image) {
      fileReader = new FileReader()
      fileReader.onload = (e) => {
        const { result } = e.target
        if (result && !isCancel) {
          setImageData(result)
        }
      }
      fileReader.readAsDataURL(image)
      
      fileReaderBuffer = new FileReader()
      fileReaderBuffer.onload = (e) => {
        const { result } = e.target
        if (result && !isCancelBuffer) {
          setImageDataBuffer(result)
          setData(result)
        }
      }
      fileReaderBuffer.readAsArrayBuffer(image)
    }
    
    return () => {
      isCancel = true
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort()
      }
      isCancelBuffer = true
      if (fileReaderBuffer && fileReaderBuffer.readyState === 1) {
        fileReaderBuffer.abort()
      }
    }

  }, [image])

  return (
    <>
      <style jsx>
      {`
        .inputImage {
          position: relative;
          display: flex;
          width: 100%;
          height: 32px;
        }
        .inputImage>INPUT {
          width: 100%;
          padding: 0px;
          margin: 0px;
          opacity: 0;
          cursor: pointer;
        }
        .inputImage>A {
          display: inline-block;
          width: 32px;
          height: 32px;
          line-height: 28px;
          vertical-align: baseline;
          text-align: center;
          margin-left: 5px;
          padding: 2px;
          border: 1px solid #FFF;
          cursor: pointer;
          color: #FFF;
        }
        .inputImage>A:hover {
          background: #1762bf;
        }
        .inputImage>A>DIV {
          display: none;
          position: absolute;
          bottom: 100%;
          right: 0px;
          max-width: 310px;
          max-height: 315px;
          padding: 5px;
          background: #000;
          border: 2px solid #FFF;
        }
        .inputImage>A>DIV IMG {
          display: block;
          max-width: 300px;
          max-height: 300px;
        }
        .inputImage>A:hover>DIV {
          display: block;
        }
        
        .inputImage>SPAN {
          display: block;
          position: absolute;
          left: 0px;
          top: 0px;
          right: 0px;
          bottom: 0px;
          text-align: center;
          font-size: 10pt;
          font-weight: bold;
          background: none;
          pointer-events: none;
          line-height: 28px;
          border: 1px solid #FFF;
        }
        .inputImage.hasImage>SPAN {
          right: 30px;
        }
        .inputImage>INPUT:hover+SPAN {
          background: #1762bf;
        }
      `}
      </style>
      <div className={imageData ? `inputImage hasImage` : `inputImage`}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => { setImage(e.target.files[0]) }}
        />
        <span>
          {image
            ? `Selected file ${image.name}`
            : (placeholder || `Cleck here for select media`)
          }
        </span>
        {imageData && (
          <a href={imageData} target="_blank" title="Open in new Tab">
            <span><FaIcon icon="image" /></span>
            <div>
              <img src={imageData} />
            </div>
          </a>
        )}
      </div>
    </>
  )
}