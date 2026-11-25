aluno(cecilia, 8.0, 7.5).
aluno(carlos, 5.0, 6.0).
aluno(marcus, 9.0, 8.5).

media(Nome, Media) :-
    aluno(Nome, Nota1, Nota2),
    Media is (Nota1 + Nota2) / 2.

situacao(Nome, aprovado) :-
    media(Nome, Media),
    Media >= 7.

situacao(Nome, reprovado) :-
    media(Nome, Media),
    Media < 7.

mostrar_aluno(Nome) :-
    media(Nome, Media),
    situacao(Nome, Situacao),
    write('Aluno: '),
    write(Nome),
    nl,
    write('Media: '),
    write(Media),
    nl,
    write('Situacao: '),
    write(Situacao),
    nl.