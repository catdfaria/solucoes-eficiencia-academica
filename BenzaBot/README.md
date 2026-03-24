# 🤖 BenzaBot: Orquestrador de Respostas Institucionais (ORI)

O **BenzaBot** (homenagem à Benzaiten, deusa do conhecimento) é uma solução de **Arquitetura Serverless** desenvolvida para transformar o atendimento eletrônico em ecossistemas acadêmicos e corporativos. Ele atua como uma ponte estratégica entre a **IA Generativa** e o rigor documental necessário em instituições de grande escala.

## 🎯 Propósito & Valor de Negócio
Desenvolvido sob a ótica do **Lean Seis Sigma**, o BenzaBot foca na redução de variabilidade e eliminação de desperdícios operacionais:
* **Auditabilidade:** Registro integral de interações vinculado a protocolos para monitoria de qualidade.
* **Padronização:** Mitigação de "alucinações" de IA através de um **Argumentário Humano Curado** (Cache em nuvem).
* **Eficiência:** Redução drástica no tempo de resposta manual mantendo o tom de voz acolhedor.
* **Escalabilidade:** Arquitetura dinâmica compatível com WhatsApp, E-mail e sistemas de ticket.

## 🏗️ Arquitetura Técnica (Azure Cloud)
O projeto utiliza uma orquestração de microsserviços para garantir alta disponibilidade e baixo custo:
1.  **Gatilho (Request):** Frontend em HTML5/JS envia payloads JSON.
2.  **Orquestração:** **Azure Logic Apps** gerencia o fluxo de trabalho e conectores de dados.
3.  **Processamento de Dados:** Consulta a bases de conhecimento em **Excel Online/SharePoint**.
4.  **Inteligência Artificial:** Integração com **Azure Functions (Python)** orquestrando modelos de linguagem para estilização contextualizada.
5.  **Feedback Loop:** Sistema de avaliação que retroalimenta a base de auditoria para melhoria contínua.

## 📊 Fluxograma de Operação 

```mermaid graph TD
  A[Entrada: Pergunta + Protocolo] --> B{Logic App: Orquestrador}
  B --> C[Consulta: Argumentos Curados]
  C --> D[Azure Function: IA Estilização]
  D --> E{Switch: Identificar Fluxo/Equipe}
  E --> F[Gravar Auditoria & Logs]
  F --> G[Retorno: Resposta Estruturada ao Atendente]

Desenvolvido por Caio Alexandre Toledo de Faria Unindo Pensamento Crítico, Ciência de Dados e Automação.
