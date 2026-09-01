-- ============================================
-- ÁTMA VIDYÁ — Sinopse curta para o banner
-- ============================================
-- Campo separado da "sinopse" completa (usada na página do livro).
-- Aqui o texto deve ser bem curto — 1 a 2 frases — para caber no
-- banner do carrossel da home.

alter table livros add column sinopse_banner text;

-- Depois de rodar isso, preencha manualmente (Table Editor) a
-- sinopse_banner dos 4 livros marcados como destaque = true.
