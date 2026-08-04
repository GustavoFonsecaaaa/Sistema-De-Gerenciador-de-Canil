document.addEventListener('DOMContentLoaded', () => {
  console.log("Script maternidade.js carregado!");

  // Função Salva-vidas para ler cache
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

  // Elementos da Tela
  const gridNinhadas = document.getElementById('grid-ninhadas');
  const emptyState = document.getElementById('empty-state-maternidade');

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

  function carregarFemeasNoSelect() {
    const caes = lerDadosSalvos('canil_cachorros');
    const femeas = caes.filter(c => c.sexo === 'Fêmea');

    // Preenche select do modal
    selectMae.innerHTML = '<option value="">Selecione a fêmea...</option>';
    if (femeas.length === 0) {
      selectMae.innerHTML = '<option value="">Nenhuma fêmea cadastrada</option>';
    } else {
      femeas.forEach(f => {
        const opt = document.createElement('option');
        // Salvamos nome e foto para facilitar a renderização
        opt.value = JSON.stringify({ nome: f.nome, foto: f.foto });
        opt.textContent = f.nome;
        selectMae.appendChild(opt);
      });
    }

    // Preenche select de filtro (baseado nas ninhadas existentes)
    const ninhadas = lerDadosSalvos('canil_ninhadas');
    const maesComNinhada = [...new Set(ninhadas.map(n => n.maeNome))];
    
    filtroMae.innerHTML = '<option value="todas">Todas as mães</option>';
    maesComNinhada.forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      filtroMae.appendChild(opt);
    });
  }

  function formatarDataBR(isoDate) {
    if (!isoDate) return '-';
    const partes = isoDate.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : isoDate;
  }

  function renderizarNinhadas() {
    let ninhadas = lerDadosSalvos('canil_ninhadas');

    // Atualiza KPIs
    const totalNinhadas = ninhadas.length;
    const totalFilhotes = ninhadas.reduce((acc, n) => acc + (n.machos + n.femeas), 0);
    const totalAmamentando = ninhadas.filter(n => n.amamentando).length;
    
    // Calcula Matrizes únicas baseando-se no cadastro global de cães fêmeas
    const caes = lerDadosSalvos('canil_cachorros');
    const matrizesCount = caes.filter(c => c.sexo === 'Fêmea').length;

    kpiNinhadas.textContent = totalNinhadas;
    kpiFilhotes.textContent = totalFilhotes;
    kpiAmamentando.textContent = totalAmamentando;
    kpiMatrizes.textContent = matrizesCount;

    // Filtros
    const maeFiltro = filtroMae.value;
    if (maeFiltro !== 'todas') {
      ninhadas = ninhadas.filter(n => n.maeNome === maeFiltro);
    }

    // Ordenação
    if (ordemAtual === 'data') {
      ninhadas.sort((a, b) => new Date(b.dataIso) - new Date(a.dataIso));
    } else if (ordemAtual === 'filhotes') {
      ninhadas.sort((a, b) => (b.machos + b.femeas) - (a.machos + a.femeas));
    }

    gridNinhadas.innerHTML = '';

    if (ninhadas.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');

      ninhadas.forEach(n => {
        const total = n.machos + n.femeas;
        // Borda verde se estiver amamentando
        const borderClass = n.amamentando ? 'border-[#10B981]/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-[#EFECE6] shadow-sm';
        const badgeAmamentando = n.amamentando ? `<span class="bg-[#D1FAE5] text-[#10B981] text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">Amamentando</span>` : '';
        const badgeParto = n.tipoParto === 'Natural' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]';

        const card = document.createElement('div');
        card.className = `bg-white border rounded-2xl p-5 relative transition-all ${borderClass}`;

        card.innerHTML = `
          <div class="flex justify-between items-start mb-6">
            <div class="flex gap-3.5 items-center">
              <div class="w-11 h-11 rounded-full overflow-hidden bg-bege border border-[#EFECE6] flex-shrink-0">
                <img src="${n.maeFoto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100'}" alt="${n.maeNome}" class="w-full h-full object-cover">
              </div>
              <div>
                <h4 class="font-bold text-sm text-[#111827]">${n.maeNome}</h4>
                <p class="text-[11px] text-[#6B7280]">Pai: ${n.paiNome}</p>
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
              <div class="text-lg font-extrabold text-[#111827]">${n.machos}</div>
              <div class="text-[10px] text-[#6B7280]">Machos</div>
            </div>
            <div>
              <div class="text-lg font-extrabold text-[#111827]">${n.femeas}</div>
              <div class="text-[10px] text-[#6B7280]">Fêmeas</div>
            </div>
            <div>
              <div class="text-lg font-extrabold text-[#111827]">${n.pesoMedio}g</div>
              <div class="text-[10px] text-[#6B7280]">Peso</div>
            </div>
          </div>

          <div class="flex justify-between items-center text-xs border-t border-[#FAFAF9] pt-3.5">
            <span class="text-[#6B7280]">Parto: <span class="font-bold text-[#111827]">${n.dataBr}</span></span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeParto}">${n.tipoParto}</span>
          </div>
          
          <button class="btn-excluir-ninhada absolute bottom-3.5 right-[85px] p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 hover:opacity-100" title="Excluir Ninhada">
              <i class="ri-delete-bin-line text-xs"></i>
          </button>
        `;
        
        // Exibe o botão lixeira só no hover do card
        card.addEventListener('mouseenter', () => card.querySelector('.btn-excluir-ninhada').classList.remove('opacity-0'));
        card.addEventListener('mouseleave', () => card.querySelector('.btn-excluir-ninhada').classList.add('opacity-0'));

        card.querySelector('.btn-excluir-ninhada').onclick = () => {
            if(confirm('Tem certeza que deseja excluir esta ninhada?')) {
                let salvos = lerDadosSalvos('canil_ninhadas').filter(item => item.id !== n.id);
                localStorage.setItem('canil_ninhadas', JSON.stringify(salvos));
                renderizarNinhadas();
                mostrarToast('Ninhada removida!');
                carregarFemeasNoSelect(); // Atualiza filtro
            }
        };

        gridNinhadas.appendChild(card);
      });
    }
  }

  // Lógica de Modais
  function abrirModal() {
    formNinhada.reset();
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.transform').classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModal() {
    if (modal) {
      modal.classList.add('opacity-0');
      modal.querySelector('.transform').classList.add('scale-95');
      setTimeout(() => modal.classList.add('hidden'), 200);
    }
  }

  btnNovaNinhada.onclick = abrirModal;
  btnFecharModal.onclick = fecharModal;
  btnCancelar.onclick = fecharModal;

  // Lógica do Formulário
  formNinhada.onsubmit = (e) => {
    e.preventDefault();

    if (!selectMae.value) {
      alert("Selecione a mãe!"); return;
    }

    const maeData = JSON.parse(selectMae.value);
    const paiNome = document.getElementById('ninhada-pai').value.trim();
    const dataPartoIso = document.getElementById('ninhada-data').value;
    const tipoParto = document.getElementById('ninhada-tipo').value;
    const machos = parseInt(document.getElementById('ninhada-machos').value) || 0;
    const femeas = parseInt(document.getElementById('ninhada-femeas').value) || 0;
    const pesoMedio = parseInt(document.getElementById('ninhada-peso').value) || 0;
    const amamentando = document.getElementById('ninhada-amamentando').checked;

    if (machos === 0 && femeas === 0) {
      alert("A ninhada precisa ter pelo menos 1 filhote."); return;
    }

    const novaNinhada = {
      id: Date.now(),
      maeNome: maeData.nome,
      maeFoto: maeData.foto,
      paiNome: paiNome,
      dataIso: dataPartoIso,
      dataBr: formatarDataBR(dataPartoIso),
      tipoParto: tipoParto,
      machos: machos,
      femeas: femeas,
      pesoMedio: pesoMedio,
      amamentando: amamentando
    };

    const ninhadas = lerDadosSalvos('canil_ninhadas');
    ninhadas.unshift(novaNinhada);
    localStorage.setItem('canil_ninhadas', JSON.stringify(ninhadas));

    fecharModal();
    carregarFemeasNoSelect(); // Atualiza o filtro caso seja a primeira ninhada dessa mãe
    renderizarNinhadas();
    mostrarToast("Ninhada registrada com sucesso!");
  };

  // Lógica de Filtros e Ordenação
  filtroMae.onchange = renderizarNinhadas;

  btnOrdemData.onclick = () => {
    ordemAtual = 'data';
    btnOrdemData.className = "px-3 py-1 rounded-md text-[11px] font-bold bg-[#FAF8F5] text-[#111827] border border-[#EFECE6]";
    btnOrdemFilhotes.className = "px-3 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent";
    renderizarNinhadas();
  };

  btnOrdemFilhotes.onclick = () => {
    ordemAtual = 'filhotes';
    btnOrdemFilhotes.className = "px-3 py-1 rounded-md text-[11px] font-bold bg-[#FAF8F5] text-[#111827] border border-[#EFECE6]";
    btnOrdemData.className = "px-3 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent";
    renderizarNinhadas();
  };

  // Inicialização
  carregarFemeasNoSelect();
  renderizarNinhadas();
});