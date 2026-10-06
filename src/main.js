const { app, crashReporter, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const electronMajor = Number.parseInt(process.versions.electron)

function createWindow ()
{
  const mainWindow = new BrowserWindow
  (
    {
      webPreferences:
      {
        preload: path.join(__dirname, 'preload.js')
      }
    }
  )

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() =>
{
  createWindow()

  app.on('activate', function ()
  {
    if (BrowserWindow.getAllWindows().length === 0)           createWindow()
  })
})

app.on('window-all-closed', function ()
{
  if (process.platform !== 'darwin') app.quit()
})

function testDone (success, ...logs)
{
  console.log(`test ${success ? 'passed' : 'failed'}`)
  logs.forEach((i) => console.log(i))
  process.exit(success ? 0 : 1)
}

{
  if (electronMajor >= 10) {
    crashReporter.start({ uploadToServer: false, submitURL: '' })
  }

  ipcMain.on('test-done', (_, success, ...logs) => testDone(success, ...logs))
  const failIfBadExit = (details) => {
    if (details.reason !== 'clean-exit') testDone(false, new Error('trace'), details)
  }
  app.on('child-process-gone', (_ev, details) => failIfBadExit(details))
  app.on('render-process-gone', (_ev, _, details) => failIfBadExit(details))
}
