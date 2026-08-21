document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com acordeão individual por card!");

  const containerRacoes = document.querySelector('.container-racoes');
  const containerSacoAberto = document.getElementById('container-saco-aberto-destaque');

  const btnAdicionar = document.getElementById('btn-adicionar-racao');
  const inputBusca = document.getElementById('input-busca-racao');

  // Modais
  const modalAdicionar = document.getElementById('modal-adicionar');
  const modalEditar = document.getElementById('modal-editar');
  const modalExcluir = document.getElementById('modal-excluir');

  // Form Adicionar
  const formAdicionar = document.getElementById('form-adicionar-racao');
  const btnFecharAdd = document.getElementById('btn-fechar-modal-adicionar');
  const btnCancelarAdd = document.getElementById('btn-cancelar-adicionar');

  // Form Editar
  const formEditar = document.getElementById('form-editar-racao');
  const btnFecharEdit = document.getElementById('btn-fechar-modal-editar');
  const btnCancelarEdit = document.getElementById('btn-cancelar-editar');

  // Modal Excluir
  const btnCancelarExcluir = document.getElementById('btn-cancelar-modal');
  const btnConfirmarExcluir = document.getElementById('btn-confirmar-modal');

  const toast = document.getElementById('toast-sucesso');

  let idRacaoParaExcluir = null;
  let idRacaoParaEditar = null;

  let racoesCache = [];
  let consumoCache = [];

  function formatarDataBR(isoDate) {
    if (!isoDate) return '-';
    const rawDate = isoDate.split('T')[0];
    const partes = rawDate.split('-');
    if (partes.length !== 3) return isoDate;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function calcularDiasDecorridos(dataIso) {
    if (!dataIso) return 0;
    const raw = dataIso.split('T')[0];
    const [a, m, d] = raw.split('-');
    const dt = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = hoje - dt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }

  function calcularDiferencaDias(dataInicioIso, dataFimIso) {
    if (!dataInicioIso || !dataFimIso) return 0;
    const p1 = dataInicioIso.split('T')[0].split('-');
    const p2 = dataFimIso.split('T')[0].split('-');
    const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
    const d2 = new Date(p2[0], p2[1] - 1, p2[2]);

    const diffTime = d2 - d1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }

  async function carregarRacoesDoBackend() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const resposta = await fetch('/api/racoes', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (resposta.ok) {
        racoesCache = await resposta.json();
        renderizarGrid();
        atualizarEstatisticas();
      }
    } catch (erro) {
      console.error('Erro ao carregar rações do servidor:', erro);
    }
  }

  async function carregarConsumoDoBackend() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const resposta = await fetch('/api/consumo', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resposta.ok) {
        consumoCache = await resposta.json();
        renderizarSacoAberto();
        renderizarGrid();
      }
    } catch (erro) {
      console.error('Erro ao carregar consumo do servidor:', erro);
    }
  }

  function renderizarSacoAberto() {
    if (!containerSacoAberto) return;
    containerSacoAberto.innerHTML = '';

    const sacoAberto = consumoCache.find(c => !c.data_fim);

    if (!sacoAberto) {
      containerSacoAberto.innerHTML = `
        <div class="bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <i class="ri-information-line text-laranja text-base"></i>
          <span>Nenhum saco de ração aberto no momento. Clique em <b>"Abrir Novo Saco Hoje"</b> em uma das rações abaixo.</span>
        </div>
      `;
      return;
    }

    const diasDecorridos = calcularDiasDecorridos(sacoAberto.data_abertura);

    const cardDestaque = document.createElement('div');
    cardDestaque.className = "bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border border-[#FCD34D] rounded-2xl p-5 shadow-sm flex items-center justify-between";

    cardDestaque.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-laranja text-white flex items-center justify-center text-2xl shadow-sm">
          <i class="ri-box-3-line"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-laranja text-white tracking-wider">Saco Atualmente Aberto</span>
            <span class="text-xs font-bold text-[#B45309]">Aberto há ${diasDecorridos} dia(s)</span>
          </div>
          <h3 class="font-bold text-base text-[#111827] mt-1">${sacoAberto.marca} — ${sacoAberto.tipo}</h3>
          <p class="text-xs text-[#6B7280]">Peso: ${sacoAberto.peso_kg} kg · Aberto em: ${formatarDataBR(sacoAberto.data_abertura)}</p>
        </div>
      </div>
      <button type="button" class="btn-finalizar-saco bg-laranja hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <i class="ri-checkbox-circle-line text-base"></i> Finalizar Saco
      </button>
    `;

    cardDestaque.querySelector('.btn-finalizar-saco').onclick = async () => {
      await finalizarSaco(sacoAberto.id);
    };

    containerSacoAberto.appendChild(cardDestaque);
  }

  async function finalizarSaco(consumoId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const hojeIso = new Date().toISOString().split('T')[0];

    try {
      const resposta = await fetch(`/api/consumo/${consumoId}/fechar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ data_fim: hojeIso })
      });

      if (resposta.ok) {
        mostrarToast('Saco finalizado com sucesso!');
        await carregarConsumoDoBackend();
      } else {
        mostrarToast('Erro ao finalizar saco.');
      }
    } catch (erro) {
      console.error('Erro ao finalizar saco:', erro);
      mostrarToast('Não foi possível conectar ao servidor.');
    }
  }

  function renderizarGrid() {
    if (!containerRacoes) return;

    const busca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    containerRacoes.innerHTML = '';

    const filtradas = racoesCache.filter(r => {
      const marcaStr = (r.marca || '').toLowerCase();
      const tipoStr = (r.tipo || '').toLowerCase();
      return marcaStr.includes(busca) || tipoStr.includes(busca);
    });

    if (filtradas.length === 0) {
      containerRacoes.innerHTML = `
        <div class="col-span-3 text-center py-16">
          <div class="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EFECE6] flex items-center justify-center text-gray-400 text-xl mx-auto mb-3">
            <i class="ri-goblet-line"></i>
          </div>
          <h3 class="font-serif text-base font-bold text-[#111827]">Nenhuma ração encontrada</h3>
          <p class="text-xs text-gray-500">Tente cadastrar uma nova ração ou ajustar a busca.</p>
        </div>
      `;
      return;
    }

    filtradas.forEach(r => {
      const pesoKg = parseFloat(r.peso_saco_kg) || 0;
      const unidades = parseInt(r.unidades) || 0;
      const totalKg = pesoKg * unidades;
      const ehEstoqueBaixo = unidades <= 1;

      const statusBadge = ehEstoqueBaixo
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">Baixo</span>`
        : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-verdeokbg text-verdeok">OK</span>`;

      // Filtra os consumos finalizados específicos deste card (mesma marca, tipo e peso_saco_kg)
      const finalizadosDoCard = consumoCache.filter(c => {
        if (!c.data_fim) return false;
        const mesmaMarca = (c.marca || '').trim().toLowerCase() === (r.marca || '').trim().toLowerCase();
        const mesmoTipo = (c.tipo || '').trim().toLowerCase() === (r.tipo || '').trim().toLowerCase();
        const mesmoPeso = parseFloat(c.peso_kg) === pesoKg;
        return mesmaMarca && mesmoTipo && mesmoPeso;
      });

      const countHistorico = finalizadosDoCard.length;

      const card = document.createElement('div');
      card.className = "bg-white border border-[#EFECE6] hover:border-laranja rounded-2xl p-5 shadow-sm flex flex-col justify-between group transition-all";

      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-verdeokbg flex items-center justify-center text-verdeok">
                <i class="ri-goblet-line text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-sm text-[#111827]">${r.marca}</h3>
                <p class="text-[11px] text-[#6B7280]">${r.tipo}</p>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="grid grid-cols-2 gap-y-2 gap-x-4 border-b border-[#FAFAF9] pb-3 mb-3 text-xs">
            <div>
              <span class="text-[10px] text-[#6B7280] block">Peso do saco</span>
              <span class="font-bold text-[#111827]">${pesoKg} kg</span>
            </div>
            <div>
              <span class="text-[10px] text-[#6B7280] block">Data compra</span>
              <span class="font-bold text-[#111827]">${formatarDataBR(r.data_compra)}</span>
            </div>
            <div class="col-span-2">
              <span class="text-[10px] text-[#6B7280] block">Total estoque</span>
              <span class="font-bold text-[#111827]">${totalKg} kg (${unidades} sacos)</span>
            </div>
          </div>

          <!-- Botão Abrir Novo Saco -->
          <button class="btn-abrir-saco w-full bg-[#FAF8F5] hover:bg-laranja hover:text-white border border-[#EFECE6] text-laranja font-bold text-[11px] py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 mb-2">
            <i class="ri-box-3-line"></i> Abrir Novo Saco Hoje
          </button>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs pt-2 border-t border-[#FAFAF9]">
            <div class="flex items-center gap-2">
              <span class="text-[#6B7280]">Sacos:</span>
              <div class="flex items-center bg-[#FAFAF9] border border-[#EFECE6] rounded-lg p-0.5">
                <button class="btn-qtd-menos w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold">-</button>
                <span class="px-3 font-bold ${ehEstoqueBaixo ? 'text-[#B45309]' : 'text-[#111827]'}">${unidades}</span>
                <button class="btn-qtd-mais w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold">+</button>
              </div>
            </div>
            
            <div class="flex items-center gap-1 bg-[#FAFAF9] border border-[#EFECE6] rounded-lg p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="btn-editar w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Editar ração">
                <i class="ri-edit-line text-sm"></i>
              </button>
              <button class="btn-excluir w-7 h-7 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded text-gray-400 transition-colors" title="Excluir ração">
                <i class="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>

          <!-- ACORDEÃO HISTÓRICO DE CONSUMO -->
          <div class="mt-3 pt-2.5 border-t border-[#EFECE6]">
            <button type="button" class="btn-toggle-historico-racao flex items-center justify-between w-full text-left text-[10px] font-bold text-[#6B7280] hover:text-[#111827] uppercase tracking-wider py-1 px-1.5 rounded-lg hover:bg-gray-100/70 transition-all cursor-pointer">
              <span>Histórico de Consumo (${countHistorico})</span>
              <i class="ri-arrow-down-s-line icone-seta-racao text-sm transition-transform duration-200"></i>
            </button>
            <div class="container-historico-racao hidden space-y-1.5 mt-2"></div>
          </div>
        </div>
      `;

      // Popula o container-historico-racao com os itens finalizados deste card
      const containerHistRacao = card.querySelector('.container-historico-racao');
      if (containerHistRacao) {
        if (finalizadosDoCard.length === 0) {
          containerHistRacao.innerHTML = `<p class="text-[11px] text-gray-400 italic py-1">Nenhum histórico finalizado.</p>`;
        } else {
          finalizadosDoCard.forEach(c => {
            const duracao = calcularDiferencaDias(c.data_abertura, c.data_fim);
            const itemHtml = `
              <div class="flex items-center justify-between bg-[#FAF8F5] border border-[#EFECE6] p-2 rounded-xl text-xs">
                <div>
                  <span class="font-bold text-[#111827] block text-[11px]">Aberto em: ${formatarDataBR(c.data_abertura)}</span>
                  <span class="text-[10px] text-gray-500">Fechado em: ${formatarDataBR(c.data_fim)}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-[#EFECE6] text-laranja">
                  Durou ${duracao}d
                </span>
              </div>
            `;
            containerHistRacao.insertAdjacentHTML('beforeend', itemHtml);
          });
        }
      }

      // Evento Toggle Acordeão
      const btnToggle = card.querySelector('.btn-toggle-historico-racao');
      const iconeSeta = card.querySelector('.icone-seta-racao');

      if (btnToggle && containerHistRacao) {
        btnToggle.onclick = (e) => {
          e.stopPropagation();
          const estaEscondido = containerHistRacao.classList.contains('hidden');
          if (estaEscondido) {
            containerHistRacao.classList.remove('hidden');
            if (iconeSeta) {
              iconeSeta.classList.remove('ri-arrow-down-s-line');
              iconeSeta.classList.add('ri-arrow-up-s-line');
            }
          } else {
            containerHistRacao.classList.add('hidden');
            if (iconeSeta) {
              iconeSeta.classList.remove('ri-arrow-up-s-line');
              iconeSeta.classList.add('ri-arrow-down-s-line');
            }
          }
        };
      }

      // Eventos
      card.querySelector('.btn-abrir-saco').onclick = () => abrirNovoSacoHoje(r);
      card.querySelector('.btn-qtd-menos').onclick = () => alterarQtd(r, -1);
      card.querySelector('.btn-qtd-mais').onclick = () => alterarQtd(r, 1);
      card.querySelector('.btn-editar').onclick = () => abrirModalEditar(r);
      card.querySelector('.btn-excluir').onclick = () => abrirModalExcluir(r.id);

      containerRacoes.appendChild(card);
    });
  }

  async function abrirNovoSacoHoje(racao) {
    const token = localStorage.getItem('token');
    if (!token) return;

    if ((parseInt(racao.unidades) || 0) <= 0) {
      mostrarToast('Atenção: Não há sacos em estoque para abrir.');
      return;
    }

    const novasUnidades = Math.max(0, (parseInt(racao.unidades) || 0) - 1);
    const data_compra = racao.data_compra ? racao.data_compra.split('T')[0] : null;
    const hojeIso = new Date().toISOString().split('T')[0];

    try {
      // 1. Reduz 1 unidade no estoque (Racao)
      const resPut = await fetch(`/api/racoes/${racao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          marca: racao.marca,
          tipo: racao.tipo,
          peso_saco_kg: racao.peso_saco_kg,
          unidades: novasUnidades,
          data_compra
        })
      });

      if (!resPut.ok) {
        mostrarToast('Erro ao atualizar estoque da ração.');
        return;
      }

      // 2. Registra a abertura do saco no ConsumoRacao
      const resPost = await fetch('/api/consumo/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          marca: racao.marca,
          tipo: racao.tipo,
          peso_kg: racao.peso_saco_kg,
          data_abertura: hojeIso
        })
      });

      if (resPost.ok) {
        mostrarToast(`Saco de ${racao.marca} registrado como aberto hoje!`);
        await carregarRacoesDoBackend();
        await carregarConsumoDoBackend();
      } else {
        mostrarToast('Erro ao registrar abertura no consumo.');
      }
    } catch (erro) {
      console.error('Erro ao abrir novo saco:', erro);
      mostrarToast('Não foi possível conectar ao servidor.');
    }
  }

  async function alterarQtd(racao, delta) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const novasUnidades = Math.max(0, (parseInt(racao.unidades) || 0) + delta);
    const data_compra = racao.data_compra ? racao.data_compra.split('T')[0] : null;

    try {
      const resposta = await fetch(`/api/racoes/${racao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          marca: racao.marca,
          tipo: racao.tipo,
          peso_saco_kg: racao.peso_saco_kg,
          unidades: novasUnidades,
          data_compra
        })
      });

      if (resposta.ok) {
        await carregarRacoesDoBackend();
      } else {
        mostrarToast('Erro ao atualizar quantidade.');
      }
    } catch (erro) {
      console.error('Erro ao alterar quantidade:', erro);
      mostrarToast('Não foi possível conectar ao servidor.');
    }
  }

  function atualizarEstatisticas() {
    let totalSacos = 0;
    let totalKg = 0;
    let estoqueBaixo = 0;
    const marcasSet = new Set();

    racoesCache.forEach(r => {
      const unidades = parseInt(r.unidades) || 0;
      const pesoKg = parseFloat(r.peso_saco_kg) || 0;
      totalSacos += unidades;
      totalKg += (pesoKg * unidades);
      if (unidades <= 1) estoqueBaixo++;
      if (r.marca) marcasSet.add(r.marca.trim().toLowerCase());
    });

    const elTotalSacos = document.getElementById('stat-total-sacos');
    const elTipos = document.getElementById('stat-tipos-cadastrados');
    const elTotalKg = document.getElementById('stat-total-kg');
    const elBaixo = document.getElementById('stat-estoque-baixo');
    const elMarcas = document.getElementById('stat-total-marcas');

    if (elTotalSacos) elTotalSacos.textContent = totalSacos;
    if (elTipos) elTipos.textContent = `${racoesCache.length} tipos cadastrados`;
    if (elTotalKg) elTotalKg.innerHTML = `${totalKg} <span class="text-sm font-normal text-[#6B7280]">kg</span>`;
    if (elBaixo) elBaixo.textContent = estoqueBaixo;
    if (elMarcas) elMarcas.textContent = marcasSet.size;
  }

  function mostrarToast(msg = "Operação realizada com sucesso!") {
    if (!toast) return;
    const span = toast.querySelector('span');
    if (span) span.textContent = msg;

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toast.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  // MODAL ADICIONAR
  function abrirModalAdd() {
    if (formAdicionar) formAdicionar.reset();
    if (modalAdicionar) {
      modalAdicionar.classList.remove('hidden');
      setTimeout(() => modalAdicionar.classList.remove('opacity-0'), 10);
    }
  }

  function fecharModalAdd() {
    if (modalAdicionar) {
      modalAdicionar.classList.add('opacity-0');
      setTimeout(() => modalAdicionar.classList.add('hidden'), 200);
    }
  }

  if (btnAdicionar) btnAdicionar.onclick = abrirModalAdd;
  if (btnFecharAdd) btnFecharAdd.onclick = fecharModalAdd;
  if (btnCancelarAdd) btnCancelarAdd.onclick = fecharModalAdd;

  if (formAdicionar) {
    formAdicionar.onsubmit = async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) return;

      const marca = document.getElementById('add-marca').value.trim();
      const tipo = document.getElementById('add-tipo').value.trim();
      const peso_saco_kg = parseFloat(document.getElementById('add-peso').value) || 0;
      const unidades = parseInt(document.getElementById('add-qtd').value) || 0;
      const data_compra = document.getElementById('add-data').value || null;

      if (!marca || !tipo || !peso_saco_kg) {
        mostrarToast('Preencha os campos obrigatórios.');
        return;
      }

      try {
        const resposta = await fetch('/api/racoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            marca,
            tipo,
            peso_saco_kg,
            unidades,
            data_compra
          })
        });

        const dados = await resposta.json();
        if (resposta.status === 201) {
          fecharModalAdd();
          await carregarRacoesDoBackend();
          mostrarToast(`Ração ${marca} cadastrada com sucesso!`);
        } else {
          mostrarToast(dados.mensagem || 'Erro ao cadastrar ração.');
        }
      } catch (erro) {
        console.error('Erro ao cadastrar ração:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  // MODAL EDITAR
  function abrirModalEditar(racao) {
    idRacaoParaEditar = racao.id;

    document.getElementById('edit-marca').value = racao.marca;
    document.getElementById('edit-tipo').value = racao.tipo;
    document.getElementById('edit-peso').value = racao.peso_saco_kg;
    document.getElementById('edit-qtd').value = racao.unidades;
    document.getElementById('edit-data').value = racao.data_compra ? racao.data_compra.split('T')[0] : '';

    if (modalEditar) {
      modalEditar.classList.remove('hidden');
      setTimeout(() => modalEditar.classList.remove('opacity-0'), 10);
    }
  }

  function fecharModalEditar() {
    if (modalEditar) {
      modalEditar.classList.add('opacity-0');
      setTimeout(() => modalEditar.classList.add('hidden'), 200);
    }
  }

  if (btnFecharEdit) btnFecharEdit.onclick = fecharModalEditar;
  if (btnCancelarEdit) btnCancelarEdit.onclick = fecharModalEditar;

  if (formEditar) {
    formEditar.onsubmit = async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token || !idRacaoParaEditar) return;

      const marca = document.getElementById('edit-marca').value.trim();
      const tipo = document.getElementById('edit-tipo').value.trim();
      const peso_saco_kg = parseFloat(document.getElementById('edit-peso').value) || 0;
      const unidades = parseInt(document.getElementById('edit-qtd').value) || 0;
      const data_compra = document.getElementById('edit-data').value || null;

      try {
        const resposta = await fetch(`/api/racoes/${idRacaoParaEditar}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            marca,
            tipo,
            peso_saco_kg,
            unidades,
            data_compra
          })
        });

        const dados = await resposta.json();
        if (resposta.ok) {
          fecharModalEditar();
          await carregarRacoesDoBackend();
          mostrarToast(`Ração atualizada com sucesso!`);
        } else {
          mostrarToast(dados.mensagem || 'Erro ao atualizar ração.');
        }
      } catch (erro) {
        console.error('Erro ao atualizar ração:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  // MODAL EXCLUIR
  function abrirModalExcluir(id) {
    idRacaoParaExcluir = id;
    if (modalExcluir) {
      modalExcluir.classList.remove('hidden');
      setTimeout(() => modalExcluir.classList.remove('opacity-0'), 10);
    }
  }

  function fecharModalExcluir() {
    if (modalExcluir) {
      modalExcluir.classList.add('opacity-0');
      setTimeout(() => modalExcluir.classList.add('hidden'), 200);
    }
  }

  if (btnCancelarExcluir) btnCancelarExcluir.onclick = fecharModalExcluir;

  if (btnConfirmarExcluir) {
    btnConfirmarExcluir.onclick = async () => {
      if (!idRacaoParaExcluir) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const resposta = await fetch(`/api/racoes/${idRacaoParaExcluir}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (resposta.ok) {
          fecharModalExcluir();
          await carregarRacoesDoBackend();
          mostrarToast("Ração removida do estoque.");
        } else {
          mostrarToast("Erro ao remover ração.");
        }
      } catch (erro) {
        console.error('Erro ao remover ração:', erro);
        mostrarToast("Não foi possível conectar ao servidor.");
      }
    };
  }

  if (inputBusca) {
    inputBusca.oninput = renderizarGrid;
  }

  carregarRacoesDoBackend();
  carregarConsumoDoBackend();
});