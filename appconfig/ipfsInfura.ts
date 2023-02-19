import { Buffer } from 'buffer'
import getConfig from 'next/config'
// @ts-ignore

global.Buffer = Buffer

import { base64encode } from 'nodejs-base64'

const {
  publicRuntimeConfig,
  publicRuntimeConfig: {
    INFURA_PROJECT_ID,
    INFURA_SECRET_KEY
  },
} = getConfig()


export const INFURA_AUTHORIZATION = "Basic " + base64encode(INFURA_PROJECT_ID + ":" + INFURA_SECRET_KEY)
export const INFURA_API_ENDPOINT = "https://ipfs.infura.io:5001/api/v0"
