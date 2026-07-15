# 🐶 CanilManager — Gestão de Canil

> Sistema moderno e intuitivo para controle e gestão completa de canis, cobrindo desde o cadastro dos cães e acompanhamento de saúde até o controle de estoque de rações e monitoramento de ciclos reprodutivos.

---

## 🎨 Design do Projeto

O visual do **CanilManager** foi totalmente planejado utilizando a ferramenta **Readdy**, priorizando uma experiência de usuário (UX) limpa, profissional e acolhedora, com uma paleta de cores voltada para tons terrosos, creme e detalhes funcionais.

O projeto conta com:
- **Dashboard Geral:** Métricas em tempo real (total de cães, machos, fêmeas e filhotes), monitoramento de últimos cios e cães recentes.
- **Gestão de Cães:** Painel interativo com listagem por cards, filtros rápidos por idade/gênero e sistema de busca.
- **Controle de Vacinas:** Prontuário médico digital para acompanhamento de imunizações.
- **Controle de Rações:** Gestão eficiente do estoque de alimentos.

---

## 🛠️ Tecnologias Utilizadas

O projeto está sendo desenvolvido utilizando uma arquitetura com separação clara de responsabilidades (front-end, back-end e banco de dados):

### Front-end
- **HTML5** & **CSS3** (Layout baseado em CSS Grid e Flexbox)
- **JavaScript (ES6+)** para manipulação dinâmica do DOM
- **Lucide Icons** para a biblioteca de ícones vetoriais
- **Fontes Google:** *Playfair Display* (títulos) e *Plus Jakarta Sans* (textos)

### Back-end
- **Node.js** com **Express**
- **CORS** & **Dotenv** (Gerenciamento seguro de variáveis de ambiente)
- **Nodemon** (Ambiente de desenvolvimento rápido)

### Banco de Dados
- **MySQL** (Conexão via pool de conexões assíncronas com a biblioteca `mysql2`)

---

## 📁 Estrutura de Pastas

```text
Projeto Gerenciador de Canil/
├── src/
│   ├── back/          # Servidor Express, rotas, controllers e banco
│   │   ├── config/    # Configurações de conexão (db.js)
│   │   └── server.js  # Inicialização do servidor
│   ├── db/            # Scripts e modelagem do banco de dados (MySQL)
│   └── front/         # Interface web do usuário (HTML, CSS, JS)
│       ├── css/       # Folhas de estilo (style.css)
│       ├── assets/    # Imagens e mídias do projeto
│       └── dashboard.html
├── .env               # Variáveis de ambiente locais (ignorado no Git)
├── .gitignore         # Regras de exclusão do Git
├── package.json       # Gerenciador de dependências do Node
└── README.md          # Documentação do projeto