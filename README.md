# radio-id

## 🚀 Projeto
Identifique a música que está tocando agora em sua estação de rádio favorita!

<div align="center">
  <img 
    width="50%" 
    alt="radio-id"
    title="radio-id" 
    src="/github_assets/radio-id.jpeg"
  />
</div>

## 🧊 Cool features:
- Identificação direto do stream da rádio, sem uso do microfone do dispositivo!

## 🛠️ Tecnologias
Esse projeto utiliza o framework [ffmpeg](https://ffmpeg.org), ferramenta que deve ser instalada localmente. Alternativamente, você pode usar o pacote npm [@ffmpeg-installer](https://www.npmjs.com/package/@ffmpeg-installer/ffmpeg) para baixar o arquivo binário do ffmpeg.

## 🗂️ Utilização

### 🐑🐑 Clonando o repositório:

```bash
  $ git clone url-do-projeto.git
```

### ▶️ Rodando o App:
```bash
  $ cd radio-id   #change to that directory

  # Localhost:
  $ npm install   #download dependencies to node_modules
  $ npm run dev   #start the project

  # Docker - with docker-compose.yaml:
  $ docker compose up          #build the image and runs the container

  # Docker - with Dockerfile:
  $ docker build -t name-of-docker-image .             #build the image
  $ docker run -it -p 4000:4000 name-of-docker-image   #run the container - foreground
  $ docker run -d -p 4000:4000 name-of-docker-image    #run the container - background
```

### 💻 Rotas HTTP:
#### baseURL Dev: <code>http://localhost:4000</code>
#### baseURL Prod: <code>https://radio-id-service-225963718403.southamerica-east1.run.app</code>
#### GET <code>{baseURL}/api/v1/id/{query}</code>
#### Output:
```json
{
  "timestamp":1717126464818,
  "track": {
    "title": "Space Truckin'",
    "artist": "Deep Purple",
    "album": {
      "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/09/70/d0/0970d0fa-a46d-049b-125c-d131171fce1c/603497877393.jpg/400x400cc.jpg",
      "title": "Machine Head",
      "year": "1972",
    }
  },
  "radio": {
    "name": "Kiss FM - 92.5",
    "state": "São Paulo",
    "countrycode": "BR",
    "stream": "https://26593.live.streamtheworld.com/RADIO_KISSFM_ADP.aac",
    "site": "https://kissfm.com.br/",
    "icon": "https://kissfm.com.br/wp-content/uploads/2024/05/KISSFMSP.svg",
  }
}
```

### 📻 Rádios:

<!-- KISS FM -->
- <a href="https://tunein.com/radio/Kiss-FM-São-Paulo-1021-s6165/">
    <img 
      width="75px"
      alt="logo_kiss_fm" 
      src="https://cdn-profiles.tunein.com/s6165/images/logod.png?t=636927382740000000"
    />
    Kiss FM - São Paulo, BR 🇧🇷
  </a>
Ouça agora: <code>https://tunein.com/radio/Kiss-FM-São-Paulo-1021-s6165/</code></br>
Tocando agora:<code>[https://radio-id.app/api/v1/id/name=kiss_fm&countrycode=BR](https://radio-id-service-225963718403.southamerica-east1.run.app/api/v1/id/name=kiss_fm&countrycode=BR)</code>

<!-- 89 -->
- <a href="https://tunein.com/89fmaradiorock/">
    <img 
      width="75px"
      alt="logo_89_a_radio_rock" 
      src="https://cdn-profiles.tunein.com/s85089/images/logod.jpg?t=638023933120000000"
    />
    89 - A Rádio Rock - São Paulo, BR 🇧🇷
  </a>
Ouça agora: <code>https://tunein.com/89fmaradiorock/</code></br>
Tocando agora:<code>[https://radio-id.app/api/v1/id/name=89_fm&countrycode=BR](https://radio-id-service-225963718403.southamerica-east1.run.app/api/v1/id/name=89_fm&countrycode=BR)</code>

<!-- FOX ROCK -->
- <a href="https://tunein.com/radio/RADIO-FOX-ROCK-879-s120826/">
    <img 
      width="75px"
      alt="logo_fox_rock" 
      src="https://cdn-profiles.tunein.com/s120826/images/logod.png?t=636565167687330000"
    />
    Fox Rock - Sorocaba, BR 🇧🇷
  </a>
Ouça agora: <code>https://tunein.com/radio/RADIO-FOX-ROCK-879-s120826/</code></br>
Tocando agora:<code>[https://radio-id.app/api/v1/id/name=fox_rock&countrycode=BR](https://radio-id-service-225963718403.southamerica-east1.run.app/api/v1/id/name=fox_rock&countrycode=BR)</code>

<!-- RADIO CITY -->
- <a href="https://tunein.com/radio/Radio-City-994-s14840/">
    <img 
      width="75px"
      alt="logo_radio_city" 
      src="https://cdn-profiles.tunein.com/s14840/images/logod.png?t=638874318730000000"
    />
    Radio City - Helsinki, Finlândia 🇫🇮
  </a>
Ouça agora: <code>https://tunein.com/radio/Radio-City-994-s14840/</code></br>
Tocando agora:<code>[https://radio-id.app/api/v1/id/name=radio_city&countrycode=FI](https://radio-id-service-225963718403.southamerica-east1.run.app/api/v1/id/name=radio_city&countrycode=FI)</code>
