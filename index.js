const core = require('@actions/core')
const glob = require('@actions/glob')
const fs = require('fs')

console.log('Finding Files')
console.time('find');
(async () => {
  const globber = await glob.create('**/*.md\n!**/node_modules')
  const files = await globber.glob()
  
  await Promise.all(files.map(async file => {
    const text = await fs.readFile(file, 'utf8')
    console.log(text)
  }))
})()
  .then(() => {
    console.timeEnd('find')
  })
  .catch(e => {
    core.setFailed(e)
  })
