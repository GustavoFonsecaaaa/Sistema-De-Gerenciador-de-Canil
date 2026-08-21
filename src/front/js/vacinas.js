document.addEventListener('DOMContentLoaded', () => {
  console.log("Script vacinas.js carregado com sucesso!");

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
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
  let vacinasCache = [];
  let caesCache = [];

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

  function formatarDataBR(isoStr) {
    if (!isoStr) return '-';
    const clean = isoStr.split('T')[0];
    const p = clean.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : isoStr;
  }

  function formatarDataISO(isoStr) {
    if (!isoStr) return '';
    return isoStr.split('T')[0];
  }

  async function carregarDadosDoBackend() {
    try {
      // Buscar cães e vacinas em paralelo
      const [resCaes, resVacinas] = await Promise.all([
        fetch('/api/cachorros', {
          headers: { 'Authorization': 'Bearer ' + token }
        }),
        fetch('/api/vacinas', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
      ]);

      if (resCaes.status === 401 || resCaes.status === 403 || resVacinas.status === 401 || resVacinas.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (resCaes.ok) {
        caesCache = await resCaes.json();
        popularSelectCaes();
      }

      if (resVacinas.ok) {
        vacinasCache = await resVacinas.json();
        renderizarTabela();
      }
    } catch (erro) {
      console.error('Erro ao carregar vacinas/cães:', erro);
    }
  }

  function popularSelectCaes() {
    if (!selectCaoGlobal) return;
    selectCaoGlobal.innerHTML = '<option value="">Selecione o cachorro...</option>';

    if (caesCache.length === 0) {
      selectCaoGlobal.innerHTML = '<option value="">Nenhum cão cadastrado no sistema</option>';
      return;
    }

    caesCache.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.nome} (${c.raca})`;
      selectCaoGlobal.appendChild(opt);
    });
  }

  function renderizarTabela() {
    const busca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const seteDias = new Date(hoje); seteDias.setDate(hoje.getDate() + 7);

    // Lógica: A tabela global exibe a dose MAIS RECENTE de cada vacina por cachorro
    const activeVacinasMap = {};
    vacinasCache.forEach(v => {
        const caoNome = (v.cachorro_nome || '').trim().toLowerCase();
        const vacinaNome = (v.nome_vacina || '').trim().toLowerCase();
        const key = `${caoNome}_${vacinaNome}`;

        const dataAplicacao = new Date(v.data_aplicacao);
        if (!activeVacinasMap[key] || dataAplicacao > new Date(activeVacinasMap[key].data_aplicacao)) {
            activeVacinasMap[key] = v;
        }
    });

    const activeVacinas = Object.values(activeVacinasMap);

    let totalVencidas = 0;
    let totalVencemBreve = 0;
    const caesVacinadosSet = new Set();

    activeVacinas.forEach(v => {
      const dtProxima = new Date(v.proxima_dose);
      if (dtProxima < hoje) {
        totalVencidas++;
      } else {
        caesVacinadosSet.add((v.cachorro_nome || '').toLowerCase());
        if (dtProxima <= seteDias) totalVencemBreve++;
      }
    });

    if (statTotalRegistros) statTotalRegistros.textContent = vacinasCache.length;
    if (statCaesVacinados) statCaesVacinados.textContent = caesVacinadosSet.size;
    if (statSubCaes) statSubCaes.textContent = `de ${caesCache.length} cães no canil`;
    if (statVencidas) statVencidas.textContent = totalVencidas;
    if (statVencemBreve) statVencemBreve.textContent = totalVencemBreve;

    const filtradas = activeVacinas.filter(v => {
      const nomeCao = (v.cachorro_nome || '').toLowerCase();
      const racaCao = (v.cachorro_raca || '').toLowerCase();
      const nomeVacina = (v.nome_vacina || '').toLowerCase();

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
      const dtProxima = new Date(v.proxima_dose);
      const estaVencida = dtProxima < hoje;

      const textoProxima = estaVencida ? 'Vencida!' : formatarDataBR(v.proxima_dose);
      const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
      const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
      const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

      const fotoExibicao = v.cachorro_foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';
      const racaExibicao = v.cachorro_raca || '';

      const tr = document.createElement('tr');
      tr.className = "hover:bg-[#FAF8F5] transition-colors text-xs border-b border-[#FAFAF9]";

      tr.innerHTML = `
        <td class="py-3.5 px-5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-bege flex-shrink-0 border border-[#EFECE6]">
              <img src="${fotoExibicao}" alt="${v.cachorro_nome}" class="w-full h-full object-cover">
            </div>
            <div><div class="font-bold text-[#111827]">${v.cachorro_nome}</div><div class="text-[10px] text-[#6B7280]">${racaExibicao}</div></div>
          </div>
        </td>
        <td class="py-3.5 px-5 font-bold text-[#111827]">${v.nome_vacina}</td>
        <td class="py-3.5 px-5 text-[#6B7280]">${formatarDataBR(v.data_aplicacao)}</td>
        <td class="py-3.5 px-5 font-bold ${corTextoProxima}">${textoProxima}</td>
        <td class="py-3.5 px-5"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClasse}">${badgeTexto}</span></td>
        <td class="py-3.5 px-5 text-right">
          <div class="flex items-center justify-end gap-1">
            <button class="btn-editar-v p-1.5 rounded-lg text-gray-400 hover:text-laranja hover:bg-orange-50 transition-all" title="Editar vacina"><i class="ri-edit-line text-sm"></i></button>
            <button class="btn-excluir-v p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Excluir vacina"><i class="ri-delete-bin-line text-sm"></i></button>
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
    formGlobal.onsubmit = async (e) => {
      e.preventDefault();
      if (!selectCaoGlobal || !selectCaoGlobal.value) { alert("Por favor, selecione um cachorro."); return; }

      const cachorro_id = parseInt(selectCaoGlobal.value);
      const nome_vacina = document.getElementById('vglobal-nome').value.trim();
      const data_aplicacao = document.getElementById('vglobal-data-dose').value;
      const proxima_dose = document.getElementById('vglobal-data-proxima').value;

      try {
        const resposta = await fetch('/api/vacinas', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cachorro_id, nome_vacina, data_aplicacao, proxima_dose })
        });

        if (resposta.ok) {
          fecharModalCadastrar();
          const cao = caesCache.find(c => c.id === cachorro_id);
          mostrarToast(`Vacina registrada${cao ? ' para ' + cao.nome : ''}!`);
          await carregarDadosDoBackend();
        } else {
          const erro = await resposta.json();
          alert(erro.mensagem || 'Erro ao cadastrar vacina.');
        }
      } catch (err) {
        console.error('Erro no cadastramento de vacina:', err);
        alert('Erro ao conectar ao servidor.');
      }
    };
  }

  function abrirModalEditar(vacina) {
    document.getElementById('veditar-id').value = vacina.id;
    document.getElementById('veditar-cao-nome').value = `${vacina.cachorro_nome} (${vacina.cachorro_raca || ''})`;
    document.getElementById('veditar-nome').value = vacina.nome_vacina;
    document.getElementById('veditar-data-dose').value = formatarDataISO(vacina.data_aplicacao);
    document.getElementById('veditar-data-proxima').value = formatarDataISO(vacina.proxima_dose);

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
    formEditar.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('veditar-id').value;
      const nome_vacina = document.getElementById('veditar-nome').value.trim();
      const data_aplicacao = document.getElementById('veditar-data-dose').value;
      const proxima_dose = document.getElementById('veditar-data-proxima').value;

      try {
        const resposta = await fetch(`/api/vacinas/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome_vacina, data_aplicacao, proxima_dose })
        });

        if (resposta.ok) {
          fecharModalEditar();
          mostrarToast("Vacina atualizada com sucesso!");
          await carregarDadosDoBackend();
        } else {
          const erro = await resposta.json();
          alert(erro.mensagem || 'Erro ao atualizar vacina.');
        }
      } catch (err) {
        console.error('Erro na atualização da vacina:', err);
        alert('Erro ao conectar ao servidor.');
      }
    };
  }

  function abrirModalExcluir(vacina) {
    idVacinaExcluir = vacina.id;
    if (textoConfirmacaoExclusao) textoConfirmacaoExclusao.textContent = `Tem certeza que deseja excluir a vacina ${vacina.nome_vacina} de ${vacina.cachorro_nome}?`;
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
    btnConfirmarExcluir.onclick = async () => {
      if (!idVacinaExcluir) return;

      try {
        const resposta = await fetch(`/api/vacinas/${idVacinaExcluir}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (resposta.ok) {
          fecharModalExcluir();
          mostrarToast("Vacina excluída do sistema.");
          await carregarDadosDoBackend();
        } else {
          const erro = await resposta.json();
          alert(erro.mensagem || 'Erro ao excluir vacina.');
        }
      } catch (err) {
        console.error('Erro na exclusão de vacina:', err);
        alert('Erro ao conectar ao servidor.');
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

  carregarDadosDoBackend();
});