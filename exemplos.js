/* Exemplos pré-programados para o Tradutor Prolog. */
window.EXEMPLOS_PROLOG = {
  valido: {
    id: 'valido',
    titulo: 'Programa válido',
    arquivo: 'genealogia.pl',
    maquinaTag: { texto: 'Compilado', classe: 'verde' },
    abaInicial: 'tokens',
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
    consulta: 'avo(joao, Neto).',
    tokens: [
      { n: 1, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '2:1', sym: 'S1' },
      { n: 2, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '2:4', sym: '–' },
      { n: 3, lexema: 'joao', classe: 'ATOMO', tipo: 'ok', pos: '2:5', sym: 'S2' },
      { n: 4, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '2:9', sym: '–' },
      { n: 5, lexema: 'maria', classe: 'ATOMO', tipo: 'ok', pos: '2:11', sym: 'S3' },
      { n: 6, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '2:16', sym: '–' },
      { n: 7, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '2:17', sym: '–' },

      { n: 8, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '3:1', sym: 'S1' },
      { n: 9, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '3:4', sym: '–' },
      { n: 10, lexema: 'joao', classe: 'ATOMO', tipo: 'ok', pos: '3:5', sym: 'S2' },
      { n: 11, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '3:9', sym: '–' },
      { n: 12, lexema: 'pedro', classe: 'ATOMO', tipo: 'ok', pos: '3:11', sym: 'S4' },
      { n: 13, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '3:16', sym: '–' },
      { n: 14, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '3:17', sym: '–' },

      { n: 15, lexema: 'mae', classe: 'ATOMO', tipo: 'ok', pos: '4:1', sym: 'S5' },
      { n: 16, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '4:4', sym: '–' },
      { n: 17, lexema: 'ana', classe: 'ATOMO', tipo: 'ok', pos: '4:5', sym: 'S6' },
      { n: 18, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '4:8', sym: '–' },
      { n: 19, lexema: 'maria', classe: 'ATOMO', tipo: 'ok', pos: '4:10', sym: 'S3' },
      { n: 20, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '4:15', sym: '–' },
      { n: 21, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '4:16', sym: '–' },

      { n: 22, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '5:1', sym: 'S1' },
      { n: 23, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '5:4', sym: '–' },
      { n: 24, lexema: 'pedro', classe: 'ATOMO', tipo: 'ok', pos: '5:5', sym: 'S4' },
      { n: 25, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '5:10', sym: '–' },
      { n: 26, lexema: 'lucas', classe: 'ATOMO', tipo: 'ok', pos: '5:12', sym: 'S7' },
      { n: 27, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '5:17', sym: '–' },
      { n: 28, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '5:18', sym: '–' },

      { n: 29, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '6:1', sym: 'S1' },
      { n: 30, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '6:4', sym: '–' },
      { n: 31, lexema: 'pedro', classe: 'ATOMO', tipo: 'ok', pos: '6:5', sym: 'S4' },
      { n: 32, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '6:10', sym: '–' },
      { n: 33, lexema: 'sofia', classe: 'ATOMO', tipo: 'ok', pos: '6:12', sym: 'S8' },
      { n: 34, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '6:17', sym: '–' },
      { n: 35, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '6:18', sym: '–' },

      { n: 36, lexema: 'avo', classe: 'ATOMO', tipo: 'ok', pos: '8:1', sym: 'S9' },
      { n: 37, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '8:4', sym: '–' },
      { n: 38, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '8:5', sym: 'S10' },
      { n: 39, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '8:6', sym: '–' },
      { n: 40, lexema: 'Y', classe: 'VARIAVEL', tipo: 'var', pos: '8:8', sym: 'S11' },
      { n: 41, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '8:9', sym: '–' },
      { n: 42, lexema: ':-', classe: 'OP_IMPLICA', tipo: 'op', pos: '8:11', sym: '–' },

      { n: 43, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '9:5', sym: 'S1' },
      { n: 44, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '9:8', sym: '–' },
      { n: 45, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '9:9', sym: 'S10' },
      { n: 46, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '9:10', sym: '–' },
      { n: 47, lexema: 'Z', classe: 'VARIAVEL', tipo: 'var', pos: '9:12', sym: 'S12' },
      { n: 48, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '9:13', sym: '–' },
      { n: 49, lexema: ',', classe: 'OP_CONJUNCAO', tipo: 'op', pos: '9:14', sym: '–' },

      { n: 50, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '10:5', sym: 'S1' },
      { n: 51, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '10:8', sym: '–' },
      { n: 52, lexema: 'Z', classe: 'VARIAVEL', tipo: 'var', pos: '10:9', sym: 'S12' },
      { n: 53, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '10:10', sym: '–' },
      { n: 54, lexema: 'Y', classe: 'VARIAVEL', tipo: 'var', pos: '10:12', sym: 'S11' },
      { n: 55, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '10:13', sym: '–' },
      { n: 56, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '10:14', sym: '–' }
    ],
    simbolos: [
      { id: 'S1', lexema: 'pai', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '2, 3, 5, 6, 9, 10' },
      { id: 'S2', lexema: 'joao', categoria: 'Átomo', detalhe: 'constante', linhas: '2, 3' },
      { id: 'S3', lexema: 'maria', categoria: 'Átomo', detalhe: 'constante', linhas: '2, 4' },
      { id: 'S4', lexema: 'pedro', categoria: 'Átomo', detalhe: 'constante', linhas: '3, 5, 6' },
      { id: 'S5', lexema: 'mae', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '4' },
      { id: 'S6', lexema: 'ana', categoria: 'Átomo', detalhe: 'constante', linhas: '4' },
      { id: 'S7', lexema: 'lucas', categoria: 'Átomo', detalhe: 'constante', linhas: '5' },
      { id: 'S8', lexema: 'sofia', categoria: 'Átomo', detalhe: 'constante', linhas: '6' },
      { id: 'S9', lexema: 'avo', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '8' },
      { id: 'S10', lexema: 'X', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '8, 9' },
      { id: 'S11', lexema: 'Y', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '8, 10' },
      { id: 'S12', lexema: 'Z', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '9, 10' }
    ],
    arvoreBadge: 'OK',
    arvore: {
      resumo: 'Derivação completa pela GLC.',
      raiz: {
        rotulo: '<Programa>',
        filhos: [
          {
            rotulo: '<Fato #1>',
            nota: 'linha 2',
            filhos: [
              {
                rotulo: '<Predicado>',
                filhos: [
                  { rotulo: 'ATOMO: pai', tipo: 'terminal' },
                  { rotulo: '<ListaArgs>: joao, maria', tipo: 'terminal' }
                ]
              },
              { rotulo: "DELIM_PONTO: '.'", tipo: 'terminal' }
            ]
          },
          {
            rotulo: '<Fatos #2..#5>',
            nota: 'linhas 3–6',
            filhos: [
              { rotulo: 'pai(joao, pedro).', tipo: 'terminal' },
              { rotulo: 'mae(ana, maria).', tipo: 'terminal' },
              { rotulo: 'pai(pedro, lucas).', tipo: 'terminal' },
              { rotulo: 'pai(pedro, sofia).', tipo: 'terminal' }
            ]
          },
          {
            rotulo: '<Regra #6>',
            nota: 'linhas 8–10',
            filhos: [
              {
                rotulo: '<Cabeca>',
                filhos: [
                  { rotulo: 'ATOMO: avo', tipo: 'terminal' },
                  { rotulo: '<ListaArgs>: X, Y', tipo: 'terminal' }
                ]
              },
              { rotulo: "OP_IMPLICA: ':-'", tipo: 'terminal' },
              {
                rotulo: '<Corpo>',
                filhos: [
                  { rotulo: '<Objetivo #1>: pai(X, Z)', tipo: 'terminal' },
                  { rotulo: "OP_CONJUNCAO: ','", tipo: 'terminal' },
                  { rotulo: '<Objetivo #2>: pai(Z, Y)', tipo: 'terminal' }
                ]
              },
              { rotulo: "DELIM_PONTO: '.'", tipo: 'terminal' }
            ]
          }
        ]
      }
    },
    diagnosticoBadge: '0',
    diagnostico: {
      tipo: 'ok',
      codigo: 'OK-000',
      titulo: 'Compilação concluída sem erros',
      fase: 'Léxica + Sintática',
      local: 'Linhas 1–10',
      lexema: '6 cláusulas',
      mensagem: 'Todas as cláusulas foram aceitas e carregadas na base de conhecimento.',
      trecho: 'Base carregada: pai/2 (4 fatos), mae/2 (1 fato), avo/2 (1 regra).',
      sugestao: 'Execute uma consulta no painel Consulta.'
    },
    consoleCompilar: {
      banner: 'COMPILAÇÃO CONCLUÍDA',
      bannerClasse: 'ok',
      linhas: [
        'genealogia.pl: 56 tokens, 12 símbolos, 6 cláusulas carregadas.'
      ]
    },
    consoleConsulta: {
      banner: 'CONSULTA',
      bannerClasse: 'ok',
      linhas: [
        '?- avo(joao, Neto).',
        '',
        'Neto = lucas ;',
        'Neto = sofia.',
        'true.'
      ]
    }
  },

  'erro-lexico': {
    id: 'erro-lexico',
    titulo: 'Erro léxico',
    arquivo: 'erro_lexico.pl',
    maquinaTag: { texto: 'Erro · LEX-001', classe: 'ouro' },
    abaInicial: 'diagnostico',
    codigo: [
      '% Exemplo com erro lexico: simbolo fora do alfabeto',
      'pai(joao, maria).',
      'mae(ana, maria).',
      'avo(X, Y) :-',
      '    pai(X, $Z),',
      '    pai(Z, Y).'
    ].join('\n'),
    consulta: 'avo(joao, Neto).',
    tokens: [
      { n: 1, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '2:1', sym: 'S1' },
      { n: 2, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '2:4', sym: '–' },
      { n: 3, lexema: 'joao', classe: 'ATOMO', tipo: 'ok', pos: '2:5', sym: 'S2' },
      { n: 4, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '2:9', sym: '–' },
      { n: 5, lexema: 'maria', classe: 'ATOMO', tipo: 'ok', pos: '2:11', sym: 'S3' },
      { n: 6, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '2:16', sym: '–' },
      { n: 7, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '2:17', sym: '–' },

      { n: 8, lexema: 'mae', classe: 'ATOMO', tipo: 'ok', pos: '3:1', sym: 'S4' },
      { n: 9, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '3:4', sym: '–' },
      { n: 10, lexema: 'ana', classe: 'ATOMO', tipo: 'ok', pos: '3:5', sym: 'S5' },
      { n: 11, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '3:8', sym: '–' },
      { n: 12, lexema: 'maria', classe: 'ATOMO', tipo: 'ok', pos: '3:10', sym: 'S3' },
      { n: 13, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '3:15', sym: '–' },
      { n: 14, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '3:16', sym: '–' },

      { n: 15, lexema: 'avo', classe: 'ATOMO', tipo: 'ok', pos: '4:1', sym: 'S6' },
      { n: 16, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '4:4', sym: '–' },
      { n: 17, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '4:5', sym: 'S7' },
      { n: 18, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '4:6', sym: '–' },
      { n: 19, lexema: 'Y', classe: 'VARIAVEL', tipo: 'var', pos: '4:8', sym: 'S8' },
      { n: 20, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '4:9', sym: '–' },
      { n: 21, lexema: ':-', classe: 'OP_IMPLICA', tipo: 'op', pos: '4:11', sym: '–' },

      { n: 22, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '5:5', sym: 'S1' },
      { n: 23, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '5:8', sym: '–' },
      { n: 24, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '5:9', sym: 'S7' },
      { n: 25, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '5:10', sym: '–' },
      { n: 26, lexema: '$', classe: 'ERRO_LEXICO', tipo: 'err', pos: '5:12', sym: 'ERRO', erro: true }
    ],
    simbolos: [
      { id: 'S1', lexema: 'pai', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '2, 5' },
      { id: 'S2', lexema: 'joao', categoria: 'Átomo', detalhe: 'constante', linhas: '2' },
      { id: 'S3', lexema: 'maria', categoria: 'Átomo', detalhe: 'constante', linhas: '2, 3' },
      { id: 'S4', lexema: 'mae', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '3' },
      { id: 'S5', lexema: 'ana', categoria: 'Átomo', detalhe: 'constante', linhas: '3' },
      { id: 'S6', lexema: 'avo', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '4' },
      { id: 'S7', lexema: 'X', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '4, 5' },
      { id: 'S8', lexema: 'Y', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '4' }
    ],
    arvoreBadge: '✖',
    arvore: null,
    arvoreIndisponivel: 'Árvore não gerada devido ao erro léxico LEX-001 (linha 5, coluna 12).',
    diagnosticoBadge: '1',
    diagnostico: {
      tipo: 'lex',
      codigo: 'LEX-001',
      titulo: 'Símbolo fora do alfabeto',
      fase: 'Análise Léxica (AFD)',
      local: 'Linha 5, Coluna 12',
      lexema: '$',
      mensagem: 'Caractere "$" rejeitado pelo analisador léxico a partir do estado q0.',
      trecho: '5 |     pai(X, $Z),\n               ^ caractere inválido',
      sugestao: 'Substitua "$Z" por uma variável válida, como "Z".'
    },
    consoleCompilar: {
      banner: 'ERRO LÉXICO · LEX-001',
      bannerClasse: 'err',
      linhas: [
        'erro_lexico.pl:5:12: caractere inválido \'$\'.'
      ]
    },
    consoleConsulta: {
      banner: 'CONSULTA BLOQUEADA',
      bannerClasse: 'err',
      linhas: [
        '?- avo(joao, Neto).',
        'Corrija o erro léxico (LEX-001) antes de consultar.'
      ]
    }
  },

  'erro-sintatico': {
    id: 'erro-sintatico',
    titulo: 'Erro sintático',
    arquivo: 'erro_sintatico.pl',
    maquinaTag: { texto: 'Erro · SIN-002', classe: 'coral' },
    abaInicial: 'diagnostico',
    codigo: [
      '% Exemplo com erro sintatico: parentese nao fechado antes de :-',
      'pai(joao, maria).',
      'pai(pedro, lucas).',
      'avo(X, Y :-',
      '    pai(X, Z),',
      '    pai(Z, Y).'
    ].join('\n'),
    consulta: 'avo(joao, Neto).',
    tokens: [
      { n: 1, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '2:1', sym: 'S1' },
      { n: 2, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '2:4', sym: '–' },
      { n: 3, lexema: 'joao', classe: 'ATOMO', tipo: 'ok', pos: '2:5', sym: 'S2' },
      { n: 4, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '2:9', sym: '–' },
      { n: 5, lexema: 'maria', classe: 'ATOMO', tipo: 'ok', pos: '2:11', sym: 'S3' },
      { n: 6, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '2:16', sym: '–' },
      { n: 7, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '2:17', sym: '–' },

      { n: 8, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '3:1', sym: 'S1' },
      { n: 9, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '3:4', sym: '–' },
      { n: 10, lexema: 'pedro', classe: 'ATOMO', tipo: 'ok', pos: '3:5', sym: 'S4' },
      { n: 11, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '3:10', sym: '–' },
      { n: 12, lexema: 'lucas', classe: 'ATOMO', tipo: 'ok', pos: '3:12', sym: 'S5' },
      { n: 13, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '3:17', sym: '–' },
      { n: 14, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '3:18', sym: '–' },

      { n: 15, lexema: 'avo', classe: 'ATOMO', tipo: 'ok', pos: '4:1', sym: 'S6' },
      { n: 16, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '4:4', sym: '–' },
      { n: 17, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '4:5', sym: 'S7' },
      { n: 18, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '4:6', sym: '–' },
      { n: 19, lexema: 'Y', classe: 'VARIAVEL', tipo: 'var', pos: '4:8', sym: 'S8' },
      { n: 20, lexema: ':-', classe: 'OP_IMPLICA', tipo: 'op', pos: '4:10', sym: '–', erro: true },

      { n: 21, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '5:5', sym: 'S1' },
      { n: 22, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '5:8', sym: '–' },
      { n: 23, lexema: 'X', classe: 'VARIAVEL', tipo: 'var', pos: '5:9', sym: 'S7' },
      { n: 24, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '5:10', sym: '–' },
      { n: 25, lexema: 'Z', classe: 'VARIAVEL', tipo: 'var', pos: '5:12', sym: 'S9' },
      { n: 26, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '5:13', sym: '–' },
      { n: 27, lexema: ',', classe: 'OP_CONJUNCAO', tipo: 'op', pos: '5:14', sym: '–' },

      { n: 28, lexema: 'pai', classe: 'ATOMO', tipo: 'ok', pos: '6:5', sym: 'S1' },
      { n: 29, lexema: '(', classe: 'DELIM_ABRE_PAR', tipo: 'delim', pos: '6:8', sym: '–' },
      { n: 30, lexema: 'Z', classe: 'VARIAVEL', tipo: 'var', pos: '6:9', sym: 'S9' },
      { n: 31, lexema: ',', classe: 'DELIM_VIRGULA', tipo: 'delim', pos: '6:10', sym: '–' },
      { n: 32, lexema: 'Y', classe: 'VARIAVEL', tipo: 'var', pos: '6:12', sym: 'S8' },
      { n: 33, lexema: ')', classe: 'DELIM_FECHA_PAR', tipo: 'delim', pos: '6:13', sym: '–' },
      { n: 34, lexema: '.', classe: 'DELIM_PONTO', tipo: 'delim', pos: '6:14', sym: '–' }
    ],
    simbolos: [
      { id: 'S1', lexema: 'pai', categoria: 'Predicado', detalhe: 'aridade 2', linhas: '2, 3, 5, 6' },
      { id: 'S2', lexema: 'joao', categoria: 'Átomo', detalhe: 'constante', linhas: '2' },
      { id: 'S3', lexema: 'maria', categoria: 'Átomo', detalhe: 'constante', linhas: '2' },
      { id: 'S4', lexema: 'pedro', categoria: 'Átomo', detalhe: 'constante', linhas: '3' },
      { id: 'S5', lexema: 'lucas', categoria: 'Átomo', detalhe: 'constante', linhas: '3' },
      { id: 'S6', lexema: 'avo', categoria: 'Predicado', detalhe: 'cabeça incompleta', linhas: '4' },
      { id: 'S7', lexema: 'X', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '4, 5' },
      { id: 'S8', lexema: 'Y', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '4, 6' },
      { id: 'S9', lexema: 'Z', categoria: 'Variável', detalhe: 'escopo avo/2', linhas: '5, 6' }
    ],
    arvoreBadge: 'Parcial',
    arvore: {
      resumo: 'Derivação parcial até a linha 4, coluna 10.',
      raiz: {
        rotulo: '<Programa>',
        filhos: [
          { rotulo: '<Fato #1>: pai(joao, maria).', tipo: 'terminal' },
          { rotulo: '<Fato #2>: pai(pedro, lucas).', tipo: 'terminal' },
          {
            rotulo: '<Clausula #3>',
            nota: 'linha 4',
            filhos: [
              {
                rotulo: '<Predicado>',
                filhos: [
                  { rotulo: 'ATOMO: avo', tipo: 'terminal' },
                  { rotulo: "DELIM_ABRE_PAR: '('", tipo: 'terminal' },
                  { rotulo: '<ListaArgs>: X, Y', tipo: 'terminal' },
                  { rotulo: "✖ Esperado ')' ou ',' — encontrado ':-' (4:10)", tipo: 'erro' }
                ]
              }
            ]
          }
        ]
      }
    },
    diagnosticoBadge: '1',
    diagnostico: {
      tipo: 'sin',
      codigo: 'SIN-002',
      titulo: 'Delimitador ")" ausente na cabeça da regra',
      fase: 'Análise Sintática (GLC)',
      local: 'Linha 4, Coluna 10',
      lexema: ':- (OP_IMPLICA)',
      mensagem: 'Esperado ")" ou "," após o argumento Y em <Predicado>, encontrado ":-".',
      trecho: '4 | avo(X, Y :-\n             ^^ esperado ")" antes de ":-"',
      sugestao: 'Feche os parênteses escrevendo "avo(X, Y) :-" na linha 4.'
    },
    consoleCompilar: {
      banner: 'ERRO SINTÁTICO · SIN-002',
      bannerClasse: 'err',
      linhas: [
        'erro_sintatico.pl:4:10: esperado \')\' antes de \':-\'.'
      ]
    },
    consoleConsulta: {
      banner: 'CONSULTA BLOQUEADA',
      bannerClasse: 'err',
      linhas: [
        '?- avo(joao, Neto).',
        'Corrija o erro sintático (SIN-002) antes de consultar.'
      ]
    }
  }
};
