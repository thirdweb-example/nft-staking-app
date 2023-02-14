const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID
const INFURA_SECRET_KEY = process.env.INFURA_SECRET_KEY
const INFURA_AUTHORIZATION = "Basic " + base64encode(projectId + ":" + projectSecretKey)

export default {
  INFURA_AUTHORIZATION
}