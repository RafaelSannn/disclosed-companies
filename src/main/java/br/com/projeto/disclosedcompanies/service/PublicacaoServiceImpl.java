package br.com.projeto.disclosedcompanies.service;

import br.com.projeto.disclosedcompanies.model.Publicacao;
import br.com.projeto.disclosedcompanies.repository.PublicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Implementação concreta de {@link PublicacaoService}.
 *
 * Gerencia o ciclo de vida das publicações: criação, leitura e exclusão.
 * A verificação de existência antes do delete garante que o cliente receba
 * HTTP 404 (e não 500) ao tentar excluir um ID inexistente.
 */
@Service
@RequiredArgsConstructor
public class PublicacaoServiceImpl implements PublicacaoService {

    private final PublicacaoRepository repository;

    /** Salva a publicação no banco. O @PrePersist da entidade define dataCriacao automaticamente. */
    @Override
    public Publicacao criar(Publicacao pub) {
        return repository.save(pub);
    }

    /** Delega a busca por usuário ao repositório com paginação. */
    @Override
    public Page<Publicacao> listarPorUsuario(Long usuarioId, Pageable pageable) {
        return repository.findByUsuarioId(usuarioId, pageable);
    }

    /** Delega a busca por tipo de autor ao repositório com paginação. */
    @Override
    public Page<Publicacao> listarPorTipo(String tipo, Pageable pageable) {
        return repository.findByTipoAutor(tipo, pageable);
    }

    /**
     * Exclui a publicação após confirmar que ela existe.
     * Lança 404 para IDs inexistentes, evitando resposta 500 do Spring.
     */
    @Override
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada.");
        }
        repository.deleteById(id);
    }
}
