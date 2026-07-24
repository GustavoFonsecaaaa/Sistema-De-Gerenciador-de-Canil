document.addEventListener('DOMContentLoaded', () => {
  console.log("Script cachorros.js carregado com sucesso!");

  // Elementos das Views Principais
  const viewLista = document.getElementById('view-lista-caes');
  const viewDetalhes = document.getElementById('view-detalhes-cao');
  const viewEditar = document.getElementById('view-editar-cao');

  // Botões de Navegação entre Views
  const btnVoltarLista = document.getElementById('btn-voltar-lista');
  const btnVoltarDetalhes = document.getElementById('btn-voltar-detalhes');
  const btnCancelarEditarCao = document.getElementById('btn-cancelar-editar-cao');
  const btnEditarCabecalho = document.querySelector('#view-detalhes-cao button[title="Editar cão"]');

  // Elementos da Tela de Detalhes
  const detalheFoto = document.getElementById('detalhe-foto');
  const detalheNome = document.getElementById('detalhe-nome');
  const detalheBadgeSexo = document.getElementById('detalhe-badge-sexo');
  const detalheRaca = document.getElementById('detalhe-raca');
  const detalheIdade = document.getElementById('detalhe-idade');
  const detalheNascimento = document.getElementById('detalhe-nascimento');
  const detalheClassificacao = document.getElementById('detalhe-classificacao');
  const detalheObs = document.getElementById('detalhe-obs');

  // Elementos da Aba de Informações
  const infoNome = document.getElementById('info-nome');
  const infoRaca = document.getElementById('info-raca');
  const infoSexo = document.getElementById('info-sexo');
  const infoNascimento = document.getElementById('info-nascimento');
  const infoIdade = document.getElementById('info-idade');
  const infoClassificacao = document.getElementById('info-classificacao');

  // Form de Edição
  const formEditar = document.getElementById('form-editar-cao');
  const editSubtitulo = document.getElementById('edit-subtitulo');
  const editPreviewFoto = document.getElementById('edit-preview-foto');
  const editFileInput = document.getElementById('edit-foto-file');
  const editNome = document.getElementById('edit-nome');
  const editRaca = document.getElementById('edit-raca');
  const editNascimento = document.getElementById('edit-nascimento');
  const editIdadeCalculada = document.getElementById('edit-idade-calculada');
  const editObs = document.getElementById('edit-obs');
  const editCharCount = document.getElementById('edit-char-count');
  
  // Botões de Sexo na Edição
  const btnSexoMacho = document.getElementById('btn-sexo-macho');
  const btnSexoFemea = document.getElementById('btn-sexo-femea');
  let sexoSelecionadoEdit = 'Macho';

  // Abas de Detalhes
  const tabVacinas = document.getElementById('tab-vacinas');
  const tabInformacoes = document.getElementById('tab-informacoes');
  const conteudoTabVacinas = document.getElementById('conteudo-tab-vacinas');
  const conteudoTabInformacoes = document.getElementById('conteudo-tab-informacoes');

  // Modal Novo Cão & Toast
  const btnNovoCachorro = document.getElementById('btn-novo-cachorro');
  const modalAdicionar = document.getElementById('modal-adicionar-cachorro');
  const modalContent = modalAdicionar ? modalAdicionar.querySelector('.transform') : null;
  const btnFecharModal = document.getElementById('btn-fechar-modal-cadastrar');
  const btnCancelarModal = document.getElementById('btn-cancelar-cadastrar');
  const formAdicionar = document.getElementById('form-adicionar-cachorro');
  const toastSucesso = document.getElementById('toast-sucesso-cao');
  let toastTimeout = null;

  let cardAtualEmExibicao = null;

  // FUNÇÃO DE SINCRONIZAÇÃO COM O LOCALSTORAGE (Para o Dashboard)
  function salvarEstadoCaesNoLocalStorage() {
    const cards = document.querySelectorAll('.container-caes > div');
    const lista = [];

    cards.forEach(card => {
      const nome = card.querySelector('h3')?.textContent.trim() || '';
      const raca = card.querySelector('p')?.textContent.trim() || '';
      const foto = card.querySelector('img')?.src || '';
      
      const spansBadges = card.querySelectorAll('.relative span');
      let sexo = 'Macho';
      let fase = 'Adulto';

      spansBadges.forEach(s => {
        const txt = s.textContent.trim();
        if (txt === 'Macho' || txt === 'Fêmea') sexo = txt;
        if (txt === 'Adulto' || txt === 'Filhote') fase = txt;
      });

      if (nome) {
        lista.push({ nome, raca, sexo, fase, foto });
      }
    });

    localStorage.setItem('canil_cachorros', JSON.stringify(lista));
  }

  function mostrarToast(msg = "Operação realizada com sucesso!") {
    if (!toastSucesso) return;
    const span = toastSucesso.querySelector('span');
    if (span) span.textContent = msg;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastSucesso.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastSucesso.classList.add('opacity-100', 'translate-y-0');

    toastTimeout = setTimeout(() => {
      toastSucesso.classList.remove('opacity-100', 'translate-y-0');
      toastSucesso.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function calcularIdadeEFase(dataNascimento) {
    const hoje = new Date();
    const nascAno = dataNascimento.getFullYear();
    const nascMes = dataNascimento.getMonth();
    
    let anos = hoje.getFullYear() - nascAno;
    let meses = hoje.getMonth() - nascMes;

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    const ehFilhote = anos < 1;
    const textoFase = ehFilhote ? 'Filhote' : 'Adulto';
    
    let textoIdade = '';
    if (anos > 0) textoIdade += `${anos}a `;
    textoIdade += `${meses}m`;

    return { textoIdade, textoFase, ehFilhote };
  }

  function atualizarContadorHeader() {
    const total = document.querySelectorAll('.container-caes > div').length;
    const headerSub = document.querySelector('header p');
    if (headerSub) {
      headerSub.textContent = `${total} cães cadastrados no canil`;
    }
  }

  // ABRIR TELA DE DETALHES
  function abrirDetalhesDoCao(card) {
    cardAtualEmExibicao = card;
    const fotoSrc = card.querySelector('img')?.src || '';
    const nome = card.querySelector('h3')?.textContent.trim() || 'Cão';
    const raca = card.querySelector('p')?.textContent.trim() || '';
    
    const spansBadges = card.querySelectorAll('.relative span');
    let sexo = 'Macho';
    let classificacao = 'Adulto';

    spansBadges.forEach(s => {
      const txt = s.textContent.trim();
      if (txt === 'Macho' || txt === 'Fêmea') sexo = txt;
      if (txt === 'Adulto' || txt === 'Filhote') classificacao = txt;
    });

    const spansRodape = card.querySelectorAll('div.flex.justify-between span');
    const idade = spansRodape[0]?.textContent.trim() || '3a 2m';
    const nascimento = spansRodape[1]?.textContent.trim() || '11/05/2023';

    if (detalheFoto) detalheFoto.src = fotoSrc;
    if (detalheNome) detalheNome.textContent = nome;
    if (detalheRaca) detalheRaca.textContent = raca;
    if (detalheIdade) detalheIdade.textContent = idade;
    if (detalheNascimento) detalheNascimento.textContent = nascimento;
    if (detalheClassificacao) detalheClassificacao.textContent = classificacao;

    if (detalheBadgeSexo) {
      detalheBadgeSexo.textContent = sexo;
      detalheBadgeSexo.className = sexo === 'Macho' 
        ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#10B981]' 
        : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE7F3] text-[#EC4899]';
    }

    if (infoNome) infoNome.textContent = nome;
    if (infoRaca) infoRaca.textContent = raca;
    if (infoSexo) infoSexo.textContent = sexo;
    if (infoNascimento) infoNascimento.textContent = nascimento;
    if (infoIdade) infoIdade.textContent = idade;
    if (infoClassificacao) infoClassificacao.textContent = classificacao;

    ativarAbaVacinas();

    if (viewLista) viewLista.classList.add('hidden');
    if (viewEditar) viewEditar.classList.add('hidden');
    if (viewDetalhes) viewDetalhes.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // SELETOR DE SEXO NA EDITAR
  function selecionarSexoEdit(sexo) {
    sexoSelecionadoEdit = sexo;
    if (sexo === 'Macho') {
      btnSexoMacho.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm bg-[#D1FAE5] border-[#10B981] text-[#065F46]";
      btnSexoFemea.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] text-gray-500 hover:bg-white text-xs font-medium transition-all shadow-sm";
    } else {
      btnSexoFemea.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm bg-[#FCE7F3] border-[#EC4899] text-[#9D174D]";
      btnSexoMacho.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] text-gray-500 hover:bg-white text-xs font-medium transition-all shadow-sm";
    }
  }

  if (btnSexoMacho) btnSexoMacho.onclick = () => selecionarSexoEdit('Macho');
  if (btnSexoFemea) btnSexoFemea.onclick = () => selecionarSexoEdit('Fêmea');

  // ABRIR TELA DE EDIÇÃO
  function abrirTelaEditarCao() {
    if (!cardAtualEmExibicao) return;

    const nome = detalheNome?.textContent || '';
    const raca = detalheRaca?.textContent || '';
    const sexo = detalheBadgeSexo?.textContent || 'Macho';
    const nascRaw = detalheNascimento?.textContent || '11/05/2023';
    const foto = detalheFoto?.src || '';
    const obs = detalheObs?.textContent || '';

    if (editSubtitulo) editSubtitulo.textContent = `Atualize as informações de ${nome}`;
    if (editPreviewFoto) editPreviewFoto.src = foto;
    if (editNome) editNome.value = nome;
    if (editRaca) editRaca.value = raca;
    if (editObs) {
      editObs.value = obs;
      if (editCharCount) editCharCount.textContent = obs.length;
    }

    const partes = nascRaw.split('/');
    if (partes.length === 3) {
      editNascimento.value = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      
      const dt = new Date(partes[2], parseInt(partes[1]) - 1, partes[0]);
      const { textoIdade, textoFase } = calcularIdadeEFase(dt);
      if (editIdadeCalculada) editIdadeCalculada.textContent = `${textoFase} · ${textoIdade}`;
    }

    selecionarSexoEdit(sexo);

    if (viewDetalhes) viewDetalhes.classList.add('hidden');
    if (viewLista) viewLista.classList.add('hidden');
    if (viewEditar) viewEditar.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnEditarCabecalho) btnEditarCabecalho.onclick = (e) => { e.preventDefault(); abrirTelaEditarCao(); };

  // PREVIEW DA FOTO AO SELECIONAR NOVO ARQUIVO
  if (editFileInput) {
    editFileInput.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (editPreviewFoto) editPreviewFoto.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
  }

  // ATUALIZA CONTADOR DE CARACTERES
  if (editObs) {
    editObs.oninput = () => {
      if (editCharCount) editCharCount.textContent = editObs.value.length;
    };
  }

  // ATUALIZA IDADE CALCULADA AO MUDAR A DATA NA EDIÇÃO
  if (editNascimento) {
    editNascimento.onchange = () => {
      if (editNascimento.value) {
        const [ano, mes, dia] = editNascimento.value.split('-');
        const dt = new Date(ano, mes - 1, dia);
        const { textoIdade, textoFase } = calcularIdadeEFase(dt);
        if (editIdadeCalculada) editIdadeCalculada.textContent = `${textoFase} · ${textoIdade}`;
      }
    };
  }

  // SUBMIT DO FORMULÁRIO DE EDIÇÃO
  if (formEditar) {
    formEditar.onsubmit = (e) => {
      e.preventDefault();

      if (!cardAtualEmExibicao) return;

      const novoNome = editNome.value;
      const novaRaca = editRaca.value;
      const novoSexo = sexoSelecionadoEdit;
      const novaDataRaw = editNascimento.value;
      const novaFotoSrc = editPreviewFoto.src;
      const novaObs = editObs.value;

      const [ano, mes, dia] = novaDataRaw.split('-');
      const dt = new Date(ano, mes - 1, dia);
      const dataFmt = `${dia}/${mes}/${ano}`;
      const { textoIdade, textoFase } = calcularIdadeEFase(dt);

      const cardTitle = cardAtualEmExibicao.querySelector('h3');
      const cardRaca = cardAtualEmExibicao.querySelector('p');
      const cardImg = cardAtualEmExibicao.querySelector('img');

      if (cardTitle) cardTitle.textContent = novoNome;
      if (cardRaca) cardRaca.textContent = novaRaca;
      if (cardImg) cardImg.src = novaFotoSrc;

      const containerFoto = cardAtualEmExibicao.querySelector('.relative');
      if (containerFoto) {
        const badgesAntigas = containerFoto.querySelectorAll('.absolute.top-2.left-2 span');
        badgesAntigas.forEach(b => b.remove());

        const divBadges = document.createElement('div');
        divBadges.className = 'absolute top-2 left-2 flex gap-1';

        const bgSexo = novoSexo === 'Macho' ? 'bg-verdeokbg text-verdeok' : 'bg-pink-100 text-pink-500';

        divBadges.innerHTML = `
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${novoSexo}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">${textoFase}</span>
        `;
        containerFoto.appendChild(divBadges);
      }

      const rodape = cardAtualEmExibicao.querySelector('.border-t');
      if (rodape) {
        const spanIdade = rodape.querySelector('span:first-child');
        const spanNascimento = rodape.querySelector('span:last-child');

        if (spanIdade) spanIdade.innerHTML = `<i class="ri-cake-2-line"></i> ${textoIdade}`;
        if (spanNascimento) spanNascimento.innerHTML = `<i class="ri-calendar-line"></i> ${dataFmt}`;
      }

      if (detalheObs) detalheObs.textContent = novaObs || 'Sem observações cadastradas.';

      abrirDetalhesDoCao(cardAtualEmExibicao);
      salvarEstadoCaesNoLocalStorage();
      mostrarToast(`Informações de ${novoNome} atualizadas com sucesso!`);
    };
  }

  // BOTÕES CANCELAR / VOLTAR DA EDIÇÃO
  if (btnVoltarDetalhes) {
    btnVoltarDetalhes.onclick = (e) => {
      e.preventDefault();
      if (viewEditar) viewEditar.classList.add('hidden');
      if (viewDetalhes) viewDetalhes.classList.remove('hidden');
    };
  }

  if (btnCancelarEditarCao) {
    btnCancelarEditarCao.onclick = (e) => {
      e.preventDefault();
      if (viewEditar) viewEditar.classList.add('hidden');
      if (viewDetalhes) viewDetalhes.classList.remove('hidden');
    };
  }

  // CONTROLE DE ABAS DA TELA DE DETALHES
  function ativarAbaVacinas() {
    if (tabVacinas && tabInformacoes) {
      tabVacinas.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all";
      tabInformacoes.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-all";
    }
    if (conteudoTabVacinas) conteudoTabVacinas.classList.remove('hidden');
    if (conteudoTabInformacoes) conteudoTabInformacoes.classList.add('hidden');
  }

  function ativarAbaInformacoes() {
    if (tabVacinas && tabInformacoes) {
      tabInformacoes.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all";
      tabVacinas.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-all";
    }
    if (conteudoTabInformacoes) conteudoTabInformacoes.classList.remove('hidden');
    if (conteudoTabVacinas) conteudoTabVacinas.classList.add('hidden');
  }

  if (tabVacinas) tabVacinas.onclick = (e) => { e.preventDefault(); ativarAbaVacinas(); };
  if (tabInformacoes) tabInformacoes.onclick = (e) => { e.preventDefault(); ativarAbaInformacoes(); };

  if (btnVoltarLista) {
    btnVoltarLista.onclick = (e) => {
      e.preventDefault();
      if (viewDetalhes) viewDetalhes.classList.add('hidden');
      if (viewEditar) viewEditar.classList.add('hidden');
      if (viewLista) viewLista.classList.remove('hidden');
    };
  }

  function inicializarCard(card) {
    card.onclick = () => {
      abrirDetalhesDoCao(card);
    };
  }

  const cardsIniciais = document.querySelectorAll('.container-caes > div');
  cardsIniciais.forEach(card => inicializarCard(card));
  salvarEstadoCaesNoLocalStorage(); // Salva estado inicial dos cards no localStorage

  // MODAL NOVO CÃO
  function abrirModal() {
    if (formAdicionar) formAdicionar.reset();
    if (modalAdicionar && modalContent) {
      modalAdicionar.classList.remove('hidden');
      setTimeout(() => {
        modalAdicionar.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModal() {
    if (modalAdicionar && modalContent) {
      modalAdicionar.classList.add('opacity-0');
      modalContent.classList.add('scale-95');
      setTimeout(() => {
        modalAdicionar.classList.add('hidden');
      }, 200);
    }
  }

  if (btnNovoCachorro) btnNovoCachorro.onclick = (e) => { e.preventDefault(); abrirModal(); };
  if (btnFecharModal) btnFecharModal.onclick = (e) => { e.preventDefault(); fecharModal(); };
  if (btnCancelarModal) btnCancelarModal.onclick = (e) => { e.preventDefault(); fecharModal(); };
  if (modalAdicionar) modalAdicionar.onclick = (e) => { if (e.target === modalAdicionar) fecharModal(); };

  if (formAdicionar) {
    formAdicionar.onsubmit = (e) => {
      e.preventDefault();

      const nome = document.getElementById('add-nome-cao').value;
      const raca = document.getElementById('add-raca-cao').value;
      const sexo = document.getElementById('add-sexo-cao').value;
      const dataNascRaw = document.getElementById('add-nascimento-cao').value;
      const fileInput = document.getElementById('add-foto-file-cao');

      const [ano, mes, dia] = dataNascRaw.split('-');
      const dataNasc = new Date(ano, mes - 1, dia);
      const dataFmt = `${dia}/${mes}/${ano}`;

      const { textoIdade, textoFase } = calcularIdadeEFase(dataNasc);

      const criarECadastrarCard = (fotoUrl) => {
        const bgSexo = sexo === 'Macho' ? 'bg-verdeokbg text-verdeok' : 'bg-pink-100 text-pink-500';

        const novoCard = document.createElement('div');
        novoCard.className = 'bg-white border border-[#EFECE6] hover:border-laranja rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between';

        novoCard.innerHTML = `
          <div class="relative h-44 bg-bege">
            <img src="${fotoUrl}" alt="${nome}" class="w-full h-full object-cover">
            <div class="absolute top-2 left-2 flex gap-1">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${sexo}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">${textoFase}</span>
            </div>
          </div>

          <div class="p-3.5">
            <h3 class="font-bold text-sm text-[#111827]">${nome}</h3>
            <p class="text-[11px] text-[#6B7280] mb-2.5">${raca}</p>

            <div class="flex justify-between text-[10px] text-[#6B7280] border-t border-[#FAFAF9] pt-2.5">
              <span><i class="ri-cake-2-line"></i> ${textoIdade}</span>
              <span><i class="ri-calendar-line"></i> ${dataFmt}</span>
            </div>
          </div>
        `;

        const containerCards = document.querySelector('.container-caes');
        if (containerCards) {
          containerCards.appendChild(novoCard);
        }

        inicializarCard(novoCard);
        atualizarContadorHeader();
        fecharModal();
        aplicarFiltrosEBusca();
        salvarEstadoCaesNoLocalStorage();
        mostrarToast(`Cão ${nome} cadastrado com sucesso!`);
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          criarECadastrarCard(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        const fotoPadrao = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400';
        criarECadastrarCard(fotoPadrao);
      }
    };
  }

  // BUSCA E FILTROS RÁPIDOS COM EMPTY STATE
  const inputBusca = document.querySelector('main input[type="text"]');
  const botoesFiltro = document.querySelectorAll('main .flex.bg-white.border button');
  const emptyState = document.getElementById('empty-state-caes');
  let filtroAtual = 'todos';

  function aplicarFiltrosEBusca() {
    const termoBusca = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const cards = document.querySelectorAll('.container-caes > div');
    let caesVisiveis = 0;

    cards.forEach(card => {
      const nome = card.querySelector('h3')?.textContent.trim().toLowerCase() || '';
      const raca = card.querySelector('p')?.textContent.trim().toLowerCase() || '';
      
      const spansBadges = card.querySelectorAll('.relative span');
      let sexo = '';
      let fase = '';

      spansBadges.forEach(s => {
        const txt = s.textContent.trim().toLowerCase();
        if (txt === 'macho' || txt === 'fêmea') sexo = txt;
        if (txt === 'adulto' || txt === 'filhote') fase = txt;
      });

      let passaFiltro = false;
      if (filtroAtual === 'todos') passaFiltro = true;
      else if (filtroAtual === 'machos' && sexo === 'macho') passaFiltro = true;
      else if (filtroAtual === 'fêmeas' && sexo === 'fêmea') passaFiltro = true;
      else if (filtroAtual === 'filhotes' && fase === 'filhote') passaFiltro = true;
      else if (filtroAtual === 'adultos' && fase === 'adulto') passaFiltro = true;

      let passaBusca = true;
      if (termoBusca !== '') {
        passaBusca = nome.includes(termoBusca) || raca.includes(termoBusca);
      }

      if (passaFiltro && passaBusca) {
        card.classList.remove('hidden');
        caesVisiveis++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (emptyState) {
      if (caesVisiveis === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  if (inputBusca) {
    inputBusca.addEventListener('input', aplicarFiltrosEBusca);
  }

  if (botoesFiltro.length > 0) {
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        botoesFiltro.forEach(b => {
          b.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-50 transition-colors";
        });
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-marromescuro text-white";

        filtroAtual = btn.textContent.trim().toLowerCase();
        aplicarFiltrosEBusca();
      });
    });
  }
});