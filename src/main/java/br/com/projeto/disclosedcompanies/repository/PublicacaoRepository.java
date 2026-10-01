package br.com.projeto.disclosedcompanies.repository;

import br.com.projeto.disclosedcompanies.model.Publicacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repositório de acesso a dados para a entidade {@link Publicacao}.
 *
 * Herda as operações básicas de CRUD do JpaRepository.
 * Os métodos de busca são derivados automaticamente pelo Spring Data JPA
 * a partir dos nomes dos métodos.
 */
public interface PublicacaoRepository extends JpaRepository<Publicacao, Long> {

    /** Retorna todas as publicações criadas por um usuário específico com paginação. */
    Page<Publicacao> findByUsuarioId(Long usuarioId, Pageable pageable);

    /**
     * Retorna publicações filtradas pelo tipo do autor com paginação.
     * Usado pela tela da empresa para exibir publicações de visitantes.
     */
    Page<Publicacao> findByTipoAutor(String tipoAutor, Pageable pageable);
}
