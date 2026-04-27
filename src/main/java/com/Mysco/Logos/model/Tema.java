package com.Mysco.Logos.model;

public enum Tema {

    TECNOLOGIA,
    COTIDIANO,
    LIVROS,
    SOCIEDADE,
    IDEIAS,
    TRABALHO,
    CULTURA,

    JAVA,
    SPRING_BOOT,
    MYSQL,
    SEGURANCA,
    API_REST,
    DEVOPS,
    FRONTEND;

    public Tema normalizado() {
        return switch (this) {
            case JAVA -> TECNOLOGIA;
            case SPRING_BOOT -> COTIDIANO;
            case MYSQL -> LIVROS;
            case SEGURANCA -> SOCIEDADE;
            case API_REST -> IDEIAS;
            case DEVOPS -> TRABALHO;
            case FRONTEND -> CULTURA;
            default -> this;
        };
    }

    public static Tema normalizar(Tema tema) {
        return tema == null ? null : tema.normalizado();
    }
}
