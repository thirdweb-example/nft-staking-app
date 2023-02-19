import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"

import InputImage from "./InputImage"


export default function AdminNftMetadataGenerator(options) {
  const {
    metadata,
    setMetadata,
    compact,
    setIsValid
  } = {
    metadata: {
      imageData: null,
      name: '',
      desc: '',
    },
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

  if (compact) {
    return (
      <div className="admin-nft-metadata-compact">
        <style jsx>
        {`
          .admin-nft-metadata-compact INPUT[type="text"],
          .admin-nft-metadata-compact TEXTAREA {
            width: 100%;
          }
        `}
        </style>
        <div>
          <InputImage data={imageData} setData={setImageData} placeholder={`Select NFT Media file`} />
        </div>
        <div>
          <input type="text" value={name} placeholder={`NFT Name`} onChange={(e) => { setName(e.target.value) }} />
        </div>
        <div>
          <textarea placeholder={`NFT description`} value={desc} onChange={(e) => { setDesc(e.target.value) }}></textarea>
        </div>
      </div>
    )
  }
  return (  
    <>
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
    </>
  )
}