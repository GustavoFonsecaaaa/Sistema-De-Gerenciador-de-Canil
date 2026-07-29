document.addEventListener('DOMContentLoaded', () => {
  console.log("Script cachorros.js carregado com sucesso!");

  // Elementos das Views Principais
  const viewLista = document.getElementById('view-lista-caes');
  const viewDetalhes = document.getElementById('view-detalhes-cao');
  const viewEditar = document.getElementById('view-editar-cao');

  // Botões de Navegação e Ações entre Views
  const btnVoltarLista = document.getElementById('btn-voltar-lista');
  const btnVoltarDetalhes = document.getElementById('btn-voltar-detalhes');
  const btnCancelarEditarCao = document.getElementById('btn-cancelar-editar-cao');
  const btnEditarCabecalho = document.getElementById('btn-editar-cao-detalhe');
  const btnExcluirCaoDetalhe = document.getElementById('btn-excluir-cao-detalhe');

  // Modal Exclusão de Cão
  const modalExcluirCao = document.getElementById('modal-confirmar-exclusao-cao');
  const modalExcluirCaoContent = modalExcluirCao ? modalExcluirCao.querySelector('.transform') : null;
  const btnCancelarExclusaoCao = document.getElementById('btn-cancelar-exclusao-cao');
  const btnConfirmarExclusaoCao = document.getElementById('btn-confirmar-exclusao-cao');
  const textoConfirmarExclusaoCao = document.getElementById('texto-confirmar-exclusao-cao');

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

  // Form de Edição de Cão
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
  const tabCio = document.getElementById('tab-cio');
  const tabVacinas = document.getElementById('tab-vacinas');
  const tabInformacoes = document.getElementById('tab-informacoes');
  const conteudoTabCio = document.getElementById('conteudo-tab-cio');
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

  // Modal Registrar/Editar Cio
  const btnRegistrarCio = document.getElementById('btn-registrar-cio');
  const modalCio = document.getElementById('modal-registrar-cio');
  const modalCioContent = modalCio ? modalCio.querySelector('.transform') : null;
  const btnFecharModalCio = document.getElementById('btn-fechar-modal-cio');
  const btnCancelarModalCio = document.getElementById('btn-cancelar-modal-cio');
  const formRegistrarCio = document.getElementById('form-registrar-cio');

  // Toggle Dinâmico dos Campos de Cruzamento
  const toggleCruzou = document.getElementById('cio-toggle-cruzou');
  const camposDetalhesCruzamento = document.getElementById('campos-detalhes-cruzamento');

  // Variável para armazenar o ID do cio se estivemos editando
  let idCioEmEdicao = null;

  if (toggleCruzou && camposDetalhesCruzamento) {
    toggleCruzou.addEventListener('change', () => {
      if (toggleCruzou.checked) {
        camposDetalhesCruzamento.classList.remove('hidden');
      } else {
        camposDetalhesCruzamento.classList.add('hidden');
      }
    });
  }

  // Modal Registrar Vacina
  const btnRegistrarVacina = document.getElementById('btn-registrar-vacina');
  const modalVacina = document.getElementById('modal-registrar-vacina');
  const modalVacinaContent = modalVacina ? modalVacina.querySelector('.transform') : null;
  const btnFecharModalVacina = document.getElementById('btn-fechar-modal-vacina');
  const btnCancelarModalVacina = document.getElementById('btn-cancelar-modal-vacina');
  const formRegistrarVacina = document.getElementById('form-registrar-vacina');

  let cardAtualEmExibicao = null;

  // COMPRESSÃO DE IMAGENS
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

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
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

      const spansRodape = card.querySelectorAll('div.flex.justify-between span');
      const idadeText = spansRodape[0]?.textContent.trim() || '';
      const nascimentoText = spansRodape[1]?.textContent.trim() || '';

      if (nome) {
        lista.push({ nome, raca, sexo, fase, foto, idadeText, nascimentoText });
      }
    });

    try {
      localStorage.setItem('canil_cachorros', JSON.stringify(lista));
    } catch (e) {
      console.error("Erro ao salvar cães no LocalStorage:", e);
    }
  }

  function criarElementoCard(cao) {
    const bgSexo = cao.sexo === 'Macho' ? 'bg-verdeokbg text-verdeok' : 'bg-pink-100 text-pink-500';

    const novoCard = document.createElement('div');
    novoCard.className = 'bg-white border border-[#EFECE6] hover:border-laranja rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between';

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

    inicializarCard(novoCard);
    return novoCard;
  }

  function carregarCaesDoLocalStorage() {
    const salvos = localStorage.getItem('canil_cachorros');
    const containerCards = document.querySelector('.container-caes');
    if (!containerCards) return;

    containerCards.innerHTML = '';

    if (salvos) {
      const listaCaes = JSON.parse(salvos);
      if (listaCaes.length > 0) {
        listaCaes.forEach(cao => {
          const cardEl = criarElementoCard(cao);
          containerCards.appendChild(cardEl);
        });
      }
    } else {
      localStorage.setItem('canil_cachorros', JSON.stringify([]));
    }

    atualizarContadorHeader();
    aplicarFiltrosEBusca();
  }

  // ABRIR TELA DE DETALHES DO CÃO
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

    // CARREGA VACINAS
    const containerVacinas = document.getElementById('lista-vacinas-container');
    const emptyStateVacinas = document.getElementById('empty-state-vacinas-detalhe');
    if (containerVacinas) {
      containerVacinas.innerHTML = '';
      const todasVacinas = JSON.parse(localStorage.getItem('canil_vacinas')) || [];
      const vacinasDoCao = todasVacinas.filter(v => v.caoNome.toLowerCase() === nome.toLowerCase());

      if (vacinasDoCao.length > 0) {
        if (emptyStateVacinas) emptyStateVacinas.classList.add('hidden');
        vacinasDoCao.forEach(v => {
          const dtProxima = new Date(v.proximaDoseIso);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const estaVencida = dtProxima < hoje;

          const textoProxima = estaVencida ? 'Vencida!' : v.proximaDose;
          const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
          const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
          const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

          const itemHTML = `
            <div class="bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl p-4 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] text-laranja flex items-center justify-center">
                  <i class="ri-syringe-line text-base"></i>
                </div>
                <div>
                  <h4 class="font-bold text-[#111827]">${v.vacinaNome}</h4>
                  <p class="text-[11px] text-[#6B7280]">Proteção preventiva</p>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <div class="text-[10px] text-[#6B7280]">Última dose</div>
                  <div class="font-bold text-[#111827]">${v.dataAplicacao}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-[#6B7280]">Próxima dose</div>
                  <div class="font-bold ${corTextoProxima}">${textoProxima}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClasse}">${badgeTexto}</span>
              </div>
            </div>
          `;
          containerVacinas.insertAdjacentHTML('beforeend', itemHTML);
        });
      } else {
        if (emptyStateVacinas) emptyStateVacinas.classList.remove('hidden');
      }
    }

    // CARREGA E PERSISTE CIOS ESPECÍFICOS DESTE CÃO (COM BOTÕES DE EDITAR E EXCLUIR)
    const containerCios = document.getElementById('lista-cios-container');
    const emptyStateCios = document.getElementById('empty-state-cios');
    if (containerCios) {
      containerCios.innerHTML = '';
      const todosCios = JSON.parse(localStorage.getItem('canil_cios')) || [];
      const ciosDoCao = todosCios.filter(c => c.caoNome.toLowerCase() === nome.toLowerCase());

      if (ciosDoCao.length > 0) {
        if (emptyStateCios) emptyStateCios.classList.add('hidden');
        ciosDoCao.forEach(c => {
          const textoStatus = c.houveCruzamento ? 'Cruzou' : 'Sem cruza';
          const classeBadge = c.houveCruzamento ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FAF8F5] border border-[#EFECE6] text-gray-500';

          let blocoCruzamentoHTML = '';
          if (c.houveCruzamento) {
            blocoCruzamentoHTML = `
              <div class="mt-3 pt-2.5 border-t border-[#EFECE6] grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span class="text-[#6B7280] block text-[9px] uppercase font-bold">Padreador (Macho)</span>
                  <span class="font-bold text-[#111827]">${c.padreador || 'Não informado'}</span>
                </div>
                <div>
                  <span class="text-[#6B7280] block text-[9px] uppercase font-bold">Qtd. Cruzas</span>
                  <span class="font-bold text-[#111827]">${c.qtdCruzas || '1'} cruza(s)</span>
                </div>
                <div>
                  <span class="text-[#6B7280] block text-[9px] uppercase font-bold">Datas das Cruzas</span>
                  <span class="font-bold text-laranja">${c.datasCruzas || 'Não informadas'}</span>
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
                <h4 class="font-bold text-[#111827] text-sm mb-0.5">${c.dataInicio} — ${c.dataFim}</h4>
                <p class="text-[11px] text-[#6B7280] mb-1">${c.duracaoDias} dias de duração</p>
                <p class="text-[11px] text-[#111827] italic font-serif">"${c.obs}"</p>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${classeBadge}">${textoStatus}</span>
                
                <!-- BOTÕES DE EDITAR E EXCLUIR CIO -->
                <div class="flex items-center gap-1 bg-white border border-[#EFECE6] rounded-xl p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button class="btn-editar-cio p-1 text-gray-400 hover:text-laranja transition-colors" title="Editar Cio">
                    <i class="ri-edit-line text-sm"></i>
                  </button>
                  <button class="btn-excluir-cio p-1 text-gray-400 hover:text-red-500 transition-colors" title="Excluir Cio">
                    <i class="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
            ${blocoCruzamentoHTML}
          `;

          // Evento do botão Editar Cio
          cardCioEl.querySelector('.btn-editar-cio').onclick = () => {
            editarCioExistente(c);
          };

          // Evento do botão Excluir Cio
          cardCioEl.querySelector('.btn-excluir-cio').onclick = () => {
            excluirCioExistente(c.id);
          };

          containerCios.appendChild(cardCioEl);
        });
      } else {
        if (emptyStateCios) emptyStateCios.classList.remove('hidden');
      }
    }

    if (sexo === 'Fêmea') {
      if (tabCio) tabCio.classList.remove('hidden');
      ativarAbaCio();
    } else {
      if (tabCio) tabCio.classList.add('hidden');
      ativarAbaVacinas();
    }

    if (viewLista) viewLista.classList.add('hidden');
    if (viewEditar) viewEditar.classList.add('hidden');
    if (viewDetalhes) viewDetalhes.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // EXCLUIR CIO
  function excluirCioExistente(cioId) {
    let cios = JSON.parse(localStorage.getItem('canil_cios')) || [];
    cios = cios.filter(c => c.id !== cioId);
    localStorage.setItem('canil_cios', JSON.stringify(cios));

    if (cardAtualEmExibicao) {
      abrirDetalhesDoCao(cardAtualEmExibicao);
    }
    mostrarToast("Registro de cio removido.");
  }

  // EDITAR CIO
  function editarCioExistente(cio) {
    idCioEmEdicao = cio.id;

    // Converte a data do formato BR (DD/MM/AAAA) para o formato do input date (AAAA-MM-DD)
    const convData = (dataBr) => {
      if (!dataBr) return '';
      const p = dataBr.split('/');
      return p.length === 3 ? `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}` : '';
    };

    document.getElementById('cio-data-inicio').value = convData(cio.dataInicio);
    document.getElementById('cio-data-fim').value = convData(cio.dataFim);
    document.getElementById('cio-obs').value = cio.obs || '';

    if (toggleCruzou) {
      toggleCruzou.checked = cio.houveCruzamento;
      if (cio.houveCruzamento) {
        camposDetalhesCruzamento.classList.remove('hidden');
        document.getElementById('cio-macho-padreador').value = cio.padreador || '';
        document.getElementById('cio-qtd-cruzas').value = cio.qtdCruzas || '';
        document.getElementById('cio-datas-cruzas').value = cio.datasCruzas || '';
      } else {
        camposDetalhesCruzamento.classList.add('hidden');
      }
    }

    const modalTitulo = modalCio ? modalCio.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = "Editar Registro de Cio";

    if (modalCio && modalCioContent) {
      modalCio.classList.remove('hidden');
      setTimeout(() => {
        modalCio.classList.remove('opacity-0');
        modalCioContent.classList.remove('scale-95');
      }, 10);
    }
  }

  // EXCLUSÃO DE CÃO
  function abrirModalExcluirCao() {
    const nome = detalheNome?.textContent || 'este cão';
    if (textoConfirmarExclusaoCao) {
      textoConfirmarExclusaoCao.textContent = `Tem certeza que deseja excluir o cão "${nome}"? Todas as vacinas e registros vinculados também serão removidos.`;
    }

    if (modalExcluirCao && modalExcluirCaoContent) {
      modalExcluirCao.classList.remove('hidden');
      setTimeout(() => {
        modalExcluirCao.classList.remove('opacity-0');
        modalExcluirCaoContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluirCao() {
    if (modalExcluirCao && modalExcluirCaoContent) {
      modalExcluirCao.classList.add('opacity-0');
      modalExcluirCaoContent.classList.add('scale-95');
      setTimeout(() => {
        modalExcluirCao.classList.add('hidden');
      }, 200);
    }
  }

  if (btnExcluirCaoDetalhe) btnExcluirCaoDetalhe.onclick = (e) => { e.preventDefault(); abrirModalExcluirCao(); };
  if (btnCancelarExclusaoCao) btnCancelarExclusaoCao.onclick = fecharModalExcluirCao;
  if (modalExcluirCao) modalExcluirCao.onclick = (e) => { if (e.target === modalExcluirCao) fecharModalExcluirCao(); };

  if (btnConfirmarExclusaoCao) {
    btnConfirmarExclusaoCao.onclick = () => {
      const nomeParaRemover = detalheNome?.textContent?.trim();

      if (nomeParaRemover) {
        let caes = JSON.parse(localStorage.getItem('canil_cachorros')) || [];
        caes = caes.filter(c => c.nome.toLowerCase() !== nomeParaRemover.toLowerCase());
        localStorage.setItem('canil_cachorros', JSON.stringify(caes));

        let vacinas = JSON.parse(localStorage.getItem('canil_vacinas')) || [];
        vacinas = vacinas.filter(v => v.caoNome.toLowerCase() !== nomeParaRemover.toLowerCase());
        localStorage.setItem('canil_vacinas', JSON.stringify(vacinas));

        let cios = JSON.parse(localStorage.getItem('canil_cios')) || [];
        cios = cios.filter(c => c.caoNome.toLowerCase() !== nomeParaRemover.toLowerCase());
        localStorage.setItem('canil_cios', JSON.stringify(cios));

        fecharModalExcluirCao();
        
        carregarCaesDoLocalStorage();
        if (viewDetalhes) viewDetalhes.classList.add('hidden');
        if (viewLista) viewLista.classList.remove('hidden');

        mostrarToast(`Cão ${nomeParaRemover} excluído com sucesso.`);
      }
    };
  }

  // ABAS DE DETALHES
  function resetarEstilosAbas() {
    const abas = [tabCio, tabVacinas, tabInformacoes];
    abas.forEach(tab => {
      if (tab) tab.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-all";
    });
    if (conteudoTabCio) conteudoTabCio.classList.add('hidden');
    if (conteudoTabVacinas) conteudoTabVacinas.classList.add('hidden');
    if (conteudoTabInformacoes) conteudoTabInformacoes.classList.add('hidden');
  }

  function ativarAbaCio() {
    resetarEstilosAbas();
    if (tabCio) tabCio.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all";
    if (conteudoTabCio) conteudoTabCio.classList.remove('hidden');
  }

  function ativarAbaVacinas() {
    resetarEstilosAbas();
    if (tabVacinas) tabVacinas.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all";
    if (conteudoTabVacinas) conteudoTabVacinas.classList.remove('hidden');
  }

  function ativarAbaInformacoes() {
    resetarEstilosAbas();
    if (tabInformacoes) tabInformacoes.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#111827] shadow-sm transition-all";
    if (conteudoTabInformacoes) conteudoTabInformacoes.classList.remove('hidden');
  }

  if (tabCio) tabCio.onclick = (e) => { e.preventDefault(); ativarAbaCio(); };
  if (tabVacinas) tabVacinas.onclick = (e) => { e.preventDefault(); ativarAbaVacinas(); };
  if (tabInformacoes) tabInformacoes.onclick = (e) => { e.preventDefault(); ativarAbaInformacoes(); };

  // SELETOR SEXO NA EDIÇÃO
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

  // ABRIR TELA EDIÇÃO DE CÃO
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

  if (editFileInput) {
    editFileInput.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        const compressedBase64 = await comprimirImagemBase64(e.target.files[0]);
        if (editPreviewFoto) editPreviewFoto.src = compressedBase64;
      }
    };
  }

  if (editObs) {
    editObs.oninput = () => {
      if (editCharCount) editCharCount.textContent = editObs.value.length;
    };
  }

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
    formAdicionar.onsubmit = async (e) => {
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

      let fotoUrl = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400';

      if (fileInput && fileInput.files && fileInput.files[0]) {
        fotoUrl = await comprimirImagemBase64(fileInput.files[0]);
      }

      const caoObj = {
        nome,
        raca,
        sexo,
        fase: textoFase,
        foto: fotoUrl,
        idadeText: textoIdade,
        nascimentoText: dataFmt
      };

      const novoCard = criarElementoCard(caoObj);
      const containerCards = document.querySelector('.container-caes');
      if (containerCards) {
        containerCards.appendChild(novoCard);
      }

      atualizarContadorHeader();
      fecharModal();
      aplicarFiltrosEBusca();
      salvarEstadoCaesNoLocalStorage();
      mostrarToast(`Cão ${nome} cadastrado com sucesso!`);
    };
  }

  // REGISTRO E EDIÇÃO DO CIO
  function abrirModalCio() {
    idCioEmEdicao = null;
    if (formRegistrarCio) formRegistrarCio.reset();
    if (toggleCruzou) toggleCruzou.checked = false;
    if (camposDetalhesCruzamento) camposDetalhesCruzamento.classList.add('hidden');

    const modalTitulo = modalCio ? modalCio.querySelector('h3') : null;
    if (modalTitulo) modalTitulo.textContent = "Registrar Novo Cio";

    if (modalCio && modalCioContent) {
      modalCio.classList.remove('hidden');
      setTimeout(() => {
        modalCio.classList.remove('opacity-0');
        modalCioContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalCio() {
    if (modalCio && modalCioContent) {
      modalCio.classList.add('opacity-0');
      modalCioContent.classList.add('scale-95');
      setTimeout(() => {
        modalCio.classList.add('hidden');
      }, 200);
    }
  }

  if (btnRegistrarCio) btnRegistrarCio.onclick = (e) => { e.preventDefault(); abrirModalCio(); };
  if (btnFecharModalCio) btnFecharModalCio.onclick = (e) => { e.preventDefault(); fecharModalCio(); };
  if (btnCancelarModalCio) btnCancelarModalCio.onclick = (e) => { e.preventDefault(); fecharModalCio(); };
  if (modalCio) modalCio.onclick = (e) => { if (e.target === modalCio) fecharModalCio(); };

  if (formRegistrarCio) {
    formRegistrarCio.onsubmit = (e) => {
      e.preventDefault();

      const caoNome = detalheNome?.textContent?.trim() || 'Fêmea';
      const dataInicioRaw = document.getElementById('cio-data-inicio').value;
      const dataFimRaw = document.getElementById('cio-data-fim').value;
      const obs = document.getElementById('cio-obs').value.trim() || 'Cio registrado';
      const houveCruzamento = toggleCruzou ? toggleCruzou.checked : false;

      let padreador = 'Não informado';
      let qtdCruzas = '1';
      let datasCruzas = 'Não informadas';

      if (houveCruzamento) {
        padreador = document.getElementById('cio-macho-padreador').value.trim() || 'Não informado';
        qtdCruzas = document.getElementById('cio-qtd-cruzas').value.trim() || '1';
        datasCruzas = document.getElementById('cio-datas-cruzas').value.trim() || 'Não informadas';
      }

      const [a1, m1, d1] = dataInicioRaw.split('-');
      const [a2, m2, d2] = dataFimRaw.split('-');

      const dtInicio = new Date(a1, m1 - 1, d1);
      const dtFim = new Date(a2, m2 - 1, d2);

      const diffTime = Math.abs(dtFim - dtInicio);
      const duracaoDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const dataFmtInicio = `${d1}/${m1}/${a1}`;
      const dataFmtFim = `${d2}/${m2}/${a2}`;

      let ciosSalvos = JSON.parse(localStorage.getItem('canil_cios')) || [];

      if (idCioEmEdicao) {
        // EDIÇÃO
        const index = ciosSalvos.findIndex(c => c.id === idCioEmEdicao);
        if (index !== -1) {
          ciosSalvos[index] = {
            ...ciosSalvos[index],
            dataInicio: dataFmtInicio,
            dataFim: dataFmtFim,
            duracaoDias,
            obs,
            houveCruzamento,
            padreador,
            qtdCruzas,
            datasCruzas
          };
        }
      } else {
        // CADASTRO NOVO
        const novoCioObj = {
          id: Date.now(),
          caoNome,
          dataInicio: dataFmtInicio,
          dataFim: dataFmtFim,
          duracaoDias,
          obs,
          houveCruzamento,
          padreador,
          qtdCruzas,
          datasCruzas
        };
        ciosSalvos.unshift(novoCioObj);
      }

      localStorage.setItem('canil_cios', JSON.stringify(ciosSalvos));
      fecharModalCio();

      if (cardAtualEmExibicao) {
        abrirDetalhesDoCao(cardAtualEmExibicao);
      }

      mostrarToast(idCioEmEdicao ? "Registro de cio atualizado!" : "Cio registrado com sucesso!");
    };
  }

  // MODAL REGISTRAR VACINA
  function abrirModalVacina() {
    if (formRegistrarVacina) formRegistrarVacina.reset();
    if (modalVacina && modalVacinaContent) {
      modalVacina.classList.remove('hidden');
      setTimeout(() => {
        modalVacina.classList.remove('opacity-0');
        modalVacinaContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalVacina() {
    if (modalVacina && modalVacinaContent) {
      modalVacina.classList.add('opacity-0');
      modalVacinaContent.classList.add('scale-95');
      setTimeout(() => {
        modalVacina.classList.add('hidden');
      }, 200);
    }
  }

  if (btnRegistrarVacina) btnRegistrarVacina.onclick = (e) => { e.preventDefault(); abrirModalVacina(); };
  if (btnFecharModalVacina) btnFecharModalVacina.onclick = (e) => { e.preventDefault(); fecharModalVacina(); };
  if (btnCancelarModalVacina) btnCancelarModalVacina.onclick = (e) => { e.preventDefault(); fecharModalVacina(); };
  if (modalVacina) modalVacina.onclick = (e) => { if (e.target === modalVacina) fecharModalVacina(); };

  if (formRegistrarVacina) {
    formRegistrarVacina.onsubmit = (e) => {
      e.preventDefault();

      const nomeVacina = document.getElementById('vacina-nome').value.trim();
      const descVacina = document.getElementById('vacina-desc').value.trim() || 'Sem descrição cadastrada';
      const dataDoseRaw = document.getElementById('vacina-data-dose').value;
      const dataProximaRaw = document.getElementById('vacina-data-proxima').value;

      const [a1, m1, d1] = dataDoseRaw.split('-');
      const [a2, m2, d2] = dataProximaRaw.split('-');

      const dtProxima = new Date(a2, m2 - 1, d2);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const estaVencida = dtProxima < hoje;

      const dataFmtDose = `${d1}/${m1}/${a1}`;
      const dataFmtProxima = `${d2}/${m2}/${a2}`;

      const textoProxima = estaVencida ? 'Vencida!' : dataFmtProxima;
      const corTextoProxima = estaVencida ? 'text-[#B45309]' : 'text-[#10B981]';
      const badgeTexto = estaVencida ? 'Pendente' : 'Em dia';
      const badgeClasse = estaVencida ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#D1FAE5] text-[#10B981]';

      const emptyStateVacinas = document.getElementById('empty-state-vacinas-detalhe');
      if (emptyStateVacinas) emptyStateVacinas.classList.add('hidden');

      const novaVacinaHTML = `
        <div class="bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl p-4 flex items-center justify-between text-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] text-laranja flex items-center justify-center">
              <i class="ri-syringe-line text-base"></i>
            </div>
            <div>
              <h4 class="font-bold text-[#111827]">${nomeVacina}</h4>
              <p class="text-[11px] text-[#6B7280]">${descVacina}</p>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <div class="text-[10px] text-[#6B7280]">Última dose</div>
              <div class="font-bold text-[#111827]">${dataFmtDose}</div>
            </div>
            <div class="text-right">
              <div class="text-[10px] text-[#6B7280]">Próxima dose</div>
              <div class="font-bold ${corTextoProxima}">${textoProxima}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClasse}">${badgeTexto}</span>
          </div>
        </div>
      `;

      const containerVacinas = document.getElementById('lista-vacinas-container');
      if (containerVacinas) {
        containerVacinas.insertAdjacentHTML('afterbegin', novaVacinaHTML);
      }

      const caoNome = detalheNome?.textContent?.trim() || 'Cão';
      const caoRaca = detalheRaca?.textContent?.trim() || '';
      const caoFoto = detalheFoto?.src || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';

      const vacinasSalvas = JSON.parse(localStorage.getItem('canil_vacinas')) || [];
      const novaVacinaObj = {
        id: Date.now(),
        caoNome,
        caoRaca,
        caoFoto,
        vacinaNome: nomeVacina,
        dataAplicacao: dataFmtDose,
        proximaDose: dataFmtProxima,
        dataAplicacaoIso: dataDoseRaw,
        proximaDoseIso: dataProximaRaw
      };

      vacinasSalvas.unshift(novaVacinaObj);
      localStorage.setItem('canil_vacinas', JSON.stringify(vacinasSalvas));

      fecharModalVacina();
      mostrarToast(`Vacina ${nomeVacina} registrada com sucesso!`);
    };
  }

  // BUSCA E FILTROS RÁPIDOS
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

  function verificarRedirecionamentoDoDashboard() {
    const nomeCaoSelecionado = localStorage.getItem('cao_selecionado_para_detalhes');
    if (nomeCaoSelecionado) {
      const cards = document.querySelectorAll('.container-caes > div');
      cards.forEach(card => {
        const nomeCard = card.querySelector('h3')?.textContent.trim();
        if (nomeCard && nomeCard.toLowerCase() === nomeCaoSelecionado.toLowerCase()) {
          abrirDetalhesDoCao(card);
        }
      });
      localStorage.removeItem('cao_selecionado_para_detalhes');
    }
  }

  carregarCaesDoLocalStorage();
  verificarRedirecionamentoDoDashboard();
});