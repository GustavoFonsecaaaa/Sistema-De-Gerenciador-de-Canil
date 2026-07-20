document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com sucesso!");

  // Elementos do painel superior
  const statTotalSacos = document.getElementById('stat-total-sacos');
  const statTotalKg = document.getElementById('stat-total-kg');
  const statEstoqueBaixo = document.getElementById('stat-estoque-baixo');

  // Função principal para recalcular os cards de estatísticas superiores
  function atualizarEstatisticasGlobais() {
    // Captura os cards atualizados que ainda restam na tela
    const cardsRacao = document.querySelectorAll('.container-racoes > div');
    
    let totalSacos = 0;
    let totalKg = 0;
    let totalEstoqueBaixo = 0;

    cardsRacao.forEach(card => {
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

  // Função isolada para configurar os eventos de um card específico
  function inicializarCard(card) {
    const botoes = card.querySelectorAll('button');
    // Os botões de + e - estão dentro da div do seletor de unidades
    const btnMenos = card.querySelector('.flex.items-center.bg-\\[\\#FAFAF9\\] button:nth-child(1)');
    const btnMais = card.querySelector('.flex.items-center.bg-\\[\\#FAFAF9\\] button:nth-child(3)');
    const textQuantidade = card.querySelector('span.px-3');
    
    // Botões de ação da direita
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

    // Eventos do seletor de quantidade
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

    // Ação do Botão Editar
    if (btnEditar) {
      btnEditar.onclick = (e) => {
        e.preventDefault();
        alert('Funcionalidade de abrir o formulário de edição será conectada à API em breve!');
      };
    }

    // Ação do Botão Excluir
    if (btnExcluir) {
      btnExcluir.onclick = (e) => {
        e.preventDefault();
        const nomeRacao = card.querySelector('h3').textContent;
        
        if (confirm(`Tem certeza que deseja remover a ração ${nomeRacao} do estoque?`)) {
          // Efeito suave de saída antes de remover
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            card.remove();
            atualizarEstatisticasGlobais(); // Recalcula tudo sem o card removido
          }, 300);
        }
      };
    }
  }

  // Inicializa todos os cards presentes no carregamento da página
  const cardsIniciais = document.querySelectorAll('.container-racoes > div');
  cardsIniciais.forEach(card => inicializarCard(card));

  // Sincroniza o painel superior no carregamento
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