import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"

import InputImage from "./InputImage"


export default function AdminNftMetadataGenerator(options) {
  const {
    metadata,
    setMetadata,
  } = {
    metadata: {
      imageData: null,
      name: '',
      desc: '',
    },
    setMetadata: () => {},
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
  }, [ imageData, name, desc ])

  return (  
    <>
      <div className={styles.subFormInfo}>
        <div className={styles.infoRow}>
          <label>Media (JPG, PNG, GIV, SVG):</label>
          <div>
            <div>
              <InputImage data={imageData} setData={setImageData} />
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