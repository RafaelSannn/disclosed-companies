package br.com.projeto.disclosedcompanies.service;

import br.com.projeto.disclosedcompanies.model.Publicacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Contrato de negócio para operações sobre publicações.
 *
 * Define criação, listagem e exclusão de publicações.
 * A implementação concreta é {@link PublicacaoServiceImpl}.
 */
public interface PublicacaoService {

    /** Persiste uma nova publicação no banco e retorna o objeto salvo (com ID preenchido). */
    Publicacao criar(Publicacao pub);

    /** Retorna todas as publicações de um usuário específico com paginação. */
    Page<Publicacao> listarPorUsuario(Long usuarioId, Pageable pageable);

    /** Retorna todas as publicações de um tipo de autor com paginação. */
    Page<Publicacao> listarPorTipo(String tipo, Pageable pageable);

    /**
     * Remove uma publicação pelo ID.
     * Lança {@link org.springframework.web.server.ResponseStatusException} com status 404
     * se o ID não existir, evitando que o cliente receba um erro 500 genérico.
     */
    void eliminar(Long id);
}
