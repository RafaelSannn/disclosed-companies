package br.com.projeto.disclosedcompanies.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Entidade JPA que representa um usuário da plataforma.
 *
 * Existem dois tipos de usuário:
 * - "visitante": pessoa física que busca serviços e publica demandas.
 * - "empresa": prestadora de serviços com campos extras (CNPJ, categoria, etc.).
 *
 * A tabela "usuarios" é mapeada automaticamente pelo Hibernate.
 */
@Data
@Entity
@Table(name = "usuarios", indexes = {
    @Index(name = "idx_usuario_tipo", columnList = "tipo"),
    @Index(name = "idx_usuario_tipo_categoria", columnList = "tipo, categoria"),
    @Index(name = "idx_usuario_email", columnList = "email"),
    @Index(name = "idx_usuario_cnpj", columnList = "cnpj")
})
public class Usuario {

    /** Identificador único gerado automaticamente pelo banco (auto_increment). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome de exibição do usuário. Não pode ser vazio. */
    @NotBlank(message = "O nome não pode estar vazio.")
    @Column(nullable = false)
    private String nome;

    /** E-mail usado para login. Deve ser único no banco. */
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hash BCrypt da senha. Nunca armazenamos a senha em texto puro.
     * @JsonIgnore garante que o hash nunca seja enviado nas respostas JSON.
     */
    @JsonIgnore
    @NotBlank(message = "A palavra-passe é obrigatória.")
    @Size(min = 6, message = "A palavra-passe deve ter pelo menos 6 caracteres.")
    @Column(nullable = false)
    private String senha;

    /** Tipo do usuário: "visitante" ou "empresa". */
    @NotBlank(message = "O tipo de usuário é obrigatório.")
    private String tipo;

    /** Endereço/cidade da empresa (preenchido apenas para tipo "empresa"). */
    private String localizacao;

    /**
     * CNPJ da empresa. Único no banco — impede duas contas para o mesmo CNPJ.
     * Preenchido apenas para tipo "empresa".
     */
    @Column(unique = true)
    private String cnpj;

    /** Segmento de atuação da empresa (ex: "Elétrica", "Informática"). */
    private String categoria;

    /** Texto descritivo sobre a empresa e seus serviços. */
    @Column(columnDefinition = "TEXT")
    private String descricao;

    /**
     * Foto de perfil codificada em Base64.
     * LONGTEXT suporta imagens de até ~16 MB sem truncamento.
     */
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;
}
