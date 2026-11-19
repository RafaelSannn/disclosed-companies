package br.com.projeto.disclosedcompanies.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * DTO com os detalhes específicos de uma empresa.
 *
 * Embutido dentro de {@link UsuarioResponse} quando o tipo do usuário é "empresa".
 * O script2.js usa este objeto para preencher a tela de perfil da empresa
 * e o modal de detalhes na listagem de "Explorar Empresas".
 *
 * A contagem de visualizações do perfil ainda não é calculada.
 */
@Data
@Builder
public class CompanyDetailsResponse {

    /** Nome da empresa (espelhado de Usuario.nome). */
    private String name;

    /** Endereço ou cidade de atuação. */
    private String location;

    /** CNPJ formatado. */
    private String cnpj;

    /** Segmento de atuação (ex: "Elétrica", "Informática"). */
    private String category;

    /** Texto descritivo sobre a empresa e seus serviços. */
    private String description;

    /** Contador de visualizações do perfil (não implementado — sempre 0). */
    private int views;

    /** Imagens salvas na galeria do perfil. */
    private List<String> images;
}
