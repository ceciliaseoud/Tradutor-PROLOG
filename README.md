# Tradutor Prolog

Ambiente web para analisar programas e executar consultas em um subconjunto de Prolog.

## Como executar

Na pasta do projeto, execute o comando abaixo com Node.js 18 ou mais recente.

```sh
node server.js
```

Abra [o interpretador local](http://127.0.0.1:3000). Clique em **Compilar** para ver tokens, tabela de símbolos, árvore sintática e diagnósticos. Clique em **Executar consulta** ou pressione Enter no campo da consulta para ver o resultado.

## Subconjunto implementado

- Fatos, regras, termos compostos, variáveis, comentários e átomos entre aspas simples.
- Unificação de termos finitos, conjunção, disjunção, recursão e busca de soluções por backtracking.
- Aritmética com `is`, `+`, `-`, `*`, `/` e comparações numéricas.
- Saída com `write/1`, `writeln/1` e `nl/0`.

O programa exige um ponto após cada fato ou regra. A consulta aceita o prefixo `?-` e o ponto final como opcionais. Uma consulta sem variáveis nomeadas retorna ao encontrar a primeira prova. As demais retornam até 100 soluções, dentro dos limites de passos, profundidade e saída do interpretador.

## API local

- `POST /api/compilar` recebe `{"codigo":"pai(joao, maria)."}` e retorna os tokens, o marcador de fim, os símbolos, a árvore e os diagnósticos.
- `POST /api/consultar` recebe `{"codigo":"pai(joao, maria).","consulta":"pai(joao, X)."}` e retorna as soluções, a saída e os erros. Uma lista vazia de soluções em uma consulta concluída indica `false`.

O servidor e o interpretador ficam em `server.js` e usam apenas módulos nativos do Node.js.