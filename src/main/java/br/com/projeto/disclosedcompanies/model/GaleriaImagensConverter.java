package br.com.projeto.disclosedcompanies.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class GaleriaImagensConverter implements AttributeConverter<List<String>, String> {
    @Override
    public String convertToDatabaseColumn(List<String> imagens) {
        // Os data URLs validados não contêm quebras de linha.
        return imagens == null || imagens.isEmpty() ? null : String.join("\n", imagens);
    }

    @Override
    public List<String> convertToEntityAttribute(String imagens) {
        return imagens == null ? List.of() : imagens.lines().toList();
    }
}
