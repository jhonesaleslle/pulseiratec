// Desenha a pulseira em HTML (unidades em mm). O mesmo código serve para o
// editor, as prévias, a impressão e o PDF.

const MM_PX = 96 / 25.4;

const CAMPOS = [
  { k: 'nome', r: 'Nome completo', largo: true },
  { k: 'nascimento', r: 'Data de nascimento', tipo: 'date' },
  { k: 'sexo', r: 'Sexo', opcoes: ['', 'F', 'M', 'Feminino', 'Masculino', 'Outro'] },
  { k: 'prontuario', r: 'Prontuário / Nº' },
  { k: 'atendimento', r: 'Atendimento' },
  { k: 'mae', r: 'Nome da mãe', largo: true },
  { k: 'convenio', r: 'Convênio' },
  { k: 'medico', r: 'Médico responsável' },
  { k: 'setor', r: 'Setor' },
  { k: 'leito', r: 'Leito / Quarto' },
  { k: 'sangue', r: 'Tipo sanguíneo', opcoes: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  { k: 'risco', r: 'Risco (queda, etc.)' },
  { k: 'alergias', r: 'Alergias', largo: true },
  { k: 'categoria', r: 'Categoria (evento: VIP, Staff…)' },
  { k: 'documento', r: 'Documento (CPF/RG)' },
  { k: 'extra1', r: 'Extra 1' },
  { k: 'extra2', r: 'Extra 2' },
  { k: 'obs', r: 'Observações', largo: true },
];

// Campos calculados, disponíveis nos textos, mas sem entrada no cadastro.
const CAMPOS_AUTO = [
  { k: 'idade', r: 'Idade (calculada)' },
  { k: 'data_hoje', r: 'Data de hoje' },
  { k: 'hora', r: 'Hora atual' },
  { k: 'instituicao', r: 'Nome da instituição' },
];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function dataBR(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

function idade(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  const n = new Date(+m[1], +m[2] - 1, +m[3]);
  const h = new Date();
  let meses = (h.getFullYear() - n.getFullYear()) * 12 + (h.getMonth() - n.getMonth());
  if (h.getDate() < n.getDate()) meses--;
  if (meses < 0) return '';
  if (meses >= 24) return Math.floor(meses / 12) + ' anos';
  if (meses >= 12) return '1 ano' + (meses % 12 ? ` e ${meses % 12} m` : '');
  if (meses >= 1) return meses + (meses === 1 ? ' mês' : ' meses');
  const dias = Math.floor((h - n) / 86400000);
  return dias + (dias === 1 ? ' dia' : ' dias');
}

function valores(reg, cfg) {
  const v = { ...(reg || {}) };
  delete v.foto;
  v.nascimento = dataBR(reg?.nascimento);
  v.idade = idade(reg?.nascimento);
  const h = new Date();
  v.data_hoje = h.toLocaleDateString('pt-BR');
  v.hora = h.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  v.instituicao = cfg?.instituicao || '';
  return v;
}

function preencher(texto, reg, cfg) {
  const v = valores(reg, cfg);
  return String(texto ?? '').replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));
}

function svgCodigoBarras(valor, el) {
  if (!valor) return '';
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, valor, {
      format: el.formato || 'CODE128',
      displayValue: el.mostrarTexto !== false,
      fontSize: 14, textMargin: 1, margin: 0, height: 60, width: 2,
      lineColor: el.cor || '#000', background: 'transparent',
    });
    const w = svg.getAttribute('width'), h = svg.getAttribute('height');
    svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.removeAttribute('style');
    return svg.outerHTML;
  } catch (e) {
    return `<div style="font-size:6pt;color:#c00">código inválido</div>`;
  }
}

function svgQR(valor, cor) {
  if (!valor) return '';
  const qr = qrcode(0, 'M');
  qr.addData(unescape(encodeURIComponent(valor)));
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n} ${n}" width="100%" height="100%" shape-rendering="crispEdges"><path d="${d}" fill="${esc(cor || '#000')}"/></svg>`;
}

function elementoHTML(el, reg, cfg, editor) {
  const base = `position:absolute;left:${el.x}mm;top:${el.y}mm;width:${el.w}mm;height:${el.h}mm;` +
    (el.rot ? `transform:rotate(${el.rot}deg);` : '') +
    (el.opacidade != null && el.opacidade < 100 ? `opacity:${el.opacidade / 100};` : '');
  const attrs = editor ? ` class="el${editor.sel === el.id ? ' sel' : ''}" data-id="${el.id}"` : '';
  const alca = editor && editor.sel === el.id ? '<div class="alca"></div>' : '';
  let dentro = '', estilo = base;

  switch (el.tipo) {
    case 'texto': {
      const txt = esc(preencher(el.texto, reg, cfg));
      const just = { left: 'flex-start', center: 'center', right: 'flex-end' }[el.alinhar || 'left'];
      const vert = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[el.vertical || 'middle'];
      estilo += `display:flex;align-items:${vert};justify-content:${just};text-align:${el.alinhar || 'left'};` +
        `font-family:'${esc(el.fonte || 'Arial')}',Arial,sans-serif;font-size:${el.tamanho || 10}pt;` +
        `font-weight:${el.negrito ? 700 : 400};font-style:${el.italico ? 'italic' : 'normal'};` +
        `text-decoration:${el.sublinhado ? 'underline' : 'none'};color:${el.cor || '#000'};` +
        `background:${el.fundo || 'transparent'};border-radius:${el.raio || 0}mm;` +
        `padding:0 ${el.margem ?? 0.8}mm;line-height:1.08;overflow:hidden;` +
        `white-space:${el.quebrar ? 'pre-wrap' : 'pre'};word-break:break-word;` +
        (el.borda ? `border:${el.borda}mm solid ${el.corBorda || '#000'};` : '') +
        (el.maiusculas ? 'text-transform:uppercase;' : '');
      const fit = el.ajustar !== false ? ` data-fit="1" data-fs="${el.tamanho || 10}"` : '';
      return `<div${attrs}${fit} style="${estilo}"><span>${txt}</span>${alca}</div>`;
    }
    case 'retangulo':
    case 'elipse':
      estilo += `background:${el.fundo || 'transparent'};` +
        (el.borda ? `border:${el.borda}mm solid ${el.corBorda || '#000'};` : '') +
        `border-radius:${el.tipo === 'elipse' ? '50%' : (el.raio || 0) + 'mm'};`;
      break;
    case 'linha':
      estilo += `display:flex;align-items:center;`;
      dentro = `<div style="width:100%;height:${el.espessura || 0.5}mm;background:${el.cor || '#000'}"></div>`;
      break;
    case 'imagem': {
      const src = el.fonte === 'logo' ? cfg?.logo : el.fonte === 'foto' ? reg?.foto : el.src;
      if (src) {
        const filtro = el.pb ? 'filter:grayscale(1) contrast(1.15);' : '';
        dentro = `<img src="${src}" style="width:100%;height:100%;object-fit:${el.ajuste || 'contain'};display:block;${filtro}">`;
        if (el.raio) estilo += `border-radius:${el.raio}mm;overflow:hidden;`;
      } else if (editor) {
        const nome = { logo: 'LOGO', foto: 'FOTO' }[el.fonte] || 'IMAGEM';
        dentro = `<div style="width:100%;height:100%;border:0.3mm dashed #8a96a6;display:flex;align-items:center;justify-content:center;font:600 2.5mm sans-serif;color:#8a96a6">${nome}</div>`;
      }
      break;
    }
    case 'barcode':
      dentro = svgCodigoBarras(preencher(el.valor, reg, cfg).trim(), el);
      break;
    case 'qrcode':
      dentro = svgQR(preencher(el.valor, reg, cfg).trim(), el.cor);
      break;
  }
  return `<div${attrs} style="${estilo}">${dentro}${alca}</div>`;
}

// Pulseira deitada (comprimento na horizontal), como é lida no pulso.
function bandaHTML(modelo, reg, cfg, editor) {
  const L = modelo.comprimento, W = modelo.largura;
  let h = `<div class="banda${editor ? ' ed' : ''}" style="position:relative;width:${L}mm;height:${W}mm;` +
    `background:${modelo.fundo || '#fff'};overflow:hidden;${modelo.mono ? 'filter:grayscale(1);' : ''}` +
    `border-radius:${editor ? '1.5mm' : 0}">`;
  for (const el of modelo.elementos) if (!el.oculto) h += elementoHTML(el, reg, cfg, editor);
  if (editor && editor.zonas !== false) {
    if (modelo.zonaInicio > 0) h += `<div class="zona" style="left:0;width:${modelo.zonaInicio}mm"><span>fecho</span></div>`;
    if (modelo.zonaFim > 0) h += `<div class="zona" style="right:0;width:${modelo.zonaFim}mm"><span>ponta</span></div>`;
  }
  return h + '</div>';
}

// Reduz a fonte dos textos marcados com "ajustar" até caberem na caixa.
function ajustarTextos(raiz) {
  raiz.querySelectorAll('[data-fit="1"]').forEach((el) => {
    let s = parseFloat(el.dataset.fs);
    const alca = el.querySelector('.alca');
    if (alca) alca.style.display = 'none';
    el.style.fontSize = s + 'pt';
    let g = 0;
    while ((el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && s > 3 && g++ < 120) {
      s -= 0.25;
      el.style.fontSize = s + 'pt';
    }
    if (alca) alca.style.display = '';
  });
}

// Transformação que coloca a pulseira deitada dentro da página vertical.
function transformVertical(modelo) {
  return modelo.rotacao === 270
    ? `translate(0, ${modelo.comprimento}mm) rotate(-90deg)`
    : `translate(${modelo.largura}mm, 0) rotate(90deg)`;
}

// Documento completo para impressão: uma página (largura x comprimento) por pulseira.
function documentoImpressao(modelo, registros, cfg, copias) {
  const W = modelo.largura, L = modelo.comprimento;
  const ox = +cfg.offX || 0, oy = +cfg.offY || 0;
  let paginas = '';
  for (const reg of registros) {
    const banda = bandaHTML(modelo, reg, cfg, null);
    for (let i = 0; i < (copias || 1); i++) {
      paginas += `<div class="pg"><div style="position:absolute;left:${ox}mm;top:${oy}mm;transform-origin:0 0;transform:${transformVertical(modelo)}">${banda}</div></div>`;
    }
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: ${Math.max(W, 24)}mm ${L}mm; margin: 0; }
html, body { margin: 0; padding: 0; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pg { position: relative; width: ${W}mm; height: ${L}mm; overflow: hidden; page-break-after: always; break-after: page; }
.pg:last-child { page-break-after: auto; break-after: auto; }
</style></head><body>${paginas}
<script>(${ajustarTextos.toString()})(document);<\/script></body></html>`;
}
