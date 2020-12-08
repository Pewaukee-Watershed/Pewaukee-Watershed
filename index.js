const core = require('@actions/core')
const glob = require('@actions/glob')
const github = require('@actions/github')
const babel = require('@babel/core')
const fs = require('fs').promises

console.log('Finding Files')
console.time('transform');
(async () => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  
  const reactPreset = babel.createConfigItem('@babel/preset-react', { type: 'preset' })
  
  const globber = await glob.create('**/*.jsx\n!**/node_modules')
  const files = await globber.glob()
  
  await Promise.all(files.map(async file => {
    const text = await fs.readFile(file, 'utf8')
    console.log(file) 
    console.log(text)
    const { code } = await babel.transformAsync(text, {
      presets: [reactPreset]
    })
    console.log(code)
    const blob = await octokit.git.createBlob({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      content: content,
      encoding: 'utf-8'
    })
    console.log(blobl.data)
  }))
})()
  .then(() => {
    console.timeEnd('transform')
  })
  .catch(e => {
    core.setFailed(e)
  })
