document.addEventListener('DOMContentLoaded', () => {
  console.log("Script cachorros.js carregado com sucesso!");

  // FUNÇÃO SALVA-VIDAS
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

  const viewLista = document.getElementById('view-lista-caes');
  const viewDetalhes = document.getElementById('view-detalhes-cao');
  const viewEditar = document.getElementById('view-editar-cao');

  const btnVoltarLista = document.getElementById('btn-voltar-lista');
  const btnVoltarDetalhes = document.getElementById('btn-voltar-detalhes');
  const btnCancelarEditarCao = document.getElementById('btn-cancelar-editar-cao');
  const btnEditarCabecalho = document.getElementById('btn-editar-cao-detalhe');
  const btnExcluirCaoDetalhe = document.getElementById('btn-excluir-cao-detalhe');

  const modalExcluirCao = document.getElementById('modal-confirmar-exclusao-cao');
  const modalExcluirCaoContent = modalExcluirCao ? modalExcluirCao.querySelector('.transform') : null;
  const btnCancelarExclusaoCao = document.getElementById('btn-cancelar-exclusao-cao');
  const btnConfirmarExclusaoCao = document.getElementById('btn-confirmar-exclusao-cao');
  const textoConfirmarExclusaoCao = document.getElementById('texto-confirmar-exclusao-cao');

  const detalheFoto = document.getElementById('detalhe-foto');
  const detalheNome = document.getElementById('detalhe-nome');
  const detalheBadgeSexo = document.getElementById('detalhe-badge-sexo');
  const detalheRaca = document.getElementById('detalhe-raca');
  const detalheIdade = document.getElementById('detalhe-idade');
  const detalheNascimento = document.getElementById('detalhe-nascimento');
  const detalheClassificacao = document.getElementById('detalhe-classificacao');
  const detalheObs = document.getElementById('detalhe-obs');

  const infoNome = document.getElementById('info-nome');
  const infoRaca = document.getElementById('info-raca');
  const infoSexo = document.getElementById('info-sexo');
  const infoNascimento = document.getElementById('info-nascimento');
  const infoIdade = document.getElementById('info-idade');
  const infoClassificacao = document.getElementById('info-classificacao');

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
  
  const btnSexoMacho = document.getElementById('btn-sexo-macho');
  const btnSexoFemea = document.getElementById('btn-sexo-femea');
  let sexoSelecionadoEdit = 'Macho';

  const tabCio = document.getElementById('tab-cio');
  const tabNinhadas = document.getElementById('tab-ninhadas'); // NOVO
  const tabVacinas = document.getElementById('tab-vacinas');
  const tabInformacoes = document.getElementById('tab-informacoes');
  
  const conteudoTabCio = document.getElementById('conteudo-tab-cio');
  const conteudoTabNinhadas = document.getElementById('conteudo-tab-ninhadas'); // NOVO
  const conteudoTabVacinas = document.getElementById('conteudo-tab-vacinas');
  const conteudoTabInformacoes = document.getElementById('conteudo-tab-informacoes');

  const btnNovoCachorro = document.getElementById('btn-novo-cachorro');
  const modalAdicionar = document.getElementById('modal-adicionar-cachorro');
  const modalContent = modalAdicionar ? modalAdicionar.querySelector('.transform') : null;
  const btnFecharModal = document.getElementById('btn-fechar-modal-cadastrar');
  const btnCancelarModal = document.getElementById('btn-cancelar-cadastrar');
  const formAdicionar = document.getElementById('form-adicionar-cachorro');
  const toastSucesso = document.getElementById('toast-sucesso-cao');
  let toastTimeout = null;

  const btnRegistrarCio = document.getElementById('btn-registrar-cio');
  const modalCio = document.getElementById('modal-registrar-cio');
  const modalCioContent = modalCio ? modalCio.querySelector('.transform') : null;
  const btnFecharModalCio = document.getElementById('btn-fechar-modal-cio');
  const btnCancelarModalCio = document.getElementById('btn-cancelar-modal-cio');
  const formRegistrarCio = document.getElementById('form-registrar-cio');

  const toggleCruzou = document.getElementById('cio-toggle-cruzou');
  const camposDetalhesCruzamento = document.getElementById('campos-detalhes-cruzamento');
  const containerItensCruza = document.getElementById('container-itens-cruza');
  const btnAddItemCruza = document.getElementById('btn-add-item-cruza');

  let idCioEmEdicao = null;
  let idVacinaEmEdicao = null;
  let cardAtualEmExibicao = null;

  const btnRegistrarVacina = document.getElementById('btn-registrar-vacina');
  const modalVacina = document.getElementById('modal-registrar-vacina');
  const btnFecharModalVacina = document.getElementById('btn-fechar-modal-vacina');
  const btnCancelarModalVacina = document.getElementById('btn-cancelar-modal-vacina');
  const formRegistrarVacina = document.getElementById('form-registrar-vacina');

  function comprimirImagemBase64(file, maxWidth = 500, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
      };
    });
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

  function formatarDataBR(isoDate) {
    if (!isoDate) return '-';
    const partes = isoDate.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : isoDate;
  }

  function calcularIdadeEFase(dataNascimento) {
    const hoje = new Date();
    const nascAno = dataNascimento.getFullYear();
    const nascMes = dataNascimento.getMonth();
    
    let anos = hoje.getFullYear() - nascAno;
    let meses = hoje.getMonth() - nascMes;
    if (meses < 0) { anos--; meses += 12; }

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
    if (headerSub) headerSub.textContent = `${total} cães cadastrados no canil`;
  }

  function salvarEstadoCaesNoLocalStorage() {
    const cards = document.querySelectorAll('.container-caes > div');
    const lista = [];

    cards.forEach(card => {
      const nome = card.querySelector('h3')?.textContent.trim() || '';
      const raca = card.querySelector('p')?.textContent.trim() || '';
      const foto = card.querySelector('img')?.src || '';
      const spansBadges = card.querySelectorAll('.relative span');
      let sexo = 'Macho', fase = 'Adulto';

      spansBadges.forEach(s => {
        const txt = s.textContent.trim();
        if (txt === 'Macho' || txt === 'Femea') sexo = txt;
        if (txt === 'Adulto' || txt === 'Filhote') fase = txt;
      });

      const spansRodape = card.querySelectorAll('div.flex.justify-between span');
      const idadeText = spansRodape[0]?.textContent.trim() || '';
      const nascimentoText = spansRodape[1]?.textContent.trim() || '';

      if (nome) lista.push({ nome, raca, sexo, fase, foto, idadeText, nascimentoText });
    });
    localStorage.setItem('canil_cachorros', JSON.stringify(lista));
  }

  function criarElementoCard(cao) {
    const bgSexo = cao.sexo === 'Macho' ? 'bg-verdeokbg text-verdeok' : 'bg-pink-100 text-pink-500';
    const novoCard = document.createElement('div');
    novoCard.className = 'bg-white border border-[#EFECE6] hover:border-laranja rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between';
    // Armazena o ID do banco para uso nas chamadas de edição e exclusão
    if (cao.id) novoCard.dataset.cachorroId = cao.id;

    novoCard.innerHTML = `
      <div class="relative h-44 bg-bege">
        <img src="${cao.foto}" alt="${cao.nome}" class="w-full h-full object-cover">
        <div class="absolute top-2 left-2 flex gap-1">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${cao.sexo}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">${cao.fase}</span>
        </div>
      </div>
      <div class="p-3.5">
        <h3 class="font-bold text-sm text-[#111827]">${cao.nome}</h3>
        <p class="text-[11px] text-[#6B7280] mb-2.5">${cao.raca}</p>
        <div class="flex justify-between text-[10px] text-[#6B7280] border-t border-[#FAFAF9] pt-2.5">
          <span><i class="ri-cake-2-line"></i> ${cao.idadeText || ''}</span>
          <span><i class="ri-calendar-line"></i> ${cao.nascimentoText || ''}</span>
        </div>
      </div>
    `;
    novoCard.onclick = () => abrirDetalhesDoCao(novoCard);
    return novoCard;
  }

  async function carregarCaesDoLocalStorage() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const containerCards = document.querySelector('.container-caes');
    if (!containerCards) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/cachorros', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      const listaCaes = await resposta.json();

      containerCards.innerHTML = '';
      listaCaes.forEach(cao => {
        // Calcula fase a partir de data_nascimento retornada pela API
        let textoFase = 'Adulto';
        let textoIdade = '';
        if (cao.data_nascimento) {
          const nasc = new Date(cao.data_nascimento);
          const { textoIdade: idade, textoFase: fase } = calcularIdadeEFase(nasc);
          textoFase = fase;
          textoIdade = idade;
        }
        const fotoUrl = cao.foto
          ? 'http://localhost:3000' + cao.foto
          : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400';
        const nascimentoText = cao.data_nascimento ? formatarDataBR(cao.data_nascimento.split('T')[0]) : '';
        containerCards.appendChild(criarElementoCard({
          id: cao.id,
          nome: cao.nome,
          raca: cao.raca,
          sexo: cao.sexo,
          fase: textoFase,
          foto: fotoUrl,
          idadeText: textoIdade,
          nascimentoText
        }));
      });

      atualizarContadorHeader();
      aplicarFiltrosEBusca();
    } catch (erro) {
      console.error('Erro ao carregar cachorros da API:', erro);
    }
  }

  function abrirDetalhesDoCao(card) {
    cardAtualEmExibicao = card;
    const fotoSrc = card.querySelector('img')?.src || '';
    const nome = card.querySelector('h3')?.textContent.trim() || 'Cão';
    const raca = card.querySelector('p')?.textContent.trim() || '';
    
    const spansBadges = card.querySelectorAll('.relative span');
    let sexo = 'Macho', classificacao = 'Adulto';

    spansBadges.forEach(s => {
      const txt = s.textContent.trim();
      if (txt === 'Macho' || txt === 'Femea') sexo = txt;
      if (txt === 'Adulto' || txt === 'Filhote') classificacao = txt;
    });

    const spansRodape = card.querySelectorAll('div.flex.justify-between span');
    const idade = spansRodape[0]?.textContent.trim() || '';
    const nascimento = spansRodape[1]?.textContent.trim() || '';

    if (detalheFoto) detalheFoto.src = fotoSrc;
    if (detalheNome) detalheNome.textContent = nome;
    if (detalheRaca) detalheRaca.textContent = raca;
    if (detalheIdade) detalheIdade.textContent = idade;
    if (detalheNascimento) detalheNascimento.textContent = nascimento;
    if (detalheClassificacao) detalheClassificacao.textContent = classificacao;

    if (detalheBadgeSexo) {
      detalheBadgeSexo.textContent = sexo;
      detalheBadgeSexo.className = sexo === 'Macho' ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#10B981]' : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE7F3] text-[#EC4899]';
    }

    if (infoNome) infoNome.textContent = nome;
    if (infoRaca) infoRaca.textContent = raca;
    if (infoSexo) infoSexo.textContent = sexo;
    if (infoNascimento) infoNascimento.textContent = nascimento;
    if (infoIdade) infoIdade.textContent = idade;
    if (infoClassificacao) infoClassificacao.textContent = classificacao;

    carregarVacinasDaFicha(nome);
    carregarCiosDaFicha(nome);
    carregarNinhadasDaFicha(nome); // Chama a nova função

    if (sexo === 'Femea') {
      if (tabCio) tabCio.classList.remove('hidden');
      if (tabNinhadas) tabNinhadas.classList.remove('hidden'); // MOSTRA A ABA
      ativarAbaCio();
    } else {
      if (tabCio) tabCio.classList.add('hidden');
      if (tabNinhadas) tabNinhadas.classList.add('hidden'); // ESCONDE A ABA
      ativarAbaVacinas();
    }

    if (viewLista) viewLista.classList.add('hidden');
    if (viewEditar) viewEditar.classList.add('hidden');
    if (viewDetalhes) viewDetalhes.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- NOVA FUNÇÃO: CARREGAR NINHADAS (MATERNIDADE) DA FICHA ---
  function carregarNinhadasDaFicha(nomeCao) {
    const containerNinhadas = document.getElementById('lista-ninhadas-container');
    const emptyStateNinhadas = document.getElementById('empty-state-ninhadas');
    if (!containerNinhadas) return;

    containerNinhadas.innerHTML = '';
    const ninhadas = lerDadosSalvos('canil_ninhadas');
    const ninhadasDaFicha = ninhadas.filter(n => (n.maeNome || '').toLowerCase() === nomeCao.toLowerCase());

    // Ordenar as ninhadas pela mais recente
    ninhadasDaFicha.sort((a, b) => new Date(b.dataIso) - new Date(a.dataIso));

    if (ninhadasDaFicha.length > 0) {
      if (emptyStateNinhadas) emptyStateNinhadas.classList.add('hidden');
      
      ninhadasDaFicha.forEach(n => {
        const badgeParto = n.tipoParto === 'Natural' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]';
        const badgeAmamentando = n.amamentando ? `<span class="bg-[#D1FAE5] text-[#10B981] text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">Amamentando</span>` : '';
        const totalFilhotes = n.machos + n.femeas;

        const itemHTML = `
          <div class="bg-[#FAF8F5] border border-[#EFECE6] hover:border-pink-300 rounded-2xl p-5 text-xs transition-all shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-bold text-[#111827] text-sm mb-0.5">Parto em ${n.dataBr}</h4>
                <p class="text-[11px] text-[#6B7280]">Padreador (Pai): ${n.paiNome}</p>
              </div>
              <div class="flex items-center gap-2">
                ${badgeAmamentando}
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeParto}">${n.tipoParto}</span>
              </div>
            </div>
            
            <div class="grid grid-cols-4 gap-3 text-center bg-white border border-[#EFECE6] rounded-xl p-3 shadow-sm">
              <div>
                <div class="font-extrabold text-[#111827] text-base">${totalFilhotes}</div>
                <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Total</div>
              </div>
              <div>
                <div class="font-extrabold text-[#111827] text-base">${n.machos}</div>
                <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Machos</div>
              </div>
              <div>
                <div class="font-extrabold text-[#111827] text-base">${n.femeas}</div>
                <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Fêmeas</div>
              </div>
              <div>
                <div class="font-extrabold text-[#111827] text-base">${n.pesoMedio}g</div>
                <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Peso Médio</div>
              </div>
            </div>
          </div>
        `;
        containerNinhadas.insertAdjacentHTML('beforeend', itemHTML);
      });
    } else {
      if (emptyStateNinhadas) emptyStateNinhadas.classList.remove('hidden');
    }
  }

  // --- LÓGICA DE HISTÓRICO DE VACINAS (AGRUPAMENTO) ---
  function carregarVacinasDaFicha(nomeCao) {
    const containerVacinas = document.getElementById('lista-vacinas-container');
    const emptyStateVacinas = document.getElementById('empty-state-vacinas-detalhe');
    if (!containerVacinas) return;
    
    containerVacinas.innerHTML = '';
    const todasVacinas = lerDadosSalvos('canil_vacinas');
    const vacinasDoCao = todasVacinas.filter(v => (v.caoNome || '').toLowerCase() === nomeCao.toLowerCase());

    if (vacinasDoCao.length > 0) {
      if (emptyStateVacinas) emptyStateVacinas.classList.add('hidden');

      // Agrupar as vacinas pelo nome (ex: "V10")
      const vacinasAgrupadas = {};
      vacinasDoCao.forEach(v => {
        const nomeKey = v.vacinaNome.trim().toLowerCase();
        if (!vacinasAgrupadas[nomeKey]) vacinasAgrupadas[nomeKey] = { nomeExibicao: v.vacinaNome, desc: v.descVacina, doses: [] };
        vacinasAgrupadas[nomeKey].doses.push(v);
      });

      Object.values(vacinasAgrupadas).forEach(grupo => {
        grupo.doses.sort((a, b) => new Date(b.dataAplicacaoIso) - new Date(a.dataAplicacaoIso));
        const ultimaDose = grupo.doses[0];

        const dtProxima = new Date(ultimaDose.proximaDoseIso);
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const estaVencida = dtProxima < hoje;

        const textoProxima = estaVencida ? 'Vencida!' : ultimaDose.proximaDose;
        const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
        const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
        const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

        let historicoHTML = '';
        if (grupo.doses.length > 1) {
          const linhasHist = grupo.doses.slice(1).map(d => `
            <div class="flex items-center justify-between py-2 px-3 bg-white border border-[#EFECE6] rounded-xl group/linha">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#111827]">${d.dataAplicacao}</span>
                <span class="text-[10px] text-[#6B7280] font-medium">(Próx: ${d.proximaDose})</span>
              </div>
              <div class="flex gap-1 opacity-0 group-hover/linha:opacity-100 transition-opacity">
                  <button type="button" class="btn-editar-hist-vacina text-gray-400 hover:text-laranja p-1 transition-colors" data-id="${d.id}"><i class="ri-edit-line text-sm"></i></button>
                  <button type="button" class="btn-excluir-hist-vacina text-gray-400 hover:text-red-500 p-1 transition-colors" data-id="${d.id}"><i class="ri-delete-bin-line text-sm"></i></button>
              </div>
            </div>
          `).join('');

          historicoHTML = `
            <div class="mt-3 pt-2.5 border-t border-[#EFECE6]">
              <div class="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Histórico de Doses Anteriores (${grupo.doses.length - 1})</div>
              <div class="space-y-1.5 text-xs">
                ${linhasHist}
              </div>
            </div>
          `;
        }

        const cardHTML = document.createElement('div');
        cardHTML.className = "bg-[#FAF8F5] border border-[#EFECE6] hover:border-laranja/50 rounded-2xl p-4 text-xs transition-all group";
        cardHTML.innerHTML = `
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] text-laranja flex items-center justify-center"><i class="ri-syringe-line text-lg"></i></div>
              <div>
                <h4 class="font-bold text-[#111827] text-sm">${grupo.nomeExibicao}</h4>
                <p class="text-[11px] text-[#6B7280]">${grupo.desc || 'Proteção preventiva'}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClasse}">${badgeTexto}</span>
                <div class="flex items-center gap-1 bg-white border border-[#EFECE6] rounded-xl p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button class="btn-nova-dose p-1 text-laranja hover:bg-orange-50 transition-colors rounded" title="Registrar Nova Dose"><i class="ri-add-line text-sm"></i></button>
                  <button class="btn-editar-ultima p-1 text-gray-400 hover:text-laranja transition-colors" title="Editar Última Dose"><i class="ri-edit-line text-sm"></i></button>
                  <button class="btn-excluir-ultima p-1 text-gray-400 hover:text-red-500 transition-colors" title="Excluir Última Dose"><i class="ri-delete-bin-line text-sm"></i></button>
                </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 bg-white border border-[#EFECE6] rounded-xl p-3 shadow-sm">
            <div><div class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mb-0.5">Última aplicação</div><div class="font-bold text-[#111827] text-sm">${ultimaDose.dataAplicacao}</div></div>
            <div class="text-right"><div class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mb-0.5">Próxima dose</div><div class="font-bold ${corTextoProxima} text-sm">${textoProxima}</div></div>
          </div>
          ${historicoHTML}
        `;

        cardHTML.querySelector('.btn-nova-dose').onclick = () => {
          abrirModalVacina("Registrar Nova Dose");
          document.getElementById('vacina-nome').value = grupo.nomeExibicao;
          document.getElementById('vacina-desc').value = grupo.desc;
        };
        cardHTML.querySelector('.btn-editar-ultima').onclick = () => editarVacinaExistente(ultimaDose);
        cardHTML.querySelector('.btn-excluir-ultima').onclick = () => excluirVacinaExistente(ultimaDose.id);

        cardHTML.querySelectorAll('.btn-editar-hist-vacina').forEach(btn => {
            btn.onclick = () => {
                const dose = grupo.doses.find(d => d.id === parseInt(btn.dataset.id));
                if(dose) editarVacinaExistente(dose);
            }
        });
        cardHTML.querySelectorAll('.btn-excluir-hist-vacina').forEach(btn => {
            btn.onclick = () => excluirVacinaExistente(parseInt(btn.dataset.id));
        });

        containerVacinas.appendChild(cardHTML);
      });

    } else {
      if (emptyStateVacinas) emptyStateVacinas.classList.remove('hidden');
    }
  }

  async function carregarCiosDaFicha(nomeCao) {
    const containerCios = document.getElementById('lista-cios-container');
    const emptyStateCios = document.getElementById('empty-state-cios');
    if (!containerCios) return;

    containerCios.innerHTML = '';

    const token = localStorage.getItem('token');
    const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
    if (!token || !cachorroId) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/cios', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!resposta.ok) return;

      const todosCios = await resposta.json();
      // Filtra pelo cachorro_id do card aberto
      const ciosDoCao = todosCios.filter(c => String(c.cachorro_id) === String(cachorroId));

      if (ciosDoCao.length > 0) {
        if (emptyStateCios) emptyStateCios.classList.add('hidden');
        ciosDoCao.forEach(c => {
          const dataInicio = c.data_inicio ? formatarDataBR(c.data_inicio.split('T')[0]) : '-';
          const dataFim    = c.data_fim    ? formatarDataBR(c.data_fim.split('T')[0])    : '-';
          const textoStatus = c.cruzou ? 'Cruzou' : 'Sem cruza';
          const classeBadge = c.cruzou ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FAF8F5] border border-[#EFECE6] text-gray-500';

          const cardCioEl = document.createElement('div');
          cardCioEl.className = "bg-[#FAF8F5] border border-[#EFECE6] hover:border-laranja/50 rounded-2xl p-4 text-xs relative pl-6 transition-all group";
          cardCioEl.innerHTML = `
            <div class="absolute left-3 top-5 w-2 h-2 rounded-full bg-laranja"></div>
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-bold text-[#111827] text-sm mb-0.5">${dataInicio} — ${dataFim}</h4>
                <p class="text-[11px] text-[#111827] italic font-serif">"${c.observacoes || 'Sem observações'}"</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${classeBadge}">${textoStatus}</span>
                <div class="flex items-center gap-1 bg-white border border-[#EFECE6] rounded-xl p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button class="btn-excluir-cio p-1 text-gray-400 hover:text-red-500 transition-colors"><i class="ri-delete-bin-line text-sm"></i></button>
                </div>
              </div>
            </div>
          `;
          cardCioEl.querySelector('.btn-excluir-cio').onclick = () => excluirCioExistente(c.id);
          containerCios.appendChild(cardCioEl);
        });
      } else {
        if (emptyStateCios) emptyStateCios.classList.remove('hidden');
      }
    } catch (erro) {
      console.error('Erro ao carregar cios da ficha:', erro);
    }
  }

  // --- GERENCIAMENTO DE VACINAS (MODAL) ---
  function abrirModalVacina(titulo = "Registrar Vacina") {
    idVacinaEmEdicao = null;
    if (formRegistrarVacina) formRegistrarVacina.reset();
    
    const modalTitulo = modalVacina ? modalVacina.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = titulo;

    if (modalVacina) {
      modalVacina.classList.remove('hidden');
      setTimeout(() => {
        modalVacina.classList.remove('opacity-0');
        const transformEl = modalVacina.querySelector('.transform');
        if (transformEl) transformEl.classList.remove('scale-95');
      }, 10);
    }
  }

  function editarVacinaExistente(vacina) {
    idVacinaEmEdicao = vacina.id;
    document.getElementById('vacina-nome').value = vacina.vacinaNome;
    document.getElementById('vacina-desc').value = vacina.descVacina || '';
    document.getElementById('vacina-data-dose').value = vacina.dataAplicacaoIso;
    document.getElementById('vacina-data-proxima').value = vacina.proximaDoseIso;

    const modalTitulo = modalVacina ? modalVacina.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = "Editar Dose de Vacina";

    if (modalVacina) {
      modalVacina.classList.remove('hidden');
      setTimeout(() => {
        modalVacina.classList.remove('opacity-0');
        const transformEl = modalVacina.querySelector('.transform');
        if (transformEl) transformEl.classList.remove('scale-95');
      }, 10);
    }
  }

  function excluirVacinaExistente(id) {
    if(confirm("Tem certeza que deseja remover este registro de dose?")) {
        let vacinas = lerDadosSalvos('canil_vacinas');
        vacinas = vacinas.filter(v => v.id !== id);
        localStorage.setItem('canil_vacinas', JSON.stringify(vacinas));
        if (cardAtualEmExibicao) abrirDetalhesDoCao(cardAtualEmExibicao);
        mostrarToast("Dose removida!");
    }
  }

  function fecharModalVacina() {
    if (modalVacina) {
      modalVacina.classList.add('opacity-0');
      const transformEl = modalVacina.querySelector('.transform');
      if (transformEl) transformEl.classList.add('scale-95');
      setTimeout(() => modalVacina.classList.add('hidden'), 200);
    }
  }

  if (btnRegistrarVacina) btnRegistrarVacina.onclick = (e) => { e.preventDefault(); abrirModalVacina(); };
  if (btnFecharModalVacina) btnFecharModalVacina.onclick = (e) => { e.preventDefault(); fecharModalVacina(); };
  if (btnCancelarModalVacina) btnCancelarModalVacina.onclick = (e) => { e.preventDefault(); fecharModalVacina(); };

  if (formRegistrarVacina) {
    formRegistrarVacina.onsubmit = (e) => {
      e.preventDefault();
      const nomeVacina = document.getElementById('vacina-nome')?.value.trim();
      const descVacina = document.getElementById('vacina-desc')?.value.trim() || 'Proteção preventiva';
      const dataDoseRaw = document.getElementById('vacina-data-dose')?.value;
      const dataProximaRaw = document.getElementById('vacina-data-proxima')?.value;

      if (!nomeVacina || !dataDoseRaw || !dataProximaRaw) return;

      const p1 = dataDoseRaw.split('-');
      const p2 = dataProximaRaw.split('-');
      const dataFmtDose = `${p1[2]}/${p1[1]}/${p1[0]}`;
      const dataFmtProxima = `${p2[2]}/${p2[1]}/${p2[0]}`;

      const caoNome = detalheNome?.textContent?.trim() || 'Cão';
      const caoRaca = detalheRaca?.textContent?.trim() || '';

      const vacinasSalvas = lerDadosSalvos('canil_vacinas');
      
      const objVacina = {
        caoNome: caoNome, 
        caoRaca: caoRaca, 
        vacinaNome: nomeVacina, 
        descVacina: descVacina,
        dataAplicacao: dataFmtDose, 
        proximaDose: dataFmtProxima,
        dataAplicacaoIso: dataDoseRaw, 
        proximaDoseIso: dataProximaRaw
      };

      if (idVacinaEmEdicao) {
          const index = vacinasSalvas.findIndex(v => v.id === idVacinaEmEdicao);
          if (index !== -1) {
              vacinasSalvas[index] = { ...vacinasSalvas[index], ...objVacina };
          }
      } else {
          vacinasSalvas.unshift({ id: Date.now(), ...objVacina });
      }

      localStorage.setItem('canil_vacinas', JSON.stringify(vacinasSalvas));
      fecharModalVacina();
      if (cardAtualEmExibicao) abrirDetalhesDoCao(cardAtualEmExibicao);
      mostrarToast(idVacinaEmEdicao ? "Vacina atualizada!" : `Nova dose salva para ${caoNome}!`);
    };
  }

  // --- GERENCIAMENTO DE CIOS ---
  function criarLinhaFormularioCruza(dados = {}) {
    if (!containerItensCruza) return;
    const divItem = document.createElement('div');
    divItem.className = "item-cruza-linha bg-[#FAF8F5] border border-[#EFECE6] p-3 rounded-2xl space-y-2 relative group";
    divItem.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Padreador *</label><input type="text" class="cruza-padreador w-full bg-white border border-[#EFECE6] rounded-xl py-2 px-3 text-xs focus:border-laranja" value="${dados.macho || ''}" required></div>
        <div><label class="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Data *</label><input type="date" class="cruza-data w-full bg-white border border-[#EFECE6] rounded-xl py-2 px-3 text-xs focus:border-laranja" value="${dados.data || ''}" required></div>
      </div>
      <div class="flex items-center justify-between gap-2">
        <input type="text" class="cruza-obs w-full bg-white border border-[#EFECE6] rounded-xl py-1.5 px-3 text-xs focus:border-laranja" placeholder="Obs (opcional)" value="${dados.obs || ''}">
        <button type="button" class="btn-remover-cruza text-gray-300 hover:text-red-500 p-1.5"><i class="ri-delete-bin-line text-sm"></i></button>
      </div>
    `;
    divItem.querySelector('.btn-remover-cruza').onclick = () => divItem.remove();
    containerItensCruza.appendChild(divItem);
  }

  if (btnAddItemCruza) btnAddItemCruza.onclick = () => criarLinhaFormularioCruza();
  if (toggleCruzou && camposDetalhesCruzamento) {
    toggleCruzou.addEventListener('change', () => {
      if (toggleCruzou.checked) {
        camposDetalhesCruzamento.classList.remove('hidden');
        if (containerItensCruza && containerItensCruza.children.length === 0) criarLinhaFormularioCruza();
      } else {
        camposDetalhesCruzamento.classList.add('hidden');
      }
    });
  }

  function abrirModalCio() {
    idCioEmEdicao = null;
    if (formRegistrarCio) formRegistrarCio.reset();
    if (toggleCruzou) toggleCruzou.checked = false;
    if (camposDetalhesCruzamento) camposDetalhesCruzamento.classList.add('hidden');
    if (containerItensCruza) containerItensCruza.innerHTML = '';
    const modalTitulo = modalCio ? modalCio.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = "Registrar Novo Cio";

    if (modalCio) {
      modalCio.classList.remove('hidden');
      setTimeout(() => {
        modalCio.classList.remove('opacity-0');
        const transformEl = modalCio.querySelector('.transform');
        if (transformEl) transformEl.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalCio() {
    if (modalCio) {
      modalCio.classList.add('opacity-0');
      const transformEl = modalCio.querySelector('.transform');
      if (transformEl) transformEl.classList.add('scale-95');
      setTimeout(() => modalCio.classList.add('hidden'), 200);
    }
  }

  if (btnRegistrarCio) btnRegistrarCio.onclick = (e) => { e.preventDefault(); abrirModalCio(); };
  if (btnFecharModalCio) btnFecharModalCio.onclick = (e) => { e.preventDefault(); fecharModalCio(); };
  if (btnCancelarModalCio) btnCancelarModalCio.onclick = (e) => { e.preventDefault(); fecharModalCio(); };

  if (formRegistrarCio) {
    formRegistrarCio.onsubmit = async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
      if (!token || !cachorroId) { mostrarToast('Erro: token ou cachorro não identificado.'); return; }

      const data_inicio = document.getElementById('cio-data-inicio').value;
      const data_fim    = document.getElementById('cio-data-fim').value;
      const observacoes = document.getElementById('cio-obs').value.trim() || null;
      const cruzou      = toggleCruzou ? toggleCruzou.checked : false;

      if (!data_inicio || !data_fim) { mostrarToast('Informe as datas do cio.'); return; }

      try {
        const resposta = await fetch('http://localhost:3000/api/cios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            cachorro_id: cachorroId,
            data_inicio,
            data_fim,
            cruzou,
            observacoes
          })
        });

        const dados = await resposta.json();

        if (resposta.status === 201) {
          fecharModalCio();
          const nomeAtual = detalheNome?.textContent?.trim() || '';
          await carregarCiosDaFicha(nomeAtual);
          mostrarToast('Cio registrado com sucesso!');
        } else {
          mostrarToast(dados.mensagem || 'Erro ao registrar cio.');
        }
      } catch (erro) {
        console.error('Erro ao cadastrar cio:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  async function excluirCioExistente(cioId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const resposta = await fetch(`http://localhost:3000/api/cios/${cioId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resposta.ok) {
        const nomeAtual = detalheNome?.textContent?.trim() || '';
        await carregarCiosDaFicha(nomeAtual);
        mostrarToast('Registro removido.');
      } else {
        mostrarToast('Erro ao remover cio.');
      }
    } catch (erro) {
      console.error('Erro ao excluir cio:', erro);
      mostrarToast('Não foi possível conectar ao servidor.');
    }
  }

  function editarCioExistente(cio) {
    idCioEmEdicao = cio.id;
    const convData = (dataBr) => {
      if (!dataBr) return '';
      const p = dataBr.split('/');
      return p.length === 3 ? `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}` : '';
    };

    document.getElementById('cio-data-inicio').value = convData(cio.dataInicio);
    document.getElementById('cio-data-fim').value = convData(cio.dataFim);
    document.getElementById('cio-obs').value = cio.obs || '';

    if (containerItensCruza) containerItensCruza.innerHTML = '';
    if (toggleCruzou) {
      toggleCruzou.checked = cio.houveCruzamento;
      if (cio.houveCruzamento) {
        if (camposDetalhesCruzamento) camposDetalhesCruzamento.classList.remove('hidden');
        if (cio.cruzas && cio.cruzas.length > 0) cio.cruzas.forEach(cr => criarLinhaFormularioCruza(cr));
        else criarLinhaFormularioCruza();
      } else {
        if (camposDetalhesCruzamento) camposDetalhesCruzamento.classList.add('hidden');
      }
    }

    const modalTitulo = modalCio ? modalCio.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = "Editar Registro de Cio";

    if (modalCio) {
      modalCio.classList.remove('hidden');
      setTimeout(() => {
        modalCio.classList.remove('opacity-0');
        const t = modalCio.querySelector('.transform');
        if (t) t.classList.remove('scale-95');
      }, 10);
    }
  }

  function abrirModalExcluirCao() {
    const nome = detalheNome?.textContent || 'este cão';
    if (textoConfirmarExclusaoCao) textoConfirmarExclusaoCao.textContent = `Deseja excluir "${nome}"?`;
    if (modalExcluirCao) {
      modalExcluirCao.classList.remove('hidden');
      setTimeout(() => {
        modalExcluirCao.classList.remove('opacity-0');
        if (modalExcluirCaoContent) modalExcluirCaoContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluirCao() {
    if (modalExcluirCao) {
      modalExcluirCao.classList.add('opacity-0');
      if (modalExcluirCaoContent) modalExcluirCaoContent.classList.add('scale-95');
      setTimeout(() => modalExcluirCao.classList.add('hidden'), 200);
    }
  }

  if (btnExcluirCaoDetalhe) btnExcluirCaoDetalhe.onclick = (e) => { e.preventDefault(); abrirModalExcluirCao(); };
  if (btnCancelarExclusaoCao) btnCancelarExclusaoCao.onclick = fecharModalExcluirCao;

  if (btnConfirmarExclusaoCao) {
    btnConfirmarExclusaoCao.onclick = async () => {
      const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
      const token = localStorage.getItem('token');

      if (!cachorroId || !token) {
        mostrarToast('Erro: ID do cachôrro não encontrado.');
        return;
      }

      try {
        const resposta = await fetch(`http://localhost:3000/api/cachorros/${cachorroId}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        const dados = await resposta.json();

        if (resposta.status === 200) {
          fecharModalExcluirCao();
          if (viewDetalhes) viewDetalhes.classList.add('hidden');
          if (viewLista) viewLista.classList.remove('hidden');
          await carregarCaesDoLocalStorage();
          mostrarToast('Cão excluído com sucesso.');
        } else {
          mostrarToast(dados.mensagem || 'Erro ao excluir.');
        }
      } catch (erro) {
        console.error('Erro ao excluir cachorro:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  function resetarEstilosAbas() {
    [tabCio, tabNinhadas, tabVacinas, tabInformacoes].forEach(tab => {
      if (tab) tab.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-all";
    });
    if (conteudoTabCio) conteudoTabCio.classList.add('hidden');
    if (conteudoTabNinhadas) conteudoTabNinhadas.classList.add('hidden');
    if (conteudoTabVacinas) conteudoTabVacinas.classList.add('hidden');
    if (conteudoTabInformacoes) conteudoTabInformacoes.classList.add('hidden');
  }

  function ativarAbaCio() { resetarEstilosAbas(); if (tabCio) tabCio.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all"; if (conteudoTabCio) conteudoTabCio.classList.remove('hidden'); }
  function ativarAbaNinhadas() { resetarEstilosAbas(); if (tabNinhadas) tabNinhadas.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all"; if (conteudoTabNinhadas) conteudoTabNinhadas.classList.remove('hidden'); }
  function ativarAbaVacinas() { resetarEstilosAbas(); if (tabVacinas) tabVacinas.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all"; if (conteudoTabVacinas) conteudoTabVacinas.classList.remove('hidden'); }
  function ativarAbaInformacoes() { resetarEstilosAbas(); if (tabInformacoes) tabInformacoes.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all"; if (conteudoTabInformacoes) conteudoTabInformacoes.classList.remove('hidden'); }

  if (tabCio) tabCio.onclick = (e) => { e.preventDefault(); ativarAbaCio(); };
  if (tabNinhadas) tabNinhadas.onclick = (e) => { e.preventDefault(); ativarAbaNinhadas(); };
  if (tabVacinas) tabVacinas.onclick = (e) => { e.preventDefault(); ativarAbaVacinas(); };
  if (tabInformacoes) tabInformacoes.onclick = (e) => { e.preventDefault(); ativarAbaInformacoes(); };

  function selecionarSexoEdit(sexo) {
    sexoSelecionadoEdit = sexo;
    if (sexo === 'Macho') {
      if (btnSexoMacho) btnSexoMacho.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm bg-[#D1FAE5] border-[#10B981] text-[#065F46]";
      if (btnSexoFemea) btnSexoFemea.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] text-gray-500 hover:bg-white text-xs font-medium transition-all shadow-sm";
    } else {
      if (btnSexoFemea) btnSexoFemea.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-sm bg-[#FCE7F3] border-[#EC4899] text-[#9D174D]";
      if (btnSexoMacho) btnSexoMacho.className = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] text-gray-500 hover:bg-white text-xs font-medium transition-all shadow-sm";
    }
  }

  if (btnSexoMacho) btnSexoMacho.onclick = () => selecionarSexoEdit('Macho');
  if (btnSexoFemea) btnSexoFemea.onclick = () => selecionarSexoEdit('Fêmea');

  function abrirTelaEditarCao() {
    if (!cardAtualEmExibicao) return;
    const nome = detalheNome?.textContent || '';
    if (editSubtitulo) editSubtitulo.textContent = `Atualize as informações de ${nome}`;
    if (editPreviewFoto) editPreviewFoto.src = detalheFoto?.src || '';
    if (editNome) editNome.value = nome;
    if (editRaca) editRaca.value = detalheRaca?.textContent || '';
    if (editObs) { editObs.value = detalheObs?.textContent || ''; if (editCharCount) editCharCount.textContent = editObs.value.length; }

    const partes = (detalheNascimento?.textContent || '').split('/');
    if (partes.length === 3 && editNascimento) {
      editNascimento.value = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      const { textoIdade, textoFase } = calcularIdadeEFase(new Date(partes[2], parseInt(partes[1]) - 1, partes[0]));
      if (editIdadeCalculada) editIdadeCalculada.textContent = `${textoFase} · ${textoIdade}`;
    }

    selecionarSexoEdit(detalheBadgeSexo?.textContent || 'Macho');
    if (viewDetalhes) viewDetalhes.classList.add('hidden');
    if (viewLista) viewLista.classList.add('hidden');
    if (viewEditar) viewEditar.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnEditarCabecalho) btnEditarCabecalho.onclick = (e) => { e.preventDefault(); abrirTelaEditarCao(); };
  if (editFileInput) editFileInput.onchange = async (e) => { if (e.target.files && e.target.files[0]) if (editPreviewFoto) editPreviewFoto.src = await comprimirImagemBase64(e.target.files[0]); };
  if (editObs) editObs.oninput = () => { if (editCharCount) editCharCount.textContent = editObs.value.length; };
  if (editNascimento) editNascimento.onchange = () => {
    if (editNascimento.value) {
      const [ano, mes, dia] = editNascimento.value.split('-');
      const { textoIdade, textoFase } = calcularIdadeEFase(new Date(ano, mes - 1, dia));
      if (editIdadeCalculada) editIdadeCalculada.textContent = `${textoFase} · ${textoIdade}`;
    }
  };

  if (formEditar) {
    formEditar.onsubmit = async (e) => {
      e.preventDefault();
      if (!cardAtualEmExibicao) return;

      const cachorroId = cardAtualEmExibicao.dataset.cachorroId;
      const token = localStorage.getItem('token');

      if (!cachorroId || !token) {
        mostrarToast('Erro: ID do cachorro não encontrado.');
        return;
      }

      const nome = editNome.value.trim();
      const raca = editRaca.value.trim();
      // Garante 'Femea' sem acento (padrão do banco)
      const sexo = sexoSelecionadoEdit === 'Fêmea' ? 'Femea' : sexoSelecionadoEdit;
      const data_nascimento = editNascimento.value;

      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('raca', raca);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', data_nascimento);
      if (editFileInput && editFileInput.files && editFileInput.files[0]) {
        formData.append('foto', editFileInput.files[0]);
      }

      try {
        const resposta = await fetch(`http://localhost:3000/api/cachorros/${cachorroId}`, {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });

        const dados = await resposta.json();

        if (resposta.status === 200) {
          mostrarToast('Atualizado com sucesso!');
          // Recarrega a lista da API e volta para a tela de lista
          if (viewEditar) viewEditar.classList.add('hidden');
          if (viewLista) viewLista.classList.remove('hidden');
          await carregarCaesDoLocalStorage();
        } else {
          mostrarToast(dados.mensagem || 'Erro ao atualizar.');
        }
      } catch (erro) {
        console.error('Erro ao atualizar cachorro:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  if (btnVoltarDetalhes) btnVoltarDetalhes.onclick = (e) => { e.preventDefault(); if (viewEditar) viewEditar.classList.add('hidden'); if (viewDetalhes) viewDetalhes.classList.remove('hidden'); };
  if (btnCancelarEditarCao) btnCancelarEditarCao.onclick = (e) => { e.preventDefault(); if (viewEditar) viewEditar.classList.add('hidden'); if (viewDetalhes) viewDetalhes.classList.remove('hidden'); };
  if (btnVoltarLista) btnVoltarLista.onclick = (e) => { e.preventDefault(); if (viewDetalhes) viewDetalhes.classList.add('hidden'); if (viewEditar) viewEditar.classList.add('hidden'); if (viewLista) viewLista.classList.remove('hidden'); };

  function abrirModalAdd() {
    if (formAdicionar) formAdicionar.reset();
    if (modalAdicionar) {
      modalAdicionar.classList.remove('hidden');
      setTimeout(() => { modalAdicionar.classList.remove('opacity-0'); const t = modalAdicionar.querySelector('.transform'); if (t) t.classList.remove('scale-95'); }, 10);
    }
  }

  function fecharModalAdd() {
    if (modalAdicionar) {
      modalAdicionar.classList.add('opacity-0');
      const t = modalAdicionar.querySelector('.transform'); if (t) t.classList.add('scale-95');
      setTimeout(() => modalAdicionar.classList.add('hidden'), 200);
    }
  }

  if (btnNovoCachorro) btnNovoCachorro.onclick = (e) => { e.preventDefault(); abrirModalAdd(); };
  if (btnFecharModal) btnFecharModal.onclick = (e) => { e.preventDefault(); fecharModalAdd(); };
  if (btnCancelarModal) btnCancelarModal.onclick = (e) => { e.preventDefault(); fecharModalAdd(); };

  if (formAdicionar) {
    formAdicionar.onsubmit = async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) { window.location.href = 'login.html'; return; }

      const nome          = document.getElementById('add-nome-cao').value.trim();
      const raca          = document.getElementById('add-raca-cao').value.trim();
      let   sexo          = document.getElementById('add-sexo-cao').value;
      const data_nascimento = document.getElementById('add-nascimento-cao').value;
      const fileInput     = document.getElementById('add-foto-file-cao');

      if (!nome || !raca || !sexo || !data_nascimento) {
        mostrarToast('Preencha todos os campos obrigatórios.');
        return;
      }

      // Monta o FormData manualmente para garantir campos e arquivo corretos
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('raca', raca);
      formData.append('sexo', sexo);
      formData.append('data_nascimento', data_nascimento);
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('foto', fileInput.files[0]);
      }

      try {
        const resposta = await fetch('http://localhost:3000/api/cachorros', {
          method: 'POST',
          headers: {
            // SEM Content-Type: o navegador define o boundary do multipart/form-data
            'Authorization': 'Bearer ' + token
          },
          body: formData
        });

        const dados = await resposta.json();

        if (resposta.status === 201 || resposta.status === 200) {
          mostrarToast(`Cão ${nome} cadastrado com sucesso!`);
          formAdicionar.reset();
          fecharModalAdd();
          await carregarCaesDoLocalStorage(); // recarrega lista da API
        } else {
          mostrarToast(dados.mensagem || 'Erro ao cadastrar cachorro.');
        }
      } catch (erro) {
        console.error('Erro ao cadastrar cachorro:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

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
      let sexo = '', fase = '';
      card.querySelectorAll('.relative span').forEach(s => { const t = s.textContent.trim().toLowerCase(); if (t === 'macho' || t === 'femea') sexo = t; if (t === 'adulto' || t === 'filhote') fase = t; });

      let passaFiltro = false;
      if (filtroAtual === 'todos') passaFiltro = true;
      else if (filtroAtual === 'machos' && sexo === 'macho') passaFiltro = true;
      else if (filtroAtual === 'fêmeas' && sexo === 'femea') passaFiltro = true;
      else if (filtroAtual === 'filhotes' && fase === 'filhote') passaFiltro = true;
      else if (filtroAtual === 'adultos' && fase === 'adulto') passaFiltro = true;

      if (passaFiltro && (termoBusca === '' || nome.includes(termoBusca) || raca.includes(termoBusca))) { card.classList.remove('hidden'); caesVisiveis++; }
      else card.classList.add('hidden');
    });

    if (emptyState) { if (caesVisiveis === 0) emptyState.classList.remove('hidden'); else emptyState.classList.add('hidden'); }
  }

  if (inputBusca) inputBusca.addEventListener('input', aplicarFiltrosEBusca);
  if (botoesFiltro.length > 0) {
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        botoesFiltro.forEach(b => b.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-50 transition-colors");
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-marromescuro text-white";
        filtroAtual = btn.textContent.trim().toLowerCase();
        aplicarFiltrosEBusca();
      });
    });
  }

  function verificarRedirecionamentoDoDashboard() {
    const nomeCaoSelecionado = localStorage.getItem('cao_selecionado_para_detalhes');
    if (nomeCaoSelecionado) {
      document.querySelectorAll('.container-caes > div').forEach(card => {
        if ((card.querySelector('h3')?.textContent.trim() || '').toLowerCase() === nomeCaoSelecionado.toLowerCase()) abrirDetalhesDoCao(card);
      });
      localStorage.removeItem('cao_selecionado_para_detalhes');
    }
  }

  carregarCaesDoLocalStorage();
  verificarRedirecionamentoDoDashboard();

});