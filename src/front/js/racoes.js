document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com sucesso!");

  // Elementos do painel superior
  const statTotalSacos = document.getElementById('stat-total-sacos');
  const statTotalKg = document.getElementById('stat-total-kg');
  const statEstoqueBaixo = document.getElementById('stat-estoque-baixo');

  // Elementos do Modal Customizado
  const modalExcluir = document.getElementById('modal-excluir');
  const modalContent = modalExcluir ? modalExcluir.querySelector('.transform') : null;
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');
  const btnConfirmarModal = document.getElementById('btn-confirmar-modal');

  // Elemento do Toast de Notificação
  const toastSucesso = document.getElementById('toast-sucesso');
  
  let cardParaExcluir = null;
  let toastTimeout = null;

  // Função para exibir a mensagem Toast de sucesso
  function mostrarToast() {
    if (!toastSucesso) return;

    // Se já houver um temporizador rodando, limpa antes de reiniciar
    if (toastTimeout) clearTimeout(toastTimeout);

    // Exibe o toast animando a entrada
    toastSucesso.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
    toastSucesso.classList.add('opacity-100', 'translate-y-0');

    // Esconde o toast após 3 segundos
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

    cardsRacaoAtuais.forEach(card => {
      const textQuantidade = card.querySelector('span.px-3');
      const qtd = parseInt(textQuantidade.textContent) || 0;

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

    if (statTotalSacos) statTotalSacos.textContent = totalSacos;
    if (statTotalKg) statTotalKg.innerHTML = `${totalKg} <span class="text-sm font-normal text-[#6B7280]">kg</span>`;
    if (statEstoqueBaixo) statEstoqueBaixo.textContent = totalEstoqueBaixo;
  }

  function abrirModal(card) {
    cardParaExcluir = card;
    if (modalExcluir && modalContent) {
      modalExcluir.classList.remove('hidden');
      setTimeout(() => {
        modalExcluir.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
      }, 10);
    }
  }

  function fecharModal() {
    if (modalExcluir && modalContent) {
      modalExcluir.classList.add('opacity-0');
      modalContent.classList.add('scale-95');
      setTimeout(() => {
        modalExcluir.classList.add('hidden');
        cardParaExcluir = null; 
      }, 200);
    }
  }

  if (btnCancelarModal) {
    btnCancelarModal.onclick = (e) => {
      e.preventDefault();
      fecharModal();
    };
  }

  if (btnConfirmarModal) {
    btnConfirmarModal.onclick = (e) => {
      e.preventDefault();
      if (cardParaExcluir) {
        const cardAlvo = cardParaExcluir;
        
        cardAlvo.style.transition = 'all 0.3s ease';
        cardAlvo.style.opacity = '0';
        cardAlvo.style.transform = 'scale(0.9)';
        
        fecharModal();

        setTimeout(() => {
          cardAlvo.remove(); 
          atualizarEstatisticasGlobais();
          mostrarToast(); // <--- Notificação ativada no momento exato da remoção!
        }, 300);
      }
    };
  }

  if (modalExcluir) {
    modalExcluir.onclick = (e) => {
      if (e.target === modalExcluir) {
        fecharModal();
      }
    };
  }

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
        alert('Funcionalidade de editar será conectada à API em breve!');
      };
    }

    if (btnExcluir) {
      btnExcluir.onclick = (e) => {
        e.preventDefault();
        abrirModal(card);
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