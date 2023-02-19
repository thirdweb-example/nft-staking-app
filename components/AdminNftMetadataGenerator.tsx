import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"

import InputImage from "./InputImage"
import FaIcon from "./FaIcon"

export default function AdminNftMetadataGenerator(options) {
  const {
    metadata,
    setMetadata,
    compact,
    setIsValid,
    isUploading,
    isUploaded
  } = {
    metadata: {
      imageData: null,
      name: '',
      desc: '',
    },
    isUploading: false,
    isUploaded: false,
    compact: false,
    setMetadata: () => {},
    setIsValid: () => {},
    ...options
  }
  
  const [ imageData, setImageData ] = useState(metadata?.imageData || null)
  const [ name, setName ] = useState(metadata?.name || ``)
  const [ desc, setDesc ] = useState(metadata?.desc || ``)

  const [ isDeployed, setIsDeployed ] = useState(false)
  
  const [ imageIPFS, setImageIPFS ] = useState(false)
  const [ metadataIPFS, setMetadataIPFS ] = useState(false)
  
  useEffect(() => {
    console.log('>>> setMetadata')
    setMetadata({
      imageData,
      name,
      desc,
    })
    setIsValid((imageData !== null && name && name !== ``))
  }, [ imageData, name, desc ])


  return (  
    <div className={`adminNftMetadata ${(compact) ? 'compact' : ''}`}>
      <style jsx>
      {`
        .adminNftMetadata {
          position: relative;
        }
        .adminNftMetadata.compact {
        }
        .adminNftMetadata.compact INPUT[type="text"],
        .adminNftMetadata.compact TEXTAREA {
          width: 100%;
          display: block;
          height: 100%;
        }
        .adminNftMetadata DIV.uploadProcess {
          position: absolute;
          left: 0px;
          top: 0px;
          bottom: 0px;
          right: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000b0;
        }
        .adminNftMetadata DIV.uploadProcess>SPAN {
          display: block;
          padding: 10px;
          background: #056299;
          box-shadow: 0 0 5px 5px black;
        }
        .adminNftMetadata DIV.uploadProcess>SPAN>SPAN {
          margin-left: 10px;
          color: #1ebd1e;
        }
        .adminNftMetadata.compact>DIV {
          padding-left: 10px;
        }
        .adminNftMetadata DIV.hasError {
          background: #a31515;
        }
        .adminNftMetadata DIV.isOk {
          background: green;
        }
      `}
      </style>
      {compact ? (
        <>
          <div className={(imageData !== null) ? 'isOk' : 'hasError'}>
            <InputImage data={imageData} setData={setImageData} placeholder={`Select NFT Media file`} />
          </div>
          <div className={(name && name !== ``) ? 'isOk' : 'hasError'}>
            <input type="text" value={name} placeholder={`NFT Name`} onChange={(e) => { setName(e.target.value) }} />
          </div>
          <div className="isOk">
            <textarea placeholder={`NFT description`} value={desc} onChange={(e) => { setDesc(e.target.value) }}></textarea>
          </div>
        </>
      ) : (
        <div className={styles.subFormInfo}>
          <div className={styles.infoRow}>
            <label>Media (JPG, PNG, GIV, SVG):</label>
            <div>
              <div>
                <InputImage data={imageData} setData={setImageData} placeholder={`Select NFT Media file`} />
              </div>
            </div>
          </div>
          <div className={styles.infoRow}>
            <label>NFT Name:</label>
            <div>
              <div>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />
              </div>
            </div>
          </div>
          <div className={styles.infoRow}>
            <label>Description:</label>
            <div>
              <div>
                <textarea value={desc} onChange={(e) => { setDesc(e.target.value) }}></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
      {(isUploading || isUploaded) && (
        <div className="uploadProcess">
          {isUploading && !isUploaded && (<span>Uploading to IPFS...</span>)}
          {isUploaded && (
            <span>
              Uploaded to IPFS
              <span>
                <FaIcon icon="circle-check" />
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}