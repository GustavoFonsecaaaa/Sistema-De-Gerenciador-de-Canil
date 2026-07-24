document.addEventListener('DOMContentLoaded', () => {
  console.log("Script cachorros.js carregado com sucesso!");

  // Elementos das Views Principais
  const viewLista = document.getElementById('view-lista-caes');
  const viewDetalhes = document.getElementById('view-detalhes-cao');
  const btnVoltarLista = document.getElementById('btn-voltar-lista');

  // Elementos da Tela de Detalhes
  const detalheFoto = document.getElementById('detalhe-foto');
  const detalheNome = document.getElementById('detalhe-nome');
  const detalheBadgeSexo = document.getElementById('detalhe-badge-sexo');
  const detalheRaca = document.getElementById('detalhe-raca');
  const detalheIdade = document.getElementById('detalhe-idade');
  const detalheNascimento = document.getElementById('detalhe-nascimento');
  const detalheClassificacao = document.getElementById('detalhe-classificacao');

  // Elementos da Aba de Informações
  const infoNome = document.getElementById('info-nome');
  const infoRaca = document.getElementById('info-raca');
  const infoSexo = document.getElementById('info-sexo');
  const infoNascimento = document.getElementById('info-nascimento');
  const infoIdade = document.getElementById('info-idade');
  const infoClassificacao = document.getElementById('info-classificacao');

  // Abas
  const tabVacinas = document.getElementById('tab-vacinas');
  const tabInformacoes = document.getElementById('tab-informacoes');
  const conteudoTabVacinas = document.getElementById('conteudo-tab-vacinas');
  const conteudoTabInformacoes = document.getElementById('conteudo-tab-informacoes');

  // Modal & Toast
  const btnNovoCachorro = document.getElementById('btn-novo-cachorro');
  const modalAdicionar = document.getElementById('modal-adicionar-cachorro');
  const modalContent = modalAdicionar ? modalAdicionar.querySelector('.transform') : null;
  const btnFecharModal = document.getElementById('btn-fechar-modal-cadastrar');
  const btnCancelarModal = document.getElementById('btn-cancelar-cadastrar');
  const formAdicionar = document.getElementById('form-adicionar-cachorro');
  const toastSucesso = document.getElementById('toast-sucesso-cao');
  let toastTimeout = null;

  function mostrarToast(msg = "Cão cadastrado com sucesso!") {
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
    const fotoSrc = card.querySelector('img')?.src || '';
    const nome = card.querySelector('h3')?.textContent.trim() || 'Cão';
    const raca = card.querySelector('p')?.textContent.trim() || '';
    
    // Captura badges de Sexo e Fase
    const spansBadges = card.querySelectorAll('.relative span');
    let sexo = 'Macho';
    let classificacao = 'Adulto';

    spansBadges.forEach(s => {
      const txt = s.textContent.trim();
      if (txt === 'Macho' || txt === 'Fêmea') sexo = txt;
      if (txt === 'Adulto' || txt === 'Filhote') classificacao = txt;
    });

    // Captura os dados no rodape do card
    const spansRodape = card.querySelectorAll('div.flex.justify-between span');
    const idade = spansRodape[0]?.textContent.trim() || '3a 2m';
    const nascimento = spansRodape[1]?.textContent.trim() || '11/05/2023';

    // Preenche Painel Esquerdo
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

    // Preenche Aba de Informações
    if (infoNome) infoNome.textContent = nome;
    if (infoRaca) infoRaca.textContent = raca;
    if (infoSexo) infoSexo.textContent = sexo;
    if (infoNascimento) infoNascimento.textContent = nascimento;
    if (infoIdade) infoIdade.textContent = idade;
    if (infoClassificacao) infoClassificacao.textContent = classificacao;

    // Reseta para a aba vacinas
    ativarAbaVacinas();

    // Troca de Views de forma segura
    if (viewLista) viewLista.classList.add('hidden');
    if (viewDetalhes) viewDetalhes.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // CONTROLE DE ABAS
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

  // BOTÃO VOLTAR PARA A LISTA
  if (btnVoltarLista) {
    btnVoltarLista.onclick = (e) => {
      e.preventDefault();
      if (viewDetalhes) viewDetalhes.classList.add('hidden');
      if (viewLista) viewLista.classList.remove('hidden');
    };
  }

  // INICIALIZA EVENTO DE CLIQUE EM CADA CARD
  function inicializarCard(card) {
    card.onclick = () => {
      abrirDetalhesDoCao(card);
    };
  }

  const cardsIniciais = document.querySelectorAll('.container-caes > div');
  cardsIniciais.forEach(card => inicializarCard(card));

  // MODAL ADICIONAR
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
        const bgSexo = sexo === 'Macho' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FCE7F3] text-[#EC4899]';

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
});