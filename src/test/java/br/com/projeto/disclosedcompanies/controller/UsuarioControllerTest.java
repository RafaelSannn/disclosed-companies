package br.com.projeto.disclosedcompanies.controller;

import br.com.projeto.disclosedcompanies.model.Usuario;
import br.com.projeto.disclosedcompanies.service.UsuarioService;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UsuarioControllerTest {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void listagemDeEmpresasNaoExpoeSenha() throws Exception {
        usuarioService.cadastrar("Empresa Teste", "empresa2@test.com", "senha123",
                "empresa", "São Paulo", "98.765.432/0001-00", "tecnologia");

        Page<Usuario> empresasPage = usuarioService.listarEmpresas(PageRequest.of(0, 20));
        List<Usuario> empresas = empresasPage.getContent();

        for (Usuario empresa : empresas) {
            String json = objectMapper.writeValueAsString(empresa);
            assertThat(json).doesNotContain("\"senha\"");
        }
    }
}
