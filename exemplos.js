/* Entradas de exemplo para o editor Prolog. */
window.EXEMPLOS_PROLOG = {
  valido: {
    titulo: 'Programa válido',
    arquivo: 'genealogia.pl',
    codigo: [
      '% Base de conhecimento: arvore genealogica',
      'pai(joao, maria).',
      'pai(joao, pedro).',
      'mae(ana, maria).',
      'pai(pedro, lucas).',
      'pai(pedro, sofia).',
      '',
      'avo(X, Y) :-',
      '    pai(X, Z),',
      '    pai(Z, Y).'
    ].join('\n'),
    consulta: 'avo(joao, Neto).'
  },
  'erro-lexico': {
    titulo: 'Erro léxico',
    arquivo: 'erro_lexico.pl',
    codigo: [
      '% Exemplo com erro lexico: simbolo fora do alfabeto',
      'pai(joao, maria).',
      'mae(ana, maria).',
      'avo(X, Y) :-',
      '    pai(X, $Z),',
      '    pai(Z, Y).'
    ].join('\n'),
    consulta: 'avo(joao, Neto).'
  },
  'erro-sintatico': {
    titulo: 'Erro sintático',
    arquivo: 'erro_sintatico.pl',
    codigo: [
      '% Exemplo com erro sintatico: parentese nao fechado antes de :-',
      'pai(joao, maria).',
      'pai(pedro, lucas).',
      'avo(X, Y :-',
      '    pai(X, Z),',
      '    pai(Z, Y).'
    ].join('\n'),
    consulta: 'avo(joao, Neto).'
  }
};
