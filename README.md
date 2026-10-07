# Pulseiras

Programa para Windows que cria, salva e imprime **pulseiras de identificação** em impressoras de pulseira (Zebra HC100/ZD510-HC, Argox, Elgin, Honeywell e outras com driver Windows), para clínicas, hospitais e eventos.

## O que ele faz

- **Modelos de pulseira** editáveis: texto, campos do cadastro (`{nome}`, `{nascimento}`, `{idade}`, `{prontuario}`…), logomarca, imagens, foto da pessoa, retângulo, elipse, linha, código de barras (Code128, Code39, EAN-13, ITF) e QR Code.
- Texto com fonte, tamanho, negrito/itálico/sublinhado/maiúsculas, **cor da letra** e **fundo da caixa** (sem fundo, colorido ou preto), cantos arredondados e borda. Formas com preenchimento colorido ou preto.
- Diminui a fonte sozinho quando o nome é grande demais.
- A pulseira **sai na vertical** (página largura × comprimento); dá para trocar o sentido (90°/270°).
- **Tamanhos padrão de mercado** prontos (é possível digitar qualquer medida):
  | Tipo | Largura × comprimento |
  |---|---|
  | Adulto hospitalar | 25,4 × 279,4 mm (1" × 11") |
  | Adulto largo | 30,2 × 279,4 mm |
  | Pediátrica | 25,4 × 177,8 mm (1" × 7") |
  | Infantil / Neonatal | 19 × 152,4 mm |
  | Evento térmica / Tyvek | 25,4 × 254 mm (1" × 10") |
  | Evento larga | 30 × 254 mm |

  Áreas listradas no editor marcam o fecho e a ponta, que normalmente não imprimem. Confira a área imprimível na caixa do seu rolo.
- **Cadastro** de pacientes/participantes, com foto, busca, importação e exportação em CSV, e impressão em lote.
- Exporta e importa modelos (`.pulseira.json`), faz backup completo e salva PDF.

## Uso

1. **Configurações**: nome da instituição, logomarca e impressora de pulseiras.
2. **Modelos**: ajuste o modelo pronto ou crie um novo.
3. **Imprimir**: escolha o modelo, busque a pessoa no cadastro (ou digite os dados) e imprima.

No driver da impressora configure o mesmo tamanho de mídia e o modo "térmica direta". Se a impressão sair deslocada, use os ajustes em mm nas Configurações. Os dados ficam na pasta `PulseirasDados`, ao lado do `.exe`.

## Desenvolvimento

```bash
npm install
npm start        # roda no computador
npm run dist     # gera dist/Pulseiras.exe (portátil, Windows x64)
```

Bibliotecas: Electron, [JsBarcode](https://github.com/lindell/JsBarcode) e [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT).
