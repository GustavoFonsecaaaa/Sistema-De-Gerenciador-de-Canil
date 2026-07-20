document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com sucesso!");

  // Captura apenas os cards que estão dentro do grid de rações
  const cardsRacao = document.querySelectorAll('.container-racoes > div');

  // Elementos do painel superior
  const statTotalSacos = document.getElementById('stat-total-sacos');
  const statTotalKg = document.getElementById('stat-total-kg');
  const statEstoqueBaixo = document.getElementById('stat-estoque-baixo');

  // Função principal para recalcular os cards de estatísticas superiores
  function atualizarEstatisticasGlobais() {
    let totalSacos = 0;
    let totalKg = 0;
    let totalEstoqueBaixo = 0;

    cardsRacao.forEach(card => {
      // Pega a quantidade atual do card
      const textQuantidade = card.querySelector('span.px-3');
      const qtd = parseInt(textQuantidade.textContent) || 0;

      // Pega o peso unitário do saco
      const spansNegrito = card.querySelectorAll('span.font-bold');
      let pesoUnitario = 0;
      spansNegrito.forEach(span => {
        const texto = span.textContent.toLowerCase();
        if (texto.includes('kg') && pesoUnitario === 0) {
          pesoUnitario = parseFloat(texto.replace('kg', '').trim()) || 0;
        }
      });

      // Soma para as estatísticas globais
      totalSacos += qtd;
      totalKg += (qtd * pesoUnitario);

      // Se for entre 0 e 3 unidades, conta como estoque baixo
      if (qtd <= 3) {
        totalEstoqueBaixo++;
      }
    });

    // Injeta os valores calculados de volta no painel superior do HTML
    if (statTotalSacos) statTotalSacos.textContent = totalSacos;
    if (statTotalKg) statTotalKg.innerHTML = `${totalKg} <span class="text-sm font-normal text-[#6B7280]">kg</span>`;
    if (statEstoqueBaixo) statEstoqueBaixo.textContent = totalEstoqueBaixo;
  }

  // Configuração inicial dos botões dos cards
  cardsRacao.forEach((card) => {
    const botoes = card.querySelectorAll('button');
    const btnMenos = botoes[0];
    const btnMais = botoes[1];
    const textQuantidade = card.querySelector('span.px-3');
    
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
  });

  // Executa uma vez na inicialização para sincronizar os dados
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