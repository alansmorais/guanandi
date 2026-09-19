# Manual de Instalação e Configuração — Web App de Reservas (Google Apps Script + Google Sheets)

Este projeto foi desenvolvido sob medida para a **Cervejaria Guanandi**, utilizando:
* **Frontend:** HTML5 + CSS3 + JavaScript puro (mobile-first, moderno, sem frameworks pesados).
* **Backend:** Google Apps Script (`doGet`, `LockService`, templates `HtmlService`).
* **Banco de Dados:** Google Sheets (6 abas relacionais).

---

## 📁 Estrutura dos Arquivos Gerados

Copie e cole os seguintes arquivos dentro do seu editor no Google Apps Script:

### Arquivos de Script (.gs)
1. `Code.gs` — Roteamento da aplicação web (`doGet`) e renderizador de templates.
2. `Config.gs` — Gerenciamento de parâmetros da aba `CONFIG` e fretes das cidades do Litoral Norte.
3. `Database.gs` — Inicializador automático das abas e funções de persistência.
4. `Products.gs` — Consulta, atualização e catálogo de cervejas, barris, equipamentos e serviços.
5. `Reservations.gs` — Lógica de antecedência mínima (7 dias), cálculo oficial de preços no backend, trava anti-double booking com `LockService` e gravação de pedidos.
6. `Admin.gs` — Autenticação por senha, listagem de reservas, atualização de status e visualização de calendário anti-conflito.

### Arquivos HTML (.html)
1. `Index.html` — Interface de autoatendimento do cliente (fluxo em 8 etapas).
2. `Admin.html` — Painel administrativo com gestão de reservas, calendário e catálogo.
3. `Styles.html` — Folha de estilos CSS3 moderna, tema escuro cervejeiro com acentos âmbar e responsivo.
4. `Scripts.html` — Lógica de navegação entre etapas, auto-busca de CEP (ViaCEP) e chamadas RPC (`google.script.run`).

---

## 🚀 Passo a Passo para Implantação

### 1. Criar a Planilha Google
1. Acesse o [Google Sheets](https://sheets.new) e crie uma nova planilha vazia com o nome:  
   `Cervejaria Guanandi - Reservas & Eventos`.
2. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
3. O editor de código do Google Apps Script será aberto em uma nova aba.

### 2. Adicionar os Arquivos no Editor do Apps Script
1. Renomeie o arquivo padrão `Código.gs` para `Code.gs` e cole o conteúdo de `Code.gs`.
2. Clique no botão **+** (Adicionar arquivo) > **Script** para criar os demais arquivos `.gs`:
   - `Config.gs`
   - `Database.gs`
   - `Products.gs`
   - `Reservations.gs`
   - `Admin.gs`
3. Clique no botão **+** > **HTML** para criar os arquivos `.html`:
   - `Index.html`
   - `Admin.html`
   - `Styles.html`
   - `Scripts.html`

### 3. Inicializar o Banco de Dados Automaticamente
1. No menu de seleção de funções na barra superior do editor, escolha a função:  
   **`setupDatabase`**.
2. Clique em **Executar**.
3. Na primeira execução, o Google solicitará permissão para acessar a planilha. Clique em **Revisar permissões**, selecione sua conta Google e permita o acesso.
4. Ao concluir, volte para a aba da planilha Google: **todas as 6 abas (`CONFIG`, `PRODUTOS`, `RESERVAS`, `ITENS_RESERVA`, `CLIENTES`, `PAGAMENTOS`) estarão criadas e preenchidas com os produtos e valores de referência!**

### 4. Implantar como Aplicativo da Web
1. No canto superior direito do editor Apps Script, clique no botão azul **Implantar** > **Nova implantação**.
2. Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha **Aplicativo da Web**.
3. Preencha a configuração:
   - **Descrição:** `Versão 1.0 - Web App de Reservas`
   - **Executar como:** `Eu (seu-email@gmail.com)`
   - **Quem pode acessar:** `Qualquer pessoa` (permite que clientes façam reservas sem login obrigatório do Google).
4. Clique em **Implantar**.
5. Copie a **URL do aplicativo da web** gerada (ex: `https://script.google.com/macros/s/.../exec`).

---

## 🔗 Links de Acesso

* **Área do Cliente (Reservas):**  
  `https://script.google.com/macros/s/SEU_ID/exec`

* **Painel Administrativo:**  
  `https://script.google.com/macros/s/SEU_ID/exec?page=admin`  
  *(Senha padrão inicial: `admin123` — pode ser alterada diretamente na aba `CONFIG` da planilha).*

---

## 🛡️ Regras de Negócio Implementadas

1. **Antecedência Mínima (7 dias):**
   - O campo de data no cliente bloqueia dias anteriores aos 7 dias configurados.
   - O backend em `Reservations.gs` recusa qualquer solicitação que não respeite a antecedência mínima.

2. **Prevenção de Conflitos e Double-Booking:**
   - Ao reservar equipamentos de estoque limitado (chopeiras elétricas, the beer truck ou tendas), o sistema soma os itens já reservados para a data em questão na aba `RESERVAS` (com status diferente de 'Cancelada').
   - O `LockService` do Apps Script bloqueia requisições simultâneas em frações de segundo para garantir integridade.

3. **Cálculo de Preço no Servidor:**
   - Os valores unitários dos barris, equipamentos e taxas de entrega por cidade são lidos diretamente da planilha. O cliente nunca pode adulterar o preço enviado pelo navegador.

4. **Integração com WhatsApp:**
   - Ao concluir a reserva, o sistema gera o código sequencial (ex: `#GN-000101`) e gera um link para o WhatsApp comercial com a mensagem completa formatada com todos os itens, data, local e valores.
