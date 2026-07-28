document.addEventListener('DOMContentLoaded', () => {
  console.log("Script dashboard.js carregado com sucesso!");

  // Elementos do Cabeçalho
  const elDataHoje = document.getElementById('dash-data-hoje');
  if (elDataHoje) {
    const hoje = new Date();
    const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
    const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
    elDataHoje.textContent = `Visão geral do seu canil — ${dataFormatada}`;
  }

  // Elementos do Painel de Notificações
  const btnSino = document.getElementById('btn-notificacoes');
  const badgeSino = document.getElementById('badge-notificacoes-count');
  const popoverNotificacoes = document.getElementById('popover-notificacoes');
  const badgeNaoLidas = document.getElementById('popover-badge-nao-lidas');
  const btnMarcarTodasLidas = document.getElementById('btn-marcar-todas-lidas');
  const containerListaNotif = document.getElementById('lista-notificacoes');
  const emptyStateNotif = document.getElementById('empty-state-notificacoes');
  const containerFiltrosNotif = document.getElementById('container-filtros-notificacoes');

  let filtroNotifAtual = 'todas';
  let notificacoesAtuais = [];

  // ==========================================
  // MOTOR DE NOTIFICAÇÕES (GERAÇÃO DINÂMICA)
  // ==========================================
  function gerarNotificacoes() {
    const vacinas = JSON.parse(localStorage.getItem('canil_vacinas')) || [];
    const racoes = JSON.parse(localStorage.getItem('canil_racoes')) || [];
    const lidasList = JSON.parse(localStorage.getItem('canil_notificacoes_lidas')) || [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lista = [];

    // 1. Notificações de Vacinas Vencidas e A Vencer
    vacinas.forEach(v => {
      if (!v.proximaDoseIso) return;
      const partes = v.proximaDoseIso.split('-');
      const dtProxima = new Date(partes[0], partes[1] - 1, partes[2]);
      const diffTime = dtProxima - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const idUnico = `vacina_${v.id}`;
      const isLida = lidasList.includes(idUnico);

      if (diffDays < 0) {
        const diasAtraso = Math.abs(diffDays);
        lista.push({
          id: idUnico,
          tipo: 'vacina-vencida',
          titulo: `Vacina ${v.vacinaNome} vencida`,
          descricao: `${v.caoNome} (${v.caoRaca}) está com a ${v.vacinaNome} vencida há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}.`,
          tempoRelativo: `HÁ ${diasAtraso} D ${diasAtraso === 1 ? 'DIA' : 'DIAS'} · ${v.caoNome.toUpperCase()}`,
          isLida
        });
      } else if (diffDays <= 7) {
        lista.push({
          id: idUnico,
          tipo: 'vacina-vencer',
          titulo: `Vacina ${v.vacinaNome} a vencer`,
          descricao: `A vacina ${v.vacinaNome} de ${v.caoNome} vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}.`,
          tempoRelativo: `EM ${diffDays} ${diffDays === 1 ? 'DIA' : 'DIAS'} · ${v.caoNome.toUpperCase()}`,
          isLida
        });
      }
    });

    // 2. Notificações de Ração Baixa
    racoes.forEach((r, idx) => {
      const idUnico = `racao_${r.id || idx}`;
      const isLida = lidasList.includes(idUnico);

      if (r.quantidadeKg <= (r.limiteMinimoKg || 5)) {
        lista.push({
          id: idUnico,
          tipo: 'racao-baixa',
          titulo: `Estoque de ração baixo`,
          descricao: `A ração ${r.marca || 'cadastrada'} está com apenas ${r.quantidadeKg}kg em estoque.`,
          tempoRelativo: `ESTOQUE CRÍTICO`,
          isLida
        });
      }
    });

    notificacoesAtuais = lista;
    atualizarBadgeSino();
    renderizarNotificacoesPopover();
  }

  function atualizarBadgeSino() {
    const naoLidas = notificacoesAtuais.filter(n => !n.isLida).length;

    if (badgeSino) {
      if (naoLidas > 0) {
        badgeSino.textContent = naoLidas > 99 ? '99+' : naoLidas;
        badgeSino.classList.remove('hidden');
      } else {
        badgeSino.classList.add('hidden');
      }
    }

    if (badgeNaoLidas) {
      badgeNaoLidas.textContent = `${naoLidas} não lidas`;
    }
  }

  function renderizarNotificacoesPopover() {
    if (!containerListaNotif) return;

    // Contadores de cada aba de filtro
    const cntTodas = notificacoesAtuais.length;
    const cntVacVencida = notificacoesAtuais.filter(n => n.tipo === 'vacina-vencida').length;
    const cntVacVencer = notificacoesAtuais.filter(n => n.tipo === 'vacina-vencer').length;
    const cntRacao = notificacoesAtuais.filter(n => n.tipo === 'racao-baixa').length;
    const cntCio = notificacoesAtuais.filter(n => n.tipo === 'cio-terminando').length;

    document.getElementById('cnt-todas') && (document.getElementById('cnt-todas').textContent = cntTodas);
    document.getElementById('cnt-vacina-vencida') && (document.getElementById('cnt-vacina-vencida').textContent = cntVacVencida);
    document.getElementById('cnt-vacina-vencer') && (document.getElementById('cnt-vacina-vencer').textContent = cntVacVencer);
    document.getElementById('cnt-racao-baixa') && (document.getElementById('cnt-racao-baixa').textContent = cntRacao);
    document.getElementById('cnt-cio-terminando') && (document.getElementById('cnt-cio-terminando').textContent = cntCio);

    // Filtragem dos itens exibidos
    const filtradas = notificacoesAtuais.filter(n => {
      if (filtroNotifAtual === 'todas') return true;
      return n.tipo === filtroNotifAtual;
    });

    containerListaNotif.innerHTML = '';

    if (filtradas.length === 0) {
      if (emptyStateNotif) emptyStateNotif.classList.remove('hidden');
    } else {
      if (emptyStateNotif) emptyStateNotif.classList.add('hidden');

      filtradas.forEach(n => {
        const item = document.createElement('div');
        item.className = `p-4 flex items-start justify-between gap-3 hover:bg-[#FAF8F5] transition-colors cursor-pointer ${n.isLida ? 'opacity-60' : ''}`;

        let iconeClass = 'ri-syringe-line text-red-500 bg-red-50';
        if (n.tipo === 'vacina-vencer') iconeClass = 'ri-alarm-warning-line text-amber-600 bg-amber-50';
        if (n.tipo === 'racao-baixa') iconeClass = 'ri-goblet-line text-orange-600 bg-orange-50';

        item.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-2xl ${iconeClass} flex items-center justify-center flex-shrink-0 text-base"></div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-xs text-[#111827]">${n.titulo}</h4>
                ${!n.isLida ? '<span class="w-2 h-2 rounded-full bg-red-500"></span>' : ''}
              </div>
              <p class="text-[11px] text-[#6B7280] mt-0.5 leading-snug">${n.descricao}</p>
              <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">${n.tempoRelativo}</div>
            </div>
          </div>
        `;

        item.onclick = () => marcarComoLida(n.id);
        containerListaNotif.appendChild(item);
      });
    }
  }

  function marcarComoLida(id) {
    const lidasList = JSON.parse(localStorage.getItem('canil_notificacoes_lidas')) || [];
    if (!lidasList.includes(id)) {
      lidasList.push(id);
      localStorage.setItem('canil_notificacoes_lidas', JSON.stringify(lidasList));
    }
    gerarNotificacoes();
  }

  if (btnMarcarTodasLidas) {
    btnMarcarTodasLidas.onclick = () => {
      const todasIds = notificacoesAtuais.map(n => n.id);
      localStorage.setItem('canil_notificacoes_lidas', JSON.stringify(todasIds));
      gerarNotificacoes();
    };
  }

  // Toggle do Popover do Sininho
  if (btnSino && popoverNotificacoes) {
    btnSino.onclick = (e) => {
      e.stopPropagation();
      const estaOculto = popoverNotificacoes.classList.contains('hidden');

      if (estaOculto) {
        popoverNotificacoes.classList.remove('hidden');
        setTimeout(() => {
          popoverNotificacoes.classList.remove('opacity-0', '-translate-y-2');
        }, 10);
      } else {
        popoverNotificacoes.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => {
          popoverNotificacoes.classList.add('hidden');
        }, 200);
      }
    };

    document.addEventListener('click', (e) => {
      if (!popoverNotificacoes.contains(e.target) && !btnSino.contains(e.target)) {
        popoverNotificacoes.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => {
          popoverNotificacoes.classList.add('hidden');
        }, 200);
      }
    });
  }

  // Filtros Rápidos do Popover
  if (containerFiltrosNotif) {
    const btns = containerFiltrosNotif.querySelectorAll('button');
    btns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        btns.forEach(b => {
          b.className = "px-3 py-1 rounded-xl font-medium text-[#6B7280] hover:bg-white whitespace-nowrap transition-colors";
        });
        btn.className = "px-3 py-1 rounded-xl font-bold bg-laranja text-white whitespace-nowrap shadow-sm";
        filtroNotifAtual = btn.dataset.filtro;
        renderizarNotificacoesPopover();
      };
    });
  }

  // ==========================================
  // CARREGAMENTO DOS DADOS DO DASHBOARD
  // ==========================================
  function carregarDadosDashboard() {
    const caesSalvos = JSON.parse(localStorage.getItem('canil_cachorros')) || [];

    const kpiTotal = document.getElementById('kpi-total-caes');
    const kpiMachos = document.getElementById('kpi-machos');
    const kpiFemeas = document.getElementById('kpi-femeas');
    const kpiFilhotes = document.getElementById('kpi-filhotes');
    const containerRecentes = document.getElementById('container-caes-recentes');

    let machos = 0;
    let femeas = 0;
    let filhotes = 0;

    caesSalvos.forEach(c => {
      if (c.sexo === 'Macho') machos++;
      if (c.sexo === 'Fêmea') femeas++;
      if (c.fase === 'Filhote') filhotes++;
    });

    if (kpiTotal) kpiTotal.textContent = caesSalvos.length;
    if (kpiMachos) kpiMachos.textContent = machos;
    if (kpiFemeas) kpiFemeas.textContent = femeas;
    if (kpiFilhotes) kpiFilhotes.textContent = filhotes;

    if (containerRecentes) {
      containerRecentes.innerHTML = '';
      const recentes = caesSalvos.slice(-5).reverse();

      if (recentes.length === 0) {
        containerRecentes.innerHTML = `
          <div class="text-center py-8 text-xs text-gray-400">Nenhum cão cadastrado ainda.</div>
        `;
      } else {
        recentes.forEach(cao => {
          const bgSexo = cao.sexo === 'Macho' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FCE7F3] text-[#EC4899]';

          const itemCard = document.createElement('div');
          itemCard.className = "flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] hover:border-laranja cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm";
          
          itemCard.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl overflow-hidden bg-bege flex-shrink-0">
                <img src="${cao.foto}" alt="${cao.nome}" class="w-full h-full object-cover">
              </div>
              <div>
                <div class="font-bold text-xs text-[#111827]">${cao.nome}</div>
                <div class="text-[11px] text-[#6B7280]">${cao.raca}</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${cao.sexo}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">${cao.fase}</span>
            </div>
          `;

          itemCard.onclick = () => {
            localStorage.setItem('cao_selecionado_para_detalhes', cao.nome);
            window.location.href = 'cachorros.html';
          };

          containerRecentes.appendChild(itemCard);
        });
      }
    }
  }

  gerarNotificacoes();
  carregarDadosDashboard();
});