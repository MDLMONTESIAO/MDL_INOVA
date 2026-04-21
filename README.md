# Acervo Musical MDL Monte Siao

Sistema separado para leitura de musicas cifradas da MDL Monte Siao.

## Como iniciar

Abra o arquivo:

```bat
iniciar.bat
```

O sistema abre em:

```text
http://localhost:3030
```

## Onde colocar novas cifras

Coloque novas pastas e arquivos dentro de:

```text
C:\Users\Pixel Midia 3D\Cifras MDL\acervo\cifras_multi
```

Formato recomendado:

```text
acervo\cifras_multi
|- artista-1
|  |- 01 - Musica.html
|  \- 02 - Outra Musica.html
\- artista-2
   \- 01 - Louvor.html
```

Arquivos aceitos:

```text
.html
.htm
.txt
```

## Atualizacao automatica

Quando o servidor estiver aberto, ele monitora a pasta `acervo\cifras_multi`.
Ao adicionar novas musicas ou novas pastas, o indice e atualizado automaticamente.

Se quiser forcar a atualizacao manualmente, abra:

```bat
atualizar-acervo.bat
```

## Play ensaio

Cada musico pode adicionar musicas ao `Play ensaio` no proprio aparelho.
A lista fica salva no navegador daquele aparelho e permite remover musicas adicionadas por engano.

## Base online do acervo

O importador gera uma base do acervo em:

```text
C:\Users\Pixel Midia 3D\Cifras MDL\data\acervo-db.json
```

E salva cada cifra indexada em:

```text
C:\Users\Pixel Midia 3D\Cifras MDL\data\songs
```

O servidor usa essa base para entregar o catalogo online pelas APIs:

```text
http://localhost:3030/api/catalog
http://localhost:3030/api/songs/ID_DA_MUSICA
http://localhost:3030/api/offline-bundle
```

## Offline automatico

Quando o musico adiciona uma musica ao `Culto de Domingo`, o app baixa a cifra automaticamente para o armazenamento local do aparelho.

Depois de baixada, a musica fica disponivel offline naquele celular ou navegador, mesmo se a conexao cair durante o culto.

O app tambem instala um service worker para manter a estrutura principal do sistema disponivel offline.

## Publicacao online

O projeto ja esta preparado para subir no Render com disco persistente:

```text
render.yaml
```

Resumo do fluxo:

1. Envie o projeto para um repositorio GitHub.
2. No Render, crie um Web Service a partir desse repositorio.
3. Use o `render.yaml` da raiz para subir a aplicacao.
4. O disco persistente fica montado em `data/`, onde o sistema guarda o banco do acervo e as cifras indexadas.

Se quiser publicar atualizacoes do acervo sem expor o robo, rode o importador no seu PC e envie os arquivos gerados em `data/` junto com o deploy do sistema.
