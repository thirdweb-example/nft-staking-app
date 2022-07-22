const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')

const root_folder = './out'
const _extenstions = ['*.html','*.js','*.css']

_extenstions.forEach((ext) => {
  glob(root_folder + '/**/' + ext, (err, files) => {
    if (err) {
      console.log('Error', err)
    } else {
      files.forEach((file) => {
        const content = readFileSync(file, 'utf8');

        let newContent = content.replaceAll('/NFTFARMBUILDURL', '.');

        console.log(file);
        writeFileSync(file, newContent);
      })
    }
  })
})
