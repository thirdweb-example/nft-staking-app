const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const fsExtra = require('fs-extra')
const archiver = require('archiver')

const root_folder = './out'
const out_folder = './wordpress'

const WP_FILES = [
  'nft-staking-app.php',
  'App/',
  'inc/',
  'templates/'
]
console.log('>>> Prepare Wordpress build')
fsExtra.emptyDir('./wordpressbuild').then(() => {
  fsExtra.copy('./out/', './wordpressbuild/vendor').then(() => {
    console.log('>>> WordPress front vendor updated')
    Promise.all(WP_FILES.map((path) => {
      return new Promise((resolve) => {
        fsExtra.copy(`./${path}`, `./wordpressbuild/${path}`).then(() => {
          console.log(`>>> Copied ${path}`)
          resolve(true)
        })
      })
    })).then(() => {
      console.log('>>> WordPress updated')
      console.log('>>> Make zip')
      const output = fsExtra.createWriteStream('nft-staking-app.zip')
      const archive = archiver('zip')

      output.on('close', function () {
          console.log(archive.pointer() + ' total bytes')
          console.log('WP Plugin zipped.')
      });

      archive.on('error', function(err){
          throw err
      });

      archive.pipe(output)
      archive.directory('./wordpressbuild', 'nft-staking-app')

      archive.finalize()
    })
  })
})
