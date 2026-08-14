document.addEventListener('DOMContentLoaded', () => {
  console.log("Script maternidade.js carregado com sucesso!");

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Elementos da Tela
  const gridNinhadas = document.getElementById('grid-ninhadas');
  const emptyState = document.getElementById('empty-state');
  const secaoHistorico = document.getElementById('secao-historico');
  const listaHistorico = document.getElementById('lista-historico');

  // Modal de exclusão de ninhada
  const modalExcluirNinhada = document.getElementById('modal-excluir-ninhada');
  const modalExcluirNinhadaContent = modalExcluirNinhada ? modalExcluirNinhada.querySelector('.transform') : null;
  const btnCancelarExclusaoNinhada = document.getElementById('btn-cancelar-exclusao-ninhada');
  const btnConfirmarExclusaoNinhada = document.getElementById('btn-confirmar-exclusao-ninhada');
  let ninhadaIdParaExcluir = null;

  // KPIs
  const kpiNinhadas = document.getElementById('kpi-ninhadas');
  const kpiFilhotes = document.getElementById('kpi-filhotes');
  const kpiAmamentando = document.getElementById('kpi-amamentando');
  const kpiMatrizes = document.getElementById('kpi-matrizes');

  // Filtros
  const filtroMae = document.getElementById('filtro-mae');
  const btnOrdemData = document.getElementById('btn-ordem-data');
  const btnOrdemFilhotes = document.getElementById('btn-ordem-filhotes');
  let ordemAtual = 'data';

  // Modal
  const btnNovaNinhada = document.getElementById('btn-nova-ninhada');
  const modal = document.getElementById('modal-ninhada');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelar = document.getElementById('btn-cancelar');
  const formNinhada = document.getElementById('form-ninhada');
  const selectMae = document.getElementById('ninhada-mae');

  // Toast
  const toast = document.getElementById('toast-notificacao');

  let caesCache = [];
  let femeasCache = [];
  let ninhadasCache = [];
  let idNinhadaEmEdicao = null;

  function abrirModalExcluirNinhada(id) {
    ninhadaIdParaExcluir = id;
    if (modalExcluirNinhada) {
      modalExcluirNinhada.classList.remove('hidden');
      setTimeout(() => {
        modalExcluirNinhada.classList.remove('opacity-0');
        if (modalExcluirNinhadaContent) modalExcluirNinhadaContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluirNinhada() {
    ninhadaIdParaExcluir = null;
    if (modalExcluirNinhada) {
      modalExcluirNinhada.classList.add('opacity-0');
      if (modalExcluirNinhadaContent) modalExcluirNinhadaContent.classList.add('scale-95');
      setTimeout(() => modalExcluirNinhada.classList.add('hidden'), 200);
    }
  }

  function mostrarToast(msg = "Ninhada registrada com sucesso!") {
    if (!toast) return;
    toast.querySelector('span').textContent = msg;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function formatarDataBR(isoDate) {
    if (!isoDate) return '-';
    const clean = String(isoDate).split('T')[0];
    const partes = clean.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : isoDate;
  }

  async function carregarDadosDoBackend() {
    try {
      const [resCaes, resNinhadas] = await Promise.all([
        fetch('http://localhost:3000/api/cachorros', {
          headers: { 'Authorization': 'Bearer ' + token }
        }),
        fetch('http://localhost:3000/api/ninhadas', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);

      if (resCaes.status === 401 || resCaes.status === 403 || resNinhadas.status === 401 || resNinhadas.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (resCaes.ok) {
        caesCache = await resCaes.json();
        femeasCache = caesCache.filter(c => (c.sexo || '').toLowerCase().startsWith('fem'));
        popularSelectFemeas();
      }

      if (resNinhadas.ok) {
        ninhadasCache = await resNinhadas.json();
        popularSelectFiltroMaes();
        renderizarNinhadas();
      }
    } catch (erro) {
      console.error("Erro ao carregar dados da Maternidade:", erro);
    }
  }

  function popularSelectFemeas() {
    if (!selectMae) return;
    const valorAtual = selectMae.value;
    selectMae.innerHTML = '<option value="">Selecione a fêmea...</option>';

    if (femeasCache.length === 0) {
      selectMae.innerHTML = '<option value="">Nenhuma fêmea cadastrada no sistema</option>';
      return;
    }

    femeasCache.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.nome} (${f.raca})`;
      if (String(f.id) === String(valorAtual)) opt.selected = true;
      selectMae.appendChild(opt);
    });
  }

  function popularSelectFiltroMaes() {
    if (!filtroMae) return;
    const maeSelecionada = filtroMae.value;
    const maesComNinhada = [...new Set(ninhadasCache.map(n => n.mae_nome).filter(Boolean))];

    filtroMae.innerHTML = '<option value="todas">Todas as mães</option>';
    maesComNinhada.forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      if (nome === maeSelecionada) opt.selected = true;
      filtroMae.appendChild(opt);
    });
  }

  function parseObservacoes(obsStr) {
    if (!obsStr) return {};
    if (typeof obsStr === 'object') return obsStr;
    try {
      return JSON.parse(obsStr);
    } catch (e) {
      return { obsTexto: obsStr };
    }
  }

  function renderizarHistorico(ninhadasHistorico) {
    if (!secaoHistorico || !listaHistorico) return;

    if (ninhadasHistorico.length === 0) {
      secaoHistorico.classList.add('hidden');
      return;
    }

    secaoHistorico.classList.remove('hidden');
    listaHistorico.innerHTML = '';

    ninhadasHistorico.forEach(n => {
      const extra = parseObservacoes(n.observacoes);
      const paiNome = extra.paiNome || 'Não informado';
      const tipoParto = extra.tipoParto || 'Natural';
      const machos = extra.machos ?? (n.quantidade_filhotes || 0);
      const femeas = extra.femeas ?? 0;
      const total = n.quantidade_filhotes ?? (machos + femeas);
      const pesoMedio = extra.pesoMedio ?? 0;
      const dtBr = formatarDataBR(n.data_nascimento);
      const badgeParto = tipoParto === 'Natural' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]';
      const idAccordion = `historico-item-${n.id}`;

      const item = document.createElement('div');
      item.className = 'border border-[#EFECE6] rounded-2xl bg-white overflow-hidden shadow-sm';
      item.innerHTML = `
        <button type="button" class="accordion-toggle w-full flex justify-between items-center px-5 py-4 hover:bg-[#FAF8F5] transition-colors" aria-expanded="false" aria-controls="${idAccordion}">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-bege border border-[#EFECE6] overflow-hidden flex-shrink-0">
              <img src="${n.mae_foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=60'}" alt="${n.mae_nome}" class="w-full h-full object-cover">
            </div>
            <div class="text-left">
              <span class="font-bold text-sm text-[#111827]">${n.mae_nome}</span>
              <span class="text-[11px] text-[#6B7280] ml-2">· Parto em ${dtBr}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeParto}">${tipoParto}</span>
            <span class="text-xs font-bold text-[#111827]">${total} filhotes</span>
            <i class="ri-arrow-down-s-line text-[#6B7280] text-base accordion-icon transition-transform"></i>
          </div>
        </button>
        <div id="${idAccordion}" class="accordion-content hidden px-5 pb-5">
          <div class="grid grid-cols-4 gap-3 text-center bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-3">
            <div>
              <div class="text-base font-extrabold text-[#111827]">${total}</div>
              <div class="text-[10px] text-[#6B7280]">Total</div>
            </div>
            <div>
              <div class="text-base font-extrabold text-[#111827]">${machos}</div>
              <div class="text-[10px] text-[#6B7280]">Machos</div>
            </div>
            <div>
              <div class="text-base font-extrabold text-[#111827]">${femeas}</div>
              <div class="text-[10px] text-[#6B7280]">Fêmeas</div>
            </div>
            <div>
              <div class="text-base font-extrabold text-[#111827]">${pesoMedio}g</div>
              <div class="text-[10px] text-[#6B7280]">Peso Médio</div>
            </div>
          </div>
          <p class="text-[11px] text-[#6B7280] mt-3">Padreador: <span class="font-semibold text-[#111827]">${paiNome}</span></p>
        </div>
      `;

      const toggleBtn = item.querySelector('.accordion-toggle');
      const content = item.querySelector('.accordion-content');
      const icon = item.querySelector('.accordion-icon');
      toggleBtn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        content.classList.toggle('hidden', isOpen);
        icon.classList.toggle('rotate-180', !isOpen);
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      listaHistorico.appendChild(item);
    });
  }

  function renderizarNinhadas() {
    let ninhadas = [...ninhadasCache];

    // Cálculo dos KPIs
    let totalAmamentando = 0;
    let totalFilhotes = 0;

    ninhadas.forEach(n => {
      const extra = parseObservacoes(n.observacoes);
      const qtd = n.quantidade_filhotes ?? ((extra.machos || 0) + (extra.femeas || 0));
      totalFilhotes += qtd;
      if (extra.amamentando) totalAmamentando++;
    });

    if (kpiNinhadas) kpiNinhadas.textContent = ninhadas.length;
    if (kpiFilhotes) kpiFilhotes.textContent = totalFilhotes;
    if (kpiAmamentando) kpiAmamentando.textContent = totalAmamentando;
    if (kpiMatrizes) kpiMatrizes.textContent = femeasCache.length;

    // Filtro por mãe
    const maeFiltro = filtroMae ? filtroMae.value : 'todas';
    if (maeFiltro !== 'todas') {
      ninhadas = ninhadas.filter(n => (n.mae_nome || '').toLowerCase() === maeFiltro.toLowerCase());
    }

    // Ordenação
    if (ordemAtual === 'data') {
      ninhadas.sort((a, b) => new Date(b.data_nascimento) - new Date(a.data_nascimento));
    } else if (ordemAtual === 'filhotes') {
      ninhadas.sort((a, b) => (b.quantidade_filhotes || 0) - (a.quantidade_filhotes || 0));
    }

    if (!gridNinhadas) return;
    gridNinhadas.innerHTML = '';

    if (ninhadas.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (secaoHistorico) secaoHistorico.classList.add('hidden');
      return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    // Separar em destaques (amamentando) e histórico (não amamentando)
    const ninhadasDestaque = ninhadas.filter(n => {
      const extra = parseObservacoes(n.observacoes);
      return extra.amamentando === true;
    });
    const ninhadasHistorico = ninhadas.filter(n => {
      const extra = parseObservacoes(n.observacoes);
      return !extra.amamentando;
    });

    // Se não há destaques, mostrar todas no grid
    const ninhadasParaGrid = ninhadasDestaque.length > 0 ? ninhadasDestaque : ninhadas.slice(0, 6);
    const ninhadasParaHistorico = ninhadasDestaque.length > 0 ? ninhadasHistorico : ninhadas.slice(6);

    renderizarHistorico(ninhadasParaHistorico);

    ninhadasParaGrid.forEach(n => {
      const extra = parseObservacoes(n.observacoes);
      const paiNome = extra.paiNome || 'Não informado';
      const tipoParto = extra.tipoParto || 'Natural';
      const machos = extra.machos ?? (n.quantidade_filhotes || 0);
      const femeas = extra.femeas ?? 0;
      const total = n.quantidade_filhotes ?? (machos + femeas);
      const pesoMedio = extra.pesoMedio ?? 0;
      const amamentando = extra.amamentando ?? false;
      const dtBr = formatarDataBR(n.data_nascimento);

      const borderClass = amamentando ? 'border-[#10B981]/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[#EFECE6] shadow-sm';
      const badgeAmamentando = amamentando ? `<span class="bg-[#D1FAE5] text-[#10B981] text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">Amamentando</span>` : '';
      const badgeParto = tipoParto === 'Natural' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]';
      const fotoExibicao = n.mae_foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';

      const card = document.createElement('div');
      card.className = `bg-white border rounded-2xl p-5 relative transition-all ${borderClass}`;

      card.innerHTML = `
        <div class="flex justify-between items-start mb-6">
          <div class="flex gap-3.5 items-center">
            <div class="w-11 h-11 rounded-full overflow-hidden bg-bege border border-[#EFECE6] flex-shrink-0">
              <img src="${fotoExibicao}" alt="${n.mae_nome}" class="w-full h-full object-cover">
            </div>
            <div>
              <h4 class="font-bold text-sm text-[#111827]">${n.mae_nome}</h4>
              <p class="text-[11px] text-[#6B7280]">Pai: ${paiNome}</p>
            </div>
          </div>
          ${badgeAmamentando}
        </div>

        <div class="grid grid-cols-4 text-center mb-6 gap-2">
          <div>
            <div class="text-lg font-extrabold text-[#111827]">${total}</div>
            <div class="text-[10px] text-[#6B7280]">Total</div>
          </div>
          <div>
            <div class="text-lg font-extrabold text-[#111827]">${machos}</div>
            <div class="text-[10px] text-[#6B7280]">Machos</div>
          </div>
          <div>
            <div class="text-lg font-extrabold text-[#111827]">${femeas}</div>
            <div class="text-[10px] text-[#6B7280]">Fêmeas</div>
          </div>
          <div>
            <div class="text-lg font-extrabold text-[#111827]">${pesoMedio}g</div>
            <div class="text-[10px] text-[#6B7280]">Peso</div>
          </div>
        </div>

        <div class="flex justify-between items-center text-xs border-t border-[#FAFAF9] pt-3.5">
          <span class="text-[#6B7280]">Parto: <span class="font-bold text-[#111827]">${dtBr}</span></span>
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeParto}">${tipoParto}</span>
            <div class="action-buttons-ninhada flex items-center gap-1 opacity-0 transition-opacity">
              <button class="btn-editar-ninhada p-1 text-gray-400 hover:text-laranja transition-colors" title="Editar Ninhada">
                <i class="ri-pencil-line text-sm"></i>
              </button>
              <button class="btn-excluir-ninhada p-1 text-gray-400 hover:text-red-500 transition-colors" title="Excluir Ninhada">
                <i class="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('mouseenter', () => {
        const actions = card.querySelector('.action-buttons-ninhada');
        if (actions) actions.classList.remove('opacity-0');
      });
      card.addEventListener('mouseleave', () => {
        const actions = card.querySelector('.action-buttons-ninhada');
        if (actions) actions.classList.add('opacity-0');
      });

      card.querySelector('.btn-editar-ninhada').onclick = () => abrirModal(n);

      card.querySelector('.btn-excluir-ninhada').onclick = () => abrirModalExcluirNinhada(n.id);

      gridNinhadas.appendChild(card);
    });
  }

  // Wiring do modal de exclusão
  if (btnCancelarExclusaoNinhada) btnCancelarExclusaoNinhada.onclick = fecharModalExcluirNinhada;

  if (btnConfirmarExclusaoNinhada) {
    btnConfirmarExclusaoNinhada.onclick = async () => {
      if (!ninhadaIdParaExcluir) return;
      try {
        const resposta = await fetch(`http://localhost:3000/api/ninhadas/${ninhadaIdParaExcluir}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        fecharModalExcluirNinhada();
        if (resposta.ok) {
          mostrarToast('Ninhada removida com sucesso!');
          await carregarDadosDoBackend();
        } else {
          const erro = await resposta.json();
          mostrarToast(erro.mensagem || 'Erro ao excluir ninhada.');
        }
      } catch (err) {
        console.error('Erro na exclusão de ninhada:', err);
        mostrarToast('Erro ao conectar ao servidor.');
      }
    };
  }

  // Lógica de Modais
  function abrirModal(ninhada = null) {
    idNinhadaEmEdicao = ninhada ? ninhada.id : null;
    if (formNinhada) formNinhada.reset();
    popularSelectFemeas();

    const modalTitulo = modal ? modal.querySelector('h3') : null;

    if (ninhada) {
      if (modalTitulo) modalTitulo.textContent = "Editar Ninhada";
      if (selectMae) selectMae.value = ninhada.mae_id;

      const extra = parseObservacoes(ninhada.observacoes);
      const elPai = document.getElementById('ninhada-pai');
      const elData = document.getElementById('ninhada-data');
      const elTipo = document.getElementById('ninhada-tipo');
      const elMachos = document.getElementById('ninhada-machos');
      const elFemeas = document.getElementById('ninhada-femeas');
      const elPeso = document.getElementById('ninhada-peso');
      const elAmamentando = document.getElementById('ninhada-amamentando');

      if (elPai) elPai.value = extra.paiNome || '';
      if (elData) elData.value = ninhada.data_nascimento ? String(ninhada.data_nascimento).split('T')[0] : '';
      if (elTipo) elTipo.value = extra.tipoParto || 'Natural';
      if (elMachos) elMachos.value = extra.machos ?? (ninhada.quantidade_filhotes || 0);
      if (elFemeas) elFemeas.value = extra.femeas ?? 0;
      if (elPeso) elPeso.value = extra.pesoMedio ?? 0;
      if (elAmamentando) elAmamentando.checked = extra.amamentando ?? false;
    } else {
      if (modalTitulo) modalTitulo.textContent = "Registrar Ninhada";
    }

    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        const t = modal.querySelector('.transform');
        if (t) t.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModal() {
    idNinhadaEmEdicao = null;
    if (modal) {
      modal.classList.add('opacity-0');
      const t = modal.querySelector('.transform');
      if (t) t.classList.add('scale-95');
      setTimeout(() => modal.classList.add('hidden'), 200);
    }
  }

  if (btnNovaNinhada) btnNovaNinhada.onclick = () => abrirModal(null);
  if (btnFecharModal) btnFecharModal.onclick = fecharModal;
  if (btnCancelar) btnCancelar.onclick = fecharModal;

  // Lógica do Formulário
  if (formNinhada) {
    formNinhada.onsubmit = async (e) => {
      e.preventDefault();

      if (!selectMae || !selectMae.value) {
        alert("Selecione a mãe!");
        return;
      }

      const mae_id = parseInt(selectMae.value);
      const paiNome = document.getElementById('ninhada-pai').value.trim();
      const dataPartoIso = document.getElementById('ninhada-data').value;
      const tipoParto = document.getElementById('ninhada-tipo').value;
      const machos = parseInt(document.getElementById('ninhada-machos').value) || 0;
      const femeas = parseInt(document.getElementById('ninhada-femeas').value) || 0;
      const pesoMedio = parseInt(document.getElementById('ninhada-peso').value) || 0;
      const amamentando = document.getElementById('ninhada-amamentando').checked;

      if (machos === 0 && femeas === 0) {
        alert("A ninhada precisa ter pelo menos 1 filhote.");
        return;
      }

      const quantidade_filhotes = machos + femeas;
      const observacoesObj = {
        paiNome: paiNome,
        tipoParto: tipoParto,
        machos: machos,
        femeas: femeas,
        pesoMedio: pesoMedio,
        amamentando: amamentando
      };

      try {
        let url = 'http://localhost:3000/api/ninhadas';
        let method = 'POST';

        if (idNinhadaEmEdicao) {
          url = `http://localhost:3000/api/ninhadas/${idNinhadaEmEdicao}`;
          method = 'PUT';
        }

        const resposta = await fetch(url, {
          method: method,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mae_id: mae_id,
            data_nascimento: dataPartoIso,
            quantidade_filhotes: quantidade_filhotes,
            observacoes: JSON.stringify(observacoesObj)
          })
        });

        if (resposta.ok) {
          fecharModal();
          mostrarToast(idNinhadaEmEdicao ? "Ninhada atualizada com sucesso!" : "Ninhada registrada com sucesso!");
          await carregarDadosDoBackend();
        } else {
          const erro = await resposta.json();
          alert(erro.mensagem || "Erro ao salvar ninhada.");
        }
      } catch (err) {
        console.error("Erro ao salvar ninhada:", err);
        alert("Erro de conexão ao servidor.");
      }
    };
  }

  // Lógica de Filtros e Ordenação
  if (filtroMae) filtroMae.onchange = renderizarNinhadas;

  if (btnOrdemData) {
    btnOrdemData.onclick = () => {
      ordemAtual = 'data';
      btnOrdemData.className = "px-3 py-1 rounded-md text-[11px] font-bold bg-[#FAF8F5] text-[#111827] border border-[#EFECE6]";
      btnOrdemFilhotes.className = "px-3 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent";
      renderizarNinhadas();
    };
  }

  if (btnOrdemFilhotes) {
    btnOrdemFilhotes.onclick = () => {
      ordemAtual = 'filhotes';
      btnOrdemFilhotes.className = "px-3 py-1 rounded-md text-[11px] font-bold bg-[#FAF8F5] text-[#111827] border border-[#EFECE6]";
      btnOrdemData.className = "px-3 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent";
      renderizarNinhadas();
    };
  }

  // Inicialização
  carregarDadosDoBackend();
});