# Tradutor-PROLOG — Interface Web (Item 4)

Protótipo frontend local da **Interface do Tradutor** (item 4 do roteiro) para a linguagem **Prolog**, construído com HTML, CSS e JavaScript puros.

## Como abrir

Abra `index.html` diretamente no navegador (sem servidor ou build). Todas as saídas exibidas são **simuladas** a partir de dados fixos cadastrados em `exemplos.js`.

## Estrutura dos arquivos

- `index.html`: layout da IDE seguindo a **Aula 5** (**Editor Prolog** à esquerda; **Máquina**, **Consulta** e **Console** à direita, empilhados em telas estreitas).
- `style.css`: identidade visual **Web Retrô** (anos 90/2000) com paleta diversificada em tons pastéis, baseada na linguagem gráfica do projeto *Trabalho de AD*.
- `exemplos.js`: dados fixos simulados para três cenários cadastrados:
  - **Programa válido** (`genealogia.pl`): 56 tokens, 12 símbolos, árvore de derivação completa e resposta simulada no console (`Neto = lucas ; Neto = sofia.`).
  - **Erro léxico** (`erro_lexico.pl`): caractere inválido `$` na linha 5, coluna 12 (`LEX-001`), tabela parcial e bloqueio da árvore/consulta.
  - **Erro sintático** (`erro_sintatico.pl`): 34 tokens válidos, falha da GLC antes de `:-` na linha 4, coluna 10 (`SIN-002`) e árvore de derivação parcial.
- `app.js`: controles de carregamento de exemplos, compilação simulada, execução de consulta, navegação por teclado nas abas (`Tab`, `ArrowLeft`, `ArrowRight`, `Home`, `End`) e limpeza automática das saídas ao editar código ou consulta.

## Comportamento de edição

Ao alterar manualmente o código no **Editor Prolog** ou o texto em **Consulta**, as saídas anteriores da **Máquina** e do **Console** são limpas imediatamente e a interface orienta o usuário a carregar um dos exemplos cadastrados para testar os controles.
