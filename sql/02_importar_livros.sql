-- ============================================
-- ÁTMA VIDYÁ — Importação do catálogo inicial
-- ============================================
-- Todos os preços ficam NULL (em branco) por enquanto.
-- No site, isso deve exibir "Em breve" no lugar do botão
-- de carrinho, até que o preço real seja definido.

insert into livros (titulo, autor, categorias, preco_centavos, capa_url, tipo_venda, link_externo, disponivel)
values
  ('Yôga Sútra de Pátañjali', 'DeRose', array['yoga','derose'], null, 'yoga_sutra.jpg', 'proprio', null, true),
  ('Ser Forte', 'DeRose', array['derose'], null, 'livro_capa_ser_forte_derose.png', 'proprio', null, true),
  ('Tratado de Yôga', 'DeRose', array['yoga','derose'], null, 'tratado_de_yoga.jpg', 'proprio', null, true),
  ('Eu Me Lembro', 'DeRose', array['derose'], null, 'livro_capa_eu_me_lembro_derose.png', 'proprio', null, true),
  ('Chakras, Kundaliní e Poderes Paranormais', 'DeRose', array['derose'], null, 'livro_capa_chakras_derose.png', 'proprio', null, true),
  ('Karma e Dharma', 'DeRose', array['derose'], null, 'livro_capa_karma_e_dharma_derose.png', 'proprio', null, true),
  ('The Bhagavad Gita', 'Franklin Edgerton', array['sagrado'], null, 'bhagavad_gita.jpg', 'proprio', null, true),
  ('O Poder do Hábito', 'Charles Duhigg', array['desenvolvimento'], null, 'o_poder_do_habito.jpg', 'proprio', null, true),
  ('Flow: A Psicologia do Alto Desempenho e da Felicidade', 'Mihaly Csikszentmihalyi', array['desenvolvimento'], null, 'flow.jpg', 'proprio', null, true),
  -- Exceção: não é produto vendido por você, é um link de recurso/indicação externa
  ('The Divine Life Society', 'Vários autores', array['hindu'], null, 'shivananda.jpg', 'externo', 'https://www.dlshq.org/', true);
