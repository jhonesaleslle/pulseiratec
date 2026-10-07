// ===================== Dados =====================

const TAMANHOS = [
  { nome: 'Adulto hospitalar — 25 × 279 mm (1" × 11")', largura: 25.4, comprimento: 279.4, zonaInicio: 22, zonaFim: 70 },
  { nome: 'Adulto largo — 30 × 279 mm (1,19" × 11")', largura: 30.2, comprimento: 279.4, zonaInicio: 22, zonaFim: 70 },
  { nome: 'Pediátrica — 25 × 178 mm (1" × 7")', largura: 25.4, comprimento: 177.8, zonaInicio: 18, zonaFim: 45 },
  { nome: 'Infantil / Neonatal — 19 × 152 mm (0,75" × 6")', largura: 19, comprimento: 152.4, zonaInicio: 15, zonaFim: 40 },
  { nome: 'Evento térmica / Tyvek — 25 × 254 mm (1" × 10")', largura: 25.4, comprimento: 254, zonaInicio: 20, zonaFim: 60 },
  { nome: 'Evento larga — 30 × 254 mm', largura: 30, comprimento: 254, zonaInicio: 20, zonaFim: 60 },
];

const FONTES = ['Arial', 'Arial Black', 'Arial Narrow', 'Segoe UI', 'Calibri', 'Tahoma', 'Verdana', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Courier New', 'Consolas', 'Impact'];
const CORES = ['#000000', '#ffffff', '#c62828', '#e65100', '#f9a825', '#2e7d32', '#1565c0', '#6a1b9a', '#ad1457', '#5d4037', '#757575'];

const EXEMPLO = {
  nome: 'MARIA APARECIDA DA SILVA SANTOS', nascimento: '1985-03-14', sexo: 'F', prontuario: '123456',
  atendimento: '987654', mae: 'JOANA DA SILVA', convenio: 'SUS', medico: 'Dr. Carlos Lima', setor: 'Clínica Médica',
  leito: '12A', sangue: 'O+', risco: 'QUEDA', alergias: 'DIPIRONA, PENICILINA', categoria: 'VIP', documento: '123.456.789-00',
  extra1: '', extra2: '', obs: '',
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function txt(x, y, w, h, texto, extra = {}) {
  return { id: uid(), tipo: 'texto', x, y, w, h, texto, fonte: 'Arial', tamanho: 9, cor: '#000000', fundo: '', alinhar: 'left', vertical: 'middle', ajustar: true, ...extra };
}

function modelosPadrao() {
  return [
    {
      ...TAMANHOS[0], id: uid(), nome: 'Paciente adulto', rotacao: 90, fundo: '#ffffff', mono: false,
      elementos: [
        { id: uid(), tipo: 'imagem', fonte: 'logo', x: 24, y: 2, w: 22, h: 21.4, ajuste: 'contain' },
        txt(48, 1.2, 104, 7.5, '{nome}', { tamanho: 14, negrito: true, maiusculas: true }),
        txt(48, 9, 104, 5, 'Nasc.: {nascimento} ({idade})   Sexo: {sexo}   {sangue}', { tamanho: 8.5 }),
        txt(48, 14.2, 104, 5, 'Pront.: {prontuario}   Atend.: {atendimento}   Leito: {leito}', { tamanho: 8.5, negrito: true }),
        txt(48, 19.4, 104, 4.6, 'Mãe: {mae}', { tamanho: 7.5 }),
        { id: uid(), tipo: 'barcode', valor: '{prontuario}', formato: 'CODE128', mostrarTexto: true, x: 154, y: 2.5, w: 30, h: 20.4 },
        txt(186, 1.5, 22, 22.4, 'ALERGIA\n{alergias}', { tamanho: 7, negrito: true, cor: '#ffffff', fundo: '#000000', alinhar: 'center', quebrar: true, raio: 1.5 }),
      ],
    },
    {
      ...TAMANHOS[4], id: uid(), nome: 'Evento', rotacao: 90, fundo: '#ffffff', mono: false,
      elementos: [
        { id: uid(), tipo: 'imagem', fonte: 'logo', x: 21, y: 2, w: 22, h: 21.4, ajuste: 'contain' },
        { id: uid(), tipo: 'retangulo', x: 46, y: 2, w: 36, h: 21.4, fundo: '#000000', raio: 2, borda: 0 },
        txt(47, 2, 34, 21.4, '{categoria}', { tamanho: 16, negrito: true, cor: '#ffffff', alinhar: 'center', maiusculas: true }),
        txt(85, 2, 82, 12, '{nome}', { tamanho: 13, negrito: true, quebrar: true }),
        txt(85, 15, 82, 8, '{instituicao} · {data_hoje}', { tamanho: 8, cor: '#333333' }),
        { id: uid(), tipo: 'qrcode', valor: '{documento}', x: 170, y: 2, w: 21.4, h: 21.4 },
      ],
    },
    {
      ...TAMANHOS[3], id: uid(), nome: 'Neonatal (RN)', rotacao: 90, fundo: '#ffffff', mono: false,
      elementos: [
        txt(16, 0.8, 80, 6, 'RN de {mae}', { tamanho: 10, negrito: true, maiusculas: true }),
        txt(16, 7, 80, 5, 'Nasc.: {nascimento}   Sexo: {sexo}', { tamanho: 8 }),
        txt(16, 12.2, 80, 5.5, 'Pront.: {prontuario}  {setor}', { tamanho: 8, negrito: true }),
        { id: uid(), tipo: 'qrcode', valor: '{prontuario}', x: 98, y: 1.5, w: 16, h: 16 },
      ],
    },
  ];
}

let db = null;
let timerSalvar = null;

function salvarDb() {
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(() => window.api.salvar(db).catch((e) => toast('Erro ao salvar: ' + e.message, true)), 300);
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg, erro) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast vis' + (erro ? ' erro' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => (t.className = 'toast' + (erro ? ' erro' : '')), 3200);
}

function rotuloCampo(k) {
  if (k === 'extra1' || k === 'extra2') return db.config.rotulos?.[k] || CAMPOS.find((c) => c.k === k).r;
  return (CAMPOS.find((c) => c.k === k) || CAMPOS_AUTO.find((c) => c.k === k))?.r || k;
}

function modeloPorId(id) { return db.modelos.find((m) => m.id === id) || db.modelos[0]; }

// Lê uma imagem escolhida pelo usuário e devolve dataURL reduzida.
function escolherImagem(maxLado = 800) {
  return new Promise((resolve) => {
    const inp = $('#arquivo-img');
    inp.value = '';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return resolve(null);
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, maxLado / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL(f.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9));
        };
        img.onerror = () => resolve(null);
        img.src = r.result;
      };
      r.readAsDataURL(f);
    };
    inp.click();
  });
}

// Desenha a pulseira dentro de um container, escalada para caber na largura.
function desenharPrevia(cont, modelo, reg, { vertical = false, maxLarg, maxAlt } = {}) {
  const L = modelo.comprimento * MM_PX, W = modelo.largura * MM_PX;
  const banda = bandaHTML(modelo, reg, db.config, null);
  const larg = maxLarg || cont.clientWidth - 28;
  if (!vertical) {
    const z = Math.min(3, larg / L);
    cont.innerHTML = `<div class="escala-wrap" style="width:${L * z}px;height:${W * z}px"><div class="sombra" style="transform:scale(${z});transform-origin:0 0;width:${L}px">${banda}</div></div>`;
  } else {
    // Mostra a pulseira em pé, mas "deitada" na tela para não ficar enorme: várias lado a lado não cabem,
    // então desenhamos uma só, com a altura limitada.
    const z = Math.min(1.2, (maxAlt || 360) / L);
    cont.innerHTML = `<div style="display:flex;gap:16px;align-items:flex-start">
      <div class="escala-wrap sombra" style="width:${W * z}px;height:${L * z}px;background:#fff;flex:none">
        <div style="transform:scale(${z});transform-origin:0 0;width:${W}px;height:${L}px;position:relative">
          <div style="position:absolute;left:0;top:0;transform-origin:0 0;transform:${transformVertical(modelo)}">${banda}</div>
        </div>
      </div>
      <div class="dica" style="max-width:320px">
        Página enviada ao driver: <b>${fmt(modelo.largura)} × ${fmt(modelo.comprimento)} mm</b> (largura × comprimento).<br><br>
        Se na impressão o texto sair de cabeça para baixo, troque a <b>direção de impressão</b> do modelo (90° / 270°).
      </div></div>`;
  }
  ajustarTextos(cont);
}

const fmt = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');

// ===================== Impressão =====================

async function imprimir(modelo, registros, copias, pdf) {
  if (!registros.length) return toast('Nada para imprimir.', true);
  const html = documentoImpressao(modelo, registros, db.config, copias);
  const opc = { html, larguraMm: modelo.largura, comprimentoMm: modelo.comprimento };
  try {
    if (pdf) {
      const r = await window.api.pdf({ ...opc, nome: registros.length === 1 ? (registros[0].nome || 'pulseira') : 'pulseiras' });
      if (r.ok) toast('PDF salvo.');
      return;
    }
    const r = await window.api.imprimir({ ...opc, impressora: db.config.impressora, dialogo: db.config.dialogo, papelDoDriver: db.config.papelDoDriver });
    const total = registros.length * (copias || 1);
    if (r.ok) toast(`${total} pulseira${total > 1 ? 's' : ''} enviada${total > 1 ? 's' : ''} para impressão.`);
    else if (r.motivo !== 'cancelled') toast('Falha na impressão: ' + (r.motivo || 'erro desconhecido'), true);
  } catch (e) {
    toast('Falha na impressão: ' + e.message, true);
  }
}

// ===================== Abas =====================

function mostrarAba(nome) {
  $$('nav button').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === nome));
  $$('.aba').forEach((a) => a.classList.toggle('ativa', a.id === 'aba-' + nome));
  if (nome === 'imprimir') Imp.atualizarTudo();
  if (nome === 'cadastro') Cad.render();
  if (nome === 'modelos') Ed.render();
  if (nome === 'config') Cfg.render();
}

function opcoesModelos(sel, atual) {
  sel.innerHTML = db.modelos.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join('');
  if (atual && db.modelos.some((m) => m.id === atual)) sel.value = atual;
}

// ===================== Aba Imprimir =====================

const Imp = {
  reg: {},
  idCadastro: null,

  init() {
    $('#imp-modelo').onchange = () => { db.config.ultimoModelo = $('#imp-modelo').value; salvarDb(); this.previa(); };
    $('#imp-busca').oninput = () => this.sugerir();
    $('#imp-limpar').onclick = () => { this.reg = {}; this.idCadastro = null; this.campos(); this.previa(); };
    $('#imp-salvar-cad').onclick = () => this.salvarNoCadastro();
    $('#imp-imprimir').onclick = () => imprimir(this.modelo(), [this.reg], +$('#imp-copias').value || 1);
    $('#imp-pdf').onclick = () => imprimir(this.modelo(), [this.reg], +$('#imp-copias').value || 1, true);
    window.addEventListener('resize', () => { if ($('#aba-imprimir').classList.contains('ativa')) this.previa(); });
  },

  modelo() { return modeloPorId($('#imp-modelo').value); },

  // Mostra só os campos que o modelo usa (os demais ficam escondidos).
  camposUsados(modelo) {
    const usados = new Set();
    for (const el of modelo.elementos) {
      const t = (el.texto || '') + ' ' + (el.valor || '');
      for (const m of t.matchAll(/\{(\w+)\}/g)) usados.add(m[1]);
      if (el.tipo === 'imagem' && el.fonte === 'foto') usados.add('foto');
    }
    if (usados.has('idade')) usados.add('nascimento');
    return usados;
  },

  atualizarTudo() {
    opcoesModelos($('#imp-modelo'), $('#imp-modelo').value || db.config.ultimoModelo);
    const imp = db.config.impressora;
    $('#imp-impressora').textContent = imp ? 'Impressora: ' + imp : 'Impressora: padrão do Windows (defina em Configurações)';
    this.campos();
    this.previa();
  },

  campos() {
    const usados = this.camposUsados(this.modelo());
    const cont = $('#imp-campos');
    cont.innerHTML = '';
    for (const c of CAMPOS) {
      if (!usados.has(c.k)) continue;
      cont.appendChild(inputCampo(c, this.reg[c.k], (v) => { this.reg[c.k] = v; this.previa(); }));
    }
    if (usados.has('foto')) {
      const b = document.createElement('button');
      b.className = 'sec';
      b.textContent = this.reg.foto ? 'Trocar foto' : 'Escolher foto…';
      b.onclick = async () => { const f = await escolherImagem(500); if (f) { this.reg.foto = f; this.campos(); this.previa(); } };
      cont.appendChild(b);
    }
    if (!cont.children.length) cont.innerHTML = '<p class="dica">Este modelo não usa campos do cadastro.</p>';
  },

  previa() {
    const m = this.modelo();
    if (!m) return;
    $('#imp-tamanho').textContent = `${fmt(m.largura)} × ${fmt(m.comprimento)} mm`;
    desenharPrevia($('#imp-previa'), m, this.reg);
    desenharPrevia($('#imp-previa-v'), m, this.reg, { vertical: true, maxAlt: 380 });
  },

  sugerir() {
    const q = norm($('#imp-busca').value);
    const box = $('#imp-sugestoes');
    if (!q) { box.innerHTML = ''; return; }
    const achados = db.pacientes.filter((p) => norm([p.nome, p.prontuario, p.documento, p.atendimento].join(' ')).includes(q)).slice(0, 8);
    box.innerHTML = '';
    for (const p of achados) {
      const b = document.createElement('button');
      b.innerHTML = `${esc(p.nome || '(sem nome)')}<br><small>${esc([dataBR(p.nascimento), p.prontuario, p.setor].filter(Boolean).join(' · '))}</small>`;
      b.onclick = () => this.carregar(p);
      box.appendChild(b);
    }
    if (!achados.length) box.innerHTML = '<p class="dica" style="margin:4px 0">Nenhum cadastro encontrado.</p>';
  },

  carregar(p) {
    this.reg = { ...p };
    this.idCadastro = p.id;
    $('#imp-busca').value = '';
    $('#imp-sugestoes').innerHTML = '';
    this.campos();
    this.previa();
  },

  salvarNoCadastro() {
    if (!this.reg.nome) return toast('Preencha ao menos o nome.', true);
    const existente = this.idCadastro && db.pacientes.find((p) => p.id === this.idCadastro);
    if (existente) Object.assign(existente, this.reg, { id: existente.id });
    else { const novo = { ...this.reg, id: uid(), criado: Date.now() }; db.pacientes.push(novo); this.idCadastro = novo.id; }
    salvarDb();
    toast('Cadastro salvo.');
  },
};

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function inputCampo(c, valor, aoMudar) {
  const l = document.createElement('label');
  if (c.largo) l.className = 'largo';
  l.textContent = rotuloCampo(c.k);
  let inp;
  if (c.opcoes) {
    inp = document.createElement('select');
    inp.innerHTML = c.opcoes.map((o) => `<option>${esc(o)}</option>`).join('');
    if (valor && !c.opcoes.includes(valor)) inp.insertAdjacentHTML('beforeend', `<option>${esc(valor)}</option>`);
  } else if (c.k === 'obs' || c.k === 'alergias') {
    inp = document.createElement('textarea');
    inp.rows = 2;
  } else {
    inp = document.createElement('input');
    inp.type = c.tipo || 'text';
  }
  inp.value = valor || '';
  inp.dataset.campo = c.k;
  inp.oninput = inp.onchange = () => aoMudar(inp.value);
  l.appendChild(inp);
  return l;
}

// ===================== Aba Cadastro =====================

const Cad = {
  sel: new Set(),
  editando: null,
  fotoTmp: null,

  init() {
    $('#cad-novo').onclick = () => this.abrir(null);
    $('#cad-busca').oninput = () => this.render();
    $('#cad-todos').onchange = (e) => {
      this.filtrados().forEach((p) => (e.target.checked ? this.sel.add(p.id) : this.sel.delete(p.id)));
      this.render();
    };
    $('#cad-imprimir-sel').onclick = () => {
      const regs = db.pacientes.filter((p) => this.sel.has(p.id));
      if (!regs.length) return toast('Marque os cadastros que deseja imprimir.', true);
      imprimir(modeloPorId($('#cad-modelo').value), regs, +$('#cad-copias').value || 1);
    };
    $('#cad-modelo').onchange = () => { db.config.ultimoModelo = $('#cad-modelo').value; salvarDb(); };
    $('#cad-importar').onclick = () => this.importarCSV();
    $('#cad-exportar').onclick = () => this.exportarCSV();
    $('#modal-cancelar').onclick = () => this.fechar();
    $('#modal-salvar').onclick = () => this.salvar(false);
    $('#modal-salvar-imprimir').onclick = () => this.salvar(true);
    $('#modal-foto-escolher').onclick = async () => { const f = await escolherImagem(500); if (f) { this.fotoTmp = f; this.mostrarFoto(); } };
    $('#modal-foto-remover').onclick = () => { this.fotoTmp = null; this.mostrarFoto(); };
    $('#modal').addEventListener('keydown', (e) => { if (e.key === 'Escape') this.fechar(); });
  },

  filtrados() {
    const q = norm($('#cad-busca').value);
    const lista = [...db.pacientes].sort((a, b) => (b.criado || 0) - (a.criado || 0));
    return q ? lista.filter((p) => norm(Object.values(p).filter((v) => typeof v === 'string' && !v.startsWith('data:')).join(' ')).includes(q)) : lista;
  },

  render() {
    opcoesModelos($('#cad-modelo'), $('#cad-modelo').value || db.config.ultimoModelo);
    const lista = this.filtrados();
    const tb = $('#cad-tabela tbody');
    tb.innerHTML = lista.map((p) => `<tr data-id="${p.id}">
      <td><input type="checkbox" ${this.sel.has(p.id) ? 'checked' : ''}></td>
      <td>${p.foto ? `<img class="mini-foto" src="${p.foto}">` : '<span class="mini-foto"></span>'}</td>
      <td><b>${esc(p.nome)}</b></td>
      <td>${esc(dataBR(p.nascimento))} <span class="dica">${esc(idade(p.nascimento))}</span></td>
      <td>${esc(p.prontuario)}</td>
      <td>${esc([p.setor, p.leito].filter(Boolean).join(' / '))}</td>
      <td>${esc(p.categoria)}</td>
      <td><div class="acoes"><button data-a="imp">🖨 Imprimir</button><button data-a="ed">Editar</button><button data-a="del" class="perigo">Excluir</button></div></td>
    </tr>`).join('');
    $('#cad-vazio').style.display = db.pacientes.length ? 'none' : 'block';
    $('#cad-contagem').textContent = `${db.pacientes.length} cadastro(s) · ${this.sel.size} selecionado(s)`;
    $$('tr[data-id]', tb).forEach((tr) => {
      const p = db.pacientes.find((x) => x.id === tr.dataset.id);
      tr.querySelector('input').onchange = (e) => { e.target.checked ? this.sel.add(p.id) : this.sel.delete(p.id); this.render(); };
      tr.querySelector('[data-a=ed]').onclick = () => this.abrir(p);
      tr.querySelector('[data-a=imp]').onclick = () => { mostrarAba('imprimir'); Imp.carregar(p); };
      tr.querySelector('[data-a=del]').onclick = () => {
        if (!confirm(`Excluir o cadastro de "${p.nome}"?`)) return;
        db.pacientes = db.pacientes.filter((x) => x.id !== p.id);
        this.sel.delete(p.id);
        salvarDb();
        this.render();
      };
      tr.ondblclick = (e) => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') this.abrir(p); };
    });
  },

  abrir(p) {
    this.editando = p;
    this.fotoTmp = p?.foto || null;
    $('#modal-titulo').textContent = p ? 'Editar cadastro' : 'Novo cadastro';
    const cont = $('#modal-campos');
    cont.innerHTML = '';
    for (const c of CAMPOS) cont.appendChild(inputCampo(c, p?.[c.k], () => {}));
    this.mostrarFoto();
    $('#modal').classList.remove('oculto');
    setTimeout(() => cont.querySelector('input')?.focus(), 50);
  },

  mostrarFoto() {
    $('#modal-foto').innerHTML = this.fotoTmp ? `<img src="${this.fotoTmp}">` : 'sem foto';
  },

  fechar() { $('#modal').classList.add('oculto'); },

  salvar(eImprimir) {
    const dados = {};
    $$('#modal-campos [data-campo]').forEach((i) => (dados[i.dataset.campo] = i.value.trim()));
    if (!dados.nome) return toast('O nome é obrigatório.', true);
    dados.foto = this.fotoTmp || undefined;
    let p = this.editando;
    if (p) Object.assign(p, dados);
    else { p = { id: uid(), criado: Date.now(), ...dados }; db.pacientes.push(p); }
    salvarDb();
    this.fechar();
    this.render();
    toast('Cadastro salvo.');
    if (eImprimir) { mostrarAba('imprimir'); Imp.carregar(p); }
  },

  async importarCSV() {
    const txt = await window.api.abrirArquivo({ filtro: { name: 'Planilha CSV', extensions: ['csv', 'txt'] } });
    if (!txt) return;
    const linhas = parseCSV(txt.replace(/^﻿/, ''));
    if (linhas.length < 2) return toast('Arquivo vazio ou sem cabeçalho.', true);
    const apelidos = {
      nome: ['nome', 'nome completo', 'paciente', 'participante'], nascimento: ['nascimento', 'data de nascimento', 'data nascimento', 'dt nasc', 'nasc'],
      sexo: ['sexo', 'genero'], prontuario: ['prontuario', 'numero', 'nº', 'n', 'codigo', 'id'], atendimento: ['atendimento'],
      mae: ['mae', 'nome da mae'], convenio: ['convenio', 'plano'], medico: ['medico', 'medico responsavel'], setor: ['setor', 'unidade'],
      leito: ['leito', 'quarto'], sangue: ['sangue', 'tipo sanguineo'], risco: ['risco'], alergias: ['alergias', 'alergia'],
      categoria: ['categoria', 'tipo', 'ingresso', 'setor evento'], documento: ['documento', 'cpf', 'rg'], extra1: ['extra1', 'extra 1'],
      extra2: ['extra2', 'extra 2'], obs: ['obs', 'observacoes', 'observacao'],
    };
    const cab = linhas[0].map(norm);
    const mapa = cab.map((h) => Object.keys(apelidos).find((k) => apelidos[k].includes(h)) || null);
    if (!mapa.includes('nome')) return toast('A planilha precisa de uma coluna "nome".', true);
    let n = 0;
    for (const l of linhas.slice(1)) {
      const p = { id: uid(), criado: Date.now() + n };
      mapa.forEach((k, i) => { if (k && l[i] != null) p[k] = l[i].trim(); });
      if (!p.nome) continue;
      const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(p.nascimento || '');
      if (m) p.nascimento = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      db.pacientes.push(p);
      n++;
    }
    salvarDb();
    this.render();
    toast(`${n} cadastro(s) importado(s).`);
  },

  async exportarCSV() {
    const ks = CAMPOS.map((c) => c.k);
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const linhas = [ks.map((k) => q(rotuloCampo(k))).join(';')];
    for (const p of db.pacientes) linhas.push(ks.map((k) => q(k === 'nascimento' ? dataBR(p[k]) : p[k])).join(';'));
    const r = await window.api.salvarArquivo({ nome: 'cadastros.csv', conteudo: '﻿' + linhas.join('\r\n'), filtro: { name: 'CSV', extensions: ['csv'] } });
    if (r) toast('Planilha exportada.');
  },
};

function parseCSV(txt) {
  const sep = (txt.split('\n')[0].match(/;/g) || []).length >= (txt.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const linhas = [];
  let l = [], c = '', aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (aspas) {
      if (ch === '"' && txt[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') aspas = false; else c += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) { l.push(c); c = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && txt[i + 1] === '\n') i++;
      l.push(c); c = '';
      if (l.some((x) => x.trim())) linhas.push(l);
      l = [];
    } else c += ch;
  }
  l.push(c);
  if (l.some((x) => x.trim())) linhas.push(l);
  return linhas;
}

// ===================== Aba Modelos (editor) =====================

const Ed = {
  modeloId: null,
  sel: null,
  zoom: null,

  m() { return modeloPorId(this.modeloId); },
  el() { return this.m()?.elementos.find((e) => e.id === this.sel); },

  init() {
    $('#mod-novo').onclick = () => this.novo();
    $('#mod-duplicar').onclick = () => {
      const c = JSON.parse(JSON.stringify(this.m()));
      c.id = uid(); c.nome += ' (cópia)';
      c.elementos.forEach((e) => (e.id = uid()));
      db.modelos.push(c); this.modeloId = c.id; this.sel = null; salvarDb(); this.render();
    };
    $('#mod-excluir').onclick = () => {
      if (db.modelos.length <= 1) return toast('É preciso ter pelo menos um modelo.', true);
      if (!confirm(`Excluir o modelo "${this.m().nome}"?`)) return;
      db.modelos = db.modelos.filter((m) => m.id !== this.modeloId);
      this.modeloId = db.modelos[0].id; this.sel = null; salvarDb(); this.render();
    };
    $('#mod-exportar').onclick = async () => {
      const r = await window.api.salvarArquivo({ nome: `modelo-${this.m().nome}.pulseira.json`, conteudo: JSON.stringify({ tipo: 'modelo-pulseira', modelo: this.m() }, null, 1) });
      if (r) toast('Modelo exportado.');
    };
    $('#mod-importar').onclick = async () => {
      const t = await window.api.abrirArquivo({});
      if (!t) return;
      try {
        const o = JSON.parse(t);
        const m = o.modelo || o;
        if (!Array.isArray(m.elementos)) throw new Error('arquivo não é um modelo');
        m.id = uid();
        db.modelos.push(m); this.modeloId = m.id; this.sel = null; salvarDb(); this.render();
        toast('Modelo importado.');
      } catch (e) { toast('Não foi possível importar: ' + e.message, true); }
    };
    $$('[data-add]').forEach((b) => (b.onclick = () => this.adicionar(b.dataset.add)));
    $('#ed-zoom-mais').onclick = () => { this.zoom = (this.zoom || 1) * 1.25; this.canvas(); };
    $('#ed-zoom-menos').onclick = () => { this.zoom = (this.zoom || 1) / 1.25; this.canvas(); };
    $('#ed-zoom-ajustar').onclick = () => { this.zoom = null; this.canvas(); };
    window.addEventListener('resize', () => { if ($('#aba-modelos').classList.contains('ativa')) this.canvas(); });
    document.addEventListener('keydown', (e) => this.teclas(e));
    $('#ed-palco').addEventListener('mousedown', (e) => {
      if (e.target.id === 'ed-palco' || e.target.id === 'ed-escala') { this.sel = null; this.canvas(); this.props(); }
    });
  },

  novo() {
    const t = TAMANHOS[0];
    const m = { ...t, id: uid(), nome: 'Novo modelo', rotacao: 90, fundo: '#ffffff', mono: false, elementos: [] };
    db.modelos.push(m); this.modeloId = m.id; this.sel = null; salvarDb(); this.render();
    toast('Modelo criado. Escolha o tamanho no painel à direita.');
  },

  render() {
    if (!db.modelos.some((m) => m.id === this.modeloId)) this.modeloId = db.modelos[0]?.id;
    const ul = $('#mod-lista');
    ul.innerHTML = db.modelos.map((m) => `<li data-id="${m.id}" class="${m.id === this.modeloId ? 'ativo' : ''}">${esc(m.nome)}<small>${fmt(m.largura)} × ${fmt(m.comprimento)} mm</small></li>`).join('');
    $$('li', ul).forEach((li) => (li.onclick = () => { this.modeloId = li.dataset.id; this.sel = null; this.zoom = null; this.render(); }));
    this.canvas();
    this.props();
  },

  mudou(redesenharProps) {
    salvarDb();
    this.canvas();
    if (redesenharProps) this.props();
  },

  canvas() {
    const m = this.m();
    if (!m) return;
    const palco = $('#ed-palco');
    const ajuste = (palco.clientWidth - 64) / (m.comprimento * MM_PX);
    const z = this.zoom || Math.max(0.5, ajuste);
    $('#ed-zoom').textContent = Math.round(z * 100) + '%';
    const esc_ = $('#ed-escala');
    esc_.style.transform = `scale(${z})`;
    esc_.style.width = m.comprimento * MM_PX + 'px';
    esc_.parentElement.style.height = '';
    esc_.innerHTML = bandaHTML(m, EXEMPLO, db.config, { sel: this.sel });
    // Reserva o espaço do conteúdo escalado.
    esc_.style.marginBottom = (m.largura * MM_PX * (z - 1)) + 'px';
    esc_.style.marginRight = (m.comprimento * MM_PX * (z - 1)) + 'px';
    ajustarTextos(esc_);
    this.z = z;
    $$('.el', esc_).forEach((d) => d.addEventListener('mousedown', (e) => this.arrastar(e, d)));
    desenharPrevia($('#ed-previa-v'), m, EXEMPLO, { vertical: true, maxAlt: 300 });
  },

  arrastar(e, div) {
    e.preventDefault();
    e.stopPropagation();
    const el = this.m().elementos.find((x) => x.id === div.dataset.id);
    if (this.sel !== el.id) { this.sel = el.id; this.canvas(); this.props(); }
    const redim = e.target.classList.contains('alca');
    const x0 = e.clientX, y0 = e.clientY;
    const ini = { x: el.x, y: el.y, w: el.w, h: el.h };
    const k = 1 / (MM_PX * this.z);
    const snap = (v) => Math.round(v * 2) / 2;
    const alvo = $(`#ed-escala [data-id="${el.id}"]`);
    let moveu = false;
    const mov = (ev) => {
      const dx = (ev.clientX - x0) * k, dy = (ev.clientY - y0) * k;
      if (Math.abs(dx) + Math.abs(dy) > 0.3) moveu = true;
      if (redim) {
        el.w = Math.max(1, snap(ini.w + dx));
        el.h = Math.max(ev.shiftKey ? 0.5 : 1, snap(ini.h + dy));
        if (el.tipo === 'qrcode' || (ev.shiftKey && el.tipo !== 'linha')) el.h = el.w = Math.max(el.w, el.h);
        alvo.style.width = el.w + 'mm'; alvo.style.height = el.h + 'mm';
      } else {
        el.x = snap(ini.x + dx); el.y = snap(ini.y + dy);
        alvo.style.left = el.x + 'mm'; alvo.style.top = el.y + 'mm';
      }
      this.atualizarCamposPos();
    };
    const fim = () => {
      window.removeEventListener('mousemove', mov);
      window.removeEventListener('mouseup', fim);
      if (moveu) this.mudou(false);
    };
    window.addEventListener('mousemove', mov);
    window.addEventListener('mouseup', fim);
  },

  atualizarCamposPos() {
    const el = this.el();
    if (!el) return;
    for (const p of ['x', 'y', 'w', 'h']) { const i = $(`#ed-props [data-p="${p}"]`); if (i) i.value = el[p]; }
  },

  teclas(e) {
    if (!$('#aba-modelos').classList.contains('ativa') || !this.sel) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const el = this.el();
    if (!el) return;
    const p = e.shiftKey ? 5 : 0.5;
    const mov = { ArrowLeft: ['x', -p], ArrowRight: ['x', p], ArrowUp: ['y', -p], ArrowDown: ['y', p] }[e.key];
    if (mov) { e.preventDefault(); el[mov[0]] = Math.round((el[mov[0]] + mov[1]) * 10) / 10; this.mudou(false); this.atualizarCamposPos(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); this.excluirEl(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); this.duplicarEl(); }
    else if (e.key === 'Escape') { this.sel = null; this.mudou(true); }
  },

  adicionar(tipo) {
    const m = this.m();
    const W = m.largura;
    const x = (m.zonaInicio || 0) + 4;
    const alt = Math.max(4, W - 4);
    let el;
    switch (tipo) {
      case 'texto': el = txt(x, 2, 60, 7, 'Texto', { tamanho: 11 }); break;
      case 'campo': el = txt(x, 2, 90, 8, '{nome}', { tamanho: 13, negrito: true }); break;
      case 'logo': el = { tipo: 'imagem', fonte: 'logo', x, y: 2, w: alt, h: alt, ajuste: 'contain' }; break;
      case 'foto': el = { tipo: 'imagem', fonte: 'foto', x, y: 2, w: alt * 0.8, h: alt, ajuste: 'cover', raio: 1 }; break;
      case 'imagem': {
        escolherImagem(900).then((src) => {
          if (!src) return;
          this.inserir({ tipo: 'imagem', fonte: 'arquivo', src, x, y: 2, w: alt, h: alt, ajuste: 'contain' });
        });
        return;
      }
      case 'retangulo': el = { tipo: 'retangulo', x, y: 2, w: 30, h: alt, fundo: '#000000', raio: 1.5, borda: 0, corBorda: '#000000' }; break;
      case 'elipse': el = { tipo: 'elipse', x, y: 2, w: alt, h: alt, fundo: '#000000', borda: 0, corBorda: '#000000' }; break;
      case 'linha': el = { tipo: 'linha', x, y: W / 2 - 1, w: 40, h: 2, espessura: 0.5, cor: '#000000' }; break;
      case 'barcode': el = { tipo: 'barcode', valor: '{prontuario}', formato: 'CODE128', mostrarTexto: true, x, y: 2, w: 34, h: alt }; break;
      case 'qrcode': el = { tipo: 'qrcode', valor: '{prontuario}', x, y: 2, w: alt, h: alt, cor: '#000000' }; break;
    }
    this.inserir(el);
  },

  inserir(el) {
    el.id = uid();
    this.m().elementos.push(el);
    this.sel = el.id;
    this.mudou(true);
  },

  excluirEl() {
    const m = this.m();
    m.elementos = m.elementos.filter((e) => e.id !== this.sel);
    this.sel = null;
    this.mudou(true);
  },

  duplicarEl() {
    const c = JSON.parse(JSON.stringify(this.el()));
    c.x += 3; c.y = Math.min(c.y + 1, this.m().largura - 1);
    this.inserir(c);
  },

  camada(dir) {
    const els = this.m().elementos;
    const i = els.findIndex((e) => e.id === this.sel);
    const [el] = els.splice(i, 1);
    if (dir === 'frente') els.push(el);
    else if (dir === 'tras') els.unshift(el);
    else els.splice(Math.max(0, Math.min(els.length, i + dir)), 0, el);
    this.mudou(false);
  },

  // ---------- Painel de propriedades ----------
  props() {
    const box = $('#ed-props');
    box.innerHTML = '';
    const el = this.el();
    if (!el) return this.propsModelo(box);
    const nomes = { texto: 'Texto', retangulo: 'Retângulo', elipse: 'Elipse', linha: 'Linha', imagem: { logo: 'Logomarca', foto: 'Foto da pessoa', arquivo: 'Imagem' }[el.fonte], barcode: 'Código de barras', qrcode: 'QR Code' };
    box.appendChild(h('h3', nomes[el.tipo]));
    const up = (redesenha) => () => this.mudou(redesenha);

    if (el.tipo === 'texto') {
      const ta = document.createElement('textarea');
      ta.value = el.texto; ta.rows = 3;
      ta.oninput = () => { el.texto = ta.value; this.mudou(false); };
      box.appendChild(rotulo('Texto (use campos entre { })', ta));
      const s = document.createElement('select');
      s.innerHTML = '<option value="">+ Inserir campo…</option>' + [...CAMPOS, ...CAMPOS_AUTO].map((c) => `<option value="${c.k}">${esc(rotuloCampo(c.k))}  {${c.k}}</option>`).join('');
      s.onchange = () => {
        if (!s.value) return;
        const pos = ta.selectionStart ?? ta.value.length;
        ta.value = ta.value.slice(0, pos) + `{${s.value}}` + ta.value.slice(ta.selectionEnd ?? pos);
        el.texto = ta.value; s.value = ''; this.mudou(false);
      };
      box.appendChild(s);
      box.appendChild(sub('Fonte'));
      box.appendChild(selectProp(el, 'fonte', FONTES.map((f) => [f, f]), up()));
      box.appendChild(grid(2, numProp(el, 'tamanho', 'Tamanho (pt)', 0.5, up()), selectProp(el, 'alinhar', [['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']], up(), 'Alinhamento')));
      box.appendChild(toggles(el, [['negrito', 'N'], ['italico', 'I'], ['sublinhado', 'S'], ['maiusculas', 'AA']], up(true)));
      box.appendChild(selectProp(el, 'vertical', [['top', 'Topo'], ['middle', 'Meio'], ['bottom', 'Base']], up(), 'Alinhamento vertical'));
      box.appendChild(checkProp(el, 'ajustar', 'Diminuir a fonte se não couber', up(), true));
      box.appendChild(checkProp(el, 'quebrar', 'Quebrar em várias linhas', up()));
      box.appendChild(sub('Cores'));
      box.appendChild(corProp(el, 'cor', 'Cor da letra', up(), false));
      box.appendChild(corProp(el, 'fundo', 'Fundo da caixa (sem / cor / preto)', up(), true));
      box.appendChild(grid(2, numProp(el, 'raio', 'Cantos (mm)', 0.5, up()), numProp(el, 'margem', 'Margem interna', 0.2, up(), 0.8)));
      box.appendChild(grid(2, numProp(el, 'borda', 'Borda (mm)', 0.1, up()), corSimples(el, 'corBorda', 'Cor da borda', up())));
    }
    if (el.tipo === 'retangulo' || el.tipo === 'elipse') {
      box.appendChild(corProp(el, 'fundo', 'Preenchimento (sem / cor / preto)', up(), true));
      box.appendChild(grid(2, numProp(el, 'borda', 'Borda (mm)', 0.1, up()), corSimples(el, 'corBorda', 'Cor da borda', up())));
      if (el.tipo === 'retangulo') box.appendChild(numProp(el, 'raio', 'Cantos arredondados (mm)', 0.5, up()));
    }
    if (el.tipo === 'linha') {
      box.appendChild(corProp(el, 'cor', 'Cor', up(), false));
      box.appendChild(numProp(el, 'espessura', 'Espessura (mm)', 0.1, up()));
    }
    if (el.tipo === 'imagem') {
      box.appendChild(selectProp(el, 'fonte', [['logo', 'Logomarca (Configurações)'], ['foto', 'Foto do cadastro'], ['arquivo', 'Imagem fixa deste modelo']], up(true), 'Origem da imagem'));
      if (el.fonte === 'arquivo') {
        const b = document.createElement('button'); b.className = 'sec'; b.textContent = 'Trocar imagem…';
        b.onclick = async () => { const s = await escolherImagem(900); if (s) { el.src = s; this.mudou(false); } };
        box.appendChild(b);
      }
      if (el.fonte === 'logo' && !db.config.logo) box.appendChild(h('p', 'Nenhuma logomarca cadastrada. Defina em Configurações.', 'dica'));
      box.appendChild(selectProp(el, 'ajuste', [['contain', 'Caber inteira'], ['cover', 'Preencher (corta)'], ['fill', 'Esticar']], up(), 'Ajuste'));
      box.appendChild(numProp(el, 'raio', 'Cantos arredondados (mm)', 0.5, up()));
      box.appendChild(checkProp(el, 'pb', 'Converter para preto e branco', up()));
    }
    if (el.tipo === 'barcode' || el.tipo === 'qrcode') {
      const i = document.createElement('input'); i.value = el.valor;
      i.oninput = () => { el.valor = i.value; this.mudou(false); };
      box.appendChild(rotulo('Conteúdo (texto fixo ou {campo})', i));
      const s = document.createElement('select');
      s.innerHTML = '<option value="">+ Usar campo…</option>' + CAMPOS.map((c) => `<option value="${c.k}">${esc(rotuloCampo(c.k))}</option>`).join('');
      s.onchange = () => { if (s.value) { el.valor = `{${s.value}}`; i.value = el.valor; s.value = ''; this.mudou(false); } };
      box.appendChild(s);
      if (el.tipo === 'barcode') {
        box.appendChild(selectProp(el, 'formato', [['CODE128', 'Code 128 (recomendado)'], ['CODE39', 'Code 39'], ['EAN13', 'EAN-13 (13 números)'], ['ITF', 'ITF (números)']], up(), 'Tipo'));
        box.appendChild(checkProp(el, 'mostrarTexto', 'Mostrar números abaixo', up(), true));
      }
      box.appendChild(corSimples(el, 'cor', 'Cor', up()));
    }

    box.appendChild(sub('Posição e tamanho (mm)'));
    box.appendChild(grid(2, numProp(el, 'x', 'X', 0.5, up()), numProp(el, 'y', 'Y', 0.5, up())));
    box.appendChild(grid(2, numProp(el, 'w', 'Largura', 0.5, up()), numProp(el, 'h', 'Altura', 0.5, up())));
    box.appendChild(grid(2, selectProp(el, 'rot', [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']], up(), 'Girar', true), numProp(el, 'opacidade', 'Opacidade %', 5, up(), 100)));
    const centro = document.createElement('button'); centro.className = 'sec'; centro.textContent = 'Centralizar na altura da pulseira';
    centro.onclick = () => { el.y = Math.round(((this.m().largura - el.h) / 2) * 10) / 10; this.mudou(true); };
    box.appendChild(centro);

    box.appendChild(sub('Camadas'));
    box.appendChild(linhaBotoes([['⤒ Frente', () => this.camada('frente')], ['↑', () => this.camada(1)], ['↓', () => this.camada(-1)], ['⤓ Trás', () => this.camada('tras')]]));
    box.appendChild(linhaBotoes([['Duplicar', () => this.duplicarEl()], ['Excluir', () => this.excluirEl(), 'perigo']]));
  },

  propsModelo(box) {
    const m = this.m();
    if (!m) return;
    const up = (r) => () => { this.mudou(r); $('#mod-lista li.ativo').innerHTML = `${esc(m.nome)}<small>${fmt(m.largura)} × ${fmt(m.comprimento)} mm</small>`; };
    box.appendChild(h('h3', 'Pulseira (modelo)'));
    box.appendChild(h('p', 'Clique num item da pulseira para editá-lo.', 'dica'));
    const nome = document.createElement('input'); nome.value = m.nome;
    nome.oninput = () => { m.nome = nome.value; up(false)(); };
    box.appendChild(rotulo('Nome do modelo', nome));
    box.appendChild(sub('Tamanho'));
    const s = document.createElement('select');
    s.innerHTML = '<option value="">Tamanhos padrão de mercado…</option>' + TAMANHOS.map((t, i) => `<option value="${i}">${esc(t.nome)}</option>`).join('');
    s.onchange = () => { if (s.value === '') return; const t = TAMANHOS[+s.value]; Object.assign(m, { largura: t.largura, comprimento: t.comprimento, zonaInicio: t.zonaInicio, zonaFim: t.zonaFim }); this.zoom = null; up(true)(); };
    box.appendChild(s);
    box.appendChild(grid(2, numProp(m, 'largura', 'Largura (mm)', 0.1, up(true)), numProp(m, 'comprimento', 'Comprimento (mm)', 1, up(true))));
    box.appendChild(grid(2, numProp(m, 'zonaInicio', 'Fecho no início (mm)', 1, up()), numProp(m, 'zonaFim', 'Ponta no fim (mm)', 1, up())));
    box.appendChild(h('p', 'As medidas de fecho/ponta são aproximadas: confira na caixa do rolo de pulseiras a área imprimível.', 'dica'));
    box.appendChild(sub('Impressão'));
    box.appendChild(selectProp(m, 'rotacao', [[90, 'Vertical — início da pulseira em cima (90°)'], [270, 'Vertical — início da pulseira embaixo (270°)']], up(), 'Direção (pulseira sai em pé)', true));
    box.appendChild(corProp(m, 'fundo', 'Cor de fundo da pulseira', up(), false));
    box.appendChild(checkProp(m, 'mono', 'Imprimir em preto e branco (impressora térmica)', up()));
    box.appendChild(h('p', 'Impressoras térmicas de pulseira imprimem só em preto: cores viram tons de cinza. Para pulseira colorida use rolo de cor diferente ou impressora colorida.', 'dica'));
    box.appendChild(sub('Itens desta pulseira'));
    const ul = document.createElement('div'); ul.className = 'col';
    m.elementos.slice().reverse().forEach((e) => {
      const b = document.createElement('button'); b.className = 'sec';
      b.style.textAlign = 'left';
      const desc = e.tipo === 'texto' ? e.texto.split('\n')[0].slice(0, 28) : e.tipo === 'imagem' ? e.fonte : (e.valor || e.tipo);
      b.textContent = `${{ texto: 'T', imagem: '🖼', retangulo: '▭', elipse: '◯', linha: '―', barcode: '|||', qrcode: '▦' }[e.tipo]}  ${desc}`;
      b.onclick = () => { this.sel = e.id; this.mudou(true); };
      ul.appendChild(b);
    });
    box.appendChild(ul);
  },
};

// ---------- pequenos construtores de formulário ----------
function h(tag, texto, cls) { const e = document.createElement(tag); e.textContent = texto; if (cls) e.className = cls; return e; }
function sub(t) { return h('div', t, 'sub'); }
function rotulo(t, inp) { const l = document.createElement('label'); l.append(t, inp); return l; }
function grid(n, ...filhos) { const d = document.createElement('div'); d.className = n === 3 ? 'grid3' : 'grid2'; d.append(...filhos); return d; }
function linhaBotoes(lista) {
  const d = document.createElement('div'); d.className = 'linha-botoes';
  for (const [t, f, cls] of lista) { const b = document.createElement('button'); b.textContent = t; b.className = cls || 'sec'; b.onclick = f; d.appendChild(b); }
  return d;
}
function numProp(o, p, t, passo, cb, padrao = 0) {
  const i = document.createElement('input'); i.type = 'number'; i.step = passo; i.value = o[p] ?? padrao; i.dataset.p = p;
  i.oninput = () => { if (i.value === '') return; o[p] = parseFloat(i.value); cb(); };
  return rotulo(t, i);
}
function selectProp(o, p, ops, cb, t, numero) {
  const s = document.createElement('select');
  s.innerHTML = ops.map(([v, r]) => `<option value="${v}">${esc(r)}</option>`).join('');
  s.value = o[p] ?? ops[0][0];
  s.onchange = () => { o[p] = numero ? +s.value : s.value; cb(); };
  return t ? rotulo(t, s) : s;
}
function checkProp(o, p, t, cb, padrao = false) {
  const l = document.createElement('label'); l.className = 'check';
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = o[p] ?? padrao;
  i.onchange = () => { o[p] = i.checked; cb(); };
  l.append(i, t); return l;
}
function toggles(o, lista, cb) {
  const d = document.createElement('div'); d.className = 'toggle';
  for (const [p, t] of lista) {
    const b = document.createElement('button'); b.textContent = t; b.className = o[p] ? 'on' : '';
    if (p === 'negrito') b.style.fontWeight = 800; if (p === 'italico') b.style.fontStyle = 'italic'; if (p === 'sublinhado') b.style.textDecoration = 'underline';
    b.title = { negrito: 'Negrito', italico: 'Itálico', sublinhado: 'Sublinhado', maiusculas: 'MAIÚSCULAS' }[p];
    b.onclick = () => { o[p] = !o[p]; cb(); };
    d.appendChild(b);
  }
  return d;
}
function corSimples(o, p, t, cb) {
  const i = document.createElement('input'); i.type = 'color'; i.value = o[p] || '#000000';
  i.oninput = () => { o[p] = i.value; cb(); };
  return rotulo(t, i);
}
// Cor com paleta rápida; "permiteNenhuma" mostra a opção sem fundo (transparente).
function corProp(o, p, t, cb, permiteNenhuma) {
  const wrap = document.createElement('div'); wrap.className = 'col';
  const l = h('label', t); wrap.appendChild(l);
  const linha = document.createElement('div'); linha.className = 'cor-linha';
  const i = document.createElement('input'); i.type = 'color'; i.value = o[p] || '#ffffff';
  i.oninput = () => { o[p] = i.value; cb(); };
  const pal = document.createElement('div'); pal.className = 'paleta';
  if (permiteNenhuma) {
    const n = document.createElement('span'); n.className = 'nenhuma'; n.title = 'Sem cor (transparente)';
    n.onclick = () => { o[p] = ''; cb(); }; pal.appendChild(n);
  }
  for (const c of CORES) {
    const s = document.createElement('span'); s.style.background = c; s.title = c === '#000000' ? 'Preto' : c;
    s.onclick = () => { o[p] = c; i.value = c; cb(); }; pal.appendChild(s);
  }
  linha.append(i, pal); wrap.appendChild(linha);
  return wrap;
}

// ===================== Configurações =====================

const Cfg = {
  init() {
    const c = () => db.config;
    $('#cfg-instituicao').oninput = (e) => { c().instituicao = e.target.value; salvarDb(); };
    $('#cfg-extra1').oninput = (e) => { c().rotulos.extra1 = e.target.value; salvarDb(); };
    $('#cfg-extra2').oninput = (e) => { c().rotulos.extra2 = e.target.value; salvarDb(); };
    $('#cfg-dialogo').onchange = (e) => { c().dialogo = e.target.checked; salvarDb(); };
    $('#cfg-papel-driver').onchange = (e) => { c().papelDoDriver = e.target.checked; salvarDb(); };
    $('#cfg-offx').oninput = (e) => { c().offX = parseFloat(e.target.value) || 0; salvarDb(); };
    $('#cfg-offy').oninput = (e) => { c().offY = parseFloat(e.target.value) || 0; salvarDb(); };
    $('#cfg-impressora').onchange = (e) => { c().impressora = e.target.value; salvarDb(); };
    $('#cfg-atualizar-imp').onclick = () => this.impressoras();
    $('#cfg-logo-escolher').onclick = async () => { const s = await escolherImagem(900); if (s) { c().logo = s; salvarDb(); this.render(); } };
    $('#cfg-logo-remover').onclick = () => { c().logo = null; salvarDb(); this.render(); };
    $('#cfg-backup').onclick = async () => {
      const r = await window.api.salvarArquivo({ nome: `backup-pulseiras-${new Date().toISOString().slice(0, 10)}.json`, conteudo: JSON.stringify(db) });
      if (r) toast('Backup salvo.');
    };
    $('#cfg-restaurar').onclick = async () => {
      const t = await window.api.abrirArquivo({});
      if (!t) return;
      try {
        const o = JSON.parse(t);
        if (!o.modelos || !o.pacientes) throw new Error('arquivo não é um backup');
        if (!confirm('Substituir TODOS os modelos e cadastros atuais pelo backup?')) return;
        db = normalizar(o); salvarDb(); this.render(); toast('Backup restaurado.');
      } catch (e) { toast('Não foi possível restaurar: ' + e.message, true); }
    };
  },

  async render() {
    const c = db.config;
    $('#cfg-instituicao').value = c.instituicao || '';
    $('#cfg-extra1').value = c.rotulos.extra1 || '';
    $('#cfg-extra2').value = c.rotulos.extra2 || '';
    $('#cfg-dialogo').checked = !!c.dialogo;
    $('#cfg-papel-driver').checked = !!c.papelDoDriver;
    $('#cfg-offx').value = c.offX || 0;
    $('#cfg-offy').value = c.offY || 0;
    $('#cfg-logo-previa').innerHTML = c.logo ? `<img src="${c.logo}">` : 'sem logo';
    $('#cfg-pasta').textContent = await window.api.pastaDados();
    this.impressoras();
  },

  async impressoras() {
    const s = $('#cfg-impressora');
    let lista = [];
    try { lista = await window.api.impressoras(); } catch (_) {}
    s.innerHTML = '<option value="">(padrão do Windows)</option>' +
      lista.map((p) => `<option value="${esc(p.nome)}">${esc(p.nome)}${p.padrao ? ' — padrão' : ''}</option>`).join('');
    if (db.config.impressora && !lista.some((p) => p.nome === db.config.impressora)) {
      s.insertAdjacentHTML('beforeend', `<option value="${esc(db.config.impressora)}">${esc(db.config.impressora)} (não encontrada)</option>`);
    }
    s.value = db.config.impressora || '';
  },
};

// ===================== Início =====================

function normalizar(d) {
  d = d || {};
  d.versao = 1;
  d.config = { instituicao: '', logo: null, impressora: '', dialogo: true, offX: 0, offY: 0, ...(d.config || {}) };
  d.config.rotulos = { extra1: 'Extra 1', extra2: 'Extra 2', ...(d.config.rotulos || {}) };
  if (!Array.isArray(d.modelos) || !d.modelos.length) d.modelos = modelosPadrao();
  if (!Array.isArray(d.pacientes)) d.pacientes = [];
  return d;
}

(async function iniciar() {
  db = normalizar(await window.api.carregar());
  salvarDb();
  $$('nav button').forEach((b) => (b.onclick = () => mostrarAba(b.dataset.aba)));
  Imp.init(); Cad.init(); Ed.init(); Cfg.init();
  mostrarAba('imprimir');
})();
