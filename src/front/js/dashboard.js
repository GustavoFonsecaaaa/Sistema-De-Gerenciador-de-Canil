document.addEventListener('DOMContentLoaded', () => {
  console.log("Script dashboard.js carregado com sucesso!");

  // Atualiza a data por extenso no cabeçalho
  const elDataHoje = document.getElementById('dash-data-hoje');
  if (elDataHoje) {
    const hoje = new Date();
    const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
    const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
    elDataHoje.textContent = `Visão geral do seu canil — ${dataFormatada}`;
  }

  // Carrega e sincroniza os cães do localStorage
  function carregarDadosDashboard() {
    const caesSalvos = JSON.parse(localStorage.getItem('canil_cachorros')) || [];

    const kpiTotal = document.getElementById('kpi-total-caes');
    const kpiMachos = document.getElementById('kpi-machos');
    const kpiFemeas = document.getElementById('kpi-femeas');
    const kpiFilhotes = document.getElementById('kpi-filhotes');
    const containerRecentes = document.getElementById('container-caes-recentes');

    let listaCaes = caesSalvos;

    // Calcula KPIs
    let machos = 0;
    let femeas = 0;
    let filhotes = 0;

    listaCaes.forEach(c => {
      if (c.sexo === 'Macho') machos++;
      if (c.sexo === 'Fêmea') femeas++;
      if (c.fase === 'Filhote') filhotes++;
    });

    if (kpiTotal) kpiTotal.textContent = listaCaes.length;
    if (kpiMachos) kpiMachos.textContent = machos;
    if (kpiFemeas) kpiFemeas.textContent = femeas;
    if (kpiFilhotes) kpiFilhotes.textContent = filhotes;

    // Renderiza até 5 Cães Recentes
    if (containerRecentes) {
      containerRecentes.innerHTML = '';

      const recentes = listaCaes.slice(-5).reverse();

      recentes.forEach(cao => {
        const bgSexo = cao.sexo === 'Macho' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FCE7F3] text-[#EC4899]';

        const itemCard = document.createElement('div');
        itemCard.className = "flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] hover:border-laranja cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm";
        
        itemCard.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-bege flex-shrink-0">
              <img src="${cao.foto}" alt="${cao.nome}" class="w-full h-full object-cover">
            </div>
            <div>
              <div class="font-bold text-xs text-[#111827]">${cao.nome}</div>
              <div class="text-[11px] text-[#6B7280]">${cao.raca}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${cao.sexo}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">${cao.fase}</span>
          </div>
        `;

        // Evento de clique para direcionar para os Detalhes do Cão
        itemCard.onclick = () => {
          localStorage.setItem('cao_selecionado_para_detalhes', cao.nome);
          window.location.href = 'cachorros.html';
        };

        containerRecentes.appendChild(itemCard);
      });
    }
  }

  carregarDadosDashboard();
});