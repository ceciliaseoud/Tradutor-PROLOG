/* Controlador da interface simulada do Tradutor Prolog (Item 4). */
(function () {
  const $ = id => document.getElementById(id);
  const EXEMPLOS = window.EXEMPLOS_PROLOG || {};

  const estado = {
    exemploId: 'valido',
    fase: 'carregado',
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

  function atualizarLinhas(notaExtra) {
    const texto = $('editorCodigo').value;
    const total = Math.max(1, texto.split('\n').length);
    let numeros = '';
    for (let i = 1; i <= total; i++) {
      numeros += i === total ? String(i) : `${i}\n`;
    }
    $('editorLinhas').textContent = numeros;
    const sufixo = notaExtra || (estado.exemploId ? 'sem erros exibidos' : 'aguardando exemplo');
    $('editorMeta').textContent = `${total} ${total === 1 ? 'linha' : 'linhas'} · ${sufixo}`;
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

  function renderVazioMaquina(modoEditado) {
    $('badgeTokens').textContent = '0';
    $('badgeSimbolos').textContent = '0';
    $('badgeArvore').textContent = '–';
    $('badgeDiag').textContent = '–';

    const bloco = modoEditado
      ? `<div class="panel-empty edit-state">
           <span class="tag pessego">Saída anterior limpa</span>
           <p>O código ou a consulta foi editado manualmente. Este protótipo trabalha apenas com <strong>resultados simulados</strong> para cenários cadastrados.</p>
           <p><strong>Próximo passo:</strong> carregue <em>Programa válido</em>, <em>Erro léxico</em> ou <em>Erro sintático</em> na seção 01 para testar <strong>Compilar</strong> e <strong>Executar consulta</strong>.</p>
         </div>`
      : `<div class="panel-empty">
           <span class="tag lil">Aguardando compilação simulada</span>
           <p>Clique em <strong>Compilar</strong> para preencher tokens, tabela de símbolos, árvore de derivação e diagnóstico do exemplo carregado.</p>
         </div>`;

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
          <span class="tag ouro">Árvore não gerada (simulado)</span>
          <p>${esc(ex.arvoreIndisponivel)}</p>
        </div>
      `;
      return;
    }

    $('panel-arvore').innerHTML = `
      <div class="tree-wrap">
        <div class="tree-meta">
          <span class="tag lil">GLC simplificada · Simulado</span>
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
          <span class="tag ${badgeClasse}">${esc(diag.codigo)} · Simulado</span>
        </div>
        <div class="diag-grid">
          <div class="diag-kv"><span>Etapa</span><strong>${esc(diag.fase)}</strong></div>
          <div class="diag-kv"><span>Localização</span><strong>${esc(diag.local)}</strong></div>
          <div class="diag-kv"><span>Elemento</span><strong>${esc(diag.lexema)}</strong></div>
        </div>
        <p class="note" style="margin:0;color:var(--preto);font-size:13px">${esc(diag.mensagem)}</p>
        <pre class="diag-snippet">${esc(diag.trecho)}</pre>
        <p class="diag-hint"><strong>Orientação:</strong> ${esc(diag.sugestao)}</p>
      </div>
    `;
  }

  function carregarExemplo(id) {
    const ex = EXEMPLOS[id];
    if (!ex) return;

    estado.exemploId = id;
    estado.fase = 'carregado';
    estado.compilado = false;

    $('editorCodigo').value = ex.codigo;
    $('inputConsulta').value = ex.consulta;
    $('editorArquivo').textContent = ex.arquivo;
    $('exemploDesc').textContent = ex.descricao;
    $('exemploAtivoInfo').textContent = `Exemplo ativo: ${ex.titulo}`;
    $('avisoEdicao').hidden = true;

    botoesExemplo.forEach(btn => {
      const ativo = btn.dataset.ex === id;
      btn.classList.toggle('on', ativo);
      btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    setTag('statusGlobal', 'Exemplo carregado', 'lil');
    setTag('editorModo', 'Exemplo cadastrado', 'verdeC');
    setTag('maquinaTag', 'Aguardando compilação', 'creme');
    setTag('consoleTag', 'Saída simulada', 'ouro');
    $('maquinaResumo').textContent = `Exemplo "${ex.titulo}" pronto. Clique em Compilar para gerar as saídas simuladas.`;

    renderVazioMaquina(false);
    selecionarAba('tokens', false);

    renderConsole('SAÍDA SIMULADA · PRONTO', 'edit', [
      `[SIMULAÇÃO] Exemplo "${ex.titulo}" (${ex.arquivo}) carregado no Editor Prolog.`,
      `Consulta pronta: ?- ${ex.consulta}`,
      'Clique em "Compilar" para inspecionar a Máquina ou em "Executar consulta" para ver a saída cadastrada.'
    ]);

    setPipeline({
      programa: { texto: 'Carregado', classe: 'ativo' },
      lexico: { texto: 'Aguardando', classe: '' },
      sintatico: { texto: 'Aguardando', classe: '' },
      maquina: { texto: 'Aguardando', classe: '' },
      console: { texto: 'Aguardando', classe: '' }
    });

    atualizarLinhas('pronto para compilar');
    atualizarCardsEstado();
  }

  function orientarEdicao(acao) {
    $('avisoEdicao').hidden = false;
    $('avisoEdicaoTexto').innerHTML =
      `Não foi possível executar <strong>${esc(acao)}</strong> porque o código ou a consulta foi editado manualmente. ` +
      'Esta interface demonstra apenas <strong>saídas simuladas</strong> de exemplos cadastrados — carregue ' +
      '<strong>Programa válido</strong>, <strong>Erro léxico</strong> ou <strong>Erro sintático</strong> acima para testar os controles.';

    renderConsole('SAÍDA SIMULADA · CARREGUE UM EXEMPLO', 'edit', [
      `[MODO SIMULADO] Ação "${acao}" indisponível para texto editado manualmente.`,
      'Carregue um dos exemplos cadastrados (Programa válido, Erro léxico ou Erro sintático) na seção 01 para testar os controles.'
    ]);
  }

  function compilar() {
    if (!estado.exemploId) {
      orientarEdicao('Compilar');
      return;
    }

    const ex = EXEMPLOS[estado.exemploId];
    estado.compilado = true;
    estado.fase = ex.estadoCompilado;

    renderTokens(ex.tokens);
    renderSimbolos(ex.simbolos);
    renderArvore(ex);
    renderDiagnostico(ex.diagnostico);

    $('badgeTokens').textContent = String(ex.tokens.length);
    $('badgeSimbolos').textContent = String(ex.simbolos.length);
    $('badgeArvore').textContent = ex.arvoreBadge;
    $('badgeDiag').textContent = ex.diagnosticoBadge;

    setTag('statusGlobal', ex.statusTag.texto, ex.statusTag.classe);
    setTag('maquinaTag', ex.maquinaTag.texto, ex.maquinaTag.classe);
    $('maquinaResumo').textContent = ex.maquinaResumo;

    setTag(
      'consoleTag',
      ex.id === 'valido' ? 'Compilado · Simulado' : 'Erro · Simulado',
      ex.id === 'valido' ? 'verde' : 'coral'
    );

    renderConsole(ex.consoleCompilar.banner, ex.consoleCompilar.bannerClasse, ex.consoleCompilar.linhas);
    setPipeline(ex.pipeline);
    selecionarAba(ex.abaInicial, false);

    const metaNota = ex.id === 'valido' ? '0 erros (simulado)' : `${ex.diagnostico.codigo} marcado (simulado)`;
    atualizarLinhas(metaNota);
    atualizarCardsEstado();
  }

  function executarConsulta() {
    if (!estado.exemploId) {
      orientarEdicao('Executar consulta');
      return;
    }

    const ex = EXEMPLOS[estado.exemploId];
    const linhas = ex.consoleConsulta.linhas.slice();
    if (!estado.compilado) {
      linhas.push('', 'Dica: clique em "Compilar" para inspecionar tokens, símbolos, árvore e diagnóstico na Máquina.');
    }

    renderConsole(ex.consoleConsulta.banner, ex.consoleConsulta.bannerClasse, linhas);

    const ok = ex.id === 'valido';
    setTag('consoleTag', ok ? 'Resposta simulada' : 'Bloqueada · Simulado', ok ? 'verde' : 'coral');

    const stepConsole = document.querySelector('.pipe-step[data-stage="console"]');
    if (stepConsole) {
      stepConsole.className = `pipe-step ${ok ? 'ok' : 'erro'}`;
    }
    $('pipeConsole').textContent = ok ? '2 soluções' : 'Bloqueada';
  }

  function limparSaida() {
    if (!estado.exemploId) {
      aoEditar('manual');
      return;
    }
    const ex = EXEMPLOS[estado.exemploId];
    estado.compilado = false;
    estado.fase = 'carregado';

    setTag('statusGlobal', 'Exemplo carregado', 'lil');
    setTag('maquinaTag', 'Saída limpa', 'creme');
    setTag('consoleTag', 'Saída simulada', 'ouro');
    $('maquinaResumo').textContent = `Saídas limpas para "${ex.titulo}". Clique em Compilar para gerar novamente.`;

    renderVazioMaquina(false);
    renderConsole('SAÍDA SIMULADA · LIMPA', 'edit', [
      `[SIMULAÇÃO] Saídas anteriores limpas. O exemplo "${ex.titulo}" continua carregado no editor.`,
      'Clique em "Compilar" ou "Executar consulta" para visualizar os dados simulados.'
    ]);

    setPipeline({
      programa: { texto: 'Carregado', classe: 'ativo' },
      lexico: { texto: 'Aguardando', classe: '' },
      sintatico: { texto: 'Aguardando', classe: '' },
      maquina: { texto: 'Aguardando', classe: '' },
      console: { texto: 'Limpo', classe: '' }
    });
    atualizarLinhas('saída limpa');
    atualizarCardsEstado();
  }

  function aoEditar(origem) {
    estado.exemploId = null;
    estado.fase = 'editado';
    estado.compilado = false;

    botoesExemplo.forEach(btn => {
      btn.classList.remove('on');
      btn.setAttribute('aria-pressed', 'false');
    });

    const alvo = origem === 'consulta' ? 'a consulta' : 'o código Prolog';
    setTag('statusGlobal', 'Editado · Saída limpa', 'pessego');
    setTag('editorModo', 'Editado manualmente', 'pessego');
    setTag('maquinaTag', 'Saída limpa', 'pessego');
    setTag('consoleTag', 'Saída limpa', 'pessego');
    $('exemploAtivoInfo').textContent = 'Exemplo ativo: nenhum (conteúdo editado)';
    $('maquinaResumo').textContent = 'Saídas anteriores limpas após edição. Carregue um exemplo cadastrado para testar os controles.';

    $('avisoEdicao').hidden = false;
    $('avisoEdicaoTexto').innerHTML =
      `Você editou <strong>${alvo}</strong>. As saídas anteriores da Máquina e do Console foram limpas ` +
      'porque este protótipo utiliza apenas <strong>dados simulados</strong>. Carregue um exemplo cadastrado ' +
      '(<em>Programa válido</em>, <em>Erro léxico</em> ou <em>Erro sintático</em>) acima para testar os controles.';

    renderVazioMaquina(true);
    renderConsole('SAÍDA LIMPA · MODO SIMULADO', 'edit', [
      `[MODO SIMULADO] Edição detectada em ${alvo}: saída anterior limpa.`,
      'Para testar "Compilar" e "Executar consulta", carregue um dos exemplos cadastrados na seção 01.'
    ]);

    setPipeline({
      programa: { texto: 'Editado', classe: 'editado' },
      lexico: { texto: 'Limpo', classe: '' },
      sintatico: { texto: 'Limpo', classe: '' },
      maquina: { texto: 'Limpa', classe: '' },
      console: { texto: 'Limpo', classe: '' }
    });

    atualizarLinhas('editado · saída limpa');
    atualizarCardsEstado();
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

  $('editorCodigo').addEventListener('input', () => aoEditar('codigo'));
  $('editorCodigo').addEventListener('scroll', () => {
    $('editorLinhas').scrollTop = $('editorCodigo').scrollTop;
  });

  $('inputConsulta').addEventListener('input', () => aoEditar('consulta'));
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
