-- ============================================
-- ÁTMA VIDYÁ — Preços temporários (apenas teste)
-- ============================================
-- Valores aleatórios, só para testar o fluxo do carrinho.
-- Antes de apresentar o projeto às editoras, redefinir todos
-- para os valores reais (ou voltar a NULL, se ainda não houver
-- parceria fechada).
-- "The Divine Life Society" não é alterado (não é venda própria).

update livros set preco_centavos = 4990 where titulo = 'Yôga Sútra de Pátañjali';
update livros set preco_centavos = 3990 where titulo = 'Ser Forte';
update livros set preco_centavos = 5490 where titulo = 'Tratado de Yôga';
update livros set preco_centavos = 4490 where titulo = 'Eu Me Lembro';
update livros set preco_centavos = 5990 where titulo = 'Chakras, Kundaliní e Poderes Paranormais';
update livros set preco_centavos = 4290 where titulo = 'Karma e Dharma';
update livros set preco_centavos = 6990 where titulo = 'The Bhagavad Gita';
update livros set preco_centavos = 5290 where titulo = 'O Poder do Hábito';
update livros set preco_centavos = 5150 where titulo = 'Flow: A Psicologia do Alto Desempenho e da Felicidade';

-- Conferência rápida:
-- select titulo, preco_centavos, tipo_venda from livros order by titulo;
