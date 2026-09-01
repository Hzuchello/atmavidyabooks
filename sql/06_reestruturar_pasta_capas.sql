-- ============================================
-- ÁTMA VIDYÁ — Reorganização de pastas: capas
-- ============================================
-- Prefixa "img/capas/" em todo capa_url existente,
-- sem precisar saber os valores atuais de cada livro.
-- Funciona para qualquer livro já cadastrado, inclusive
-- os adicionados manualmente.
--
-- A condição "not like '%/%'" evita prefixar duas vezes
-- caso esse script seja rodado mais de uma vez por engano.

update livros
set capa_url = 'img/capas/' || capa_url
where capa_url is not null
  and capa_url not like '%/%';

-- Conferência rápida depois de rodar:
-- select titulo, capa_url from livros order by titulo;
