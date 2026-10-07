const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// No .exe portátil os dados ficam ao lado do executável (fácil de copiar/backup).
const PASTA_DADOS = process.env.PORTABLE_EXECUTABLE_DIR
  ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'PulseirasDados')
  : path.join(app.getPath('userData'), 'dados');
const ARQ_DADOS = path.join(PASTA_DADOS, 'dados.json');

let win;

function criarJanela() {
  win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    title: 'Pulseiras',
    backgroundColor: '#f3f5f8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'index.html'));
  if (process.env.PULSEIRAS_DEVTOOLS) win.webContents.openDevTools();
}

ipcMain.handle('dados:carregar', () => {
  try {
    if (fs.existsSync(ARQ_DADOS)) return JSON.parse(fs.readFileSync(ARQ_DADOS, 'utf8'));
  } catch (e) {
    // Arquivo corrompido: tenta a cópia anterior.
    const bak = ARQ_DADOS + '.bak';
    if (fs.existsSync(bak)) return JSON.parse(fs.readFileSync(bak, 'utf8'));
  }
  return null;
});

ipcMain.handle('dados:salvar', (_e, dados) => {
  fs.mkdirSync(PASTA_DADOS, { recursive: true });
  const tmp = ARQ_DADOS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(dados));
  if (fs.existsSync(ARQ_DADOS)) fs.copyFileSync(ARQ_DADOS, ARQ_DADOS + '.bak');
  fs.renameSync(tmp, ARQ_DADOS);
  return true;
});

ipcMain.handle('dados:pasta', () => PASTA_DADOS);

ipcMain.handle('impressoras', async () => {
  const lista = await win.webContents.getPrintersAsync();
  return lista.map((p) => ({ nome: p.name, padrao: !!p.isDefault }));
});

// Carrega o HTML das pulseiras numa janela invisível (via arquivo temporário,
// pois imagens em base64 deixam a URL grande demais).
async function janelaDeImpressao(html) {
  const tmp = path.join(os.tmpdir(), `pulseiras-${Date.now()}.html`);
  fs.writeFileSync(tmp, html, 'utf8');
  const w = new BrowserWindow({ show: false, webPreferences: { offscreen: false } });
  await w.loadFile(tmp);
  // Espera imagens/fontes.
  await w.webContents.executeJavaScript(
    'Promise.all([document.fonts.ready, ...[...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))]).then(() => true)'
  );
  return { w, tmp };
}

// O Chromium recusa páginas muito estreitas; abaixo disso a pulseira fica
// alinhada à esquerda numa página de 24 mm.
const LARGURA_MIN = 24;
const larguraPagina = (mm) => Math.max(mm, LARGURA_MIN);

ipcMain.handle('imprimir', async (_e, opc) => {
  const { w, tmp } = await janelaDeImpressao(opc.html);
  try {
    return await new Promise((resolve) => {
      w.webContents.print(
        {
          silent: !opc.dialogo,
          printBackground: true,
          deviceName: opc.impressora || undefined,
          copies: 1,
          margins: { marginType: 'none' },
          // Tamanho da página em mícrons: a pulseira sai na vertical (largura x comprimento).
          // Ou, se configurado, o papel definido no driver da impressora.
          ...(opc.papelDoDriver ? {} : { pageSize: { width: Math.round(larguraPagina(opc.larguraMm) * 1000), height: Math.round(opc.comprimentoMm * 1000) } }),
        },
        (ok, motivo) => resolve({ ok, motivo })
      );
    });
  } finally {
    setTimeout(() => { w.destroy(); fs.rmSync(tmp, { force: true }); }, 2000);
  }
});

ipcMain.handle('pdf', async (_e, opc) => {
  const r = await dialog.showSaveDialog(win, {
    title: 'Salvar PDF',
    defaultPath: (opc.nome || 'pulseiras') + '.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (r.canceled) return { ok: false };
  const { w, tmp } = await janelaDeImpressao(opc.html);
  try {
    const buf = await w.webContents.printToPDF({
      printBackground: true,
      margins: { marginType: 'none' },
      pageSize: { width: larguraPagina(opc.larguraMm) / 25.4, height: opc.comprimentoMm / 25.4 },
    });
    fs.writeFileSync(r.filePath, buf);
    return { ok: true, arquivo: r.filePath };
  } finally {
    w.destroy();
    fs.rmSync(tmp, { force: true });
  }
});

ipcMain.handle('arquivo:salvar', async (_e, { nome, conteudo, filtro }) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: nome,
    filters: [filtro || { name: 'JSON', extensions: ['json'] }],
  });
  if (r.canceled) return null;
  fs.writeFileSync(r.filePath, conteudo, 'utf8');
  return r.filePath;
});

ipcMain.handle('arquivo:abrir', async (_e, { filtro }) => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [filtro || { name: 'JSON', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return fs.readFileSync(r.filePaths[0], 'utf8');
});

app.whenReady().then(criarJanela);
app.on('window-all-closed', () => app.quit());
