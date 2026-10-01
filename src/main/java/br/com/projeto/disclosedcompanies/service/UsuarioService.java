package br.com.projeto.disclosedcompanies.service;

import br.com.projeto.disclosedcompanies.dto.LoginResponse;
import br.com.projeto.disclosedcompanies.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Contrato de negócio para operações relacionadas a usuários.
 *
 * Define as ações disponíveis para cadastro, autenticação, listagem e
 * atualização de perfil. A implementação concreta é {@link UsuarioServiceImpl}.
 *
 * Usar interface desacopla o controller da implementação, facilitando testes
 * unitários com mocks e eventual troca de implementação sem alterar o controller.
 */
public interface UsuarioService {

    /**
     * Cadastra um novo usuário após validar email duplicado, CNPJ duplicado e tamanho da senha.
     * Retorna um mapa com "status" ("sucesso" ou "erro") e "mensagem" descritiva.
     */
    Map<String, String> cadastrar(String nome, String email, String senha, String tipo,
                                  String localizacao, String cnpj, String categoria);

    /**
     * Autentica o usuário verificando email e senha via BCrypt.
     * Retorna {@link LoginResponse} com status "sucesso" e os dados do usuário,
     * ou status "erro" se as credenciais forem inválidas.
     */
    LoginResponse login(String email, String senha);

    /** Retorna todos os usuários do tipo "empresa" com paginação. */
    Page<Usuario> listarEmpresas(Pageable pageable);

    /** Retorna empresas filtradas por categoria de atuação com paginação. */
    Page<Usuario> listarEmpresasPorCategoria(String categoria, Pageable pageable);

    /**
     * Atualiza os campos de perfil de um usuário (nome, foto, localização, categoria, descrição).
     * Apenas os campos não-nulos são alterados — campos nulos são ignorados.
     * Retorna mapa com "status" e "mensagem".
     */
    Map<String, String> atualizarPerfil(Long id, String nome, String profileImage,
                                        String localizacao, String categoria, String descricao);
}
