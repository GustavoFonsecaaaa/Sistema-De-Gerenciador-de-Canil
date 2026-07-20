document.addEventListener('DOMContentLoaded', () => {
  console.log("Script racoes.js carregado com sucesso!");

  // Seleciona todos os cards dentro do container principal de rações
  const cardsRacao = document.querySelectorAll('main .grid > div');

  if (cardsRacao.length === 0) {
    console.warn("Nenhum card de ração foi encontrado na tela. Verifique as classes do HTML.");
  }

  cardsRacao.forEach((card, index) => {
    // Encontra os botões de + e - e o texto da quantidade dentro deste card
    const botoes = card.querySelectorAll('button');
    const btnMenos = botoes[0];
    const btnMais = botoes[1];
    const textQuantidade = card.querySelector('span.px-3');
    
    // Tenta capturar o peso unitário buscando o elemento em negrito que contenha "kg"
    const spansNegrito = card.querySelectorAll('span.font-bold');
    let textTotalEstoque = null;
    let pesoUnitario = 0;

    spansNegrito.forEach(span => {
      const texto = span.textContent.toLowerCase();
      // O peso do saco geralmente é o primeiro elemento com 'kg'
      if (texto.includes('kg') && pesoUnitario === 0) {
        pesoUnitario = parseFloat(texto.replace('kg', '').trim()) || 0;
      }
      // O total em estoque é o que fica logo abaixo ou ao lado
      // Vamos tentar mapear pelo texto do elemento pai ou posição
    });

    // Mapeamento mais certeiro do total em estoque baseado na estrutura padrão
    const divsTexto = card.querySelectorAll('div.grid > div');
    divsTexto.forEach(div => {
      const label = div.querySelector('span:not(.font-bold)');
      if (label && label.textContent.toLowerCase().includes('total em estoque')) {
        textTotalEstoque = div.querySelector('span.font-bold');
      }
    });

    console.log(`Card ${index + 1}: Peso Unitário extraído = ${pesoUnitario}kg`);

    if (btnMenos && btnMais && textQuantidade) {
      
      // Evento do botão de Menos (-)
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
        }
      };

      // Evento do botão de Mais (+)
      btnMais.onclick = (e) => {
        e.preventDefault();
        let qtd = parseInt(textQuantidade.textContent) || 0;
        qtd++;
        textQuantidade.textContent = qtd;
        
        if (textTotalEstoque && pesoUnitario > 0) {
          textTotalEstoque.textContent = `${qtd * pesoUnitario} kg`;
        }
        
        atualizarBadgeStatus(card, qtd);
      };
    }
  });
});

// Função para mudar a tag de status e cores dinamicamente
function atualizarBadgeStatus(card, quantidade) {
  const badge = card.querySelector('.flex.justify-between.items-start span') || card.querySelector('.flex.justify-between.items-center span');
  const textQuantidade = card.querySelector('span.px-3');
  if (!badge || !textQuantidade) return;

  if (quantidade === 0) {
    // Estado: ESGOTADO (Quantidade é 0)
    badge.textContent = 'Esgotado';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#EF4444]'; 
    textQuantidade.className = 'px-3 font-bold text-[#B45309]'; 
    
  } else if (quantidade <= 3) {
    // Estado: BAIXO (Quantidade é 3, 2 ou 1)
    badge.textContent = 'Baixo';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]'; 
    textQuantidade.className = 'px-3 font-bold text-[#B45309]';
    
  } else {
    // Estado: OK (Quantidade é 4 ou mais)
    badge.textContent = 'OK';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#10B981]'; 
    textQuantidade.className = 'px-3 font-bold text-[#111827]';
  }
}