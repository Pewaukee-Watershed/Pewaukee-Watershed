import core from '@actions/core'
import glob from '@actions/glob'
import github from '@actions/github'
import babel from '@babel/core'
import React from 'react'
import ReactDOM from 'react-dom'
import fs from 'fs/promises'
import path from 'path'

console.log('Finding Files')
console.time('transform');
(async () => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  
  const reactPreset = babel.createConfigItem('@babel/preset-react', { type: 'preset' })
  
  const globber = await glob.create('**/*.jsx\n!**/node_modules')
  const files = await globber.glob()
  
  const blobs = await Promise.all(files.map(async file => {
    const text = await fs.readFile(file, 'utf8')
    const { code } = await babel.transformAsync(text, {
      presets: [reactPreset]
    })
    const blob = await octokit.git.createBlob({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      content: code,
      encoding: 'utf-8'
    })
    await fs.writeFile(file, code)
    const { default: App } = await import(file)
    console.log(App)
    console.log(React.createElement(App))
    console.log(ReactDOM.renderToString(React.createElement(App)))
    return {
      file: path.relative(process.cwd(), file),
      sha: blob.data.sha
    }
  }))
  console.log(blobs)
})()
  .then(() => {
    console.timeEnd('transform')
  })
  .catch(e => {
    core.setFailed(e)
  })
