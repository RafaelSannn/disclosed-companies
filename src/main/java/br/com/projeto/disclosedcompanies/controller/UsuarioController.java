package br.com.projeto.disclosedcompanies.controller;

import br.com.projeto.disclosedcompanies.dto.LoginResponse;
import br.com.projeto.disclosedcompanies.model.Usuario;
import br.com.projeto.disclosedcompanies.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para operações de usuário.
 *
 * Mapeado em "/php" para manter compatibilidade com o script2.js legado,
 * que espera URLs no estilo "/php/login.php", "/php/register.php", etc.
 *
 * Responsabilidade: receber a requisição HTTP, delegar ao {@link UsuarioService}
 * e devolver o ResponseEntity adequado. Nenhuma lógica de negócio aqui.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/php")
public class UsuarioController {

    private final UsuarioService service;

    /**
     * GET /php/usuarios/empresas
     * Retorna todas as empresas cadastradas com paginação.
     * Parâmetros: page (default 0), size (default 20), sort (default nome,asc)
     * O campo "senha" nunca aparece no JSON graças ao @JsonIgnore na entidade.
     */
    @GetMapping("/usuarios/empresas")
    public Page<Usuario> listarEmpresas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome,asc") String[] sort) {
        
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc")
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        return service.listarEmpresas(pageable);
    }

    /**
     * GET /php/usuarios/empresa/{categoria}
     * Retorna empresas filtradas por categoria com paginação.
     * Parâmetros: page (default 0), size (default 20)
     */
    @GetMapping("/usuarios/empresa/{categoria}")
    public Page<Usuario> listarEmpresaPorCategoria(
            @PathVariable String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        return service.listarEmpresasPorCategoria(categoria, pageable);
    }

    /**
     * POST /php/register.php
     * Cadastra um novo usuário (visitante ou empresa).
     * Recebe os dados como form-data (@RequestParam) para compatibilidade com o script2.js.
     * Retorna 200 em sucesso ou 400 com mensagem de erro.
     */
    @PostMapping("/register.php")
    public ResponseEntity<Map<String, String>> cadastrar(
            @RequestParam String nome,
            @RequestParam String email,
            @RequestParam String senha,
            @RequestParam String tipo,
            @RequestParam(required = false) String localizacao,
            @RequestParam(required = false) String cnpj,
            @RequestParam(required = false) String categoria) {

        Map<String, String> response = service.cadastrar(nome, email, senha, tipo, localizacao, cnpj, categoria);

        if ("erro".equals(response.get("status"))) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /php/perfil.php
     * Atualiza os dados de perfil de um usuário (nome, foto, localização, categoria, descrição).
     * Apenas os campos enviados são atualizados — campos ausentes são preservados.
     * Retorna 200 em sucesso ou 400 se o ID não existir.
     */
    @PutMapping("/perfil.php")
    public ResponseEntity<Map<String, String>> atualizarPerfil(
            @RequestParam Long id,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String profileImage,
            @RequestParam(required = false) String localizacao,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String descricao) {

        Map<String, String> response = service.atualizarPerfil(id, nome, profileImage, localizacao, categoria, descricao);
        if ("erro".equals(response.get("status"))) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * POST /php/login.php
     * Autentica o usuário por e-mail e senha.
     * Retorna 200 com os dados do usuário em caso de sucesso,
     * ou 400 com mensagem genérica em caso de credenciais inválidas.
     */
    @PostMapping("/login.php")
    public ResponseEntity<LoginResponse> login(
            @RequestParam String email,
            @RequestParam String senha) {

        LoginResponse response = service.login(email, senha);
        if ("erro".equals(response.getStatus())) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
