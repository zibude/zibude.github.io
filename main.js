const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); 

let mainWindow; 
const INDEX_HTML_PATH = 'index.html'; 
const INITIAL_URL = 'https://ncsa.illinois.edu/'; 
let LAST_URL_FILE; 

app.setName('NCSA Mosaic byChromium'); 

const customPath = path.join(app.getAppPath(), 'app_data');
app.setPath('userData', customPath);


LAST_URL_FILE = path.join(app.getPath('userData'), 'lastUrl.json');


function loadLastUrl() {
    try {
        
        if (fs.existsSync(LAST_URL_FILE)) {
            const data = fs.readFileSync(LAST_URL_FILE, 'utf8');
            const config = JSON.parse(data);
            return config.lastUrl || INITIAL_URL; 
        }
    } catch (e) {
        console.error("Failed to load last URL:", e);
    }
    return INITIAL_URL;
}


function createWindow(urlToLoad = null) {

    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 600,
        minHeight: 400,
    
        autoHideMenuBar: true, 
       
        
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webviewTag: true,
            nodeIntegrationInSubFrames: true, 
            allowRunningInsecureContent: true 
        }
    });


    win.setMenuBarVisibility(false); 

    const initialUrl = urlToLoad || loadLastUrl(); 

    win.loadFile(INDEX_HTML_PATH).then(() => {
        if (initialUrl) {
            win.webContents.send('load-url', initialUrl);
        }
        
        const uriPath = ICON_BASE_PATH.replace(/\\/g, '/');
        win.webContents.send('set-icon-path', uriPath); 
    });
    

    if (!mainWindow) {
        mainWindow = win;
    }

    return win;
}



app.whenReady().then(() => {
  
    console.log('UserData Path:', app.getPath('userData')); 

    createWindow();


    ipcMain.on('open-new-window', (event, url) => {
        createWindow(url);
    });
    
    ipcMain.on('destroy-window', (event, url) => {
   
        try {
            fs.writeFileSync(LAST_URL_FILE, JSON.stringify({ lastUrl: url }), 'utf8');
        } catch (e) {
            console.error("[main.js] Failed to save URL:", e);
        }
        
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        if (win) {
            win.close();
        }
    });
    
    ipcMain.on('show-find-in-page', (event) => {
      
    });

 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});