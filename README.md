# radio-id

## 🚀 Projeto
Identifique a música que está tocando agora em sua estação de rádio favorita!

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
  $ docker run -it -p 4000:4000 name-of-docker-image   #run the container - foregroud
  $ docker run -d -p 4000:4000 name-of-docker-image    #run the container - background
```

### 💻 Rotas HTTP:
#### baseURL: <code>http://localhost:4000</code>
#### GET <code>{baseURL}/recognise/{streamURLencodedAsURI}</code>
#### Output:
```json
{
  "timestamp":1717126464818,
  "title":"Space Truckin'",
  "artist":"Deep Purple",
  "album":{
    "cover":"https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/09/70/d0/0970d0fa-a46d-049b-125c-d131171fce1c/603497877393.jpg/400x400cc.jpg",
    "title":"Machine Head",
    "year":"1972",
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
    Kiss FM - São Paulo, BR
  </a>
Stream: <code>https://cloud2.cdnseguro.com:20000/;</code></br>
Teste: 
[Dev](http://localhost:4000/recognise/https%3A%2F%2Fcloud2.cdnseguro.com%3A20000%2F%3B) | 
[Prod](https://radio-id-service-3qh6bgqgpq-rj.a.run.app/recognise/https%3A%2F%2Fcloud2.cdnseguro.com%3A20000%2F%3B)

<!-- 89 -->
- <a href="https://tunein.com/89fmaradiorock/">
    <img 
      width="75px"
      alt="logo_89_a_radio_rock" 
      src="https://cdn-profiles.tunein.com/s85089/images/logod.jpg?t=638023933120000000"
    />
    89 - A Rádio Rock - São Paulo, BR
  </a>
Stream: <code>http://24373.live.streamtheworld.com/RADIO_89FMAAC.aac</code></br>
Teste: 
[Dev](http://localhost:4000/recognise/http%3A%2F%2F24373.live.streamtheworld.com%2FRADIO_89FMAAC.aac) | 
[Prod](https://radio-id-service-3qh6bgqgpq-rj.a.run.app/recognise/http%3A%2F%2F24373.live.streamtheworld.com%2FRADIO_89FMAAC.aac)

<!-- FOX ROCK -->
- <a href="https://tunein.com/radio/RADIO-FOX-ROCK-879-s120826/">
    <img 
      width="75px"
      alt="logo_fox_rock" 
      src="https://cdn-profiles.tunein.com/s120826/images/logod.png?t=636565167687330000"
    />
    Fox Rock - Sorocaba, BR
  </a>
Stream: <code>https://bcast.brapostreaming.com.br/radio/8000/radio.mp3</code></br>
Teste: 
[Dev](http://localhost:4000/recognise/https%3A%2F%2Fbcast.brapostreaming.com.br%2Fradio%2F8000%2Fradio.mp3) | 
[Prod](https://radio-id-service-3qh6bgqgpq-rj.a.run.app/recognise/https%3A%2F%2Fbcast.brapostreaming.com.br%2Fradio%2F8000%2Fradio.mp3)
