document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado!");

  const containerRacoes = document.querySelector('.container-racoes');
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

  // Dados Iniciais Padrão se o LocalStorage estiver vazio
  const racoesPadrao = [
    {
      id: 1,
      marca: "Royal Canin",
      tipo: "Adulto - Porte Grande",
      pesoKg: 15,
      quantidadeSacos: 3,
      dataCompra: "2025-06-20",
      dataAbertura: "2025-07-01",
      obs: "Ração principal do canil"
    },
    {
      id: 2,
      marca: "Premier",
      tipo: "Filhote - Raças Médias",
      pesoKg: 10,
      quantidadeSacos: 2,
      dataCompra: "2025-06-28",
      dataAbertura: "",
      obs: ""
    },
    {
      id: 3,
      marca: "Hill's",
      tipo: "Adulto - Light",
      pesoKg: 12,
      quantidadeSacos: 1,
      dataCompra: "2025-07-01",
      dataAbertura: "2025-07-20",
      obs: "Controle de peso"
    }
  ];

  function carregarRacoes() {
    let salvas = localStorage.getItem('canil_racoes');
    if (!salvas) {
      localStorage.setItem('canil_racoes', JSON.stringify(racoesPadrao));
      salvas = JSON.stringify(racoesPadrao);
    }
    return JSON.parse(salvas);
  }

  function salvarRacoes(lista) {
    localStorage.setItem('canil_racoes', JSON.stringify(lista));
    renderizarGrid();
    atualizarEstatisticas();
  }

  function formatarDataBR(isoDate) {
    if (!isoDate) return '-';
    const partes = isoDate.split('-');
    if (partes.length !== 3) return isoDate;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function calcularDiasAberto(dataAberturaIso) {
    if (!dataAberturaIso) return null;
    const [a, m, d] = dataAberturaIso.split('-');
    const dtAbertura = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = hoje - dtAbertura;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }

  function renderizarGrid() {
    if (!containerRacoes) return;

    const lista = carregarRacoes();
    const busca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';

    containerRacoes.innerHTML = '';

    const filtradas = lista.filter(r => {
      return r.marca.toLowerCase().includes(busca) || r.tipo.toLowerCase().includes(busca);
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
      const totalKg = r.pesoKg * r.quantidadeSacos;
      const ehEstoqueBaixo = r.quantidadeSacos <= 1;

      const statusBadge = ehEstoqueBaixo
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">Baixo</span>`
        : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-verdeokbg text-verdeok">OK</span>`;

      const diasAberto = calcularDiasAberto(r.dataAbertura);
      let textoAbertura = '-';
      if (diasAberto !== null) {
        textoAbertura = `${formatarDataBR(r.dataAbertura)} (${diasAberto}d abertos)`;
      }

      const card = document.createElement('div');
      card.className = "bg-white border border-[#EFECE6] hover:border-laranja rounded-2xl p-5 shadow-sm flex flex-col justify-between group transition-all";

      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-4">
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

          <div class="grid grid-cols-2 gap-y-3 gap-x-4 border-b border-[#FAFAF9] pb-4 mb-4 text-xs">
            <div>
              <span class="text-[11px] text-[#6B7280] block">Peso do saco</span>
              <span class="font-bold text-[#111827]">${r.pesoKg} kg</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Data compra</span>
              <span class="font-bold text-[#111827]">${formatarDataBR(r.dataCompra)}</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Total em estoque</span>
              <span class="font-bold text-[#111827]">${totalKg} kg</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Abertura</span>
              <span class="font-bold text-laranja">${textoAbertura}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs mt-2 pt-3 border-t border-[#FAFAF9]">
          <div class="flex items-center gap-2">
            <span class="text-[#6B7280]">Unidades:</span>
            <div class="flex items-center bg-[#FAFAF9] border border-[#EFECE6] rounded-lg p-0.5">
              <button class="btn-qtd-menos w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold">-</button>
              <span class="px-3 font-bold ${ehEstoqueBaixo ? 'text-[#B45309]' : 'text-[#111827]'}">${r.quantidadeSacos}</span>
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
      `;

      // Eventos dos Botões do Card
      card.querySelector('.btn-qtd-menos').onclick = () => alterarQtd(r.id, -1);
      card.querySelector('.btn-qtd-mais').onclick = () => alterarQtd(r.id, 1);
      card.querySelector('.btn-editar').onclick = () => abrirModalEditar(r);
      card.querySelector('.btn-excluir').onclick = () => abrirModalExcluir(r.id);

      containerRacoes.appendChild(card);
    });
  }

  function alterarQtd(id, delta) {
    const lista = carregarRacoes();
    const item = lista.find(r => r.id === id);
    if (item) {
      item.quantidadeSacos = Math.max(0, item.quantidadeSacos + delta);
      salvarRacoes(lista);
    }
  }

  function atualizarEstatisticas() {
    const lista = carregarRacoes();

    let totalSacos = 0;
    let totalKg = 0;
    let estoqueBaixo = 0;
    const marcasSet = new Set();

    lista.forEach(r => {
      totalSacos += r.quantidadeSacos;
      totalKg += (r.pesoKg * r.quantidadeSacos);
      if (r.quantidadeSacos <= 1) estoqueBaixo++;
      if (r.marca) marcasSet.add(r.marca.trim().toLowerCase());
    });

    const elTotalSacos = document.getElementById('stat-total-sacos');
    const elTipos = document.getElementById('stat-tipos-cadastrados');
    const elTotalKg = document.getElementById('stat-total-kg');
    const elBaixo = document.getElementById('stat-estoque-baixo');
    const elMarcas = document.getElementById('stat-total-marcas');

    if (elTotalSacos) elTotalSacos.textContent = totalSacos;
    if (elTipos) elTipos.textContent = `${lista.length} tipos cadastrados`;
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
    formAdicionar.onsubmit = (e) => {
      e.preventDefault();

      const marca = document.getElementById('add-marca').value.trim();
      const tipo = document.getElementById('add-tipo').value.trim();
      const pesoKg = parseFloat(document.getElementById('add-peso').value) || 0;
      const quantidadeSacos = parseInt(document.getElementById('add-qtd').value) || 0;
      const dataCompra = document.getElementById('add-data').value;
      const dataAbertura = document.getElementById('add-data-abertura').value;
      const obs = document.getElementById('add-obs').value.trim();

      const lista = carregarRacoes();
      const novaRacao = {
        id: Date.now(),
        marca,
        tipo,
        pesoKg,
        quantidadeSacos,
        dataCompra,
        dataAbertura,
        obs
      };

      lista.unshift(novaRacao);
      salvarRacoes(lista);
      fecharModalAdd();
      mostrarToast(`Ração ${marca} adicionada com sucesso!`);
    };
  }

  // MODAL EDITAR
  function abrirModalEditar(racao) {
    idRacaoParaEditar = racao.id;

    document.getElementById('edit-marca').value = racao.marca;
    document.getElementById('edit-tipo').value = racao.tipo;
    document.getElementById('edit-peso').value = racao.pesoKg;
    document.getElementById('edit-qtd').value = racao.quantidadeSacos;
    document.getElementById('edit-data').value = racao.dataCompra || '';
    document.getElementById('edit-data-abertura').value = racao.dataAbertura || '';
    document.getElementById('edit-obs').value = racao.obs || '';

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
    formEditar.onsubmit = (e) => {
      e.preventDefault();

      const lista = carregarRacoes();
      const index = lista.findIndex(r => r.id === idRacaoParaEditar);

      if (index !== -1) {
        lista[index].marca = document.getElementById('edit-marca').value.trim();
        lista[index].tipo = document.getElementById('edit-tipo').value.trim();
        lista[index].pesoKg = parseFloat(document.getElementById('edit-peso').value) || 0;
        lista[index].quantidadeSacos = parseInt(document.getElementById('edit-qtd').value) || 0;
        lista[index].dataCompra = document.getElementById('edit-data').value;
        lista[index].dataAbertura = document.getElementById('edit-data-abertura').value;
        lista[index].obs = document.getElementById('edit-obs').value.trim();

        salvarRacoes(lista);
        fecharModalEditar();
        mostrarToast(`Ração atualizada com sucesso!`);
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
    btnConfirmarExcluir.onclick = () => {
      if (idRacaoParaExcluir) {
        let lista = carregarRacoes();
        lista = lista.filter(r => r.id !== idRacaoParaExcluir);
        salvarRacoes(lista);
        fecharModalExcluir();
        mostrarToast("Ração removida do estoque.");
      }
    };
  }

  if (inputBusca) {
    inputBusca.oninput = renderizarGrid;
  }

  renderizarGrid();
  atualizarEstatisticas();
});