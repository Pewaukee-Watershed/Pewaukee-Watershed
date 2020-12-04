const core = require('@actions/core')
const glob = require('@actions/glob')

console.log('Finding Files')
(async () => {
  
})()
  .then(() => {
    console.timeEnd('find')
  })
  .catch(e => {
    core.setFailed(e)
  })
