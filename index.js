const core = require('@actions/core')
const glob = require('@actions/glob')
const github = require('@actions/github')
const fs = require('fs').promises

console.log(process.env)

console.log('Finding Files')
console.time('find');
(async () => {
  const globber = await glob.create('**/*.jsc\n!**/node_modules')
  const files = await globber.glob()
  
  await Promise.all(files.map(async file => {
    const text = await fs.readFile(file, 'utf8')
    console.log(file, text)
  }))
})()
  .then(() => {
    console.timeEnd('find')
  })
  .catch(e => {
    core.setFailed(e)
  })
