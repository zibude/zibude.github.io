const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('browserAPI', {
 
    openNewWindow: (url) => {
        ipcRenderer.send('open-new-window', url);
    },
    
 
    destroyWindow: (url) => {
        ipcRenderer.send('destroy-window', url);
    },

    showFindInPage: () => {
        ipcRenderer.send('show-find-in-page');
    },

    onLoadUrl: (callback) => {
        ipcRenderer.on('load-url', (event, url) => callback(url));
    }
});