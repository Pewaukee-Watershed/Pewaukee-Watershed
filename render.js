
const { default: App } = await import(window.location.pathname
  .split('?')[1]
  .split('&')
  .map(p => p.split('='))
  .find(([p]) => p === 'component')[1]
)
const app = React.createElement(App)
const appDiv = document.getElementById('app')
ReactDOM.render(app, appDiv)
