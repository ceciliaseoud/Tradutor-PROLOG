/* Controlador da interface do Tradutor PROLOG conectado ao backend local. */
(function () {
  const $ = id => document.getElementById(id);
  const EXEMPLOS = window.EXEMPLOS_PROLOG || {};

  const estado = {
    exemploId: 'personalizado',
    requisicao: 0,
    linhasErro: []
  };

  const abas = Array.from(document.querySelectorAll('.machine-tabs [role="tab"]'));
  const botoesExemplo = Array.from(document.querySelectorAll('.ex-btn'));

  function esc(valor) {
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function atualizarLinhas() {
    const texto = $('editorCodigo').value;
    const total = Math.max(1, texto.split('\n').length);
    const errosNormalizados = [...new Set(
      estado.linhasErro
        .filter(n => Number.isInteger(n) && n >= 1)
        .map(n => Math.min(n, total))
    )].sort((a, b) => a - b);
    const erros = new Set(errosNormalizados);
    const primeiraErro = errosNormalizados.length ? errosNormalizados[0] : -1;

    let gutterHtml = '';
    let backdropHtml = '';
    for (let i = 1; i <= total; i++) {
      const temErro = erros.has(i);
      const bolinha = i === primeiraErro ? '<span class="err-dot" aria-hidden="true"></span>' : '';
      gutterHtml += `<div class="gutter-line${temErro ? ' is-err' : ''}">${bolinha}<span>${i}</span></div>`;
      backdropHtml += `<div class="code-line-bg${temErro ? ' is-err' : ''}"></div>`;
    }

    $('editorLinhas').innerHTML = gutterHtml;
    $('editorBackdrop').innerHTML = backdropHtml;
    $('editorLinhas').scrollTop = $('editorCodigo').scrollTop;
    $('editorBackdrop').scrollTop = $('editorCodigo').scrollTop;
    $('editorMeta').textContent = `${total} ${total === 1 ? 'linha' : 'linhas'}`;
  }

  function setTag(id, texto, classe) {
    const el = $(id);
    if (!el) return;
    el.textContent = texto;
    el.className = `tag ${classe}`;
  }

  function marcarBotaoExemplo(id) {
    botoesExemplo.forEach(btn => {
      const ativo = btn.dataset.ex === id;
      btn.classList.toggle('on', ativo);
      btn.setAttribute('aria-pressed', String(ativo));
    });
  }

  function selecionarAba(nomeAba, focar) {
    abas.forEach(btn => {
      const ativa = btn.dataset.tab === nomeAba;
      btn.classList.toggle('on', ativa);
      btn.setAttribute('aria-selected', String(ativa));
      btn.tabIndex = ativa ? 0 : -1;
      const painel = $(btn.getAttribute('aria-controls'));
      if (painel) painel.hidden = !ativa;
      if (ativa && focar) btn.focus();
    });
  }

  function renderConsole(banner, bannerClasse, linhas) {
    $('consoleSaida').innerHTML =
      `<div class="console-banner ${esc(bannerClasse)}">${esc(banner)}</div>` +
      `<pre class="console-lines">${esc(linhas.join('\n'))}</pre>`;
  }

  function renderVazioMaquina(mensagem) {
    $('badgeTokens').textContent = '0';
    $('badgeSimbolos').textContent = '0';
    $('badgeArvore').textContent = '–';
    $('badgeDiag').textContent = '–';

    const bloco = `<div class="panel-empty"><p>${esc(mensagem || 'Aguardando compilação.')}</p></div>`;
    $('panel-tokens').innerHTML = bloco;
    $('panel-simbolos').innerHTML = bloco;
    $('panel-arvore').innerHTML = bloco;
    $('panel-diagnostico').innerHTML = bloco;
  }

  function renderTokens(tokens) {
    const classes = {
      atomo: ['Átomo', 'ok'],
      atomo_citado: ['Átomo entre aspas', 'ok'],
      variavel: ['Variável', 'var'],
      inteiro: ['Inteiro', 'ok'],
      decimal: ['Decimal', 'ok'],
      operador: ['Operador', 'op'],
      delimitador: ['Delimitador', 'delim']
    };
    const linhas = tokens.map((t, i) => {
      const [classe, cor] = classes[t.classe] || ['Inválido', 'err'];
      return `
      <tr class="${cor === 'err' ? 'row-err' : ''}">
        <td>${i + 1}</td>
        <td><strong>${esc(t.lexema)}</strong></td>
        <td><span class="tok-chip ${cor}">${classe}</span></td>
        <td>${t.linha}:${t.coluna}</td>
        <td>${esc(t.simbolo ?? '–')}</td>
      </tr>
    `;
    }).join('');

    $('panel-tokens').innerHTML = `
      <div class="tabela">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Lexema</th>
              <th>Token / Classe</th>
              <th>Linha:Col</th>
              <th>Símbolo</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;
  }

  function renderSimbolos(simbolos) {
    const linhas = simbolos.map(s => `
      <tr>
        <td><strong>${esc(s.id)}</strong></td>
        <td>${esc(s.lexema)}</td>
        <td><span class="tok-chip ${s.categoria === 'Variável' ? 'var' : 'ok'}">${esc(s.categoria)}</span></td>
        <td>${s.ocorrencias}</td>
        <td>${s.linhas.join(', ')}</td>
      </tr>
    `).join('');

    $('panel-simbolos').innerHTML = `
      <div class="tabela">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Lexema</th>
              <th>Categoria</th>
              <th>Ocorrências</th>
              <th>Linhas</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;
  }

  function renderNoArvore(no) {
    const tipoClasse = no.tipo ? ` ${esc(no.tipo)}` : '';
    const filhos = Array.isArray(no.filhos) && no.filhos.length
      ? `<ul>${no.filhos.map(renderNoArvore).join('')}</ul>`
      : '';
    return `<li><span class="tree-node${tipoClasse}">${esc(no.rotulo)}</span>${filhos}</li>`;
  }

  function renderArvore(arvore) {
    if (!arvore) {
      $('panel-arvore').innerHTML = `
        <div class="panel-empty">
          <span class="tag ouro">Indisponível</span>
          <p>Corrija os erros léxicos para gerar a árvore sintática.</p>
        </div>
      `;
      return;
    }

    $('panel-arvore').innerHTML = `
      <div class="tree-wrap">
        <ul class="tree-list">${renderNoArvore(arvore)}</ul>
      </div>
    `;
  }

  function renderDiagnosticos(diagnosticos, fonte) {
    if (!diagnosticos.length) {
      $('panel-diagnostico').innerHTML =
        '<div class="diag-box"><div class="diag-header ok"><strong>Programa analisado sem erros.</strong></div></div>';
      return;
    }
    const linhas = fonte.split(/\r\n?|\n/);
    $('panel-diagnostico').innerHTML = diagnosticos.map(d => {
      const linha = linhas[d.linha - 1] ?? '';
      const marcador = [...linha].slice(0, Math.max(0, d.coluna - 1)).map(c => c === '\t' ? '\t' : ' ').join('');
      const lexico = d.fase === 'léxica';
      return `
      <div class="diag-box">
        <div class="diag-header ${lexico ? 'lex' : 'sin'}">
          <strong>${esc(d.mensagem)}</strong>
          <span class="tag ${lexico ? 'ouro' : 'coral'}">${d.linha}:${d.coluna}</span>
        </div>
        <div class="diag-grid">
          <div class="diag-kv"><span>Etapa</span><strong>${lexico ? 'Análise Léxica' : 'Análise Sintática'}</strong></div>
          <div class="diag-kv"><span>Localização</span><strong>Linha ${d.linha}, Coluna ${d.coluna}</strong></div>
          <div class="diag-kv"><span>Elemento</span><strong>${esc(d.lexema || 'fim do arquivo')}</strong></div>
        </div>
        <pre class="diag-snippet">${esc(`${d.linha} | ${linha}\n${' '.repeat(String(d.linha).length + 3)}${marcador}^`)}</pre>
      </div>`;
    }).join('');
  }

  function ativarPersonalizado(limparCampos, focarEditor) {
    estado.exemploId = 'personalizado';
    estado.linhasErro = [];

    if (limparCampos) {
      $('editorCodigo').value = '';
      $('inputConsulta').value = '';
    }

    $('editorArquivo').textContent = 'personalizado.pl';
    marcarBotaoExemplo('personalizado');
    setTag('editorModo', 'Personalizado', 'lil');
    limparSaida('Escreva um código Prolog no editor ou escolha um exemplo.', 'Modo personalizado ativo.');
    selecionarAba('tokens', false);

    if (focarEditor) $('editorCodigo').focus();
  }

  function carregarExemplo(id) {
    if (id === 'personalizado') {
      ativarPersonalizado(true, true);
      return;
    }

    const ex = EXEMPLOS[id];
    if (!ex) return;

    estado.exemploId = id;
    estado.linhasErro = [];
    $('editorCodigo').value = ex.codigo;
    $('inputConsulta').value = ex.consulta;
    $('editorArquivo').textContent = ex.arquivo;
    marcarBotaoExemplo(id);
    setTag('editorModo', 'Exemplo', 'verdeC');
    limparSaida('Clique em Compilar para analisar o programa.', `${ex.arquivo} carregado.`);
    selecionarAba('tokens', false);
  }

  async function enviar(rota, dados) {
    const requisicao = ++estado.requisicao;
    try {
      const resposta = await fetch(rota, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.erro);
      return requisicao === estado.requisicao ? resultado : null;
    } catch (falha) {
      if (requisicao !== estado.requisicao) return null;
      const mensagem = falha instanceof TypeError
        ? 'Inicie o servidor com node server.js e abra http://127.0.0.1:3000.'
        : falha.message;
      setTag('consoleTag', 'Erro', 'coral');
      renderConsole('ERRO NA REQUISIÇÃO', 'err', [mensagem]);
      return null;
    }
  }

  async function compilar() {
    const codigo = $('editorCodigo').value;
    if (!codigo.trim()) {
      estado.linhasErro = [];
      atualizarLinhas();
      setTag('maquinaTag', 'Editor vazio', 'pessego');
      setTag('consoleTag', 'Aviso', 'pessego');
      renderVazioMaquina('Escreva um código Prolog no editor antes de compilar.');
      renderConsole('AVISO', 'edit', ['Escreva um código Prolog no editor antes de compilar.']);
      return;
    }

    const resultado = await enviar('/api/compilar', { codigo });
    if (!resultado) return;

    const { tokens, simbolos, arvore, diagnosticos, clausulas } = resultado;
    const erro = diagnosticos[0];
    const lexico = erro?.fase === 'léxica';
    const status = erro ? (lexico ? 'Erro léxico' : 'Erro sintático') : 'Compilado';

    estado.linhasErro = diagnosticos.map(d => d.linha);
    atualizarLinhas();

    renderTokens(tokens);
    renderSimbolos(simbolos);
    renderArvore(arvore);
    renderDiagnosticos(diagnosticos, codigo);

    $('badgeTokens').textContent = String(tokens.length);
    $('badgeSimbolos').textContent = String(simbolos.length);
    $('badgeArvore').textContent = arvore ? (erro ? 'Parcial' : 'OK') : '✖';
    $('badgeDiag').textContent = String(diagnosticos.length);

    setTag('maquinaTag', status, erro ? (lexico ? 'ouro' : 'coral') : 'verde');
    setTag('consoleTag', erro ? 'Erro' : 'OK', erro ? 'coral' : 'verde');

    renderConsole(
      status.toUpperCase(),
      erro ? 'err' : 'ok',
      erro
        ? diagnosticos.map(d => `${d.linha}:${d.coluna} · ${d.mensagem}`)
        : [`${$('editorArquivo').textContent}: ${tokens.length} tokens, ${simbolos.length} símbolos, ${clausulas} cláusula(s).`]
    );
    selecionarAba(erro ? 'diagnostico' : 'tokens', false);
  }

  async function executarConsulta() {
    const codigo = $('editorCodigo').value;
    const consulta = $('inputConsulta').value;
    if (!consulta.trim()) {
      setTag('consoleTag', 'Aviso', 'pessego');
      renderConsole('AVISO', 'edit', ['Informe uma consulta antes de executar.']);
      return;
    }

    const resultado = await enviar('/api/consultar', { codigo, consulta });
    if (!resultado) return;

    const linhas = [`?- ${consulta.trim().replace(/^\?-\s*/, '')}`, ''];
    const { diagnosticos, origem, solucoes, saida, erro, limitada } = resultado;
    if (saida) linhas.push(saida.replace(/\n$/, ''));
    if (diagnosticos) {
      if (origem === 'programa') {
        estado.linhasErro = diagnosticos.map(d => d.linha);
        atualizarLinhas();
      }
      for (const d of diagnosticos) {
        linhas.push(`Erro (${d.linha}:${d.coluna}): ${d.mensagem}`);
      }
    } else {
      const respostas = solucoes.map(s => Object.entries(s).map(([nome, valor]) => `${nome} = ${valor}`).join(', ') || 'true');
      if (respostas.length) linhas.push(`${respostas.join(' ;\n')}.`);
      else if (!erro) linhas.push('false.');
      if (limitada) linhas.push('Exibindo as primeiras 100 soluções.');
      if (erro) linhas.push(erro);
    }

    const falhou = Boolean(erro || diagnosticos);
    renderConsole(falhou ? 'CONSULTA INTERROMPIDA' : 'CONSULTA', falhou ? 'err' : 'ok', linhas);
    setTag('consoleTag', falhou ? 'Erro' : 'OK', falhou ? 'coral' : 'verde');
  }

  function limparSaida(msgMaquina, msgConsole) {
    estado.requisicao++;
    estado.linhasErro = [];
    atualizarLinhas();
    setTag('maquinaTag', 'Aguardando', 'creme');
    setTag('consoleTag', 'Pronto', 'creme');
    renderVazioMaquina(msgMaquina || 'Saída limpa.');
    renderConsole('PRONTO', 'edit', [msgConsole || 'Saída limpa.']);
  }

  function aoEditar() {
    if (estado.exemploId !== 'personalizado') {
      ativarPersonalizado(false, false);
    } else if (estado.linhasErro.length) {
      limparSaida('Aguardando compilação.', 'Pronto.');
    } else {
      atualizarLinhas();
    }
  }

  /* Eventos dos controles */
  botoesExemplo.forEach(btn => {
    btn.addEventListener('click', () => carregarExemplo(btn.dataset.ex));
  });

  $('btnCompilar').addEventListener('click', compilar);
  $('btnExecutar').addEventListener('click', executarConsulta);
  $('btnLimpar').addEventListener('click', () => limparSaida('Saída limpa.', 'Saída limpa.'));

  $('editorCodigo').addEventListener('input', aoEditar);
  $('editorCodigo').addEventListener('scroll', () => {
    const top = $('editorCodigo').scrollTop;
    $('editorLinhas').scrollTop = top;
    $('editorBackdrop').scrollTop = top;
  });

  $('inputConsulta').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executarConsulta();
    }
  });

  /* Navegação por teclado nas abas da Máquina (WAI-ARIA Tabs) */
  abas.forEach((btn, idx) => {
    btn.addEventListener('click', () => selecionarAba(btn.dataset.tab, false));
    btn.addEventListener('keydown', e => {
      let alvo = -1;
      if (e.key === 'ArrowRight') alvo = (idx + 1) % abas.length;
      else if (e.key === 'ArrowLeft') alvo = (idx - 1 + abas.length) % abas.length;
      else if (e.key === 'Home') alvo = 0;
      else if (e.key === 'End') alvo = abas.length - 1;
      if (alvo >= 0) {
        e.preventDefault();
        selecionarAba(abas[alvo].dataset.tab, true);
      }
    });
  });

  /* Estado inicial: Personalizado pronto para escrever ou escolher um exemplo */
  ativarPersonalizado(true, false);
})();
