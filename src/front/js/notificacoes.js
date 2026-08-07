document.addEventListener('DOMContentLoaded', () => {
  console.log("Script notificacoes.js carregado!");

  // Sincronizar Rodapé da Sidebar com localStorage
  function atualizarSidebarUsuario() {
    const nomeSalvo = localStorage.getItem('canil_usuario_nome') || 'Criador';
    const emailSalvo = localStorage.getItem('canil_usuario_cadastrado_email') || 'admin@canil.com';
    const fotoSalva = localStorage.getItem('canil_usuario_foto');

    const elSidebarNome = document.getElementById('sidebar-nome');
    const elSidebarEmail = document.getElementById('sidebar-email');
    const elSidebarAvatarImg = document.getElementById('sidebar-avatar-img');
    const elSidebarAvatarInicial = document.getElementById('sidebar-avatar-inicial');

    if (elSidebarNome) elSidebarNome.textContent = nomeSalvo;
    if (elSidebarEmail) elSidebarEmail.textContent = emailSalvo;

    const inicial = nomeSalvo.charAt(0).toUpperCase();

    if (fotoSalva) {
      if (elSidebarAvatarImg) {
        elSidebarAvatarImg.src = fotoSalva;
        elSidebarAvatarImg.classList.remove('hidden');
      }
      if (elSidebarAvatarInicial) {
        elSidebarAvatarInicial.classList.add('hidden');
      }
    } else {
      if (elSidebarAvatarImg) {
        elSidebarAvatarImg.classList.add('hidden');
      }
      if (elSidebarAvatarInicial) {
        elSidebarAvatarInicial.textContent = inicial;
        elSidebarAvatarInicial.classList.remove('hidden');
      }
    }
  }

  atualizarSidebarUsuario();

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

  function gerarNotificacoes() {
    const vacinas = JSON.parse(localStorage.getItem('canil_vacinas')) || [];
    const racoes = JSON.parse(localStorage.getItem('canil_racoes')) || [];
    const lidasList = JSON.parse(localStorage.getItem('canil_notificacoes_lidas')) || [];
    const excluidasList = JSON.parse(localStorage.getItem('canil_notificacoes_excluidas')) || [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lista = [];

    // 1. Vacinas
    vacinas.forEach(v => {
      if (!v.proximaDoseIso) return;
      const partes = v.proximaDoseIso.split('-');
      const dtProxima = new Date(partes[0], partes[1] - 1, partes[2]);
      const diffTime = dtProxima - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const idUnico = `vacina_${v.id}`;

      // Ignora se estiver na lista de excluídas
      if (excluidasList.includes(idUnico)) return;

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

    // 2. Rações
    racoes.forEach((r, idx) => {
      const idUnico = `racao_${r.id || idx}`;

      if (excluidasList.includes(idUnico)) return;

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
        item.className = `p-4 flex items-start justify-between gap-3 hover:bg-[#FAF8F5] transition-colors group cursor-pointer ${n.isLida ? 'opacity-60' : ''}`;

        let iconeClass = 'ri-syringe-line text-red-500 bg-red-50';
        if (n.tipo === 'vacina-vencer') iconeClass = 'ri-alarm-warning-line text-amber-600 bg-amber-50';
        if (n.tipo === 'racao-baixa') iconeClass = 'ri-goblet-line text-orange-600 bg-orange-50';

        item.innerHTML = `
          <div class="flex items-start gap-3 flex-1">
            <div class="w-9 h-9 rounded-2xl ${iconeClass} flex items-center justify-center flex-shrink-0 text-base"></div>
            <div class="flex-1">
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-xs text-[#111827]">${n.titulo}</h4>
                ${!n.isLida ? '<span class="w-2 h-2 rounded-full bg-red-500"></span>' : ''}
              </div>
              <p class="text-[11px] text-[#6B7280] mt-0.5 leading-snug">${n.descricao}</p>
              <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">${n.tempoRelativo}</div>
            </div>
          </div>
          
          <button data-id="${n.id}" class="btn-excluir-notificacao p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg flex-shrink-0 opacity-0 group-hover:opacity-100" title="Excluir notificação">
            <i class="ri-delete-bin-line text-sm"></i>
          </button>
        `;

        // Clique no item marca como lida
        item.onclick = (e) => {
          if (e.target.closest('.btn-excluir-notificacao')) return;
          marcarComoLida(n.id);
        };

        // Clique na lixeira exclui a notificação
        const btnExcluir = item.querySelector('.btn-excluir-notificacao');
        if (btnExcluir) {
          btnExcluir.onclick = (e) => {
            e.stopPropagation();
            excluirNotificacao(n.id);
          };
        }

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

  function excluirNotificacao(id) {
    const excluidasList = JSON.parse(localStorage.getItem('canil_notificacoes_excluidas')) || [];
    if (!excluidasList.includes(id)) {
      excluidasList.push(id);
      localStorage.setItem('canil_notificacoes_excluidas', JSON.stringify(excluidasList));
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

  gerarNotificacoes();
});