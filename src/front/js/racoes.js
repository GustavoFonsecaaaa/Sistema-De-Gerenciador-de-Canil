document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com sucesso!");

  // Elementos do painel superior
  const statTotalSacos = document.getElementById('stat-total-sacos');
  const statTotalKg = document.getElementById('stat-total-kg');
  const statEstoqueBaixo = document.getElementById('stat-estoque-baixo');
  const statTiposCadastrados = document.getElementById('stat-tipos-cadastrados');
  const statTotalMarcas = document.getElementById('stat-total-marcas');
  const containerRacoes = document.querySelector('.container-racoes');

  // Barra de Busca
  const inputBusca = document.querySelector('input[placeholder*="Buscar por marca"]');

  // Botão abrir adicionar
  const btnAdicionarRacao = document.getElementById('btn-adicionar-racao');

  // Elementos do Modal Excluir
  const modalExcluir = document.getElementById('modal-excluir');
  const modalContentExcluir = modalExcluir ? modalExcluir.querySelector('.transform') : null;
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');
  const btnConfirmarModal = document.getElementById('btn-confirmar-modal');

  // Elementos do Modal Editar
  const modalEditar = document.getElementById('modal-editar');
  const modalContentEditar = modalEditar ? modalEditar.querySelector('.transform') : null;
  const btnFecharModalEditar = document.getElementById('btn-fechar-modal-editar');
  const btnCancelarEditar = document.getElementById('btn-cancelar-editar');
  const formEditar = document.getElementById('form-editar-racao');

  // Elementos do Modal Adicionar
  const modalAdicionar = document.getElementById('modal-adicionar');
  const modalContentAdicionar = modalAdicionar ? modalAdicionar.querySelector('.transform') : null;
  const btnFecharModalAdicionar = document.getElementById('btn-fechar-modal-adicionar');
  const btnCancelarAdicionar = document.getElementById('btn-cancelar-adicionar');
  const formAdicionar = document.getElementById('form-adicionar-racao');

  // Toast
  const toastSucesso = document.getElementById('toast-sucesso');
  
  let cardParaExcluir = null;
  let cardParaEditar = null;
  let toastTimeout = null;

  function mostrarToast(mensagem = "Operação realizada com sucesso!") {
    if (!toastSucesso) return;
    const spanText = toastSucesso.querySelector('span');
    if (spanText) spanText.textContent = mensagem;

    if (toastTimeout) clearTimeout(toastTimeout);

    toastSucesso.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastSucesso.classList.add('opacity-100', 'translate-y-0');

    toastTimeout = setTimeout(() => {
      toastSucesso.classList.remove('opacity-100', 'translate-y-0');
      toastSucesso.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    }, 3000);
  }

  function atualizarEstatisticasGlobais() {
    const cardsRacaoAtuais = document.querySelectorAll('.container-racoes > div');
    
    let totalSacos = 0;
    let totalKg = 0;
    let totalEstoqueBaixo = 0;
    const marcasUnicas = new Set();

    cardsRacaoAtuais.forEach(card => {
      const textQuantidade = card.querySelector('span.px-3');
      const qtd = parseInt(textQuantidade.textContent) || 0;

      const marcaNome = card.querySelector('h3')?.textContent.trim().toLowerCase();
      if (marcaNome) {
        marcasUnicas.add(marcaNome);
      }

      const spansNegrito = card.querySelectorAll('span.font-bold');
      let pesoUnitario = 0;
      spansNegrito.forEach(span => {
        const texto = span.textContent.toLowerCase();
        if (texto.includes('kg') && pesoUnitario === 0) {
          pesoUnitario = parseFloat(texto.replace('kg', '').trim()) || 0;
        }
      });

      totalSacos += qtd;
      totalKg += (qtd * pesoUnitario);

      if (qtd <= 3) {
        totalEstoqueBaixo++;
      }
    });

    const totalTipos = cardsRacaoAtuais.length;

    if (statTotalSacos) statTotalSacos.textContent = totalSacos;
    if (statTotalKg) statTotalKg.innerHTML = `${totalKg} <span class="text-sm font-normal text-[#6B7280]">kg</span>`;
    if (statEstoqueBaixo) statEstoqueBaixo.textContent = totalEstoqueBaixo;
    
    if (statTiposCadastrados) {
      statTiposCadastrados.textContent = `${totalTipos} ${totalTipos === 1 ? 'tipo cadastrado' : 'tipos cadastrados'}`;
    }
    if (statTotalMarcas) {
      statTotalMarcas.textContent = marcasUnicas.size;
    }
  }

  // FUNCIONALIDADE DA BARRA DE BUSCA
  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
      const termoBusca = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.container-racoes > div');

      cards.forEach(card => {
        const marca = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const tipo = card.querySelector('p')?.textContent.toLowerCase() || '';

        // Se o termo pesquisado bater com a marca ou com o tipo/fase
        if (marca.includes(termoBusca) || tipo.includes(termoBusca)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  }

  // CONTROLE MODAL ADICIONAR
  function abrirModalAdicionar() {
    if (formAdicionar) formAdicionar.reset();
    if (modalAdicionar && modalContentAdicionar) {
      modalAdicionar.classList.remove('hidden');
      setTimeout(() => {
        modalAdicionar.classList.remove('opacity-0');
        modalContentAdicionar.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalAdicionar() {
    if (modalAdicionar && modalContentAdicionar) {
      modalAdicionar.classList.add('opacity-0');
      modalContentAdicionar.classList.add('scale-95');
      setTimeout(() => {
        modalAdicionar.classList.add('hidden');
      }, 200);
    }
  }

  if (btnAdicionarRacao) btnAdicionarRacao.onclick = (e) => { e.preventDefault(); abrirModalAdicionar(); };
  if (btnFecharModalAdicionar) btnFecharModalAdicionar.onclick = (e) => { e.preventDefault(); fecharModalAdicionar(); };
  if (btnCancelarAdicionar) btnCancelarAdicionar.onclick = (e) => { e.preventDefault(); fecharModalAdicionar(); };

  if (formAdicionar) {
    formAdicionar.onsubmit = (e) => {
      e.preventDefault();

      const marca = document.getElementById('add-marca').value;
      const tipo = document.getElementById('add-tipo').value;
      const peso = parseFloat(document.getElementById('add-peso').value) || 0;
      const qtd = parseInt(document.getElementById('add-qtd').value) || 0;
      const dataRaw = document.getElementById('add-data').value;

      let dataFmt = '20/06/2025';
      if (dataRaw) {
        const [ano, mes, dia] = dataRaw.split('-');
        dataFmt = `${dia}/${mes}/${ano}`;
      }

      const novoCard = document.createElement('div');
      novoCard.className = 'bg-white border border-[#EFECE6] rounded-2xl p-5 shadow-sm flex flex-col justify-between group';
      
      novoCard.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-verdeokbg flex items-center justify-center text-verdeok">
                <i class="ri-goblet-line text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-sm text-[#111827]">${marca}</h3>
                <p class="text-[11px] text-[#6B7280]">${tipo}</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"></span>
          </div>

          <div class="grid grid-cols-2 gap-y-3 gap-x-4 border-b border-[#FAFAF9] pb-4 mb-4 text-xs">
            <div>
              <span class="text-[11px] text-[#6B7280] block">Peso do saco</span>
              <span class="font-bold text-[#111827]">${peso} kg</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Compra</span>
              <span class="font-bold text-[#111827]">${dataFmt}</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Total em estoque</span>
              <span class="font-bold text-[#111827]">${qtd * peso} kg</span>
            </div>
            <div>
              <span class="text-[11px] text-[#6B7280] block">Data compra</span>
              <span class="font-bold text-[#111827]">${dataFmt}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs mt-4 pt-3 border-t border-[#FAFAF9]">
          <div class="flex items-center gap-2">
            <span class="text-[#6B7280]">Unidades:</span>
            <div class="flex items-center bg-[#FAFAF9] border border-[#EFECE6] rounded-lg p-0.5">
              <button class="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold">-</button>
              <span class="px-3 font-bold text-[#111827]">${qtd}</span>
              <button class="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold">+</button>
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

      if (containerRacoes) containerRacoes.appendChild(novoCard);

      inicializarCard(novoCard);
      atualizarBadgeStatus(novoCard, qtd);
      atualizarEstatisticasGlobais();
      fecharModalAdicionar();
      mostrarToast("Ração adicionada ao estoque!");
    };
  }

  // CONTROLE DO MODAL DE EXCLUSÃO
  function abrirModalExcluir(card) {
    cardParaExcluir = card;
    if (modalExcluir && modalContentExcluir) {
      modalExcluir.classList.remove('hidden');
      setTimeout(() => {
        modalExcluir.classList.remove('opacity-0');
        modalContentExcluir.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalExcluir() {
    if (modalExcluir && modalContentExcluir) {
      modalExcluir.classList.add('opacity-0');
      modalContentExcluir.classList.add('scale-95');
      setTimeout(() => {
        modalExcluir.classList.add('hidden');
        cardParaExcluir = null; 
      }, 200);
    }
  }

  if (btnCancelarModal) btnCancelarModal.onclick = (e) => { e.preventDefault(); fecharModalExcluir(); };

  if (btnConfirmarModal) {
    btnConfirmarModal.onclick = (e) => {
      e.preventDefault();
      if (cardParaExcluir) {
        const cardAlvo = cardParaExcluir;
        cardAlvo.style.transition = 'all 0.3s ease';
        cardAlvo.style.opacity = '0';
        cardAlvo.style.transform = 'scale(0.9)';
        fecharModalExcluir();

        setTimeout(() => {
          cardAlvo.remove(); 
          atualizarEstatisticasGlobais();
          mostrarToast("Ração removida do estoque.");
        }, 300);
      }
    };
  }

  // CONTROLE DO MODAL DE EDIÇÃO
  function abrirModalEditar(card) {
    cardParaEditar = card;

    const marca = card.querySelector('h3')?.textContent.trim() || '';
    const tipo = card.querySelector('p')?.textContent.trim() || '';
    const textQuantidade = card.querySelector('span.px-3')?.textContent.trim() || '0';

    let pesoVal = '';
    let dataVal = '';

    const divsGrid = card.querySelectorAll('.grid > div');
    divsGrid.forEach(div => {
      const label = div.querySelector('span:not(.font-bold)')?.textContent.toLowerCase() || '';
      const valor = div.querySelector('span.font-bold')?.textContent.trim() || '';

      if (label.includes('peso do saco')) {
        pesoVal = valor.replace('kg', '').trim();
      }
      if (label.includes('data compra') || label.includes('compra')) {
        const partes = valor.split('/');
        if (partes.length === 3) {
          dataVal = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        }
      }
    });

    if (document.getElementById('edit-marca')) document.getElementById('edit-marca').value = marca;
    if (document.getElementById('edit-tipo')) document.getElementById('edit-tipo').value = tipo;
    if (document.getElementById('edit-peso')) document.getElementById('edit-peso').value = pesoVal;
    if (document.getElementById('edit-qtd')) document.getElementById('edit-qtd').value = textQuantidade;
    if (document.getElementById('edit-data')) document.getElementById('edit-data').value = dataVal;
    if (document.getElementById('edit-obs')) document.getElementById('edit-obs').value = '';

    if (modalEditar && modalContentEditar) {
      modalEditar.classList.remove('hidden');
      setTimeout(() => {
        modalEditar.classList.remove('opacity-0');
        modalContentEditar.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModalEditar() {
    if (modalEditar && modalContentEditar) {
      modalEditar.classList.add('opacity-0');
      modalContentEditar.classList.add('scale-95');
      setTimeout(() => {
        modalEditar.classList.add('hidden');
        cardParaEditar = null;
      }, 200);
    }
  }

  if (btnFecharModalEditar) btnFecharModalEditar.onclick = (e) => { e.preventDefault(); fecharModalEditar(); };
  if (btnCancelarEditar) btnCancelarEditar.onclick = (e) => { e.preventDefault(); fecharModalEditar(); };

  if (formEditar) {
    formEditar.onsubmit = (e) => {
      e.preventDefault();

      if (cardParaEditar) {
        const novaMarca = document.getElementById('edit-marca').value;
        const novoTipo = document.getElementById('edit-tipo').value;
        const novoPeso = parseFloat(document.getElementById('edit-peso').value) || 0;
        const novaQtd = parseInt(document.getElementById('edit-qtd').value) || 0;
        const novaDataRaw = document.getElementById('edit-data').value;

        let novaDataFmt = '20/06/2025';
        if (novaDataRaw) {
          const [ano, mes, dia] = novaDataRaw.split('-');
          novaDataFmt = `${dia}/${mes}/${ano}`;
        }

        const titleEl = cardParaEditar.querySelector('h3');
        const descEl = cardParaEditar.querySelector('p');
        const qtdEl = cardParaEditar.querySelector('span.px-3');

        if (titleEl) titleEl.textContent = novaMarca;
        if (descEl) descEl.textContent = novoTipo;
        if (qtdEl) qtdEl.textContent = novaQtd;

        const divsGrid = cardParaEditar.querySelectorAll('.grid > div');
        divsGrid.forEach(div => {
          const label = div.querySelector('span:not(.font-bold)')?.textContent.toLowerCase() || '';
          const valorEl = div.querySelector('span.font-bold');

          if (valorEl) {
            if (label.includes('peso do saco')) valorEl.textContent = `${novoPeso} kg`;
            if (label.includes('total em estoque')) valorEl.textContent = `${novaQtd * novoPeso} kg`;
            if (label.includes('compra')) valorEl.textContent = novaDataFmt;
          }
        });

        atualizarBadgeStatus(cardParaEditar, novaQtd);
        atualizarEstatisticasGlobais();
        fecharModalEditar();
        mostrarToast("Ração atualizada com sucesso!");
      }
    };
  }

  // Fechar modais ao clicar no fundo escuro
  if (modalExcluir) modalExcluir.onclick = (e) => { if (e.target === modalExcluir) fecharModalExcluir(); };
  if (modalEditar) modalEditar.onclick = (e) => { if (e.target === modalEditar) fecharModalEditar(); };
  if (modalAdicionar) modalAdicionar.onclick = (e) => { if (e.target === modalAdicionar) fecharModalAdicionar(); };

  function inicializarCard(card) {
    const btnMenos = card.querySelector('.flex.items-center.bg-\\[\\#FAFAF9\\] button:nth-child(1)');
    const btnMais = card.querySelector('.flex.items-center.bg-\\[\\#FAFAF9\\] button:nth-child(3)');
    const textQuantidade = card.querySelector('span.px-3');
    
    const btnEditar = card.querySelector('.btn-editar');
    const btnExcluir = card.querySelector('.btn-excluir');
    
    const spansNegrito = card.querySelectorAll('span.font-bold');
    let textTotalEstoque = null;
    let pesoUnitario = 0;

    spansNegrito.forEach(span => {
      const texto = span.textContent.toLowerCase();
      if (texto.includes('kg') && pesoUnitario === 0) {
        pesoUnitario = parseFloat(texto.replace('kg', '').trim()) || 0;
      }
    });

    const divsTexto = card.querySelectorAll('div.grid > div');
    divsTexto.forEach(div => {
      const label = div.querySelector('span:not(.font-bold)');
      if (label && label.textContent.toLowerCase().includes('total em estoque')) {
        textTotalEstoque = div.querySelector('span.font-bold');
      }
    });

    if (btnMenos && btnMais && textQuantidade) {
      btnMenos.onclick = (e) => {
        e.preventDefault();
        let qtd = parseInt(textQuantidade.textContent) || 0;
        if (qtd > 0) {
          qtd--;
          textQuantidade.textContent = qtd;
          if (textTotalEstoque && pesoUnitario > 0) {
            textTotalEstoque.textContent = `${qtd * pesoUnitario} kg`;
          }
          atualizarBadgeStatus(card, qtd);
          atualizarEstatisticasGlobais();
        }
      };

      btnMais.onclick = (e) => {
        e.preventDefault();
        let qtd = parseInt(textQuantidade.textContent) || 0;
        qtd++;
        textQuantidade.textContent = qtd;
        if (textTotalEstoque && pesoUnitario > 0) {
          textTotalEstoque.textContent = `${qtd * pesoUnitario} kg`;
        }
        atualizarBadgeStatus(card, qtd);
        atualizarEstatisticasGlobais();
      };
    }

    if (btnEditar) {
      btnEditar.onclick = (e) => {
        e.preventDefault();
        abrirModalEditar(card);
      };
    }

    if (btnExcluir) {
      btnExcluir.onclick = (e) => {
        e.preventDefault();
        abrirModalExcluir(card);
      };
    }
  }

  const cardsIniciais = document.querySelectorAll('.container-racoes > div');
  cardsIniciais.forEach(card => inicializarCard(card));

  atualizarEstatisticasGlobais();
});

function atualizarBadgeStatus(card, quantidade) {
  const badge = card.querySelector('.flex.justify-between.items-start span') || card.querySelector('.flex.justify-between.items-center span');
  const textQuantidade = card.querySelector('span.px-3');
  if (!badge || !textQuantidade) return;

  if (quantidade === 0) {
    badge.textContent = 'Esgotado';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#EF4444]'; 
    textQuantidade.className = 'px-3 font-bold text-[#B45309]'; 
  } else if (quantidade <= 3) {
    badge.textContent = 'Baixo';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]'; 
    textQuantidade.className = 'px-3 font-bold text-[#B45309]';
  } else {
    badge.textContent = 'OK';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#10B981]'; 
    textQuantidade.className = 'px-3 font-bold text-[#111827]';
  }
}