const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('searchInfo', {
    getSearchInfo: ({infoSearch,domainSearch}) => ipcRenderer.send('get-searchInfo', {infoSearch,domainSearch}),
    hideShowLoading: (cssProperty) => ipcRenderer.on('showHideLoading', cssProperty),
    showWebResult: (cssProperty, isError, webResult) => ipcRenderer.on('showWebResult', cssProperty, isError, webResult),
    showHistoryWindow: () => ipcRenderer.send('showHistoryWindow'),
})

