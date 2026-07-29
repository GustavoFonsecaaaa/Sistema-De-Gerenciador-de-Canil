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

  // Carrega e sincroniza os cães e cios do localStorage
  function carregarDadosDashboard() {
    const caesSalvos = JSON.parse(localStorage.getItem('canil_cachorros')) || [];
    const ciosSalvos = JSON.parse(localStorage.getItem('canil_cios')) || [];

    // KPIs
    const kpiTotal = document.getElementById('kpi-total-caes');
    const kpiMachos = document.getElementById('kpi-machos');
    const kpiFemeas = document.getElementById('kpi-femeas');
    const kpiFilhotes = document.getElementById('kpi-filhotes');

    // Containers
    const containerRecentes = document.getElementById('container-caes-recentes');
    const containerCios = document.getElementById('container-cios-dashboard');

    let machos = 0;
    let femeas = 0;
    let filhotes = 0;

    caesSalvos.forEach(c => {
      if (c.sexo === 'Macho') machos++;
      if (c.sexo === 'Fêmea') femeas++;
      if (c.fase === 'Filhote') filhotes++;
    });

    if (kpiTotal) kpiTotal.textContent = caesSalvos.length;
    if (kpiMachos) kpiMachos.textContent = machos;
    if (kpiFemeas) kpiFemeas.textContent = femeas;
    if (kpiFilhotes) kpiFilhotes.textContent = filhotes;

    // 1. RENDERIZA ÚLTIMOS CIOS REGISTRADOS
    if (containerCios) {
      containerCios.innerHTML = '';

      if (ciosSalvos.length === 0) {
        containerCios.innerHTML = `
          <div class="text-center py-10 text-xs text-[#6B7280]">
            <div class="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EFECE6] flex items-center justify-center text-[#1C1105]/30 text-lg mx-auto mb-2">
              <i class="ri-heart-pulse-line"></i>
            </div>
            Nenhum cio registrado até o momento.
          </div>
        `;
      } else {
        // Exibe os últimos 4 cios registrados
        const ciosRecentes = ciosSalvos.slice(0, 4);

        ciosRecentes.forEach(cio => {
          const itemCio = document.createElement('div');
          itemCio.className = "flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6]";

          const badgeCruzou = cio.houveCruzamento 
            ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">Cruzou</span>` 
            : '';

          itemCio.innerHTML = `
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-laranja">
                <i class="ri-calendar-event-line text-base"></i>
              </div>
              <div>
                <div class="font-bold text-xs text-[#111827]">${cio.caoNome}</div>
                <div class="text-[11px] text-[#6B7280] mt-0.5">${cio.dataInicio} — ${cio.dataFim}</div>
              </div>
            </div>
            ${badgeCruzou}
          `;

          containerCios.appendChild(itemCio);
        });
      }
    }

    // 2. RENDERIZA CÃES RECENTES
    if (containerRecentes) {
      containerRecentes.innerHTML = '';
      const recentes = caesSalvos.slice(-5).reverse();

      if (recentes.length === 0) {
        containerRecentes.innerHTML = `
          <div class="text-center py-8 text-xs text-[#6B7280]">
            Nenhum cão cadastrado ainda.
          </div>
        `;
      } else {
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

          itemCard.onclick = () => {
            localStorage.setItem('cao_selecionado_para_detalhes', cao.nome);
            window.location.href = 'cachorros.html';
          };

          containerRecentes.appendChild(itemCard);
        });
      }
    }
  }

  carregarDadosDashboard();
});