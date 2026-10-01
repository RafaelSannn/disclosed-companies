package br.com.projeto.disclosedcompanies.repository;

import br.com.projeto.disclosedcompanies.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para a entidade {@link Usuario}.
 *
 * Estende JpaRepository, que fornece automaticamente as operações básicas de CRUD
 * (save, findById, findAll, deleteById, etc.) sem necessidade de implementação manual.
 *
 * Os métodos de busca abaixo são gerados pelo Spring Data JPA a partir dos nomes
 * dos métodos — nenhuma query SQL precisa ser escrita.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Busca um usuário pelo e-mail. Usado na autenticação e na validação de duplicatas. */
    Optional<Usuario> findByEmail(String email);

    /** Retorna todos os usuários do tipo especificado com paginação. */
    Page<Usuario> findByTipo(String tipo, Pageable pageable);

    /** Retorna empresas filtradas por categoria com paginação. */
    Page<Usuario> findByTipoAndCategoria(String tipo, String categoria, Pageable pageable);

    /** Verifica se já existe uma empresa com o CNPJ informado. Evita duplicatas no cadastro. */
    Optional<Usuario> findByCnpj(String cnpj);
}
