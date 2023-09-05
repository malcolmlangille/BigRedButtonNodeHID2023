const { app, Tray, Menu, BrowserWindow } = require('electron');
const path = require('path');
const exec = require('child_process').exec;

console.log("__dirname is: ", __dirname);  // Log the directory name

let tray = null;

app.whenReady()
  .then(() => {
    console.log("App is ready.");

    // Initialize system tray
    const iconPath = path.join(__dirname, 'icon.png');
    console.log("Icon path is: ", iconPath);  // Log the icon path
    
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Run Test', click: runBigRedButtonTest },
      { type: 'separator' },
      { label: 'Exit', click: () => { app.quit(); } },
    ]);

    tray.setToolTip('Big Red Button Test');
    tray.setContextMenu(contextMenu);

    // Hide from taskbar (macOS specific)
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
    
    console.log("System tray should be visible now.");
  })
  .catch((error) => {
    console.error("Failed to initialize app: ", error);
  });

function runBigRedButtonTest() {
  console.log("Run Test clicked.");
  // Code to run BigRedButtonTest.js (you might need to adjust the path)
  exec(`node ${path.join(__dirname, 'BigRedButtonTest.js')}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing BigRedButtonTest: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create a window when clicking on the dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
