# Gerenciador de Faltas — Trabalho de Heurísticas

Aplicação simples para registrar faltas por aluno, feita em React + Vite e persistência de dados em `localStorage`.

## Objetivo do trabalho

Usar esta aplicação como base para aplicar heurísticas de usabilidade/ IHC, registrando a evolução a cada nova heurística utilizada.

## Como rodar

- Instalar dependências: `npm install`
- Rodar em dev: `npm run dev`

## Versão 1:

- Lista fixa de alunos (inicializa com 3 se o storage estiver vazio)
- Campo numérico para alterar faltas
- Botões que salvam em `localStorage` (chave `faltas_data`)

![imagem da versão 1 do site](imagens/v1.png)

## Versão 2:

Mudanças focadas em deixar o sistema mais “explicável” e previsível para o usuário

- Feedback de status ao salvar (mostra confirmação com horário)
- Indicação de “alterações não salvas”
- Botões renomeados para linguagem mais comum e intuitiva “Salvar alterações”, “Desfazer”
- Controle e liberdade: opção de desfazer e voltar ao último salvamento
- Prevenção de erros: limite de faltas (0 a 99) e entrada inteira

![imagem da versão 2 do site](imagens/v2.png)

## Heurísticas (Nielsen) — checklist

- [x] 1. Visibilidade do status do sistema
- [x] 2. Correspondência entre o sistema e o mundo real
- [x] 3. Controle e liberdade do usuário
- [x] 4. Consistência e padrões
- [x] 5. Prevenção de erros
- [ ] 6. Reconhecimento em vez de lembrança
- [ ] 7. Flexibilidade e eficiência de uso
- [ ] 8. Estética e design minimalista
- [ ] 9. Ajudar usuários a reconhecer, diagnosticar e recuperar de erros
- [ ] 10. Ajuda e documentação
