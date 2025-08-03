Gravação Mobile: https://drive.google.com/file/d/1_bolRL5BG_oe76p1f9UsGKQMK92C5-Ya/view?usp=sharing
Gravação Web: https://drive.google.com/file/d/17o8u0_LAVY0iHoV9detl-o3272PZ0Z5F/view?usp=sharing

# Farms Native
Solução multiplataforma para gerenciamento de vendas, produções e estoque de uma fazenda, composta por um aplicativo web (Next.js) + aplicação remota (react.js) e um aplicativo móvel (React Native/Expo). 
O projeto utiliza backend serverless com Firebase para autenticação e persistência em tempo real.

Para executar o projeto é necessário ter PNPM instalado:
`npm install -g pnpm`

Instale as dependências:
`pnpm install`
Execute o comando dev para rodar todas as aplicações simultaneamente
`pnpm dev`

## Tecnologias

- React/Next.js (Web) e React Native (Mobile) com TypeScript
- Firebase Auth & Firestore para autenticação e dados
- Zustand para estado global e persistência local
- React Hook Form & Zod para formulários com validação
- Chart.js (web) e Google Charts (mobile) para dashboards
- Google Maps para exibir localizações de vendas
- Pacotes compartilhados: @farms/schemas, @farms/forms, @farms/state e @farms/firebase

## Funcionalidades

### Produtos
- Cadastro e edição de produtos (nome, categoria, preço de venda e custo)
- Cálculo de margem de lucro em % (margens exibidas com selos coloridos)
- Listagem de produtos com ordenação por margem e filtros por categoria/preço

### Vendas e Estoque
- Registro de vendas com quantidade, valor, cliente e coordenadas (lat/long)
- Controle de estoque com quantidade disponível e data da última atualização
- Listagens com ações de criar, editar e excluir

### Produções
- Controle de cultivos com status aguardando, em_producao ou colhido
- Formulário para registrar início, quantidade e data de colheita

### Dashboards
- Web: Gráficos de barras, linhas e pizza com dados de vendas e produções. Cards mostram vendas totais, lucro, ticket médio e distribuição de vendas. Mapa interativo exibe a localização de cada venda
- Mobile: Cards de resumo (receita, quantidade, lucro, valor de estoque), gráfico de colunas para top 5 produtos e mapa com marcadores

### Metas e Notificações ( Não implementado completamente )
- Definição de metas para vendas ou produções (produto, quantidade, período)
- Monitoramento em tempo real: quando a meta é atingida, cria-se uma notificação no Firestore
- Notificações exibidas via Alert no mobile e marcadas como lidas

### Autenticação
- Contexto AuthProvider mantém usuário logado e expõe métodos de login, cadastro e logout
- Páginas web protegidas por ProtectedRoute; APIs verificam o token de ID antes de acessar o Firestore

### Estrutura e padrões
- Arquitetura limpa: interfaces de domínio (ex.: ProductUseCase) e implementações (ProductUseCaseImpl) calculam margens e filtram produtos
- Injeção de dependência: repositórios Firebase são injetados nos casos de uso através de um contêiner DI, facilitando a troca de fonte de dados
- Pacotes reutilizáveis: schemas Zod compartilhados garantem validação consistente entre web e mobile

