import core from '@actions/core'
import glob from '@actions/glob'
import github from '@actions/github'
import babel from '@babel/core'
import React from 'react'
import ReactDOM from 'react-dom/server.js'
import fs from 'fs/promises'
import path from 'path'

console.log('Finding Files')
console.time('transform');
(async () => {
  const createBlob = async text => await octokit.git.createBlob({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    content: text,
    encoding: 'utf-8'
  })
  
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  
  const reactPreset = babel.createConfigItem('@babel/preset-react', { type: 'preset' })
  
  const globber = await glob.create('**/*.jsx\n!**/node_modules')
  const files = await globber.glob()
  
  const renderFile = `
const { default: App } = await import(window.location.pathname
  .split('?')[1]
  .split('&')
  .map(p => p.split('='))
  .find(([p]) => p === 'component')[1]
)
const app = React.createElement(App)
const appDiv = document.getElementById('app')
ReactDOM.render(app, appDiv)
`
  const renderBlob = await createBlob(renderFile)
  
  const blobs = await Promise.all(files.map(async file => {
    const text = await fs.readFile(file, 'utf8')
    const { code } = await babel.transformAsync(text, {
      presets: [reactPreset]
    })
    const jsBlob = await createBlob(`const React = window.react\n${code}`)
    const jsFile = file.replace('.jsx', '.js')
    const jsPath = path.relative(process.cwd(), jsFile)
    await fs.writeFile(jsFile, `import React from 'react'\n${code}`)
    const { default: App } = await import(jsFile)
    const app = React.createElement(App)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <script type="module" src="/render.js?component=${jsPath}"></script>
</head>
<body>
  <div id="app">
    ${ReactDOM.renderToString(app)}
  </div>
</body>
</html>
`
    const htmlBlob = await createBlob(html)
    const htmlFile = file.replace('.jsx', '.html')
    return {
      js: {
        file: jsPath,
        sha: jsBlob.data.sha
      },
      html: {
        file: path.relative(process.cwd(), htmlFile),
        sha: htmlBlob.data.sha
      }
    }
  }))
  const tree = await octokit.git.createTree({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    tree: [{
      path: 'render.js',
      sha: renderBlob.data.sha,
      mode: '100644'
    }].concat(...blobs.map(({ js, html }) => [js, html].map(({ file, sha }) => ({
      path: file,
      sha: sha,
      mode: '100644'
    })))),
    base_tree: github.context.payload.head_commit.tree_id
  })
  const commit = await octokit.git.createCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      message: 'Compile JSX to JS and HTML',
      tree: tree.data.sha,
      parents: [github.context.payload.head_commit.id],
      author: {
          name: 'Compiler Actions',
          email: 'compiler-actions[bot]'
      }
  })
  await octokit.git.updateRef({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: github.context.ref.slice(5),
      sha: commit.data.sha
  })
})()
  .then(() => {
    console.timeEnd('transform')
  })
  .catch(e => {
    core.setFailed(e.stack)
  })
