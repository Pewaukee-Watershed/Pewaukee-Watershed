const core = require('@actions/core')
const glob = require('@actions/glob')

console.log('Finding Files')
console.time('find');
(async () => {
  
})()
  .then(() => {
    console.timeEnd('find')
  })
  .catch(e => {
    core.setFailed(e)
  })
