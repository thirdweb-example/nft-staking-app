const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')
const fsExtra = require('fs-extra')

const root_folder = './out'
const _extenstions = ['*.html','*.js','*.css']

console.log('Prepare engine')
fsExtra.move(root_folder + '/_next/', root_folder + '/engine/', err => {
  if(err) return console.error(err);
  console.log('Make engine success!');

  console.log('>>> Fix paths')
  _extenstions.forEach((ext) => {
    glob(root_folder + '/**/' + ext, (err, files) => {
      if (err) {
        console.log('Error', err)
      } else {
        files.forEach((file) => {
          const content = readFileSync(file, 'utf8');

          let newContent = content.replaceAll('/_MYAPP', '.');
          newContent = newContent.replaceAll('/_next/','/engine/');

          console.log(file);
          writeFileSync(file, newContent);
        })
      }
    })
  })
})


