document.addEventListener('DOMContentLoaded', () => {
  console.log("Script vacinas.js carregado com sucesso!");

  function lerDadosSalvos(chave) {
    try {
      const dados = localStorage.getItem(chave);
      return dados ? JSON.parse(dados) : [];
    } catch (e) {
      console.warn(`Cache corrompido na chave ${chave}. Limpando...`);
      localStorage.setItem(chave, '[]');
      return [];
    }
  }

  const tabelaBody = document.getElementById('tabela-vacinas-body');
  const emptyState = document.getElementById('empty-state-vacinas');

  const statTotalRegistros = document.getElementById('stat-total-registros');
  const statCaesVacinados = document.getElementById('stat-caes-vacinados');
  const statSubCaes = document.getElementById('stat-sub-caes');
  const statVencidas = document.getElementById('stat-vencidas');
  const statVencemBreve = document.getElementById('stat-vencem-breve');

  const inputBusca = document.getElementById('input-busca-vacinas');
  const containerFiltros = document.getElementById('container-filtros-vacinas');
  let filtroVacinaAtual = 'Todas';

  const btnAbrirModal = document.getElementById('btn-abrir-modal-vacina');
  const modalGlobal = document.getElementById('modal-vacinas-global');
  const btnFecharModalGlobal = document.getElementById('btn-fechar-modal-vglobal');
  const btnCancelarModalGlobal = document.getElementById('btn-cancelar-modal-vglobal');
  const formGlobal = document.getElementById('form-vacina-global');
  const selectCaoGlobal = document.getElementById('vglobal-select-cao');

  const modalEditar = document.getElementById('modal-editar-vacina');
  const btnFecharModalEditar = document.getElementById('btn-fechar-modal-veditar');
  const btnCancelarModalEditar = document.getElementById('btn-cancelar-modal-veditar');
  const formEditar = document.getElementById('form-editar-vacina');

  const modalExcluir = document.getElementById('modal-confirmar-exclusao');
  const btnCancelarExcluir = document.getElementById('btn-cancelar-exclusao');
  const btnConfirmarExcluir = document.getElementById('btn-confirmar-exclusao');
  const textoConfirmacaoExclusao = document.getElementById('texto-confirmacao-exclusao');

  const toastVacina = document.getElementById('toast-vacina');
  let idVacinaExcluir = null;

  function mostrarToast(msg = "Operação realizada com sucesso!") {
    if (!toastVacina) return;
    const span = toastVacina.querySelector('span');
    if (span) span.textContent = msg;

    toastVacina.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastVacina.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toastVacina.classList.remove('opacity-100', 'translate-y-0');
      toastVacina.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function salvarVacinas(lista) {
    localStorage.setItem('canil_vacinas', JSON.stringify(lista));
    renderizarTabela();
  }

  function popularSelectCaes() {
    if (!selectCaoGlobal) return;
    const caes = lerDadosSalvos('canil_cachorros');
    selectCaoGlobal.innerHTML = '<option value="">Selecione o cachorro...</option>';

    if (caes.length === 0) {
      selectCaoGlobal.innerHTML = '<option value="">Nenhum cão cadastrado no sistema</option>';
      return;
    }

    caes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ nome: c.nome, raca: c.raca }); // OTIMIZAÇÃO: Não carrega foto no select
      opt.textContent = `${c.nome} (${c.raca})`;
      selectCaoGlobal.appendChild(opt);
    });
  }

  function formatarDataBR(iso) {
    if (!iso) return '-';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  function renderizarTabela() {
    const vacinas = lerDadosSalvos('canil_vacinas');
    const caes = lerDadosSalvos('canil_cachorros');
    const busca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const seteDias = new Date(hoje); seteDias.setDate(hoje.getDate() + 7);

    let totalVencidas = 0;
    let totalVencemBreve = 0;
    const caesVacinadosSet = new Set();

    vacinas.forEach(v => {
      const dtProxima = new Date(v.proximaDoseIso);
      if (dtProxima < hoje) {
        totalVencidas++;
      } else {
        caesVacinadosSet.add((v.caoNome || '').toLowerCase());
        if (dtProxima <= seteDias) totalVencemBreve++;
      }
    });

    if (statTotalRegistros) statTotalRegistros.textContent = vacinas.length;
    if (statCaesVacinados) statCaesVacinados.textContent = caesVacinadosSet.size;
    if (statSubCaes) statSubCaes.textContent = `de ${caes.length} cães no canil`;
    if (statVencidas) statVencidas.textContent = totalVencidas;
    if (statVencemBreve) statVencemBreve.textContent = totalVencemBreve;

    const filtradas = vacinas.filter(v => {
      const nomeCao = (v.caoNome || '').toLowerCase();
      const racaCao = (v.caoRaca || '').toLowerCase();
      const nomeVacina = (v.vacinaNome || '').toLowerCase();

      let passaFiltro = filtroVacinaAtual === 'Todas' || nomeVacina.includes(filtroVacinaAtual.toLowerCase());
      let passaBusca = busca === '' || nomeCao.includes(busca) || racaCao.includes(busca) || nomeVacina.includes(busca);

      return passaFiltro && passaBusca;
    });

    if (!tabelaBody) return;
    tabelaBody.innerHTML = '';

    if (filtradas.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    filtradas.forEach(v => {
      const dtProxima = new Date(v.proximaDoseIso);
      const estaVencida = dtProxima < hoje;

      const textoProxima = estaVencida ? 'Vencida!' : v.proximaDose;
      const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
      const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
      const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

      // BUSCA IMAGEM E RAÇA DIRETAMENTE DA LISTA DE CÃES
      const caoRef = caes.find(c => c.nome === v.caoNome) || {};
      const fotoExibicao = caoRef.foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';
      const racaExibicao = caoRef.raca || v.caoRaca || '';

      const tr = document.createElement('tr');
      tr.className = "hover:bg-[#FAF8F5] transition-colors text-xs border-b border-[#FAFAF9]";

      tr.innerHTML = `
        <td class="py-3.5 px-5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-bege flex-shrink-0 border border-[#EFECE6]">
              <img src="${fotoExibicao}" alt="${v.caoNome}" class="w-full h-full object-cover">
            </div>
            <div><div class="font-bold text-[#111827]">${v.caoNome}</div><div class="text-[10px] text-[#6B7280]">${racaExibicao}</div></div>
          </div>
        </td>
        <td class="py-3.5 px-5 font-bold text-[#111827]">${v.vacinaNome}</td>
        <td class="py-3.5 px-5 text-[#6B7280]">${v.dataAplicacao}</td>
        <td class="py-3.5 px-5 font-bold ${corTextoProxima}">${textoProxima}</td>
        <td class="py-3.5 px-5"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClasse}">${badgeTexto}</span></td>
        <td class="py-3.5 px-5 text-right">
          <div class="flex items-center justify-end gap-1">
            <button class="btn-editar-v p-1.5 rounded-lg text-gray-400 hover:text-laranja hover:bg-orange-50 transition-all"><i class="ri-edit-line text-sm"></i></button>
            <button class="btn-excluir-v p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><i class="ri-delete-bin-line text-sm"></i></button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-editar-v').onclick = () => abrirModalEditar(v);
      tr.querySelector('.btn-excluir-v').onclick = () => abrirModalExcluir(v);
      tabelaBody.appendChild(tr);
    });
  }

  function abrirModalCadastrar() {
    if (formGlobal) formGlobal.reset();
    popularSelectCaes();
    if (modalGlobal) {
      modalGlobal.classList.remove('hidden');
      setTimeout(() => { modalGlobal.classList.remove('opacity-0'); const t = modalGlobal.querySelector('.transform'); if (t) t.classList.remove('scale-95'); }, 10);
    }
  }

  function fecharModalCadastrar() {
    if (modalGlobal) {
      modalGlobal.classList.add('opacity-0');
      const t = modalGlobal.querySelector('.transform'); if (t) t.classList.add('scale-95');
      setTimeout(() => modalGlobal.classList.add('hidden'), 200);
    }
  }

  if (btnAbrirModal) btnAbrirModal.onclick = (e) => { e.preventDefault(); abrirModalCadastrar(); };
  if (btnFecharModalGlobal) btnFecharModalGlobal.onclick = fecharModalCadastrar;
  if (btnCancelarModalGlobal) btnCancelarModalGlobal.onclick = fecharModalCadastrar;

  if (formGlobal) {
    formGlobal.onsubmit = (e) => {
      e.preventDefault();
      if (!selectCaoGlobal || !selectCaoGlobal.value) { alert("Por favor, selecione um cachorro."); return; }

      try {
        const caoObj = JSON.parse(selectCaoGlobal.value);
        const dtDoseRaw = document.getElementById('vglobal-data-dose').value;
        const dtProximaRaw = document.getElementById('vglobal-data-proxima').value;

        const vacinas = lerDadosSalvos('canil_vacinas');
        
        // OTIMIZAÇÃO CRUCIAL: Removemos o salvamento duplicado da foto base64
        vacinas.unshift({
          id: Date.now(),
          caoNome: caoObj.nome, 
          caoRaca: caoObj.raca,
          vacinaNome: document.getElementById('vglobal-nome').value.trim(),
          dataAplicacao: formatarDataBR(dtDoseRaw), 
          proximaDose: formatarDataBR(dtProximaRaw),
          dataAplicacaoIso: dtDoseRaw, 
          proximaDoseIso: dtProximaRaw
        });

        salvarVacinas(vacinas);
        fecharModalCadastrar();
        mostrarToast(`Vacina registrada para ${caoObj.nome}!`);
      } catch (err) {
        console.error(err);
      }
    };
  }

  function abrirModalEditar(vacina) {
    document.getElementById('veditar-id').value = vacina.id;
    document.getElementById('veditar-cao-nome').value = `${vacina.caoNome} (${vacina.caoRaca || ''})`;
    document.getElementById('veditar-nome').value = vacina.vacinaNome;
    document.getElementById('veditar-data-dose').value = vacina.dataAplicacaoIso || '';
    document.getElementById('veditar-data-proxima').value = vacina.proximaDoseIso || '';

    if (modalEditar) {
      modalEditar.classList.remove('hidden');
      setTimeout(() => { modalEditar.classList.remove('opacity-0'); const t = modalEditar.querySelector('.transform'); if (t) t.classList.remove('scale-95'); }, 10);
    }
  }

  function fecharModalEditar() {
    if (modalEditar) {
      modalEditar.classList.add('opacity-0');
      const t = modalEditar.querySelector('.transform'); if (t) t.classList.add('scale-95');
      setTimeout(() => modalEditar.classList.add('hidden'), 200);
    }
  }

  if (btnFecharModalEditar) btnFecharModalEditar.onclick = fecharModalEditar;
  if (btnCancelarModalEditar) btnCancelarModalEditar.onclick = fecharModalEditar;

  if (formEditar) {
    formEditar.onsubmit = (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('veditar-id').value);
      const dtDoseRaw = document.getElementById('veditar-data-dose').value;
      const dtProximaRaw = document.getElementById('veditar-data-proxima').value;

      const vacinas = lerDadosSalvos('canil_vacinas');
      const idx = vacinas.findIndex(v => v.id === id);

      if (idx !== -1) {
        vacinas[idx].vacinaNome = document.getElementById('veditar-nome').value.trim();
        vacinas[idx].dataAplicacaoIso = dtDoseRaw;
        vacinas[idx].proximaDoseIso = dtProximaRaw;
        vacinas[idx].dataAplicacao = formatarDataBR(dtDoseRaw);
        vacinas[idx].proximaDose = formatarDataBR(dtProximaRaw);

        salvarVacinas(vacinas);
        fecharModalEditar();
        mostrarToast("Vacina atualizada com sucesso!");
      }
    };
  }

  function abrirModalExcluir(vacina) {
    idVacinaExcluir = vacina.id;
    if (textoConfirmacaoExclusao) textoConfirmacaoExclusao.textContent = `Tem certeza que deseja excluir a vacina ${vacina.vacinaNome} de ${vacina.caoNome}?`;
    if (modalExcluir) {
      modalExcluir.classList.remove('hidden');
      setTimeout(() => { modalExcluir.classList.remove('opacity-0'); const t = modalExcluir.querySelector('.transform'); if (t) t.classList.remove('scale-95'); }, 10);
    }
  }

  function fecharModalExcluir() {
    if (modalExcluir) {
      modalExcluir.classList.add('opacity-0');
      const t = modalExcluir.querySelector('.transform'); if (t) t.classList.add('scale-95');
      setTimeout(() => modalExcluir.classList.add('hidden'), 200);
    }
  }

  if (btnCancelarExcluir) btnCancelarExcluir.onclick = fecharModalExcluir;

  if (btnConfirmarExcluir) {
    btnConfirmarExcluir.onclick = () => {
      if (idVacinaExcluir) {
        let vacinas = lerDadosSalvos('canil_vacinas').filter(v => v.id !== idVacinaExcluir);
        salvarVacinas(vacinas);
        fecharModalExcluir();
        mostrarToast("Vacina excluída do sistema.");
      }
    };
  }

  if (inputBusca) inputBusca.addEventListener('input', renderizarTabela);

  if (containerFiltros) {
    const btns = containerFiltros.querySelectorAll('button');
    btns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        btns.forEach(b => b.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-50 transition-colors");
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-laranja text-white";
        filtroVacinaAtual = btn.textContent.trim();
        renderizarTabela();
      };
    });
  }

  renderizarTabela();
});