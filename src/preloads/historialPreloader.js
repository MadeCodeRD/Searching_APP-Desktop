const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dbSearchInfo', {
    searchInfo: (dbValues) => ipcRenderer.on('getDbInfo', dbValues),
    deleteSearch: (searchId) => ipcRenderer.send('dialog:deleteSearch',searchId),
    provokeRender: (idDeleted) => ipcRenderer.on('provokeRender', idDeleted),
})


