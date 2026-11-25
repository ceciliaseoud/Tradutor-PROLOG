'use strict';

const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const padrao = /(?<ignorar>\s+|%[^\n]*|\/\*[\s\S]*?\*\/)|(?<atomo>'[^'\n]*'|[a-z]\w*)|(?<variavel>[A-Z_]\w*)|(?<numero>\d+(?:\.\d+)?)|(?<erro>'[^\n]*|\/\*[\s\S]*$)|(?<operador>:-|\?-|=:=|=\\=|\\=|>=|=<|[=<>;+*/-])|(?<delimitador>[(),.])|(?<invalido>.)/gu;
const categorias = { atomo: 'Átomo', variavel: 'Variável', numero: 'Número' };
const diagnostico = (fase, t, mensagem) => ({ fase, mensagem, lexema: t.lexema, linha: t.linha, coluna: t.coluna });

function tokenizar(fonte) {
  const tokens = [], simbolos = new Map(), diagnosticos = [];
  let linha = 1, coluna = 1;
  for (const m of fonte.replace(/\r\n?/g, '\n').matchAll(padrao)) {
    const lexema = m[0], tipo = Object.keys(m.groups).find(chave => m.groups[chave] !== undefined);
    const classe = tipo === 'numero' ? (lexema.includes('.') ? 'decimal' : 'inteiro')
      : tipo === 'atomo' && lexema.startsWith("'") ? 'atomo_citado' : tipo;
    const t = { lexema, tipo, classe, linha, coluna };
    const partes = lexema.split('\n');
    linha += partes.length - 1;
    coluna = (partes.length === 1 ? coluna : 1) + [...partes.at(-1)].length;
    if (tipo === 'ignorar') continue;
    tokens.push(t);
    if (tipo === 'erro' || tipo === 'invalido') {
      const item = lexema[0] === "'" ? 'Átomo entre aspas' : 'Comentário';
      const mensagem = tipo === 'erro' ? `${item} sem fechamento.` : `Caractere inválido: ${lexema}.`;
      diagnosticos.push(diagnostico('léxica', t, mensagem));
    }
    if (!categorias[tipo]) continue;
    if (!simbolos.has(lexema)) {
      simbolos.set(lexema, { id: `S${simbolos.size + 1}`, lexema, categoria: categorias[tipo], ocorrencias: 0, linhas: [] });
    }
    const s = simbolos.get(lexema);
    s.ocorrencias++;
    if (s.linhas.at(-1) !== t.linha) s.linhas.push(t.linha);
    t.simbolo = s.id;
  }
  const eof = { lexema: '', tipo: 'eof', linha, coluna };
  return { tokens, simbolos: [...simbolos.values()], diagnosticos, eof };
}

const precedencia = new Map([
  [';', 1], [',', 2], ['=', 3], ['\\=', 3], ['is', 3], ['>', 3], ['<', 3], ['>=', 3], ['=<', 3],
  ['=:=', 3], ['=\\=', 3], ['+', 4], ['-', 4], ['*', 5], ['/', 5]
]);
const termo = (nome, args = [], tipo = 'atomo') => ({ nome, args, tipo });
const numerico = t => t.tipo === 'numero' || t.tipo === 'decimal';
const no = (rotulo, filhos = [], tipo) => ({ rotulo, filhos, tipo });
const noTermo = t => no(t.lexema, t.args.map(noTermo), t.args.length ? undefined : 'terminal');

function analisar(fonte, consulta = false) {
  const resultado = tokenizar(fonte);
  const { tokens, diagnosticos, eof } = resultado;
  const clausulas = [], arvore = no(consulta ? 'Consulta' : 'Programa');
  let i = 0, variaveis = new Map(), objetivo;
  const atual = () => tokens[i] || eof;
  const erro = (mensagem, t = atual()) => { throw diagnostico('sintática', t, mensagem); };
  function aceitar(lexema) {
    if (atual().lexema !== lexema) return false;
    i++;
    return true;
  }
  function exigir(lexema) {
    if (!aceitar(lexema)) erro(`Esperava “${lexema}”.`);
  }
  function montar(t, nome, args, tipo = 'atomo') {
    const altura = args.reduce((maior, a) => Math.max(maior, a.altura + 1), 0);
    if (altura > 80) erro('Expressão muito aninhada.', t);
    return { ...termo(nome, args, tipo), lexema: t.lexema, altura };
  }
  function primario(profundidade) {
    if (profundidade > 80) erro('Expressão muito aninhada.');
    const t = atual();
    if (aceitar('(')) {
      const interno = expressao(1, profundidade + 1);
      exigir(')');
      return interno;
    }
    if (aceitar('-')) {
      const a = primario(profundidade + 1);
      if (numerico(a)) return montar({ ...t, lexema: `-${a.lexema}` }, -a.nome, [], a.tipo);
      return montar(t, '-', [a]);
    }
    if (!categorias[t.tipo]) erro('Esperava um átomo, uma variável ou um número.');
    i++;
    const nome = t.lexema.startsWith("'") ? t.lexema.slice(1, -1) : t.lexema;
    const args = [];
    if (t.tipo === 'atomo' && aceitar('(')) {
      do { args.push(expressao(3, profundidade + 1)); } while (aceitar(','));
      exigir(')');
    }
    const valor = t.tipo === 'numero' ? Number(nome) : nome;
    if (t.tipo === 'numero' && !Number.isFinite(valor)) erro('Número fora do intervalo suportado.', t);
    const item = montar(t, valor, args, t.tipo === 'numero' && nome.includes('.') ? 'decimal' : t.tipo);
    if (t.tipo !== 'variavel' || nome === '_') return item;
    if (!variaveis.has(nome)) variaveis.set(nome, item);
    return variaveis.get(nome);
  }
  function expressao(minimo, profundidade = 0) {
    let esquerda = primario(profundidade), operador = atual();
    let nivel = precedencia.get(operador.lexema);
    while (nivel >= minimo) {
      i++;
      const direita = expressao(nivel + 1, profundidade + 1);
      esquerda = montar(operador, operador.lexema, [esquerda, direita]);
      operador = atual();
      if (nivel === 3 && precedencia.get(operador.lexema) === 3) erro('Separe as comparações com uma vírgula.');
      nivel = precedencia.get(operador.lexema);
    }
    return esquerda;
  }
  if (diagnosticos.length) return resultado;
  try {
    if (consulta) {
      aceitar('?-');
      objetivo = expressao(1);
      aceitar('.');
      if (atual() !== eof) erro('Esperava o fim da consulta.');
    } else while (atual() !== eof) {
      variaveis = new Map();
      const inicio = atual(), cabeca = primario(0);
      if (inicio.tipo !== 'atomo') erro('A cláusula deve começar por um predicado.', inicio);
      const corpo = aceitar(':-') ? expressao(1) : null;
      exigir('.');
      clausulas.push({ cabeca, corpo });
      const filhos = [noTermo(cabeca)];
      if (corpo) filhos.push(no('Corpo', [noTermo(corpo)]));
      arvore.filhos.push(no(corpo ? 'Regra' : 'Fato', filhos));
    }
  } catch (falha) {
    if (falha.fase !== 'sintática') throw falha;
    diagnosticos.push(falha);
    arvore.filhos.push(no(falha.mensagem, [], 'erro'));
  }
  return { ...resultado, clausulas, arvore, objetivo, variaveis };
}

const assinatura = t => `${t.nome}/${t.args.length}`;
function resolver(t, ligacoes) {
  while (ligacoes.has(t)) t = ligacoes.get(t);
  return t;
}

function executar(clausulas, consulta) {
  const base = new Map(), solucoes = [];
  let passos = 0, saida = '', erro = null, limitada = false;
  for (const c of clausulas) {
    const chave = assinatura(c.cabeca);
    if (!base.has(chave)) base.set(chave, []);
    base.get(chave).push(c);
  }
  function passo(peso = 1) {
    passos += peso;
    if (passos > 30000) throw new Error('Limite de passos atingido.');
  }
  function ocorre(v, t, ligacoes) {
    passo();
    t = resolver(t, ligacoes);
    return v === t || t.args.some(a => ocorre(v, a, ligacoes));
  }
  function unificar(a, b, ligacoes) {
    passo();
    a = resolver(a, ligacoes);
    b = resolver(b, ligacoes);
    if (a === b) return true;
    if (b.tipo === 'variavel' && a.tipo !== 'variavel') return unificar(b, a, ligacoes);
    if (a.tipo === 'variavel') {
      if (ocorre(a, b, ligacoes)) return false;
      ligacoes.set(a, b);
      return true;
    }
    return a.tipo === b.tipo && a.nome === b.nome && a.args.length === b.args.length &&
      a.args.every((arg, i) => unificar(arg, b.args[i], ligacoes));
  }
  function copiar(t, locais) {
    passo();
    if (t.tipo !== 'variavel') return termo(t.nome, t.args.map(a => copiar(a, locais)), t.tipo);
    if (!locais.has(t)) locais.set(t, termo(t.nome, [], t.tipo));
    return locais.get(t);
  }
  const calculos = { '+': (a, b) => a + b, '-': (a, b) => b === undefined ? -a : a - b,
    '*': (a, b) => a * b, '/': (a, b) => a / b };
  const comparacoes = { '>': (a, b) => a > b, '<': (a, b) => a < b, '>=': (a, b) => a >= b,
    '=<': (a, b) => a <= b, '=:=': (a, b) => a === b, '=\\=': (a, b) => a !== b };
  function calcular(t, ligacoes) {
    passo();
    t = resolver(t, ligacoes);
    if (numerico(t)) return t;
    if (!Object.hasOwn(calculos, t.nome) || ![1, 2].includes(t.args.length) ||
        (t.args.length === 1 && t.nome !== '-')) throw new Error('Esperava uma expressão aritmética com números definidos.');
    const args = t.args.map(a => calcular(a, ligacoes));
    const valor = calculos[t.nome](...args.map(a => a.nome));
    if (!Number.isFinite(valor)) throw new Error('Divisão por zero ou resultado fora do intervalo numérico.');
    const tipo = t.nome === '/' || args.some(a => a.tipo === 'decimal') ? 'decimal' : 'numero';
    return termo(valor, [], tipo);
  }
  function formatar(t, ligacoes, nomes, aspas = true) {
    t = resolver(t, ligacoes);
    passo(Math.max(1, Math.ceil(String(t.nome).length / 16)));
    if (t.tipo === 'variavel') {
      if (!nomes.has(t)) nomes.set(t, `_G${nomes.size + 1}`);
      return nomes.get(t);
    }
    if (t.tipo === 'decimal' && Number.isInteger(t.nome) && Math.abs(t.nome) < 1e21) return `${t.nome}.0`;
    const nome = aspas && t.tipo === 'atomo' && !/^[a-z]\w*$/.test(t.nome) ? `'${t.nome}'` : t.nome;
    return t.args.length ? `${nome}(${t.args.map(a => formatar(a, ligacoes, nomes, aspas)).join(', ')})` : String(nome);
  }
  function* provar(t, ligacoes, profundidade = 0) {
    passo();
    if (profundidade > 120) throw new Error('Limite de profundidade atingido.');
    t = resolver(t, ligacoes);
    if (t.tipo !== 'atomo') throw new Error('O objetivo deve ser um predicado ou uma expressão lógica.');
    const [a, b] = t.args, nivel = profundidade + 1, chave = assinatura(t);
    switch (chave) {
      case ',/2':
        for (const parcial of provar(a, ligacoes, nivel)) yield* provar(b, parcial, nivel);
        return;
      case ';/2': yield* provar(a, ligacoes, nivel); yield* provar(b, ligacoes, nivel); return;
      case 'fail/0': case 'false/0': return;
      case 'true/0': yield ligacoes; return;
      case 'write/1': case 'writeln/1': case 'nl/0':
        saida += a ? formatar(a, ligacoes, new Map(), false) : '';
        if (chave !== 'write/1') saida += '\n';
        if (saida.length > 16000) throw new Error('Limite de saída atingido.');
        yield ligacoes;
        return;
    }
    if (t.args.length === 2 && Object.hasOwn(comparacoes, t.nome)) {
      if (comparacoes[t.nome](calcular(a, ligacoes).nome, calcular(b, ligacoes).nome)) yield ligacoes;
    } else if (['=/2', '\\=/2', 'is/2'].includes(chave)) {
      const novas = new Map(ligacoes);
      const ok = unificar(a, t.nome === 'is' ? calcular(b, ligacoes) : b, novas);
      if (t.nome === '\\=' ? !ok : ok) yield t.nome === '\\=' ? ligacoes : novas;
    } else for (const { cabeca, corpo } of base.get(chave) || []) {
      const locais = new Map(), novas = new Map(ligacoes);
      if (!unificar(t, copiar(cabeca, locais), novas)) continue;
      if (corpo) yield* provar(copiar(corpo, locais), novas, nivel);
      else yield novas;
    }
  }
  try {
    for (const ligacoes of provar(consulta.objetivo, new Map())) {
      if (solucoes.length === 100) { limitada = true; break; }
      const nomes = new Map();
      for (const [nome, v] of consulta.variaveis) {
        const raiz = resolver(v, ligacoes);
        if (raiz.tipo === 'variavel' && !nomes.has(raiz)) nomes.set(raiz, nome);
      }
      const valores = [...consulta.variaveis].map(([nome, v]) => [nome, formatar(v, ligacoes, nomes)]);
      solucoes.push(Object.fromEntries(valores.filter(([nome, valor]) => nome !== valor)));
      if (consulta.variaveis.size === 0) break;
    }
  } catch (falha) { erro = falha.message; }
  return { solucoes, saida: saida.slice(0, 16000), erro, limitada };
}

const arquivos = { '/index.html': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'],
  '/app.js': ['app.js', 'text/javascript'], '/exemplos.js': ['exemplos.js', 'text/javascript'] };

const servidor = createServer(async (req, res) => {
  const json = (status, dados) => {
    const corpo = JSON.stringify(dados);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(corpo);
  };
  const pagina = req.url.split('?')[0];
  const caminho = pagina === '/' ? '/index.html' : pagina;
  try {
    if (req.method === 'GET' && Object.hasOwn(arquivos, caminho)) {
      const [arquivo, tipo] = arquivos[caminho], conteudo = await readFile(join(__dirname, arquivo));
      res.writeHead(200, { 'Content-Type': `${tipo}; charset=utf-8` });
      return res.end(conteudo);
    }
    if (!['/api/compilar', '/api/consultar'].includes(caminho)) return json(404, { erro: 'Rota desconhecida.' });
    if (req.method !== 'POST') return json(405, { erro: 'Use POST para esta rota.' });
    let tamanho = 0;
    const partes = [];
    for await (const trecho of req) {
      tamanho += trecho.length;
      if (tamanho <= 65536) partes.push(trecho);
    }
    if (tamanho > 65536) return json(413, { erro: 'Entrada acima de 64 KiB.' });
    const { codigo, consulta } = JSON.parse(Buffer.concat(partes).toString('utf8')) || {};
    if (typeof codigo !== 'string') return json(400, { erro: 'Envie o texto do programa em "codigo".' });
    const { tokens, simbolos, diagnosticos, clausulas, arvore, eof } = analisar(codigo);
    if (caminho === '/api/compilar') return json(200, { tokens, simbolos, diagnosticos, eof, arvore: arvore ?? null, clausulas: clausulas?.length ?? 0 });
    if (diagnosticos.length) return json(200, { origem: 'programa', diagnosticos });
    if (typeof consulta !== 'string') return json(400, { erro: 'Envie o texto da consulta em "consulta".' });
    const pergunta = analisar(consulta, true);
    if (pergunta.diagnosticos.length) return json(200, { origem: 'consulta', diagnosticos: pergunta.diagnosticos });
    return json(200, executar(clausulas, pergunta));
  } catch (falha) {
    if (falha instanceof SyntaxError) return json(400, { erro: 'JSON inválido.' });
    json(500, { erro: 'Falha ao processar a requisição.' });
  }
});

const porta = Number(process.env.PORT ?? 3000);
servidor.listen(porta, '127.0.0.1', () => console.log(`Tradutor Prolog em http://127.0.0.1:${servidor.address().port}`));