package br.com.projeto.disclosedcompanies.controller;

import br.com.projeto.disclosedcompanies.model.Publicacao;
import br.com.projeto.disclosedcompanies.service.PublicacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para operações sobre publicações de serviço.
 *
 * Mapeado em "/api/publicacoes". Recebe JSON no body (@RequestBody)
 * ao contrário do UsuarioController que usa form-data.
 *
 * Delega toda lógica ao {@link PublicacaoService}.
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/publicacoes")
public class PublicacaoController {

    private final PublicacaoService service;

    /**
     * POST /api/publicacoes
     * Cria uma nova publicação. O body JSON deve conter título, descrição,
     * imagens (Base64), tipoAutor, nomeAutor e usuarioId.
     * A dataCriacao é preenchida automaticamente pelo @PrePersist.
     */
    @PostMapping
    public Publicacao criar(@RequestBody Publicacao pub) {
        return service.criar(pub);
    }

    /**
     * GET /api/publicacoes/usuario/{id}
     * Retorna publicações de um usuário com paginação.
     * Parâmetros: page (default 0), size (default 10)
     * Ordenadas por data de criação (mais recentes primeiro).
     */
    @GetMapping("/usuario/{id}")
    public Page<Publicacao> listarPorUsuario(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dataCriacao").descending());
        return service.listarPorUsuario(id, pageable);
    }

    /**
     * GET /api/publicacoes/tipo/{tipo}
     * Retorna publicações filtradas pelo tipo do autor com paginação.
     * Parâmetros: page (default 0), size (default 10)
     * Ordenadas por data de criação (mais recentes primeiro).
     */
    @GetMapping("/tipo/{tipo}")
    public Page<Publicacao> listarPorTipo(
            @PathVariable String tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dataCriacao").descending());
        return service.listarPorTipo(tipo, pageable);
    }

    /**
     * DELETE /api/publicacoes/{id}
     * Exclui uma publicação pelo ID.
     * Retorna 204 (No Content) em sucesso ou 404 se o ID não existir.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
