const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  carregar: () => ipcRenderer.invoke('dados:carregar'),
  salvar: (dados) => ipcRenderer.invoke('dados:salvar', dados),
  pastaDados: () => ipcRenderer.invoke('dados:pasta'),
  impressoras: () => ipcRenderer.invoke('impressoras'),
  imprimir: (opc) => ipcRenderer.invoke('imprimir', opc),
  pdf: (opc) => ipcRenderer.invoke('pdf', opc),
  salvarArquivo: (opc) => ipcRenderer.invoke('arquivo:salvar', opc),
  abrirArquivo: (opc) => ipcRenderer.invoke('arquivo:abrir', opc),
});
