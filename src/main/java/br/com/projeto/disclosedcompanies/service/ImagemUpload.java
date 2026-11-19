package br.com.projeto.disclosedcompanies.service;

import br.com.projeto.disclosedcompanies.exception.ValidationException;

import java.util.Base64;
import java.util.List;
import java.util.Set;

final class ImagemUpload {
    private static final int MAX_BYTES = 400 * 1024;
    private static final int MAX_BASE64_LENGTH = 4 * ((MAX_BYTES + 2) / 3);
    private static final Set<String> FORMATOS = Set.of(
            "data:image/jpeg;base64", "data:image/png;base64",
            "data:image/webp;base64", "data:image/gif;base64");

    private ImagemUpload() {}

    static void validarGaleria(List<String> imagens, int limite) {
        if (imagens == null) return;
        if (imagens.size() > limite) {
            throw new ValidationException("A galeria excede o limite de imagens.");
        }
        imagens.forEach(ImagemUpload::validar);
    }

    static void validar(String imagem) {
        if (imagem == null || imagem.isBlank()) {
            throw new ValidationException("Selecione uma imagem válida.");
        }
        int separador = imagem.indexOf(',');
        if (separador < 0 || separador > 30 || !FORMATOS.contains(imagem.substring(0, separador))) {
            throw new ValidationException("Use uma imagem JPEG, PNG, WebP ou GIF.");
        }
        if (imagem.length() - separador - 1 > MAX_BASE64_LENGTH) {
            throw new ValidationException("A imagem preparada deve ter até 400 KB.");
        }
        byte[] conteudo;
        try {
            conteudo = Base64.getDecoder().decode(imagem.substring(separador + 1));
        } catch (IllegalArgumentException e) {
            throw new ValidationException("O conteúdo da imagem é inválido.");
        }
        if (conteudo.length == 0 || conteudo.length > MAX_BYTES) {
            throw new ValidationException("A imagem preparada deve ter até 400 KB.");
        }
    }
}
