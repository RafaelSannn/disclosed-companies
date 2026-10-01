package br.com.projeto.disclosedcompanies.service;

import br.com.projeto.disclosedcompanies.dto.LoginResponse;
import br.com.projeto.disclosedcompanies.dto.UsuarioResponse;
import br.com.projeto.disclosedcompanies.model.Usuario;
import br.com.projeto.disclosedcompanies.repository.UsuarioRepository;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementação concreta de {@link UsuarioService}.
 *
 * Concentra toda a lógica de negócio relacionada a usuários:
 * validações de cadastro, autenticação BCrypt, listagem e atualização de perfil.
 *
 * @Service registra esta classe como bean gerenciado pelo Spring.
 * @RequiredArgsConstructor gera o construtor com os campos final, viabilizando
 * injeção de dependência sem @Autowired em campo.
 */
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Valida e persiste um novo usuário.
     *
     * Ordem das validações:
     * 1. Tamanho mínimo da senha (6 caracteres)
     * 2. E-mail duplicado
     * 3. CNPJ duplicado (apenas para tipo "empresa")
     *
     * A senha nunca é armazenada em texto puro — é codificada com BCrypt antes de salvar.
     * Se uma violação de constraint JPA ocorrer na persistência, a mensagem da anotação
     * da entidade é retornada ao cliente.
     */
    @Override
    public Map<String, String> cadastrar(String nome, String email, String senha, String tipo,
                                          String localizacao, String cnpj, String categoria) {
        if (senha == null || senha.trim().length() < 6)
            return erro("A palavra-passe deve ter pelo menos 6 caracteres.");

        if (repository.findByEmail(email).isPresent())
            return erro("E-mail já registado. Tente outro.");

        if ("empresa".equals(tipo) && cnpj != null && !cnpj.trim().isEmpty()
                && repository.findByCnpj(cnpj).isPresent())
            return erro("Este CNPJ já está registado em outra empresa.");

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(nome);
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(passwordEncoder.encode(senha)); // hash BCrypt
        novoUsuario.setTipo(tipo);

        if ("empresa".equals(tipo)) {
            novoUsuario.setLocalizacao(localizacao);
            novoUsuario.setCnpj(cnpj);
            novoUsuario.setCategoria(categoria);
        }

        try {
            repository.save(novoUsuario);
        } catch (ConstraintViolationException e) {
            // Captura erros das anotações de validação JPA (@Email, @NotBlank, etc.)
            return erro(e.getConstraintViolations().iterator().next().getMessage());
        }

        return sucesso("Registo concluído com sucesso.");
    }

    /**
     * Autentica o usuário pelo e-mail e senha.
     *
     * Usa passwordEncoder.matches() para comparar a senha digitada
     * com o hash BCrypt armazenado — nunca descriptografa.
     * A mensagem de erro é propositalmente vaga para não revelar se o
     * e-mail existe ou não ("enumeração de usuários").
     */
    @Override
    public LoginResponse login(String email, String senha) {
        Optional<Usuario> usuarioOpt = repository.findByEmail(email);

        if (usuarioOpt.isEmpty() || !passwordEncoder.matches(senha, usuarioOpt.get().getSenha())) {
            return LoginResponse.builder()
                    .status("erro")
                    .mensagem("E-mail ou palavra-passe incorretos.")
                    .build();
        }

        return LoginResponse.builder()
                .status("sucesso")
                .mensagem("Sessão iniciada com sucesso.")
                .usuario(UsuarioResponse.from(usuarioOpt.get()))
                .build();
    }

    /** Delega ao repositório a busca por todos os usuários do tipo "empresa" com paginação. */
    @Override
    public Page<Usuario> listarEmpresas(Pageable pageable) {
        return repository.findByTipo("empresa", pageable);
    }

    /** Delega ao repositório a busca por empresas de uma categoria específica com paginação. */
    @Override
    public Page<Usuario> listarEmpresasPorCategoria(String categoria, Pageable pageable) {
        return repository.findByTipoAndCategoria("empresa", categoria, pageable);
    }

    /**
     * Atualiza os dados de perfil de um usuário existente.
     *
     * Apenas os campos fornecidos (não-nulos e não-vazios) são sobrescritos,
     * preservando os demais valores já armazenados (atualização parcial).
     * Retorna erro 400 se o ID não existir no banco.
     */
    @Override
    public Map<String, String> atualizarPerfil(Long id, String nome, String profileImage,
                                               String localizacao, String categoria, String descricao) {
        return repository.findById(id)
                .map(u -> {
                    if (nome != null && !nome.trim().isEmpty()) u.setNome(nome.trim());
                    if (profileImage != null && !profileImage.isEmpty()) u.setProfileImage(profileImage);
                    if (localizacao != null) u.setLocalizacao(localizacao);
                    if (categoria != null) u.setCategoria(categoria);
                    if (descricao != null) u.setDescricao(descricao);
                    repository.save(u);
                    return sucesso("Perfil atualizado com sucesso.");
                })
                .orElse(erro("Usuário não encontrado."));
    }

    /** Monta um mapa de resposta de erro padronizado para o frontend. */
    private static Map<String, String> erro(String mensagem) {
        return Map.of("status", "erro", "mensagem", mensagem);
    }

    /** Monta um mapa de resposta de sucesso padronizado para o frontend. */
    private static Map<String, String> sucesso(String mensagem) {
        return Map.of("status", "sucesso", "mensagem", mensagem);
    }
}
