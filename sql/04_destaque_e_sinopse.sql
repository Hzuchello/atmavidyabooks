-- ============================================
-- ÁTMA VIDYÁ — Colunas para destaques e sinopse
-- ============================================

alter table livros add column destaque boolean not null default false;
alter table livros add column sinopse text;

-- Depois de rodar isso, marque manualmente (no Table Editor)
-- quais 4 livros terão destaque = true, e vá preenchendo a
-- sinopse de cada um quando tiver o texto pronto.
