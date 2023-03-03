const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const fsExtra = require('fs-extra')

const root_folder = './out'
const out_folder = './wordpress'

console.log('>>> Prepare Wordpress build')
fsExtra.emptyDir('./wordpressbuild').then(() => {
  fsExtra.copy('./out/', './wordpressbuild/vendor').then(() => {
    console.log('>>> WordPress front vendor updated')
  })
})
