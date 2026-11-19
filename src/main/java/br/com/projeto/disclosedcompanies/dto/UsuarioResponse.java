package br.com.projeto.disclosedcompanies.dto;

import br.com.projeto.disclosedcompanies.model.Usuario;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * DTO (Data Transfer Object) de saída para dados de usuário.
 *
 * Representa o usuário na resposta JSON sem expor campos sensíveis
 * como a senha (que fica apenas na entidade {@link Usuario} anotada com @JsonIgnore).
 *
 * Para usuários do tipo "empresa", inclui o objeto {@link CompanyDetailsResponse}
 * com os detalhes da empresa. Para visitantes, companyDetails é null.
 *
 * O método estático {@code from()} converte a entidade neste DTO.
 */
@Data
@Builder
public class UsuarioResponse {

    private Long id;
    private String nome;
    private String email;
    private String tipo;
    private String profileImage;

    /** Detalhes da empresa. Preenchido apenas quando tipo = "empresa". */
    private CompanyDetailsResponse companyDetails;

    /**
     * Converte uma entidade {@link Usuario} neste DTO.
     * Popula companyDetails somente se o usuário for do tipo "empresa".
     *
     * @param u entidade JPA recuperada do banco
     * @return DTO pronto para serialização JSON
     */
    public static UsuarioResponse from(Usuario u) {
        UsuarioResponseBuilder builder = UsuarioResponse.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .tipo(u.getTipo())
                .profileImage(u.getProfileImage());

        if ("empresa".equals(u.getTipo())) {
            builder.companyDetails(CompanyDetailsResponse.builder()
                    .name(u.getNome())
                    .location(u.getLocalizacao())
                    .cnpj(u.getCnpj())
                    .category(u.getCategoria())
                    .description(u.getDescricao())
                    .views(0)
                    .images(u.getImagensPerfil() == null ? List.of() : u.getImagensPerfil())
                    .build());
        }

        return builder.build();
    }
}
