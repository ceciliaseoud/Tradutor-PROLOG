/* Controlador da interface do Tradutor PROLOG. */
(function () {
  const $ = id => document.getElementById(id);
  const EXEMPLOS = window.EXEMPLOS_PROLOG || {};

  const estado = {
    exemploId: 'personalizado',
    compilado: false,
    abaAtiva: 'tokens'
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
    let numeros = '';
    for (let i = 1; i <= total; i++) {
      numeros += i === total ? String(i) : `${i}\n`;
    }
    $('editorLinhas').textContent = numeros;
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
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
  }

  function selecionarAba(nomeAba, focar) {
    estado.abaAtiva = nomeAba;
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
    const linhas = tokens.map(t => `
      <tr class="${t.erro ? 'row-err' : ''}">
        <td>${t.n}</td>
        <td><strong>${esc(t.lexema)}</strong></td>
        <td><span class="tok-chip ${esc(t.tipo)}">${esc(t.classe)}</span></td>
        <td>${esc(t.pos)}</td>
        <td>${esc(t.sym)}</td>
      </tr>
    `).join('');

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
        <td>${esc(s.detalhe)}</td>
        <td>${esc(s.linhas)}</td>
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
              <th>Detalhe</th>
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
    const nota = no.nota ? `<small>(${esc(no.nota)})</small>` : '';
    const filhos = Array.isArray(no.filhos) && no.filhos.length
      ? `<ul>${no.filhos.map(renderNoArvore).join('')}</ul>`
      : '';
    return `<li><span class="tree-node${tipoClasse}">${esc(no.rotulo)}${nota}</span>${filhos}</li>`;
  }

  function renderArvore(ex) {
    if (!ex.arvore) {
      $('panel-arvore').innerHTML = `
        <div class="panel-empty">
          <span class="tag ouro">Indisponível</span>
          <p>${esc(ex.arvoreIndisponivel)}</p>
        </div>
      `;
      return;
    }

    $('panel-arvore').innerHTML = `
      <div class="tree-wrap">
        <div class="tree-meta">
          <span class="tag lil">GLC</span>
          <span class="mono">${esc(ex.arvore.resumo)}</span>
        </div>
        <ul class="tree-list">
          ${renderNoArvore(ex.arvore.raiz)}
        </ul>
      </div>
    `;
  }

  function renderDiagnostico(diag) {
    const badgeClasse = diag.tipo === 'ok' ? 'verde' : diag.tipo === 'lex' ? 'ouro' : 'coral';
    $('panel-diagnostico').innerHTML = `
      <div class="diag-box">
        <div class="diag-header ${esc(diag.tipo)}">
          <strong>${esc(diag.titulo)}</strong>
          <span class="tag ${badgeClasse}">${esc(diag.codigo)}</span>
        </div>
        <div class="diag-grid">
          <div class="diag-kv"><span>Etapa</span><strong>${esc(diag.fase)}</strong></div>
          <div class="diag-kv"><span>Localização</span><strong>${esc(diag.local)}</strong></div>
          <div class="diag-kv"><span>Elemento</span><strong>${esc(diag.lexema)}</strong></div>
        </div>
        <p class="note" style="margin:0;color:var(--preto);font-size:13px">${esc(diag.mensagem)}</p>
        <pre class="diag-snippet">${esc(diag.trecho)}</pre>
        <p class="diag-hint"><strong>Sugestão:</strong> ${esc(diag.sugestao)}</p>
      </div>
    `;
  }

  function ativarPersonalizado(limparCampos, focarEditor) {
    estado.exemploId = 'personalizado';
    estado.compilado = false;

    if (limparCampos) {
      $('editorCodigo').value = '';
      $('inputConsulta').value = '';
    }

    $('editorArquivo').textContent = 'personalizado.pl';
    marcarBotaoExemplo('personalizado');
    setTag('editorModo', 'Personalizado', 'lil');
    setTag('maquinaTag', 'Aguardando', 'creme');
    setTag('consoleTag', 'Pronto', 'creme');

    renderVazioMaquina('Escreva um código Prolog no editor ou escolha um exemplo.');
    selecionarAba('tokens', false);
    renderConsole('PRONTO', 'edit', ['Modo personalizado ativo.']);
    atualizarLinhas();

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
    estado.compilado = false;

    $('editorCodigo').value = ex.codigo;
    $('inputConsulta').value = ex.consulta;
    $('editorArquivo').textContent = ex.arquivo;
    marcarBotaoExemplo(id);

    setTag('editorModo', 'Exemplo', 'verdeC');
    setTag('maquinaTag', 'Aguardando', 'creme');
    setTag('consoleTag', 'Pronto', 'creme');

    renderVazioMaquina('Clique em Compilar para analisar o programa.');
    selecionarAba('tokens', false);
    renderConsole('PRONTO', 'edit', [`${ex.arquivo} carregado.`]);
    atualizarLinhas();
  }

  function compilar() {
    if (estado.exemploId === 'personalizado') {
      const vazio = !$('editorCodigo').value.trim();
      const msg = vazio
        ? 'Escreva um código Prolog no editor antes de compilar.'
        : 'Compilação de código personalizado ainda não integrada ao motor.';
      setTag('maquinaTag', vazio ? 'Editor vazio' : 'Pendente', 'pessego');
      setTag('consoleTag', 'Aviso', 'pessego');
      renderVazioMaquina(msg);
      renderConsole('PERSONALIZADO', 'edit', [msg]);
      return;
    }

    const ex = EXEMPLOS[estado.exemploId];
    estado.compilado = true;

    renderTokens(ex.tokens);
    renderSimbolos(ex.simbolos);
    renderArvore(ex);
    renderDiagnostico(ex.diagnostico);

    $('badgeTokens').textContent = String(ex.tokens.length);
    $('badgeSimbolos').textContent = String(ex.simbolos.length);
    $('badgeArvore').textContent = ex.arvoreBadge;
    $('badgeDiag').textContent = ex.diagnosticoBadge;

    setTag('maquinaTag', ex.maquinaTag.texto, ex.maquinaTag.classe);
    setTag('consoleTag', ex.id === 'valido' ? 'OK' : 'Erro', ex.id === 'valido' ? 'verde' : 'coral');

    renderConsole(ex.consoleCompilar.banner, ex.consoleCompilar.bannerClasse, ex.consoleCompilar.linhas);
    selecionarAba(ex.abaInicial, false);
  }

  function executarConsulta() {
    if (estado.exemploId === 'personalizado') {
      const consulta = $('inputConsulta').value.trim();
      const msg = consulta
        ? 'Execução de consulta personalizada ainda não integrada ao motor.'
        : 'Informe uma consulta antes de executar.';
      setTag('consoleTag', 'Aviso', 'pessego');
      renderConsole('PERSONALIZADO', 'edit', consulta ? [`?- ${consulta}`, msg] : [msg]);
      return;
    }

    const ex = EXEMPLOS[estado.exemploId];
    const ok = ex.id === 'valido';
    setTag('consoleTag', ok ? 'OK' : 'Bloqueada', ok ? 'verde' : 'coral');
    renderConsole(ex.consoleConsulta.banner, ex.consoleConsulta.bannerClasse, ex.consoleConsulta.linhas);
  }

  function limparSaida() {
    estado.compilado = false;
    setTag('maquinaTag', 'Aguardando', 'creme');
    setTag('consoleTag', 'Pronto', 'creme');
    renderVazioMaquina('Saída limpa.');
    renderConsole('CONSOLE', 'edit', ['Saída limpa.']);
  }

  function aoEditar() {
    if (estado.exemploId !== 'personalizado' || estado.compilado) {
      ativarPersonalizado(false, false);
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
  $('btnLimpar').addEventListener('click', limparSaida);

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

  /* Estado inicial: Personalizado pronto para escrever ou escolher um exemplo */
  ativarPersonalizado(true, false);
})();
