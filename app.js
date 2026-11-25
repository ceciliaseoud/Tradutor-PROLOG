/* Controlador da interface do Tradutor Prolog. */
(function () {
  const $ = id => document.getElementById(id);
  const EXEMPLOS = window.EXEMPLOS_PROLOG || {};

  const estado = { exemploId: 'valido', fase: 'carregado', requisicao: 0 };

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

  function atualizarLinhas(notaExtra) {
    const texto = $('editorCodigo').value;
    const total = Math.max(1, texto.split('\n').length);
    let numeros = '';
    for (let i = 1; i <= total; i++) {
      numeros += i === total ? String(i) : `${i}\n`;
    }
    $('editorLinhas').textContent = numeros;
    $('editorMeta').textContent = `${total} ${total === 1 ? 'linha' : 'linhas'} · ${notaExtra}`;
  }

  function setTag(id, texto, classe) {
    const el = $(id);
    el.textContent = texto;
    el.className = `tag ${classe}`;
  }

  function setPipeline(mapa) {
    const chaves = [
      ['programa', 'pipePrograma'],
      ['lexico', 'pipeLexico'],
      ['sintatico', 'pipeSintatico'],
      ['maquina', 'pipeMaquina'],
      ['console', 'pipeConsole']
    ];
    for (const [stage, outId] of chaves) {
      const cfg = mapa[stage] || { texto: 'Aguardando', classe: '' };
      const item = document.querySelector(`.pipe-step[data-stage="${stage}"]`);
      if (item) {
        item.className = `pipe-step${cfg.classe ? ' ' + cfg.classe : ''}`;
      }
      $(outId).textContent = cfg.texto;
    }
  }

  function atualizarCardsEstado() {
    document.querySelectorAll('#estados [data-e]').forEach(card => {
      card.classList.toggle('atual', card.dataset.e === estado.fase);
    });
  }

  function selecionarAba(nomeAba, focar) {
    abas.forEach(btn => {
      const ativa = btn.dataset.tab === nomeAba;
      btn.classList.toggle('on', ativa);
      btn.setAttribute('aria-selected', ativa ? 'true' : 'false');
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

  function renderVazioMaquina() {
    $('badgeTokens').textContent = '0';
    $('badgeSimbolos').textContent = '0';
    $('badgeArvore').textContent = '–';
    $('badgeDiag').textContent = '–';

    const bloco = '<div class="panel-empty"><p>Clique em <strong>Compilar</strong> para analisar o programa do editor.</p></div>';

    $('panel-tokens').innerHTML = bloco;
    $('panel-simbolos').innerHTML = bloco;
    $('panel-arvore').innerHTML = bloco;
    $('panel-diagnostico').innerHTML = bloco;
  }

  function renderTokens(tokens) {
    const classes = { atomo: ['Átomo', 'ok'], atomo_citado: ['Átomo entre aspas', 'ok'], variavel: ['Variável', 'var'],
      inteiro: ['Inteiro', 'ok'], decimal: ['Decimal', 'ok'], operador: ['Operador', 'op'], delimitador: ['Delimitador', 'delim'] };
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
      $('panel-diagnostico').innerHTML = '<div class="diag-box"><div class="diag-header ok">Programa analisado sem erros.</div></div>';
      return;
    }
    const linhas = fonte.split(/\r\n?|\n/);
    $('panel-diagnostico').innerHTML = diagnosticos.map(d => {
      const linha = linhas[d.linha - 1] ?? '';
      const marcador = [...linha].slice(0, d.coluna - 1).map(c => c === '\t' ? '\t' : ' ').join('');
      return `
      <div class="diag-box">
        <div class="diag-header ${d.fase === 'léxica' ? 'lex' : 'sin'}">
          <strong>${esc(d.mensagem)}</strong><span class="mono">${d.linha}:${d.coluna}</span>
        </div>
        <pre class="diag-snippet">${esc(`${linha}\n${marcador}^`)}</pre>
      </div>`;
    }).join('');
  }

  function carregarExemplo(id) {
    const ex = EXEMPLOS[id];
    if (!ex) return;
    estado.exemploId = id;
    $('editorCodigo').value = ex.codigo;
    $('inputConsulta').value = ex.consulta;
    $('editorArquivo').textContent = ex.arquivo;
    $('exemploDesc').textContent = ex.descricao;
    $('exemploAtivoInfo').textContent = `Exemplo ativo: ${ex.titulo}`;
    $('avisoEdicao').hidden = true;
    botoesExemplo.forEach(btn => {
      const ativo = btn.dataset.ex === id;
      btn.classList.toggle('on', ativo);
      btn.setAttribute('aria-pressed', String(ativo));
    });
    limparSaida();
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
      const mensagem = falha instanceof TypeError ? 'Inicie o servidor com node server.js e abra http://127.0.0.1:3000.' : falha.message;
      setTag('consoleTag', 'Erro de comunicação', 'coral');
      renderConsole('ERRO NA REQUISIÇÃO', 'err', [mensagem]);
      return null;
    }
  }

  async function compilar() {
    const codigo = $('editorCodigo').value;
    const resultado = await enviar('/api/compilar', { codigo });
    if (!resultado) return;
    const { tokens, simbolos, arvore, diagnosticos, clausulas } = resultado;
    const erro = diagnosticos[0], lexico = erro?.fase === 'léxica';
    const status = erro ? (lexico ? 'Erro léxico' : 'Erro sintático') : 'Compilado';
    estado.fase = erro ? (lexico ? 'erro-lexico' : 'erro-sintatico') : 'compilado';

    renderTokens(tokens);
    renderSimbolos(simbolos);
    renderArvore(arvore);
    renderDiagnosticos(diagnosticos, codigo);
    $('badgeTokens').textContent = tokens.length;
    $('badgeSimbolos').textContent = simbolos.length;
    $('badgeArvore').textContent = arvore ? (erro ? 'Parcial' : '✓') : '–';
    $('badgeDiag').textContent = diagnosticos.length;
    setTag('statusGlobal', status, erro ? 'coral' : 'verde');
    setTag('maquinaTag', status, erro ? 'coral' : 'verde');
    setTag('consoleTag', erro ? 'Bloqueada' : 'Pronto', erro ? 'coral' : 'verde');
    $('maquinaResumo').textContent = erro ? 'Corrija o código no editor.' : `${clausulas} cláusula(s) disponível(is) para consulta.`;

    renderConsole(status.toUpperCase(), erro ? 'err' : 'ok', erro
      ? diagnosticos.map(d => `${d.linha}:${d.coluna} · ${d.mensagem}`)
      : ['Clique em Executar consulta para consultar a base.']);
    setPipeline({
      programa: { texto: 'Analisado', classe: 'ok' },
      lexico: { texto: lexico ? 'Erro léxico' : `${tokens.length} tokens`, classe: lexico ? 'erro' : 'ok' },
      sintatico: { texto: lexico ? 'Aguardando' : erro ? 'Erro sintático' : 'Válido', classe: lexico ? '' : erro ? 'erro' : 'ok' },
      maquina: { texto: erro ? 'Bloqueada' : `${clausulas} cláusulas`, classe: erro ? 'erro' : 'ok' },
      console: { texto: erro ? 'Bloqueado' : 'Pronto', classe: erro ? 'erro' : 'ativo' }
    });
    selecionarAba(erro ? 'diagnostico' : 'tokens', false);
    atualizarLinhas(erro ? status : 'sem erros');
    atualizarCardsEstado();
  }

  async function executarConsulta() {
    const codigo = $('editorCodigo').value, consulta = $('inputConsulta').value;
    const resultado = await enviar('/api/consultar', { codigo, consulta });
    if (!resultado) return;
    const linhas = [`?- ${consulta.trim().replace(/^\?-\s*/, '')}`, ''];
    const { diagnosticos, origem, solucoes, saida, erro, limitada } = resultado;
    if (saida) linhas.push(saida.replace(/\n$/, ''));
    if (diagnosticos) {
      for (const d of diagnosticos) linhas.push(`Erro no ${origem === 'programa' ? 'programa' : 'texto da consulta'} (${d.linha}:${d.coluna}). ${d.mensagem}`);
    } else {
      const respostas = solucoes.map(s => Object.entries(s).map(([nome, valor]) => `${nome} = ${valor}`).join(', ') || 'true');
      if (respostas.length) linhas.push(`${respostas.join(' ;\n')}.`);
      else if (!erro) linhas.push('false.');
      if (limitada) linhas.push('Exibindo as primeiras 100 soluções.');
      if (erro) linhas.push(erro);
    }
    const falhou = Boolean(erro || diagnosticos);
    renderConsole(falhou ? 'CONSULTA INTERROMPIDA' : 'RESULTADO DA CONSULTA', falhou ? 'err' : 'ok', linhas);
    setTag('consoleTag', falhou ? 'Consulta interrompida' : 'Consulta concluída', falhou ? 'coral' : 'verde');
    $('pipeConsole').textContent = falhou ? 'Interrompida' : `${solucoes.length} solução(ões)`;
    $('pipeConsole').parentElement.className = `pipe-step ${falhou ? 'erro' : 'ok'}`;
  }

  function limparSaida() {
    estado.requisicao++;
    const exemplo = estado.exemploId !== null;
    estado.fase = exemplo ? 'carregado' : 'editado';
    setTag('statusGlobal', exemplo ? 'Exemplo carregado' : 'Editado', exemplo ? 'lil' : 'pessego');
    setTag('editorModo', exemplo ? 'Exemplo cadastrado' : 'Editado manualmente', exemplo ? 'verdeC' : 'pessego');
    setTag('maquinaTag', 'Aguardando compilação', 'creme');
    setTag('consoleTag', 'Pronto', 'ouro');
    $('maquinaResumo').textContent = 'Clique em Compilar para analisar o código atual.';
    renderVazioMaquina();
    renderConsole('PRONTO', 'edit', ['Clique em Executar consulta para consultar o programa do editor.']);
    setPipeline({ programa: { texto: exemplo ? 'Carregado' : 'Editado', classe: exemplo ? 'ativo' : 'editado' } });
    atualizarLinhas('aguardando compilação');
    atualizarCardsEstado();
  }

  function aoEditar() {
    estado.exemploId = null;
    botoesExemplo.forEach(btn => {
      btn.classList.remove('on');
      btn.setAttribute('aria-pressed', 'false');
    });
    $('exemploAtivoInfo').textContent = 'Conteúdo editado';
    $('avisoEdicao').hidden = false;
    limparSaida();
  }

  /* Eventos dos controles */
  botoesExemplo.forEach(btn => {
    btn.addEventListener('click', () => carregarExemplo(btn.dataset.ex));
  });

  $('btnCompilar').addEventListener('click', compilar);
  $('topCompilar').addEventListener('click', compilar);
  $('btnExecutar').addEventListener('click', executarConsulta);
  $('topExecutar').addEventListener('click', executarConsulta);
  $('btnLimpar').addEventListener('click', limparSaida);
  $('topLimpar').addEventListener('click', limparSaida);
  $('btnRecarregarValido').addEventListener('click', () => carregarExemplo('valido'));

  $('editorCodigo').addEventListener('input', aoEditar);
  $('editorCodigo').addEventListener('scroll', () => {
    $('editorLinhas').scrollTop = $('editorCodigo').scrollTop;
  });

  $('inputConsulta').addEventListener('input', aoEditar);
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

  /* Estado inicial */
  carregarExemplo('valido');
})();