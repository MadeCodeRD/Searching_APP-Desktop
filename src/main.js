require('./db/connectDB');
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  dialog,
} = require('electron');
const path = require('path');
const { getWebResults } = require('./utils/webScrapper');
const historialSchema = require('./db/schema');

const ACTIONS = {
  showHideLoading: (window, cssProperty) =>
    window.webContents.send('showHideLoading', cssProperty),
  showWebResult: (window, cssProperty, isError, webResult = null) =>
    window.webContents.send('showWebResult', cssProperty, isError, webResult),
  provokeRender: (window,idDeleted) => window.webContents.send('provokeRender',idDeleted), 
  showDbWebResult: (window, results) =>  window.webContents.send('getDbInfo', JSON.stringify(results))
};


let history;
let mainWindow;

const createMainWindow = () => {
  //HISTORY

  history = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preloads/historialPreloader.js'),
    },
  });

  history.webContents.on('did-finish-load', async function () {
    const results = await getDbWebResult();
    ACTIONS.showDbWebResult(history, results);
  });

  ipcMain.on('dialog:deleteSearch', async (event, value) => {
    const result = await handleDelete(value);
    if(result){
      ACTIONS.provokeRender(history,value);
    }

  });

  history.on('close', (e)=> {
   e.preventDefault();  
   history.hide();   
  })


  //history.setMenu(null);
  history.loadFile(path.join(__dirname, 'views/historial.html'));
  history.once('ready-to-show', () => history.show());


  //MAIN SCREEN
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preloads/indexPreload.js'),
    },
  });

  mainWindow.on('close', (e)=> {
      app.quit();
   })

  ipcMain.on('get-searchInfo', async (event, { infoSearch, domainSearch }) => {
    ACTIONS.showHideLoading(mainWindow, 'block');

    const results = await getWebResults(infoSearch, domainSearch);
    ACTIONS.showHideLoading(mainWindow, 'none');

    const isWebResultEmpty = results['search'].some(
      (searchResult) => !searchResult
    );

    if (isWebResultEmpty) {
      ACTIONS.showWebResult(mainWindow, 'block', true);
      return;
    }

    for (const result of results.search) {
      if (result.success) {
        openUrl(result.url);
      }
    }

    ACTIONS.showWebResult(mainWindow, 'block', false, results);
    

    //save to DB (should be another function TBH) add validation as well to db failing stuff!!
    const searchResults = new historialSchema(results);
    await searchResults.save();

    //showing db results in history
    const dbResults = await getDbWebResult();
    ACTIONS.showDbWebResult(history, dbResults);

    console.log('COMPLETED!');
  });

  mainWindow.loadFile(path.join(__dirname, 'views/index.html'));
};


const menuItems = [
  {
    label: 'Salir',
    click: () => app.quit(),
    accelerator: 'Ctrl+Q',
  },
  {
    label: 'Historial',
    click: () => {
      if (history) {
        if (history.isVisible()) {
          history.hide();
        } else {
          history.show();
        }
      }
    },
  },
];

if (process.env.NODE_ENV !== 'production') {
  menuItems.push({
    label: 'DevTools',
    submenu: [
      {
        label: 'Show/Hide Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: 'reload',
      },
    ],
  });
}

const menu = Menu.buildFromTemplate(menuItems);
Menu.setApplicationMenu(menu);


app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const openUrl = async (url) => {
  await shell.openExternal(url);
};

const getDbWebResult = async () => {
  const results = await historialSchema.find({});
  return results;
};

const deleteWebResult = async (searchId) => {
  const result = await historialSchema.deleteOne({ _id: searchId });
  return result;
};

async function handleDelete(value) {
  const options = {
    type: 'question',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    title: 'Delete Search',
    message: 'Do you want to do this?',
    detail: 'This will delete the search',
  };

  const result = await dialog.showMessageBox(options);

  if (options.buttons[result.response] === 'Cancel') {
    return;
  } else {
    const result = await deleteWebResult(value);
    return result;
  }
}
