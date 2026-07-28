document.addEventListener('DOMContentLoaded', () => {
  console.log("Script vacinas.js carregado com sucesso!");

  const tabelaBody = document.getElementById('tabela-vacinas-body');
  const emptyState = document.getElementById('empty-state-vacinas');
  const inputBusca = document.getElementById('input-busca-vacinas');
  const containerFiltros = document.getElementById('container-filtros-vacinas');

  // KPIs Elements
  const elStatTotal = document.getElementById('stat-total-registros');
  const elStatVacinados = document.getElementById('stat-caes-vacinados');
  const elStatSubCaes = document.getElementById('stat-sub-caes');
  const elStatVencidas = document.getElementById('stat-vencidas');
  const elStatVencemBreve = document.getElementById('stat-vencem-breve');

  // Modal Registrar Vacina
  const btnAbrirModal = document.getElementById('btn-abrir-modal-vacina');
  const modalVGlobal = document.getElementById('modal-vacinas-global');
  const modalContentGlobal = modalVGlobal ? modalVGlobal.querySelector('.transform') : null;
  const btnFecharModalGlobal = document.getElementById('btn-fechar-modal-vglobal');
  const btnCancelarModalGlobal = document.getElementById('btn-cancelar-modal-vglobal');
  const formVacinaGlobal = document.getElementById('form-vacina-global');
  const selectCao = document.getElementById('vglobal-select-cao');

  // Modal Editar Vacina
  const modalVEditar = document.getElementById('modal-editar-vacina');
  const modalContentEditar = modalVEditar ? modalVEditar.querySelector('.transform') : null;
  const btnFecharModalEditar = document.getElementById('btn-fechar-modal-veditar');
  const btnCancelarModalEditar = document.getElementById('btn-cancelar-modal-veditar');
  const formEditarVacina = document.getElementById('form-editar-vacina');

  // Modal Exclusão
  const modalExclusao = document.getElementById('modal-confirmar-exclusao');
  const modalContentExclusao = modalExclusao ? modalExclusao.querySelector('.transform') : null;
  const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');
  const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
  const textoConfirmacaoExclusao = document.getElementById('texto-confirmacao-exclusao');
  let idVacinaParaExcluir = null;

  // Toast
  const toastVacina = document.getElementById('toast-vacina');
  let toastTimeout = null;
  let filtroVacinaAtual = 'todas';

  function mostrarToast(msg = "Operação realizada com sucesso!") {
    if (!toastVacina) return;
    const span = toastVacina.querySelector('span');
    if (span) span.textContent = msg;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastVacina.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastVacina.classList.add('opacity-100', 'translate-y-0');

    toastTimeout = setTimeout(() => {
      toastVacina.classList.remove('opacity-100', 'translate-y-0');
      toastVacina.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function obterVacinas() {
    const salvos = localStorage.getItem('canil_vacinas');
    if (salvos) {
      return JSON.parse(salvos);
    }

    const vacinasIniciais = [
      { id: 1, caoNome: 'Thor', caoRaca: 'Golden Retriever', caoFoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', vacinaNome: 'V10', dataAplicacao: '15/01/2025', proximaDose: '15/01/2026', proximaDoseIso: '2026-01-15' },
      { id: 2, caoNome: 'Thor', caoRaca: 'Golden Retriever', caoFoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', vacinaNome: 'Antirrábica', dataAplicacao: '20/02/2025', proximaDose: '20/02/2026', proximaDoseIso: '2026-02-20' },
      { id: 3, caoNome: 'Thor', caoRaca: 'Golden Retriever', caoFoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', vacinaNome: 'Gripe Canina', dataAplicacao: '10/03/2025', proximaDose: '10/03/2026', proximaDoseIso: '2026-03-10' },
      { id: 4, caoNome: 'Thor', caoRaca: 'Golden Retriever', caoFoto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', vacinaNome: 'Giardíase', dataAplicacao: '05/04/2025', proximaDose: '05/04/2026', proximaDoseIso: '2026-04-05' },
      { id: 5, caoNome: 'Luna', caoRaca: 'Pastor Alemão', caoFoto: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', vacinaNome: 'Antirrábica', dataAplicacao: '18/02/2025', proximaDose: '18/02/2026', proximaDoseIso: '2026-02-18' }
    ];

    localStorage.setItem('canil_vacinas', JSON.stringify(vacinasIniciais));
    return vacinasIniciais;
  }

  function calcularStatus(proximaDoseIso) {
    if (!proximaDoseIso) return { statusText: 'Em dia', isVencida: false, isEmBreve: false };

    const partes = proximaDoseIso.split('-');
    const dtProxima = new Date(partes[0], partes[1] - 1, partes[2]);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = dtProxima - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { statusText: 'Vencida', isVencida: true, isEmBreve: false };
    } else if (diffDays <= 7) {
      return { statusText: 'Vence em breve', isVencida: false, isEmBreve: true };
    } else {
      return { statusText: 'Em dia', isVencida: false, isEmBreve: false };
    }
  }

  function renderizarDashboardEVacinas() {
    const vacinas = obterVacinas();
    const caesSalvos = JSON.parse(localStorage.getItem('canil_cachorros')) || [];
    const totalCaesNoCanil = caesSalvos.length > 0 ? caesSalvos.length : 8;

    let contVencidas = 0;
    let contEmBreve = 0;
    const caesComVacinaSet = new Set();

    vacinas.forEach(v => {
      caesComVacinaSet.add(v.caoNome.toLowerCase());
      const { isVencida, isEmBreve } = calcularStatus(v.proximaDoseIso);
      if (isVencida) contVencidas++;
      if (isEmBreve) contEmBreve++;
    });

    if (elStatTotal) elStatTotal.textContent = vacinas.length;
    if (elStatVacinados) elStatVacinados.textContent = caesComVacinaSet.size;
    if (elStatSubCaes) elStatSubCaes.textContent = `de ${totalCaesNoCanil} cães no canil`;
    if (elStatVencidas) elStatVencidas.textContent = contVencidas;
    if (elStatVencemBreve) elStatVencemBreve.textContent = contEmBreve;

    const termoBusca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const vacinasFiltradas = vacinas.filter(v => {
      const passaBusca = v.caoNome.toLowerCase().includes(termoBusca) || v.caoRaca.toLowerCase().includes(termoBusca);
      let passaFiltro = true;

      if (filtroVacinaAtual !== 'todas') {
        passaFiltro = v.vacinaNome.toLowerCase() === filtroVacinaAtual.toLowerCase();
      }

      return passaBusca && passaFiltro;
    });

    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    if (vacinasFiltradas.length === 0) {
      if (emptyState) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
      }
    } else {
      if (emptyState) {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
      }

      vacinasFiltradas.forEach(v => {
        const { statusText, isVencida, isEmBreve } = calcularStatus(v.proximaDoseIso);

        let badgeClass = 'bg-verdeokbg text-verdeok';
        if (isVencida) badgeClass = 'bg-vermelhobg text-vermelho';
        if (isEmBreve) badgeClass = 'bg-[#FEF3C7] text-[#B45309]';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-bege overflow-hidden flex-shrink-0">
                <img src="${v.caoFoto}" class="w-full h-full object-cover" alt="${v.caoNome}">
              </div>
              <div>
                <div class="font-bold text-xs text-[#111827]">${v.caoNome}</div>
                <div class="text-[10px] text-[#6B7280]">${v.caoRaca}</div>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5 text-xs font-medium text-[#111827]">${v.vacinaNome}</td>
          <td class="px-5 py-3.5 text-xs text-[#6B7280]">${v.dataAplicacao}</td>
          <td class="px-5 py-3.5 text-xs text-[#6B7280]">${v.proximaDose}</td>
          <td class="px-5 py-3.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">${statusText}</span>
          </td>
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-2">
              <button data-id="${v.id}" class="btn-editar-vacina text-gray-400 hover:text-laranja transition-colors text-sm" title="Editar vacina">
                <i class="ri-edit-line"></i>
              </button>
              <button data-id="${v.id}" class="btn-deletar-vacina text-gray-400 hover:text-vermelho transition-colors text-sm" title="Excluir vacina">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </td>
        `;

        const btnEditar = tr.querySelector('.btn-editar-vacina');
        if (btnEditar) {
          btnEditar.onclick = () => abrirModalEditar(v);
        }

        const btnDeletar = tr.querySelector('.btn-deletar-vacina');
        if (btnDeletar) {
          btnDeletar.onclick = () => solicitarExclusaoVacina(v.id, v.vacinaNome, v.caoNome);
        }

        tabelaBody.appendChild(tr);
      });
    }
  }

  // MODAL EXCLUSÃO
  function solicitarExclusaoVacina(id, nomeVacina, nomeCao) {
    idVacinaParaExcluir = id;
    if (textoConfirmacaoExclusao) {
      textoConfirmacaoExclusao.textContent = `Você tem certeza que deseja excluir a vacina ${nomeVacina} de ${nomeCao}?`;
    }
    if (modalExclusao && modalContentExclusao) {
      modalExclusao.classList.remove('hidden');
      setTimeout(() => {
        modalExclusao.classList.remove('opacity-0');
        modalContentExclusao.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExclusao() {
    if (modalExclusao && modalContentExclusao) {
      modalExclusao.classList.add('opacity-0');
      modalContentExclusao.classList.add('scale-95');
      setTimeout(() => {
        modalExclusao.classList.add('hidden');
        idVacinaParaExcluir = null;
      }, 200);
    }
  }

  if (btnCancelarExclusao) btnCancelarExclusao.onclick = fecharModalExclusao;
  if (modalExclusao) modalExclusao.onclick = (e) => { if (e.target === modalExclusao) fecharModalExclusao(); };

  if (btnConfirmarExclusao) {
    btnConfirmarExclusao.onclick = () => {
      if (idVacinaParaExcluir !== null) {
        let vacinas = obterVacinas();
        vacinas = vacinas.filter(v => v.id !== idVacinaParaExcluir);
        localStorage.setItem('canil_vacinas', JSON.stringify(vacinas));
        fecharModalExclusao();
        renderizarDashboardEVacinas();
        mostrarToast("Vacina excluída com sucesso!");
      }
    };
  }

  // MODAL EDITAR VACINA
  function abrirModalEditar(vacina) {
    document.getElementById('veditar-id').value = vacina.id;
    document.getElementById('veditar-cao-nome').value = `${vacina.caoNome} (${vacina.caoRaca})`;
    document.getElementById('veditar-nome').value = vacina.vacinaNome;
    document.getElementById('veditar-data-dose').value = vacina.dataAplicacaoIso || '';
    document.getElementById('veditar-data-proxima').value = vacina.proximaDoseIso || '';

    if (modalVEditar && modalContentEditar) {
      modalVEditar.classList.remove('hidden');
      setTimeout(() => {
        modalVEditar.classList.remove('opacity-0');
        modalContentEditar.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalEditar() {
    if (modalVEditar && modalContentEditar) {
      modalVEditar.classList.add('opacity-0');
      modalContentEditar.classList.add('scale-95');
      setTimeout(() => {
        modalVEditar.classList.add('hidden');
      }, 200);
    }
  }

  if (btnFecharModalEditar) btnFecharModalEditar.onclick = fecharModalEditar;
  if (btnCancelarModalEditar) btnCancelarModalEditar.onclick = fecharModalEditar;
  if (modalVEditar) modalVEditar.onclick = (e) => { if (e.target === modalVEditar) fecharModalEditar(); };

  if (formEditarVacina) {
    formEditarVacina.onsubmit = (e) => {
      e.preventDefault();

      const id = Number(document.getElementById('veditar-id').value);
      const novoNome = document.getElementById('veditar-nome').value.trim();
      const dataDoseRaw = document.getElementById('veditar-data-dose').value;
      const dataProximaRaw = document.getElementById('veditar-data-proxima').value;

      const [a1, m1, d1] = dataDoseRaw.split('-');
      const [a2, m2, d2] = dataProximaRaw.split('-');

      const dataFmtDose = `${d1}/${m1}/${a1}`;
      const dataFmtProxima = `${d2}/${m2}/${a2}`;

      let vacinas = obterVacinas();
      vacinas = vacinas.map(v => {
        if (v.id === id) {
          return {
            ...v,
            vacinaNome: novoNome,
            dataAplicacao: dataFmtDose,
            proximaDose: dataFmtProxima,
            dataAplicacaoIso: dataDoseRaw,
            proximaDoseIso: dataProximaRaw
          };
        }
        return v;
      });

      localStorage.setItem('canil_vacinas', JSON.stringify(vacinas));
      fecharModalEditar();
      renderizarDashboardEVacinas();
      mostrarToast("Vacina atualizada com sucesso!");
    };
  }

  // MODAL CADASTRAR VACINA
  function carregarOpcoesCaesModal() {
    if (!selectCao) return;
    const caesSalvos = JSON.parse(localStorage.getItem('canil_cachorros')) || [];

    selectCao.innerHTML = '';
    if (caesSalvos.length === 0) {
      selectCao.innerHTML = '<option value="">Nenhum cão cadastrado</option>';
      return;
    }

    caesSalvos.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.nome;
      opt.dataset.raca = c.raca;
      opt.dataset.foto = c.foto;
      opt.textContent = `${c.nome} (${c.raca})`;
      selectCao.appendChild(opt);
    });
  }

  function abrirModalGlobal() {
    carregarOpcoesCaesModal();
    if (formVacinaGlobal) formVacinaGlobal.reset();
    if (modalVGlobal && modalContentGlobal) {
      modalVGlobal.classList.remove('hidden');
      setTimeout(() => {
        modalVGlobal.classList.remove('opacity-0');
        modalContentGlobal.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalGlobal() {
    if (modalVGlobal && modalContentGlobal) {
      modalVGlobal.classList.add('opacity-0');
      modalContentGlobal.classList.add('scale-95');
      setTimeout(() => {
        modalVGlobal.classList.add('hidden');
      }, 200);
    }
  }

  if (btnAbrirModal) btnAbrirModal.onclick = (e) => { e.preventDefault(); abrirModalGlobal(); };
  if (btnFecharModalGlobal) btnFecharModalGlobal.onclick = fecharModalGlobal;
  if (btnCancelarModalGlobal) btnCancelarModalGlobal.onclick = fecharModalGlobal;
  if (modalVGlobal) modalVGlobal.onclick = (e) => { if (e.target === modalVGlobal) fecharModalGlobal(); };

  if (formVacinaGlobal) {
    formVacinaGlobal.onsubmit = (e) => {
      e.preventDefault();

      const selectedOption = selectCao.options[selectCao.selectedIndex];
      const caoNome = selectCao.value;
      const caoRaca = selectedOption?.dataset?.raca || 'Cão';
      const caoFoto = selectedOption?.dataset?.foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400';

      const vacinaNome = document.getElementById('vglobal-nome').value.trim();
      const dataDoseRaw = document.getElementById('vglobal-data-dose').value;
      const dataProximaRaw = document.getElementById('vglobal-data-proxima').value;

      const [a1, m1, d1] = dataDoseRaw.split('-');
      const [a2, m2, d2] = dataProximaRaw.split('-');

      const dataFmtDose = `${d1}/${m1}/${a1}`;
      const dataFmtProxima = `${d2}/${m2}/${a2}`;

      const vacinas = obterVacinas();
      const novaVacina = {
        id: Date.now(),
        caoNome,
        caoRaca,
        caoFoto,
        vacinaNome,
        dataAplicacao: dataFmtDose,
        proximaDose: dataFmtProxima,
        dataAplicacaoIso: dataDoseRaw,
        proximaDoseIso: dataProximaRaw
      };

      vacinas.unshift(novaVacina);
      localStorage.setItem('canil_vacinas', JSON.stringify(vacinas));

      fecharModalGlobal();
      renderizarDashboardEVacinas();
      mostrarToast(`Vacina ${vacinaNome} cadastrada com sucesso!`);
    };
  }

  // BUSCA E FILTROS
  if (inputBusca) {
    inputBusca.addEventListener('input', renderizarDashboardEVacinas);
  }

  if (containerFiltros) {
    const botoes = containerFiltros.querySelectorAll('button');
    botoes.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        botoes.forEach(b => {
          b.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-50 transition-colors";
        });
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-laranja text-white";

        filtroVacinaAtual = btn.textContent.trim().toLowerCase();
        renderizarDashboardEVacinas();
      });
    });
  }

  renderizarDashboardEVacinas();
});