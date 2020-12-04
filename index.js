const core = require('@actions/core')
const glob = require('@actions/glob')

console.log('Finding Files')
console.time('find');
(async () => {
  const globber = await glob.create('**/*.md')
  const files = await globber.glob()
  
  console.log(files)
  console.log(__dirname)
})()
  .then(() => {
    console.timeEnd('find')
  })
  .catch(e => {
    core.setFailed(e)
  })
