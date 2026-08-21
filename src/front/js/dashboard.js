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

  // ------------------------------------------------------------------
  // CARREGA OS KPIs DE CACHORROS A PARTIR DA API (com autenticação JWT)
  // ------------------------------------------------------------------
  async function carregarResumoCachorros() {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const resposta = await fetch('/api/cachorros', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      const cachorros = await resposta.json();

      const total   = cachorros.length;
      const machos  = cachorros.filter(c => c.sexo === 'Macho').length;
      const femeas  = cachorros.filter(c => c.sexo === 'Femea').length;
      const filhotes = cachorros.filter(c => c.fase === 'Filhote').length;

      const kpiTotal    = document.getElementById('kpi-total-caes');
      const kpiMachos   = document.getElementById('kpi-machos');
      const kpiFemeas   = document.getElementById('kpi-femeas');
      const kpiFilhotes = document.getElementById('kpi-filhotes');

      if (kpiTotal)    kpiTotal.textContent    = total;
      if (kpiMachos)   kpiMachos.textContent   = machos;
      if (kpiFemeas)   kpiFemeas.textContent   = femeas;
      if (kpiFilhotes) kpiFilhotes.textContent = filhotes;

      // Renderiza o painel "Cães Recentes" com os dados da API
      renderizarCaesRecentes(cachorros);

    } catch (erro) {
      console.error('Erro ao carregar resumo de cachorros:', erro);
    }
  }

  // ------------------------------------------------------------------
  // RENDERIZA O PAINEL "CÃES RECENTES" COM OS DADOS DA API
  // ------------------------------------------------------------------
  function renderizarCaesRecentes(cachorros) {
    const containerRecentes = document.getElementById('container-caes-recentes');
    if (!containerRecentes) return;

    containerRecentes.innerHTML = '';

    const recentes = cachorros.slice(-5).reverse();

    if (recentes.length === 0) {
      containerRecentes.innerHTML = `
        <div class="text-center py-8 text-xs text-[#6B7280]">
          Nenhum cão cadastrado ainda.
        </div>
      `;
      return;
    }

    recentes.forEach(cao => {
      const bgSexo = cao.sexo === 'Macho' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FCE7F3] text-[#EC4899]';

      const itemCard = document.createElement('div');
      itemCard.className = "flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] hover:border-laranja cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm";

      const fotoHtml = cao.foto
        ? `<img src="${cao.foto}" alt="${cao.nome}" class="w-full h-full object-cover">`
        : `<span class="text-[#D97706] font-bold text-sm">${cao.nome.charAt(0)}</span>`;

      itemCard.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-bege flex-shrink-0 flex items-center justify-center">
            ${fotoHtml}
          </div>
          <div>
            <div class="font-bold text-xs text-[#111827]">${cao.nome}</div>
            <div class="text-[11px] text-[#6B7280]">${cao.raca}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bgSexo}">${cao.sexo}</span>
        </div>
      `;

      itemCard.onclick = () => {
        window.location.href = 'cachorros.html';
      };

      containerRecentes.appendChild(itemCard);
    });
  }

  // ------------------------------------------------------------------
  // RENDERIZA "ÚLTIMOS CIOS REGISTRADOS" — busca da API
  // ------------------------------------------------------------------
  async function carregarCiosDashboard() {
    const containerCios = document.getElementById('container-cios-dashboard');
    if (!containerCios) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const resposta = await fetch('/api/cios', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!resposta.ok) return;

      const cios = await resposta.json();

      containerCios.innerHTML = '';

      if (cios.length === 0) {
        containerCios.innerHTML = `
          <div class="text-center py-10 text-xs text-[#6B7280]">
            <div class="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EFECE6] flex items-center justify-center text-[#1C1105]/30 text-lg mx-auto mb-2">
              <i class="ri-heart-pulse-line"></i>
            </div>
            Nenhum cio registrado até o momento.
          </div>
        `;
        return;
      }

      // Exibe os 4 cios mais recentes
      cios.slice(0, 4).forEach(cio => {
        const dataInicio = cio.data_inicio ? cio.data_inicio.split('T')[0].split('-').reverse().join('/') : '';
        const dataFim    = cio.data_fim    ? cio.data_fim.split('T')[0].split('-').reverse().join('/') : '';

        const badgeCruzou = cio.cruzou
          ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">Cruzou</span>`
          : '';

        const itemCio = document.createElement('div');
        itemCio.className = "flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6]";
        itemCio.innerHTML = `
          <div class="flex items-center gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-laranja">
              <i class="ri-calendar-event-line text-base"></i>
            </div>
            <div>
              <div class="font-bold text-xs text-[#111827]">${cio.cachorro_nome}</div>
              <div class="text-[11px] text-[#6B7280] mt-0.5">${dataInicio} — ${dataFim}</div>
            </div>
          </div>
          ${badgeCruzou}
        `;
        containerCios.appendChild(itemCio);
      });

    } catch (erro) {
      console.error('Erro ao carregar cios do dashboard:', erro);
    }
  }

  // ------------------------------------------------------------------
  // INICIALIZAÇÃO
  // ------------------------------------------------------------------
  carregarResumoCachorros();
  carregarCiosDashboard();
});