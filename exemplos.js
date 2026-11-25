/* Entradas de exemplo para o editor Prolog. */
window.EXEMPLOS_PROLOG = {
  'valido': {
    titulo: "Programa válido",
    arquivo: "genealogia.pl",
    descricao: "Base genealógica válida com 5 fatos, 1 regra e consulta pronta para execução.",
    codigo: [
      "% Base de conhecimento: arvore genealogica",
      "pai(joao, maria).",
      "pai(joao, pedro).",
      "mae(ana, maria).",
      "pai(pedro, lucas).",
      "pai(pedro, sofia).",
      "",
      "avo(X, Y) :-",
      "    pai(X, Z),",
      "    pai(Z, Y)."
    ].join('\n'),
    consulta: "avo(joao, Neto)."
  },
  'erro-lexico': {
    titulo: "Erro léxico",
    arquivo: "erro_lexico.pl",
    descricao: "Introduz o caractere inválido \"$\" em pai(X, $Z) para demonstrar rejeição pelo AFD e diagnóstico léxico.",
    codigo: [
      "% Exemplo com erro lexico: simbolo fora do alfabeto",
      "pai(joao, maria).",
      "mae(ana, maria).",
      "avo(X, Y) :-",
      "    pai(X, $Z),",
      "    pai(Z, Y)."
    ].join('\n'),
    consulta: "avo(joao, Neto)."
  },
  'erro-sintatico': {
    titulo: "Erro sintático",
    arquivo: "erro_sintatico.pl",
    descricao: "Todos os tokens são válidos, mas falta \")\" antes de \":-\" em avo(X, Y :- para demonstrar erro na GLC.",
    codigo: [
      "% Exemplo com erro sintatico: parentese nao fechado antes de :-",
      "pai(joao, maria).",
      "pai(pedro, lucas).",
      "avo(X, Y :-",
      "    pai(X, Z),",
      "    pai(Z, Y)."
    ].join('\n'),
    consulta: "avo(joao, Neto)."
  }
};
