const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createInterface } = require('node:readline');
const { before, after, test } = require('node:test');
const { runInNewContext } = require('node:vm');

const raiz = join(__dirname, '..');
const window = {};
runInNewContext(readFileSync(join(raiz, 'exemplos.js'), 'utf8'), { window });
const exemplos = window.EXEMPLOS_PROLOG;
const notas = readFileSync(join(__dirname, 'notas.pl'), 'utf8');

let servidor;
let endereco;

before(async () => {
  servidor = spawn(process.execPath, ['server.js'], {
    cwd: raiz,
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'inherit']
  });

  const linhas = createInterface({ input: servidor.stdout });
  const sinal = AbortSignal.timeout(5000);
  try {
    endereco = await new Promise((resolve, reject) => {
      sinal.addEventListener('abort', () => reject(sinal.reason), { once: true });
      servidor.once('error', reject);
      servidor.once('exit', codigo => reject(new Error(`Servidor encerrou (${codigo}).`)));
      linhas.on('line', linha => {
        const url = linha.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (url) resolve(url[0]);
      });
    });
  } finally {
    linhas.close();
  }
});

after(() => servidor?.kill());

async function enviar(rota, dados) {
  const resposta = await fetch(`${endereco}/api/${rota}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
    signal: AbortSignal.timeout(5000)
  });
  assert.equal(resposta.status, 200);
  return resposta.json();
}

test('T1 — exemplo válido do editor: análise e duas soluções por backtracking', async () => {
  const { codigo, consulta } = exemplos.valido;
  const compilacao = await enviar('compilar', { codigo });
  assert.deepEqual(compilacao.diagnosticos, []);
  assert.equal(compilacao.clausulas, 6);
  assert.equal(compilacao.arvore.rotulo, 'Programa');
  assert.deepEqual(compilacao.arvore.filhos.map(no => no.rotulo),
    ['Fato', 'Fato', 'Fato', 'Fato', 'Fato', 'Regra']);
  assert.equal(compilacao.simbolos.find(s => s.lexema === 'pai').ocorrencias, 6);
  const resultado = await enviar('consultar', { codigo, consulta });
  assert.equal(resultado.erro, null);
  assert.deepEqual(resultado.solucoes, [{ Neto: 'lucas' }, { Neto: 'sofia' }]);
});

for (const caso of [
  { nome: 'T2 — erro léxico', exemplo: 'erro-lexico', fase: 'léxica', lexema: '$', linha: 5, coluna: 12 },
  { nome: 'T3 — erro sintático', exemplo: 'erro-sintatico', fase: 'sintática', lexema: ':-', linha: 4, coluna: 10 }
]) {
  test(`${caso.nome}: diagnóstico e bloqueio da consulta`, async () => {
    const { codigo, consulta } = exemplos[caso.exemplo];
    const { diagnosticos } = await enviar('compilar', { codigo });
    assert.equal(diagnosticos.length, 1);
    const { fase, lexema, linha, coluna } = diagnosticos[0];
    assert.deepEqual({ fase, lexema, linha, coluna },
      { fase: caso.fase, lexema: caso.lexema, linha: caso.linha, coluna: caso.coluna });
    const resultado = await enviar('consultar', { codigo, consulta });
    assert.deepEqual(resultado, { origem: 'programa', diagnosticos });
  });
}

test('T4 — programa de notas do relatório: tokens, cláusulas e EOF', async () => {
  const { tokens, clausulas, diagnosticos, eof } = await enviar('compilar', {
    codigo: notas.trimEnd()
  });
  assert.deepEqual(diagnosticos, []);
  assert.equal(clausulas, 7);
  assert.equal(tokens.length, 144);
  assert.deepEqual(eof, { lexema: '', tipo: 'eof', linha: 28, coluna: 8 });
  const pontosDeControle = [
    ['8.0', 'decimal', 1, 16],
    ['is', 'atomo', 7, 11],
    ['>=', 'operador', 11, 11],
    ['<', 'operador', 15, 11],
    ["'Aluno: '", 'atomo_citado', 20, 11],
    ["'Media: '", 'atomo_citado', 23, 11],
    ["'Situacao: '", 'atomo_citado', 26, 11]
  ];
  for (const [lexema, classe, linha, coluna] of pontosDeControle) {
    const token = tokens.find(item => item.linha === linha && item.coluna === coluna);
    assert.equal(token?.lexema, lexema, `Lexema em ${linha}:${coluna}`);
    assert.equal(token.classe, classe);
  }
});

test('T5 — médias, situação e saída do programa do relatório', async () => {
  const media = await enviar('consultar', { codigo: notas, consulta: '?- media(carlos, X).' });
  assert.equal(media.erro, null);
  assert.deepEqual(media.solucoes, [{ X: '5.5' }]);

  const aprovados = await enviar('consultar', { codigo: notas, consulta: 'situacao(X, aprovado).' });
  assert.equal(aprovados.erro, null);
  assert.deepEqual(aprovados.solucoes, [{ X: 'cecilia' }, { X: 'marcus' }]);

  const exibicao = await enviar('consultar', { codigo: notas, consulta: 'mostrar_aluno(cecilia).' });
  assert.equal(exibicao.erro, null);
  assert.deepEqual(exibicao.solucoes, [{}]);
  assert.equal(exibicao.saida, 'Aluno: cecilia\nMedia: 7.75\nSituacao: aprovado\n');
});

test('T6 — consulta válida sem solução', async () => {
  const resultado = await enviar('consultar', { codigo: notas, consulta: 'situacao(carlos, aprovado).' });
  assert.equal(resultado.erro, null);
  assert.deepEqual(resultado.solucoes, []);
});

test('T7 — erro aritmético durante a consulta de um programa aceito', async () => {
  const codigo = 'quociente(R) :- R is 1 / 0.';
  const compilacao = await enviar('compilar', { codigo });
  assert.deepEqual(compilacao.diagnosticos, []);
  const resultado = await enviar('consultar', { codigo, consulta: 'quociente(R).' });
  assert.equal(resultado.erro, 'Divisão por zero ou resultado fora do intervalo numérico.');
  assert.deepEqual(resultado.solucoes, []);
});

test('T8 — erro sintático na consulta de um programa válido', async () => {
  const resultado = await enviar('consultar', { codigo: notas, consulta: 'media(carlos, X.' });
  assert.equal(resultado.origem, 'consulta');
  assert.equal(resultado.diagnosticos[0].fase, 'sintática');
  assert.equal(resultado.diagnosticos[0].lexema, '.');
});

test('T9 — espaços, comentários e quebras de linha na análise léxica', async () => {
  const codigo = '% comentário com $\r\n\taluno(cecilia, 8.0, 7.5).';
  const { tokens, diagnosticos } = await enviar('compilar', { codigo });
  assert.deepEqual(diagnosticos, []);
  assert.deepEqual(tokens.map(token => token.lexema),
    ['aluno', '(', 'cecilia', ',', '8.0', ',', '7.5', ')', '.']);
  assert.equal(tokens[0].linha, 2);
  assert.equal(tokens[0].coluna, 2);
});

test('T10 — recuperação léxica em variação do programa de notas', async () => {
  const codigo = notas.replace('8.0', '$8.0').replace('Media is', "Media : is")
    .replace("'Aluno: '", "'Aluno: ");
  const { tokens, diagnosticos, arvore } = await enviar('compilar', { codigo });
  assert.deepEqual(diagnosticos.map(({ fase, lexema, linha, coluna }) =>
    [fase, lexema, linha, coluna]), [
    ['léxica', '$', 1, 16],
    ['léxica', ':', 7, 11],
    ['léxica', "'Aluno: ),", 20, 11]
  ]);
  assert.ok(tokens.some(token => token.lexema === '8.0' && token.coluna === 17));
  assert.ok(tokens.some(token => token.lexema === 'write' && token.linha === 21));
  assert.equal(arvore, null);
});