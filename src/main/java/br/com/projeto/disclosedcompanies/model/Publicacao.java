package br.com.projeto.disclosedcompanies.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entidade JPA que representa uma publicação de serviço na plataforma.
 *
 * Tanto visitantes quanto empresas podem criar publicações.
 * Cada publicação pertence a um usuário (via usuarioId) e pode conter
 * imagens codificadas em Base64.
 */
@Data
@Entity
@Table(name = "publicacoes", indexes = {
    @Index(name = "idx_publicacao_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_publicacao_tipo_autor", columnList = "tipo_autor"),
    @Index(name = "idx_publicacao_data_criacao", columnList = "data_criacao")
})
public class Publicacao {

    /** Identificador único gerado automaticamente pelo banco. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Título da publicação. Campo obrigatório. */
    @Column(nullable = false)
    private String titulo;

    /** Descrição detalhada do serviço ou demanda publicada. */
    @Column(columnDefinition = "TEXT")
    private String descricao;

    /**
     * Imagens da publicação codificadas em Base64 (string única).
     * LONGTEXT para suportar imagens sem risco de truncamento.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String imagens;

    /** Tipo do autor: "visitante" ou "empresa". Usado para filtrar no feed. */
    private String tipoAutor;

    /** Nome do autor no momento da publicação (desnormalizado para evitar JOIN). */
    private String nomeAutor;

    /** Referência ao ID do Usuario que criou a publicação. */
    private Long usuarioId;

    /** Data e hora de criação, preenchida automaticamente na persistência. */
    private LocalDateTime dataCriacao;

    /**
     * Define a data de criação no momento em que a entidade é salva pela primeira vez.
     * Usar @PrePersist garante que o valor reflita o instante real da persistência,
     * não o da instanciação da classe.
     */
    @PrePersist
    protected void prePersist() {
        dataCriacao = LocalDateTime.now();
    }
}
