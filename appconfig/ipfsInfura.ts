import { Buffer } from 'buffer'
import { ENV } from "../.env.ts"
// @ts-ignore

global.Buffer = Buffer

import { base64encode } from 'nodejs-base64'

const INFURA_PROJECT_ID = ENV.INFURA_PROJECT_ID
const INFURA_SECRET_KEY = ENV.INFURA_SECRET_KEY

export const INFURA_AUTHORIZATION = "Basic " + base64encode(INFURA_PROJECT_ID + ":" + INFURA_SECRET_KEY)
export const INFURA_API_ENDPOINT = "https://ipfs.infura.io:5001/api/v0"
