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

  const modalExcluirCio = document.getElementById('modal-excluir-cio');
  const modalExcluirCioContent = modalExcluirCio ? modalExcluirCio.querySelector('.transform') : null;
  const btnCancelarExclusaoCio = document.getElementById('btn-cancelar-exclusao-cio');
  const btnConfirmarExclusaoCio = document.getElementById('btn-confirmar-exclusao-cio');
  let idCioParaExcluir = null;

  const modalExcluirNinhadaFicha = document.getElementById('modal-excluir-ninhada-ficha');
  const modalExcluirNinhadaFichaContent = modalExcluirNinhadaFicha ? modalExcluirNinhadaFicha.querySelector('.transform') : null;
  const btnCancelarExclusaoNinhadaFicha = document.getElementById('btn-cancelar-exclusao-ninhada-ficha');
  const btnConfirmarExclusaoNinhadaFicha = document.getElementById('btn-confirmar-exclusao-ninhada-ficha');
  let ninhadaIdParaExcluirFicha = null;

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
      const resposta = await fetch('/api/cachorros', {
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
          ? cao.foto
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
  async function carregarNinhadasDaFicha(nomeCao) {
    const containerNinhadas = document.getElementById('lista-ninhadas-container');
    const emptyStateNinhadas = document.getElementById('empty-state-ninhadas');
    if (!containerNinhadas) return;

    containerNinhadas.innerHTML = '';
    const token = localStorage.getItem('token');
    const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
    if (!token) return;

    try {
      const resposta = await fetch('/api/ninhadas', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!resposta.ok) return;

      const todasNinhadas = await resposta.json();
      const ninhadasDaFicha = todasNinhadas.filter(n =>
        (cachorroId && String(n.mae_id) === String(cachorroId)) ||
        ((n.mae_nome || '').toLowerCase() === (nomeCao || '').toLowerCase())
      );

      ninhadasDaFicha.sort((a, b) => new Date(b.data_nascimento) - new Date(a.data_nascimento));

      if (ninhadasDaFicha.length > 0) {
        if (emptyStateNinhadas) emptyStateNinhadas.classList.add('hidden');
        
        ninhadasDaFicha.forEach(n => {
          let extra = {};
          try {
            extra = typeof n.observacoes === 'string' ? JSON.parse(n.observacoes) : (n.observacoes || {});
          } catch (e) {
            extra = { obsTexto: n.observacoes };
          }

          const paiNome = extra.paiNome || 'Não informado';
          const tipoParto = extra.tipoParto || 'Natural';
          const machos = extra.machos ?? (n.quantidade_filhotes || 0);
          const femeas = extra.femeas ?? 0;
          const totalFilhotes = n.quantidade_filhotes ?? (machos + femeas);
          const pesoMedio = extra.pesoMedio ?? 0;
          const amamentando = extra.amamentando ?? false;
          const dataBr = n.data_nascimento ? formatarDataBR(String(n.data_nascimento).split('T')[0]) : '-';

          const badgeParto = tipoParto === 'Natural' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#D97706]';
          const badgeAmamentando = amamentando ? `<span class="bg-[#D1FAE5] text-[#10B981] text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">Amamentando</span>` : '';

          const itemHTML = `
            <div class="bg-[#FAF8F5] border border-[#EFECE6] hover:border-pink-300 rounded-2xl p-5 text-xs transition-all shadow-sm" data-ninhada-id="${n.id}">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4 class="font-bold text-[#111827] text-sm mb-0.5">Parto em ${dataBr}</h4>
                  <p class="text-[11px] text-[#6B7280]">Padreador (Pai): ${paiNome}</p>
                </div>
                <div class="flex items-center gap-2">
                  ${badgeAmamentando}
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeParto}">${tipoParto}</span>
                  <a href="maternidade.html" class="p-1 text-gray-400 hover:text-laranja hover:bg-orange-50 rounded transition-colors" title="Editar na Maternidade"><i class="ri-pencil-line text-sm"></i></a>
                  <button type="button" class="btn-excluir-ninhada-ficha p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir Ninhada"><i class="ri-delete-bin-line text-sm"></i></button>
                </div>
              </div>
              
              <div class="grid grid-cols-4 gap-3 text-center bg-white border border-[#EFECE6] rounded-xl p-3 shadow-sm">
                <div>
                  <div class="font-extrabold text-[#111827] text-base">${totalFilhotes}</div>
                  <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Total</div>
                </div>
                <div>
                  <div class="font-extrabold text-[#111827] text-base">${machos}</div>
                  <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Machos</div>
                </div>
                <div>
                  <div class="font-extrabold text-[#111827] text-base">${femeas}</div>
                  <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">F\u00eameas</div>
                </div>
                <div>
                  <div class="font-extrabold text-[#111827] text-base">${pesoMedio}g</div>
                  <div class="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold mt-0.5">Peso M\u00e9dio</div>
                </div>
              </div>
            </div>
          `;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = itemHTML;
          const itemEl = tempDiv.firstElementChild;
          itemEl.querySelector('.btn-excluir-ninhada-ficha').addEventListener('click', () => {
            abrirModalExcluirNinhadaFicha(n.id, nomeCao);
          });
          containerNinhadas.appendChild(itemEl);
        });
      } else {
        if (emptyStateNinhadas) emptyStateNinhadas.classList.remove('hidden');
      }
    } catch (err) {
      console.error("Erro ao carregar ninhadas da ficha:", err);
    }
  }

  // --- LÓGICA DE HISTÓRICO DE VACINAS (AGRUPAMENTO) ---
  async function carregarVacinasDaFicha(nomeCao) {
    const containerVacinas = document.getElementById('lista-vacinas-container');
    const emptyStateVacinas = document.getElementById('empty-state-vacinas-detalhe');
    if (!containerVacinas) return;
    
    containerVacinas.innerHTML = '';
    const token = localStorage.getItem('token');
    const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
    if (!token) return;

    try {
      const resposta = await fetch('/api/vacinas', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!resposta.ok) return;

      const todasVacinas = await resposta.json();
      
      // Atualiza o cache local para notificações
      localStorage.setItem('canil_vacinas', JSON.stringify(todasVacinas.map(v => ({
        id: v.id,
        caoNome: v.cachorro_nome,
        caoRaca: v.cachorro_raca,
        vacinaNome: v.nome_vacina,
        descVacina: 'Proteção preventiva',
        dataAplicacao: v.data_aplicacao ? formatarDataBR(String(v.data_aplicacao).split('T')[0]) : '-',
        proximaDose: v.proxima_dose ? formatarDataBR(String(v.proxima_dose).split('T')[0]) : '-',
        dataAplicacaoIso: v.data_aplicacao ? String(v.data_aplicacao).split('T')[0] : '',
        proximaDoseIso: v.proxima_dose ? String(v.proxima_dose).split('T')[0] : ''
      }))));

      const vacinasDoCao = todasVacinas.filter(v => 
        (cachorroId && String(v.cachorro_id) === String(cachorroId)) ||
        ((v.cachorro_nome || '').toLowerCase() === (nomeCao || '').toLowerCase())
      );

      if (vacinasDoCao.length > 0) {
        if (emptyStateVacinas) emptyStateVacinas.classList.add('hidden');

        // Agrupar as vacinas pelo nome (ex: "V10")
        const vacinasAgrupadas = {};
        vacinasDoCao.forEach(v => {
          const nomeKey = (v.nome_vacina || '').trim().toLowerCase();
          if (!vacinasAgrupadas[nomeKey]) vacinasAgrupadas[nomeKey] = { nomeExibicao: v.nome_vacina, desc: 'Proteção preventiva', doses: [] };
          vacinasAgrupadas[nomeKey].doses.push(v);
        });

        Object.values(vacinasAgrupadas).forEach(grupo => {
          grupo.doses.sort((a, b) => new Date(b.data_aplicacao) - new Date(a.data_aplicacao));
          const ultimaDose = grupo.doses[0];

          const dtProximaStr = String(ultimaDose.proxima_dose).split('T')[0];
          const dtProxima = new Date(dtProximaStr + 'T00:00:00');
          const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
          const estaVencida = dtProxima < hoje;

          const textoProxima = estaVencida ? 'Vencida!' : formatarDataBR(dtProximaStr);
          const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
          const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
          const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

          let historicoHTML = '';
          if (grupo.doses.length > 1) {
            const linhasHist = grupo.doses.slice(1).map(d => {
              const dtAppStr = String(d.data_aplicacao).split('T')[0];
              const dtProxStr = String(d.proxima_dose).split('T')[0];
              return `
                <div class="flex items-center justify-between py-2 px-3 bg-white border border-[#EFECE6] rounded-xl group/linha">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#111827]">${formatarDataBR(dtAppStr)}</span>
                    <span class="text-[10px] text-[#6B7280] font-medium">(Próx: ${formatarDataBR(dtProxStr)})</span>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover/linha:opacity-100 transition-opacity">
                      <button type="button" class="btn-editar-hist-vacina text-gray-400 hover:text-laranja p-1 transition-colors" data-id="${d.id}"><i class="ri-edit-line text-sm"></i></button>
                      <button type="button" class="btn-excluir-hist-vacina text-gray-400 hover:text-red-500 p-1 transition-colors" data-id="${d.id}"><i class="ri-delete-bin-line text-sm"></i></button>
                  </div>
                </div>
              `;
            }).join('');

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
              <div><div class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mb-0.5">Última aplicação</div><div class="font-bold text-[#111827] text-sm">${formatarDataBR(String(ultimaDose.data_aplicacao).split('T')[0])}</div></div>
              <div class="text-right"><div class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mb-0.5">Próxima dose</div><div class="font-bold ${corTextoProxima} text-sm">${textoProxima}</div></div>
            </div>
            ${historicoHTML}
          `;

          cardHTML.querySelector('.btn-nova-dose').onclick = () => {
            abrirModalVacina("Registrar Nova Dose");
            document.getElementById('vacina-nome').value = grupo.nomeExibicao;
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
    } catch (err) {
      console.error("Erro ao carregar vacinas da ficha:", err);
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
      const resposta = await fetch('/api/cios', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!resposta.ok) return;

      const todosCios = await resposta.json();
      // Filtra pelo cachorro_id do card aberto
      const ciosDoCao = todosCios.filter(c => String(c.cachorro_id) === String(cachorroId));

      if (ciosDoCao.length > 0) {
        if (emptyStateCios) emptyStateCios.classList.add('hidden');
        for (const c of ciosDoCao) {
          const dataInicio = c.data_inicio ? formatarDataBR(c.data_inicio.split('T')[0]) : '-';
          const dataFim    = c.data_fim    ? formatarDataBR(c.data_fim.split('T')[0])    : '-';
          const textoStatus = c.cruzou ? 'Cruzou' : 'Sem cruza';
          const classeBadge = c.cruzou ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FAF8F5] border border-[#EFECE6] text-gray-500';

          // Busca o histórico real de cruzamentos via API
          let cruzamentosList = [];
          try {
            const resCruz = await fetch(`/api/cruzamentos/cio/${c.id}`, {
              method: 'GET',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resCruz.ok) {
              cruzamentosList = await resCruz.json();
            }
          } catch (errCruz) {
            console.error('Erro ao buscar cruzamentos para cio:', errCruz);
          }

          let cruzamentosHTML = '';
          if (cruzamentosList.length > 0) {
            const linhasCruza = cruzamentosList.map(cr => {
              const dtCruza = cr.data_cruzamento ? formatarDataBR(cr.data_cruzamento.split('T')[0]) : '-';
              return `
                <div class="flex items-center justify-between py-2 px-3 bg-white border border-[#EFECE6] rounded-xl group/cruza text-xs">
                  <div>
                    <span class="font-bold text-[#111827]">${cr.macho_parceiro}</span>
                    <span class="text-[10px] text-[#6B7280] font-medium ml-2">(${dtCruza})</span>
                    ${cr.observacoes ? `<p class="text-[10px] text-gray-500 italic mt-0.5">${cr.observacoes}</p>` : ''}
                  </div>
                  <button type="button" class="btn-excluir-cruzamento text-gray-400 hover:text-red-500 p-1 transition-colors opacity-0 group-hover/cruza:opacity-100" data-id="${cr.id}" title="Excluir Cruzamento">
                    <i class="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              `;
            }).join('');

            cruzamentosHTML = `
              <div class="mt-3 pt-2.5 border-t border-[#EFECE6]">
                <button type="button" class="btn-toggle-historico flex items-center justify-between w-full text-left text-[10px] font-bold text-[#6B7280] hover:text-[#111827] uppercase tracking-wider py-1 px-1.5 rounded-lg hover:bg-gray-100/70 transition-all cursor-pointer">
                  <span>Histórico de Cruzamentos (${cruzamentosList.length})</span>
                  <i class="ri-arrow-down-s-line icone-seta text-sm transition-transform duration-200"></i>
                </button>
                <div class="container-historico hidden space-y-1.5 mt-2">
                  ${linhasCruza}
                </div>
              </div>
            `;
          }

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
                  <button class="btn-editar-cio p-1 text-gray-400 hover:text-laranja transition-colors" title="Editar Cio"><i class="ri-edit-line text-sm"></i></button>
                  <button class="btn-excluir-cio p-1 text-gray-400 hover:text-red-500 transition-colors" title="Excluir Cio"><i class="ri-delete-bin-line text-sm"></i></button>
                </div>
              </div>
            </div>
            ${cruzamentosHTML}
          `;

          cardCioEl.querySelector('.btn-editar-cio').onclick = () => editarCioExistente(c);
          cardCioEl.querySelector('.btn-excluir-cio').onclick = () => excluirCioExistente(c.id);

          const btnToggle = cardCioEl.querySelector('.btn-toggle-historico');
          const containerHist = cardCioEl.querySelector('.container-historico');
          const iconeSeta = cardCioEl.querySelector('.icone-seta');

          if (btnToggle && containerHist) {
            btnToggle.onclick = (e) => {
              e.stopPropagation();
              const estaEscondido = containerHist.classList.contains('hidden');
              if (estaEscondido) {
                containerHist.classList.remove('hidden');
                if (iconeSeta) {
                  iconeSeta.classList.remove('ri-arrow-down-s-line');
                  iconeSeta.classList.add('ri-arrow-up-s-line');
                }
              } else {
                containerHist.classList.add('hidden');
                if (iconeSeta) {
                  iconeSeta.classList.remove('ri-arrow-up-s-line');
                  iconeSeta.classList.add('ri-arrow-down-s-line');
                }
              }
            };
          }

          cardCioEl.querySelectorAll('.btn-excluir-cruzamento').forEach(btn => {
            btn.onclick = async (e) => {
              e.stopPropagation();
              const cruzaId = btn.dataset.id;
              if (confirm('Deseja realmente excluir este registro de cruzamento?')) {
                try {
                  const resDel = await fetch(`/api/cruzamentos/${cruzaId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                  });
                  if (resDel.ok) {
                    mostrarToast('Cruzamento removido com sucesso!');
                    await carregarCiosDaFicha(nomeCao);
                  } else {
                    mostrarToast('Erro ao remover cruzamento.');
                  }
                } catch (errDel) {
                  console.error('Erro ao excluir cruzamento:', errDel);
                  mostrarToast('Não foi possível conectar ao servidor.');
                }
              }
            };
          });

          containerCios.appendChild(cardCioEl);
        }
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
    const nomeVacinaInput = document.getElementById('vacina-nome');
    const descVacinaInput = document.getElementById('vacina-desc');
    const dtDoseInput = document.getElementById('vacina-data-dose');
    const dtProxInput = document.getElementById('vacina-data-proxima');

    if (nomeVacinaInput) nomeVacinaInput.value = vacina.nome_vacina || vacina.vacinaNome || '';
    if (descVacinaInput) descVacinaInput.value = vacina.descVacina || 'Proteção preventiva';

    const dtAppIso = vacina.data_aplicacao ? String(vacina.data_aplicacao).split('T')[0] : (vacina.dataAplicacaoIso || '');
    const dtProxIso = vacina.proxima_dose ? String(vacina.proxima_dose).split('T')[0] : (vacina.proximaDoseIso || '');

    if (dtDoseInput) dtDoseInput.value = dtAppIso;
    if (dtProxInput) dtProxInput.value = dtProxIso;

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

  async function excluirVacinaExistente(id) {
    if (!confirm("Tem certeza que deseja remover este registro de dose?")) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const resposta = await fetch(`/api/vacinas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (resposta.ok) {
        mostrarToast("Dose removida!");
        const caoNome = detalheNome?.textContent?.trim() || '';
        await carregarVacinasDaFicha(caoNome);
      } else {
        const erro = await resposta.json();
        alert(erro.mensagem || "Erro ao excluir vacina.");
      }
    } catch (err) {
      console.error("Erro ao excluir vacina:", err);
      alert("Erro de conexão ao excluir vacina.");
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
    formRegistrarVacina.onsubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const cachorroId = cardAtualEmExibicao?.dataset?.cachorroId;
      const nomeVacina = document.getElementById('vacina-nome')?.value.trim();
      const dataDoseRaw = document.getElementById('vacina-data-dose')?.value;
      const dataProximaRaw = document.getElementById('vacina-data-proxima')?.value;

      if (!token || !cachorroId || !nomeVacina || !dataDoseRaw || !dataProximaRaw) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const caoNome = detalheNome?.textContent?.trim() || 'Cão';

      try {
        let url = '/api/vacinas';
        let method = 'POST';
        let bodyPayload = {
          cachorro_id: parseInt(cachorroId),
          nome_vacina: nomeVacina,
          data_aplicacao: dataDoseRaw,
          proxima_dose: dataProximaRaw
        };

        if (idVacinaEmEdicao) {
          url = `/api/vacinas/${idVacinaEmEdicao}`;
          method = 'PUT';
        }

        const resposta = await fetch(url, {
          method: method,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        });

        if (resposta.ok) {
          fecharModalVacina();
          mostrarToast(idVacinaEmEdicao ? "Vacina atualizada!" : `Nova dose salva para ${caoNome}!`);
          await carregarVacinasDaFicha(caoNome);
        } else {
          const erro = await resposta.json();
          alert(erro.mensagem || "Erro ao salvar vacina.");
        }
      } catch (err) {
        console.error("Erro ao salvar vacina:", err);
        alert("Erro de conexão com o servidor.");
      }
    };
  }

  // --- GERENCIAMENTO DE CIOS ---
  function criarLinhaFormularioCruza(dados = {}) {
    if (!containerItensCruza) return;
    const divItem = document.createElement('div');
    divItem.className = "item-cruza-linha bg-[#FAF8F5] border border-[#EFECE6] p-3 rounded-2xl space-y-2 relative group";
    if (dados.id) {
      divItem.dataset.cruzaId = dados.id;
      divItem.dataset.cruzamentoId = dados.id;
    }

    const padreadorVal = dados.macho_parceiro || dados.macho || '';
    const dataVal = dados.data_cruzamento ? dados.data_cruzamento.split('T')[0] : (dados.data || '');
    const obsVal = dados.observacoes || dados.obs || '';

    divItem.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Padreador *</label><input type="text" name="macho_parceiro" class="cruza-padreador w-full bg-white border border-[#EFECE6] rounded-xl py-2 px-3 text-xs focus:border-laranja" value="${padreadorVal}" required></div>
        <div><label class="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Data *</label><input type="date" name="data_cruzamento" class="cruza-data w-full bg-white border border-[#EFECE6] rounded-xl py-2 px-3 text-xs focus:border-laranja" value="${dataVal}" required></div>
      </div>
      <div class="flex items-center justify-between gap-2">
        <input type="text" name="observacoes" class="cruza-obs w-full bg-white border border-[#EFECE6] rounded-xl py-1.5 px-3 text-xs focus:border-laranja" placeholder="Obs (opcional)" value="${obsVal}">
        <button type="button" class="btn-remover-cruza text-gray-300 hover:text-red-500 p-1.5"><i class="ri-delete-bin-line text-sm"></i></button>
      </div>
    `;

    divItem.querySelector('.btn-remover-cruza').onclick = async () => {
      const idParaExcluir = divItem.dataset.cruzamentoId || divItem.dataset.cruzaId;
      if (idParaExcluir) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch(`/api/cruzamentos/${idParaExcluir}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            mostrarToast('Cruzamento removido!');
            const nomeAtual = detalheNome?.textContent?.trim() || '';
            await carregarCiosDaFicha(nomeAtual);
          } catch (err) {
            console.error('Erro ao excluir cruzamento:', err);
          }
        }
      }
      divItem.remove();
    };

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
        let cioIdTarget = idCioEmEdicao;

        if (idCioEmEdicao) {
          // PUT /api/cios/:id (Edição de Cio)
          const resposta = await fetch(`/api/cios/${idCioEmEdicao}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
              data_inicio,
              data_fim,
              cruzou,
              observacoes
            })
          });

          const dados = await resposta.json();
          if (!resposta.ok) {
            mostrarToast(dados.mensagem || 'Erro ao atualizar cio.');
            return;
          }
        } else {
          // POST /api/cios (Novo Cio)
          const resposta = await fetch('/api/cios', {
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
            cioIdTarget = dados.cioId;
          } else {
            mostrarToast(dados.mensagem || 'Erro ao registrar cio.');
            return;
          }
        }

        // Se houve cruzamento, sincroniza todas as linhas de cruzamento (PUT para existentes, POST para novas)
        if (cruzou && cioIdTarget && containerItensCruza) {
          const linhasCruza = containerItensCruza.querySelectorAll('.item-cruza-linha');
          const promessasCruzamento = [];

          for (const linha of linhasCruza) {
            const cruzamentoId = linha.dataset.cruzamentoId || linha.dataset.cruzaId;
            const macho_parceiro = linha.querySelector('.cruza-padreador')?.value.trim();
            const data_cruzamento = linha.querySelector('.cruza-data')?.value;
            const obsCruza = linha.querySelector('.cruza-obs')?.value.trim() || null;

            if (macho_parceiro && data_cruzamento) {
              if (cruzamentoId) {
                // PUT /api/cruzamentos/:id (Edita cruzamento existente)
                promessasCruzamento.push(
                  fetch(`/api/cruzamentos/${cruzamentoId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                      data_cruzamento,
                      macho_parceiro,
                      observacoes: obsCruza
                    })
                  })
                );
              } else {
                // POST /api/cruzamentos (Cadastra novo cruzamento)
                promessasCruzamento.push(
                  fetch('/api/cruzamentos', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                      cio_id: cioIdTarget,
                      data_cruzamento,
                      macho_parceiro,
                      observacoes: obsCruza
                    })
                  })
                );
              }
            }
          }

          if (promessasCruzamento.length > 0) {
            await Promise.all(promessasCruzamento);
          }
        }

        fecharModalCio();
        const nomeAtual = detalheNome?.textContent?.trim() || '';
        await carregarCiosDaFicha(nomeAtual);
        mostrarToast(idCioEmEdicao ? 'Cio atualizado com sucesso!' : 'Cio registrado com sucesso!');

      } catch (erro) {
        console.error('Erro ao salvar cio:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  function abrirModalExcluirCio(cioId) {
    idCioParaExcluir = cioId;
    if (modalExcluirCio) {
      modalExcluirCio.classList.remove('hidden');
      setTimeout(() => {
        modalExcluirCio.classList.remove('opacity-0');
        if (modalExcluirCioContent) modalExcluirCioContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluirCio() {
    idCioParaExcluir = null;
    if (modalExcluirCio) {
      modalExcluirCio.classList.add('opacity-0');
      if (modalExcluirCioContent) modalExcluirCioContent.classList.add('scale-95');
      setTimeout(() => modalExcluirCio.classList.add('hidden'), 200);
    }
  }

  function excluirCioExistente(cioId) {
    abrirModalExcluirCio(cioId);
  }

  if (btnCancelarExclusaoCio) btnCancelarExclusaoCio.onclick = fecharModalExcluirCio;

  if (btnConfirmarExclusaoCio) {
    btnConfirmarExclusaoCio.onclick = async () => {
      if (!idCioParaExcluir) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const resposta = await fetch(`/api/cios/${idCioParaExcluir}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });

        if (resposta.ok) {
          fecharModalExcluirCio();
          const nomeAtual = detalheNome?.textContent?.trim() || '';
          await carregarCiosDaFicha(nomeAtual);
          mostrarToast('Registro removido com sucesso!');
        } else {
          mostrarToast('Erro ao remover cio.');
        }
      } catch (erro) {
        console.error('Erro ao excluir cio:', erro);
        mostrarToast('Não foi possível conectar ao servidor.');
      }
    };
  }

  function abrirModalExcluirNinhadaFicha(id, nomeCao) {
    ninhadaIdParaExcluirFicha = id;
    _nomeCaoParaRecarregar = nomeCao;
    if (modalExcluirNinhadaFicha) {
      modalExcluirNinhadaFicha.classList.remove('hidden');
      setTimeout(() => {
        modalExcluirNinhadaFicha.classList.remove('opacity-0');
        if (modalExcluirNinhadaFichaContent) modalExcluirNinhadaFichaContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluirNinhadaFicha() {
    ninhadaIdParaExcluirFicha = null;
    if (modalExcluirNinhadaFicha) {
      modalExcluirNinhadaFicha.classList.add('opacity-0');
      if (modalExcluirNinhadaFichaContent) modalExcluirNinhadaFichaContent.classList.add('scale-95');
      setTimeout(() => modalExcluirNinhadaFicha.classList.add('hidden'), 200);
    }
  }

  let _nomeCaoParaRecarregar = null;

  if (btnCancelarExclusaoNinhadaFicha) btnCancelarExclusaoNinhadaFicha.onclick = fecharModalExcluirNinhadaFicha;

  if (btnConfirmarExclusaoNinhadaFicha) {
    btnConfirmarExclusaoNinhadaFicha.onclick = async () => {
      if (!ninhadaIdParaExcluirFicha) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const resposta = await fetch(`/api/ninhadas/${ninhadaIdParaExcluirFicha}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        fecharModalExcluirNinhadaFicha();
        if (resposta.ok) {
          mostrarToast('Ninhada removida com sucesso!');
          if (_nomeCaoParaRecarregar) await carregarNinhadasDaFicha(_nomeCaoParaRecarregar);
        } else {
          mostrarToast('Erro ao remover ninhada.');
        }
      } catch (err) {
        console.error('Erro ao excluir ninhada da ficha:', err);
        mostrarToast('N\u00e3o foi poss\u00edvel conectar ao servidor.');
      }
    };
  }

  async function editarCioExistente(cio) {
    idCioEmEdicao = cio.id;
    const convData = (dataIso) => {
      if (!dataIso) return '';
      return dataIso.split('T')[0];
    };

    document.getElementById('cio-data-inicio').value = convData(cio.data_inicio);
    document.getElementById('cio-data-fim').value = convData(cio.data_fim);
    document.getElementById('cio-obs').value = cio.observacoes || '';

    if (containerItensCruza) containerItensCruza.innerHTML = '';
    const houveCruzamento = cio.cruzou === 1 || cio.cruzou === true || cio.cruzou === 'true';

    if (toggleCruzou) {
      toggleCruzou.checked = houveCruzamento;
      if (houveCruzamento) {
        if (camposDetalhesCruzamento) camposDetalhesCruzamento.classList.remove('hidden');
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const resCruza = await fetch(`/api/cruzamentos/cio/${cio.id}`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (resCruza.ok) {
              const cruzas = await resCruza.json();
              if (cruzas && cruzas.length > 0) {
                cruzas.forEach(cr => criarLinhaFormularioCruza(cr));
              } else {
                criarLinhaFormularioCruza();
              }
            } else {
              criarLinhaFormularioCruza();
            }
          } catch (err) {
            console.error('Erro ao carregar cruzamentos para edição:', err);
            criarLinhaFormularioCruza();
          }
        }
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
        const resposta = await fetch(`/api/cachorros/${cachorroId}`, {
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
        const resposta = await fetch(`/api/cachorros/${cachorroId}`, {
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
        const resposta = await fetch('/api/cachorros', {
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