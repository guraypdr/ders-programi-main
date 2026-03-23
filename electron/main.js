const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    autoHideMenuBar: true,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setMenu(null)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

ipcMain.handle('save-schedule', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Ders Programını Kaydet',
    filters: [{ name: 'JSON Dosyası', extensions: ['json'] }],
    defaultPath: 'ders-programi.json'
  })
  if (!result.canceled) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2))
    return { success: true }
  }
  return { success: false }
})

ipcMain.handle('load-schedule', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Ders Programını Aç',
    filters: [{ name: 'JSON Dosyası', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (!result.canceled) {
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'))
    return { success: true, data }
  }
  return { success: false }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
