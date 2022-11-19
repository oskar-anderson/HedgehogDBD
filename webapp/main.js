const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, ipcMain } = electron;

process.env.NODE_ENV = 'development';
console.log('hello from main.js');

let mainWindow;

app.on('ready', function() {
    // Create new main window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        width: 1080, 
        height: 910,
    }
    );
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "pages", "draw.html"),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', function() {
        app.quit();
    });
})