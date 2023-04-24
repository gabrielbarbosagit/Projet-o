axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes = [];
let myQuizzesId = [];
let selectedQuizz;

/////////////////////////////FUNÇÕES GERAIS/////////////////////////////////////////////////

function showScreen(n) {
    if (n === 1) {
        document.querySelector('.tela1').style.display = 'flex';
        document.querySelector('.tela2').style.display = 'none';
        document.querySelector('.tela3').style.display = 'none';
    } else if (n === 2) {
        document.querySelector('.tela1').style.display = 'none';
        document.querySelector('.tela2').style.display = 'flex';
        document.querySelector('.tela3').style.display = 'none';
        document.querySelector('.tela3').style.display = 'none';
    } else {
        document.querySelector('.tela1').style.display = 'none';
        document.querySelector('.tela2').style.display = 'none';
        document.querySelector('.tela3').style.display = 'flex';
    }
}

function getAllQuizzes() { 
    const promise = axios.get('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes');    
    return promise;
}

function getMyQuizzes() {
    const myQuizzesIdSerializado = localStorage.getItem('ids');
    myQuizzesId = JSON.parse(myQuizzesIdSerializado);

    if(myQuizzesId === null) {
        myQuizzesId = [];
    }
}

function myQuizz() {
    const paginaAnterior = document.querySelector('.sucessoQuizz');
    paginaAnterior.classList.add('esconde-tela')

    let id = myQuizzesId[myQuizzesId.length - 1].id;

    const promise = axios.get('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes');
    promise.then(response => {
        allQuizzes = response.data;
        playQuizz(id);
    }).catch(error => {
        alert(`Erro ao tentar acessar o servidor\n
              ${error.status}\n
              ${error.statusMessage}`);

        window.location.reload();        
    })   
}

function getById(id) {
    const promise = axios.get(`https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes/${id}`);

    return promise;
}
////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////FUNÇÕES TELA 1///////////////////////////////////////////////////////

function showQuizzes() {
    
    getMyQuizzes();

    const promise = getAllQuizzes();
    promise.then(response => {
        console.log(response.data);
        allQuizzes = response.data;

        let arrayMyQuizzes = [];
        let arrayNotMyQuizzes = [];
        [arrayMyQuizzes, arrayNotMyQuizzes] = separateMyquizzesandNotMyQuizzes(arrayMyQuizzes, arrayNotMyQuizzes);
        console.log(arrayMyQuizzes);

        if (arrayMyQuizzes.length > 0) { //Se myQuizzes não for vazio
            renderQuizzes('.tela1 .myQuizzes', arrayMyQuizzes);
            document.querySelector('.tela1 .myQuizzes').style.display = 'flex';
            document.querySelector('.tela1 .makeAQuizz').style.display = 'none';
            showScreen(1);
        } else {
            document.querySelector('.tela1 .myQuizzes').style.display = 'none';
            document.querySelector('.tela1 .makeAQuizz').style.display = 'flex';
            showScreen(1);
        }
        
        renderQuizzes('.tela1 .allQuizzes', arrayNotMyQuizzes);
    }).catch(error => {
        alert(`Erro ao tentar acessar o servidor\n
              ${error.status}\n
              ${error.statusMessage}`);

        window.location.reload();
    })
    
}

function separateMyquizzesandNotMyQuizzes(arrayMyQuizzes, arrayNotMyQuizzes) {
    if (myQuizzesId.length > 0) { //Se myQuizzes não for vazio
        allQuizzes.forEach(searchedQuiz => {
            if(myQuizzesId.some(quiz => quiz.id === searchedQuiz.id)) {
                arrayMyQuizzes.push(searchedQuiz);
            } else {
                arrayNotMyQuizzes.push(searchedQuiz);
            }
        });
    } else {
        arrayNotMyQuizzes = allQuizzes;
    }

    return [arrayMyQuizzes, arrayNotMyQuizzes]
}

function renderQuizzes(adress, Quizzes) {
    const container = document.querySelector(adress);

    if (adress === '.tela1 .allQuizzes') {
        container.innerHTML = '<div class="container-title">Todos os Quizzes</div>';

        Quizzes.forEach(quiz => {
            container.innerHTML += `
                <div data-test="others-quiz" class="quiz-card" onclick="playQuizz(${quiz.id})">
                    <h2>${quiz.title}</h2>
                    <img class="" src="${quiz.image}" alt="">
                </div>
            `;
    
            container.querySelector('div:last-child').style.backgroundImage = `linear-gradient(
                180deg, 
                transparent,
                rgba(0, 0, 0, 0.5) 65%, 
                #000000 100%),
                url(${quiz.image})`;
            container.querySelector('div:last-child').style.backgroundSize = '340px 181px';
            });
    } else {
        container.innerHTML = `<div class="container-title">Seus Quizzes 
                                    <button data-test="create-btn" onclick="makeAQuizz()"><ion-icon name="add-circle"></ion-icon></button>
                               </div>`;
        
        Quizzes.forEach(quiz => {
        container.innerHTML += `
            <div data-test="my-quiz" class="quiz-card" onclick="playQuizz(${quiz.id})">                
                <h2>${quiz.title}</h2>
                <img class="" src="${quiz.image}" alt="">
            </div>
        `;

        container.querySelector('div:last-child').style.backgroundImage = `linear-gradient(
            180deg, 
            transparent,
            rgba(0, 0, 0, 0.5) 65%, 
            #000000 100%),
            url(${quiz.image})`;
        container.querySelector('div:last-child').style.backgroundSize = '340px 181px';
        });
    }
}


/* FUNÇÕES TELA 2 */
//////////////////////////////////////////////////////////////////////////////////////////

let totalPerguntas = 0;
let totalAcertos = 0;
let perguntasRespondidas = 0;
const perguntas = document.getElementById('quizResult');



function renderQuizz(question) {
  const containerPerguntas = document.createElement('div');
  containerPerguntas.className = 'container-perguntas';
  containerPerguntas.setAttribute('data-test', 'question');
  perguntas.appendChild(containerPerguntas);

  const perguntasQuiz = document.createElement('div');
  perguntasQuiz.className = 'perguntas-quiz';
  perguntasQuiz.setAttribute('data-test', 'question-title');
  perguntasQuiz.innerHTML = question.title;
  containerPerguntas.appendChild(perguntasQuiz);

  for (let i = 0; i < question.answers.length; i++) {
    const escolherImagem = document.createElement('div');
    escolherImagem.className = 'escolherImagem';
    containerPerguntas.appendChild(escolherImagem);

    const escolherImagemImg = document.createElement('div');
    escolherImagemImg.className = 'escolherImagem-img resposta-nSelecionada';
    escolherImagemImg.setAttribute('data-test', 'answer');
    escolherImagemImg.setAttribute('data-isCorrect', question.answers[i].isCorrectAnswer);
    escolherImagemImg.setAttribute('onclick', 'destacarRespostaEscolhida(this)');

    const imagemImg = document.createElement('div');
    imagemImg.className = 'imagem-img';
    imagemImg.style.backgroundImage = `url(${question.answers[i].image})`;
    escolherImagemImg.appendChild(imagemImg);

    const imagemText = document.createElement('p');
    imagemText.setAttribute('data-test', 'answer-text');
    imagemText.innerHTML = question.answers[i].text;
    escolherImagemImg.appendChild(imagemText);

    escolherImagem.appendChild(escolherImagemImg);
  }

  const titulopergunta = containerPerguntas.querySelector('.perguntas-quiz');
  titulopergunta.style.backgroundColor = question.color;

  totalPerguntas++;
}

function destacarRespostaEscolhida(answerElement) {
    const isCorrect = answerElement.getAttribute('data-isCorrect');
    const escolherImagem = answerElement.parentNode;
    answerElement.removeAttribute('onclick');
  
    if (isCorrect !== null && isCorrect !== '') {
      const isCorrectBool = JSON.parse(isCorrect);
  
      if (isCorrectBool) {
        answerElement.style.color = "green";
        totalAcertos++;
      } else {
        answerElement.style.color = "red";
      }
  
      const todasAsRespostas = escolherImagem.parentNode.querySelectorAll('.escolherImagem-img');
  
      todasAsRespostas.forEach(resposta => {
        if (resposta !== answerElement) {
          resposta.removeAttribute('onclick');

          const isCorrect = resposta.getAttribute('data-isCorrect');
          const isCorrectBool = JSON.parse(isCorrect);

          if (isCorrectBool) {
            resposta.style.color = "green";
          } else {
            resposta.style.color = "red";
          }

          resposta.style.opacity = 0.6;
        }
      });
  
      perguntasRespondidas++;
  
      if (perguntasRespondidas === totalPerguntas) {
        exibirResultadoFinal();
      }
  
// Função de scroll após 2 segundos
setTimeout(function() {
    // Obter o próximo elemento de pergunta
    var proximaPergunta = answerElement.closest('.container-perguntas').nextElementSibling;
  
    // Verificar se existe um próximo elemento de pergunta e se não é null
    if (proximaPergunta !== null && proximaPergunta !== undefined) {
      // Fazer o scroll para o próximo elemento de pergunta
      proximaPergunta.scrollIntoView({
        behavior: 'smooth', // Opção para suavizar o scroll
        block: 'start' // Opção para posicionar o início do elemento no topo da janela
      });
    }
  }, 2000); // 2 segundos de atraso (2000 milissegundos)
  
}
  } 


  function resetQuizz() {
    totalPerguntas = 0;
    totalAcertos = 0;
    perguntasRespondidas = 0;
    perguntas.innerHTML = ''; // Limpa o conteúdo da div 'perguntas'
    playQuizz(selectedQuizz.id); // Chama a função 'playQuizz' para reiniciar o quizz
  }
  
  // Função para criar o botão de reset na div 'level-container'
  function criarBotaoReset() {
    const divButtons = document.createElement('div');
    
    // Cria um novo elemento button
    const resetButton = document.createElement('button');
    resetButton.classList.add('reset-button');
    resetButton.setAttribute('data-test', 'restart');
    resetButton.innerHTML = 'Resetar Quizz';
    resetButton.addEventListener('click', resetQuizz); // Adiciona o evento de clique ao 
    divButtons.appendChild(resetButton); // Adiciona o botão à div 'level-container'

     // Cria um novo elemento button para voltar à home
    const homeButton = document.createElement('button');
    homeButton.classList.add('home-button');
    homeButton.setAttribute('data-test', 'go-home');
    homeButton.innerHTML = 'Voltar à Home';
    homeButton.addEventListener('click', showQuizzes); // Adiciona o evento de clique ao botão
    divButtons.appendChild(homeButton); // Adiciona o botão à div 'level-container'

    // stylizando
    divButtons.style.display = 'flex';
    divButtons.style.flexDirection = 'column';
    divButtons.style.justifyContent = 'space-between';
    divButtons.style.marginTop = '50px';

    // Joga divButtons na tela 2
    perguntas.appendChild(divButtons);
}
  
  
  function exibirResultadoFinal() {
    // Remova a função de clique das respostas
    const todasAsRespostas = document.querySelectorAll('.escolherImagem-img');
    todasAsRespostas.forEach(resposta => {
        resposta.style.pointerEvents = "none";
    });

    const porcentagemAcertos = (totalAcertos / totalPerguntas) * 100;
    const porcentagemAcertosArredondada = Math.round(porcentagemAcertos);


    // Crie um novo elemento div para o resultado final
    const resultadoContainer = document.createElement('div');
    resultadoContainer.className = 'container-perguntas';
    perguntas.appendChild(resultadoContainer);

    // Encontre o level correspondente à porcentagem de acertos
    let levelEncontrado = false;

    //selectedQuizz.levels.forEach(level => {
        selectedQuizz.levels.forEach((level, index) => {
            if ( (!levelEncontrado && index === selectedQuizz.levels.length - 1) || (!levelEncontrado && porcentagemAcertos < selectedQuizz.levels[index+1].minValue)) {
        //if (!levelEncontrado && porcentagemAcertos >= level.minValue) {
            // Crie um novo elemento div para exibir os detalhes do level
            const levelContainer = document.createElement('div');
            levelContainer.className = 'level-container'; // Classe personalizada para o container do level

            // Crie um novo elemento div para exibir o título do level com a porcentagem de acertos
            const levelTitle = document.createElement('div');
            levelTitle.innerHTML = `${porcentagemAcertosArredondada}% de acerto:${level.title}`;
            levelTitle.className = 'level-title'; // Classe personalizada para o título do level
            levelTitle.setAttribute('data-test', 'level-title');
            levelContainer.appendChild(levelTitle);

            // Crie um novo elemento img para exibir a imagem do level
            const levelImage = document.createElement('img');
            levelImage.src = level.image;
            levelImage.alt = `${level.title}`;
            levelImage.className = 'level-image'; // Classe personalizada para a imagem do level
            levelImage.setAttribute('data-test', 'level-img');
            levelContainer.appendChild(levelImage);

            // Crie um novo elemento div para exibir o texto do level
            const levelText = document.createElement('div');
            levelText.innerHTML = `${level.text}`;
            levelText.className = 'level-text'; // Classe personalizada para o texto do level
            levelText.setAttribute('data-test', 'level-text');
            levelContainer.appendChild(levelText);

            resultadoContainer.appendChild(levelContainer);
            levelEncontrado = true;

            criarBotaoReset()
        }
    });

  }


  function playQuizz(idQuizzSelecionado) {
    // Rolando a página para o topo
    window.scrollTo(0, 0);

    const promise = getById(idQuizzSelecionado);
    promise.then(response => {
        selectedQuizz = response.data;
        const quizResultElement = document.getElementById('quizResult');
        if (quizResultElement) { 
            quizResultElement.innerHTML = `        
            <div data-test="banner" class="header-pergunta" ><span>${selectedQuizz.title}</span></div> 
            `;
        }
    
        quizResultElement.querySelector('.header-pergunta').style.backgroundImage = `url(${selectedQuizz.image})`;
        const sectionPerguntas = quizResultElement.querySelector('.container-perguntas');
    
        /* RANDOMIZA AS ALTERNATIVAS DAS QUESTOES */
        for(i = 0; i < selectedQuizz.questions.length; i++){
            selectedQuizz.questions[i].answers = selectedQuizz.questions[i].answers.sort(() => Math.random() - 0.5);
        }
        
        
        selectedQuizz.questions.forEach(renderQuizz)
    
        showScreen(2);
    }).catch(error => {
        alert(`Erro ao tentar acessar o servidor\n
              ${error.status}\n
              ${error.statusMessage}`);

        window.location.reload();
    })
}

///////////////////////////////////FUNÇÕES TELA 3/////////////////////////////////////////

function makeAQuizz() {
    showScreen(3);
    const paginaAnterior = document.querySelector('.infoQuizz');
    paginaAnterior.classList.remove('esconde-tela');
}

let qtdNiveis;
let qtdPerguntas;

let quizzEmConstrução = [{
	title: "",
	image: "",
	questions: [
		{
			title: "",
			color: "",
			answers: [
				{
					text: "",
					image: "",
					isCorrectAnswer: true
				},
				{
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				}
			]
		},
		{
			title: "",
			color: "",
			answers: [
				{
					text: "",
					image: "",
					isCorrectAnswer: true
				},
				{
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				}
			]
		},
		{
			title: "",
			color: "",
			answers: [
				{
					text: "",
					image: "",
					isCorrectAnswer: true
				},
				{
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				},
                {
					text: "",
					image: "",
					isCorrectAnswer: false
				}
			]
		}
	],
	levels: [
		{
			title: "",
			image: "",
			text: "",
			minValue: 0
		},
		{
			title: "",
			image: "",
			text: "",
			minValue: 50
		}
	]
},{
	title: "The lord of the rings! The Fellowship of Vuvuzela!",
	image: "https://media.tenor.com/FHPlYE4KQ0YAAAAd/pistolshrimps-vuvuzela.gif",
	questions: [
		{
			title: "'The Fellowship of the Vuvuzela' é uma adaptação cinematográfica de que filme?",
			color: "#014785",
			answers: [
				{
					text: "Moguerço",
					image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIP2D1HM5K0UjhDS9cDR4aiDniSd0Vm8JyuA&usqp=CAU",
					isCorrectAnswer: false
				},
				{
					text: "O Senhor dos Aneis - A Sociedade do Anel",
					image: "https://cdn.ome.lt/7xLwB7U7D9x5QTw89oQS5ShLcIQ=/1200x630/smart/extras/conteudos/LordCapa.jpg",
					isCorrectAnswer: true
				}
			]
		},
		{
			title: "Em 'The Fellowship of the Vuvuzela' qual a principal arma utilizada?",
			color: "#362541",
			answers: [
				{
					text: "Vuvuzelas",
					image: "https://s.rfi.fr/media/display/d3013cd6-0d33-11ea-8016-005056a9aa4d/w:1280/p:4x3/Vuvuzelas_Colors_0_0.jpg",
					isCorrectAnswer: true
				},
				{
					text: "Espadinhas",
					image: "https://www.sword-buyers-guide.com/images/xAnduril-1.jpg.pagespeed.ic.iy65IWo0ed.jpg",
					isCorrectAnswer: false
				}
			]
		},
		{
			title: "Em que Copa do Mundo de Futebol as Vuvuzelas ficaram conhecidas como armas de destruição em massa?",
			color: "#987456",
			answers: [
				{
					text: "2010 - Africa",
					image: "https://vidaequilibrio.com.br/wp-content/uploads/2010/06/uk.reuters.com_.jpg",
					isCorrectAnswer: true
				},
				{
					text: "2014 - Brasil",
					image: "https://m.i.uol.com.br/estilo/2010/06/24/como-assistir-aos-jogos-da-copa-no-trabalho-sem-cometer-gafes-1277397493356_300x300.jpg",
					isCorrectAnswer: false
				},
			]
		}
	],
	levels: [
		{
			title: "Você não gosta de Vuvuzela",
			image: "https://s.glbimg.com/es/ge/f/original/2010/08/10/usaxbra-061_62.jpg",
			text: "Graças a você as Vuvuzelas foram banidas :(",
			minValue: 0
		},
		{
			title: "The Vuvuzela Team",
			image: "https://static.vecteezy.com/system/resources/thumbnails/000/121/258/small_2x/free-vuvuzela-vector.jpg",
			text: "Por ser capaz de acertar pelo menos uma questão você acaba de entrar pro Team Vuvuzela!",
			minValue: 30
		}
	]
}
];

function prossegueCriarPerguntas() {
    let tituloQuiz = document.querySelector('.tituloQuiz');
    quizzEmConstrução[0].title = tituloQuiz.value;
    let insereTexto = document.querySelector('.tituloQuizzCriado');
    insereTexto.innerHTML = quizzEmConstrução[0].title;

    let urlQuiz = document.querySelector('.urlQuiz');
    quizzEmConstrução[0].image = urlQuiz.value;
    let insereImg = document.querySelector('.bannerQuizzPronto');
    insereImg.src = quizzEmConstrução[0].image;

    qtdPerguntas = Number(document.querySelector('.qtdPerguntas').value);

    qtdNiveis = Number(document.querySelector('.qtdNiveis').value);

    if(tituloQuiz.value.length < 20 || tituloQuiz.value.length > 65) {
        alert(`O título precisa ter entre 20 e 65 caracteres!\nSeu título digitado possui ${tituloQuiz.value.length} caracteres.`);
        } else if(!((urlQuiz.value.includes('http://')) || (urlQuiz.value.includes('https://')))){
                alert(`Sua URL não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
            } else if(qtdPerguntas < 3 || isNaN(qtdPerguntas)) {
                    alert(`A quantidade de perguntas deve ser de no mínimo 3.\nO valor digitado foi ${document.querySelector('.qtdPerguntas').value}.`);
                } else if(qtdNiveis < 2 || isNaN(qtdNiveis)) {
                        alert(`A quantidade de níveis deve ser de no mínimo 2.\nO valor digitado foi ${document.querySelector('.qtdNiveis').value}.`);
                    } else {

        /* INSERE MAIS PERGUNTAS NO QUIZ */
        if(qtdPerguntas > 3) {
            for(let i = 3; i < qtdPerguntas; i++){
                quizzEmConstrução[0].questions.push({
                    title: "Título da pergunta",
                    color: "#123456",
                    answers: [
                        {
                            text: "Texto da resposta 1",
                            image: "https://http.cat/411.jpg",
                            isCorrectAnswer: true
                        },
                        {
                            text: "Texto da resposta 2",
                            image: "https://http.cat/412.jpg",
                            isCorrectAnswer: false
                        },
                        {
                            text: "",
                            image: "",
                            isCorrectAnswer: false
                        },
                        {
                            text: "",
                            image: "",
                            isCorrectAnswer: false
                        }
                    ]
                });
            }
        }

        /* INSERE MAIS NIVEIS NO QUIZ */
        if(qtdNiveis > 2) {
            for(i = 2; i < qtdNiveis; i++) {
                quizzEmConstrução[0].levels.push({
                    title: "Título do nível",
                    image: "https://http.cat/411.jpg",
                    text: "Descrição do nível 1",
                    minValue: 0
                });
            }
        }

        /* INSERE PERGUNTAS NO HTML */
        const innerPerguntas = document.querySelector('.infosCriarPerguntas');
        for(i = 3; i < qtdPerguntas; i++) {
            innerPerguntas.innerHTML += `
                <div data-test="question-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input_pergunta${i+1}">
                <label data-test="toggle" for="accordion_input_pergunta${i+1}" class="accordion_label">Pergunta ${i+1}</label>
                    <div class="accordion_content">
                        <div class="p2">
                        <input data-test="question-input" class="texto_pergunta${i+1}" type="text" placeholder="Texto da pergunta">
                        <input data-test="question-color-input" class="fundo_pergunta${i+1}" type="text" placeholder="Cor de fundo da pergunta">
                        <p>Resposta correta</p>
                        <input data-test="correct-answer-input" class="resposta_correta_pergunta${i+1}" type="text" placeholder="Resposta correta">
                        <input data-test="correct-img-input" class="url_resposta_correta_pergunta${i+1}" type="text" placeholder="URL da imagem">
                        <p>Respostas incorretas</p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta1_pergunta${i+1}" type="text" placeholder="Resposta incorreta 1">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta1_pergunta${i+1}" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta${i+1}" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta2_pergunta${i+1}" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta${i+1}" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta3_pergunta${i+1}" type="text" placeholder="URL da imagem 3">
                    </div>  
                </div>
                </div>        
            `;
        }

        /* INSERE NIVEIS NO HTML */
        const innerNiveis = document.querySelector('.infosNiveis');
        for(i = 2; i < qtdNiveis; i++) {
            innerNiveis.innerHTML += `
                <div data-test="level-ctn" class="accordion">
                    <input type="checkbox" class="accordion_input" id="accordion_input${i+1}">
                    <label data-test="toggle" for="accordion_input${i+1}" class="accordion_label">Nível ${i+1}</label>
                    <div class="accordion_content">
                        <div class="p2">
                            <input data-test="level-input" class="tituloNivel${i+1}" type="text" placeholder="Título do nível">
                            <input data-test="level-percent-input" class="porcentagemNivel${i+1}" type="text" placeholder="% de acerto mínima">
                            <input data-test="level-img-input" class="urlNivel${i+1}" type="text" placeholder="URL da imagem do nível">
                            <textarea data-test="level-description-input" class="descriçãoNivel${i+1}" name="" id="" cols="30" rows="10" placeholder="Descrição do nível"></textarea>
                        </div>  
                    </div>
                </div>       
            `;
        }

        /* LIMPA VALORES DOS INPUTS */
        let limpaValue = document.querySelector('.tituloQuiz');
        limpaValue.value = "";

        limpaValue = document.querySelector('.urlQuiz');
        limpaValue.value = "";

        limpaValue = document.querySelector('.qtdPerguntas');
        limpaValue.value = "";

        limpaValue = document.querySelector('.qtdNiveis');
        limpaValue.value = "";        

        /* TRANSIÇÃO DE TELA */
        const paginaAnterior = document.querySelector('.infoQuizz');
        paginaAnterior.classList.add('esconde-tela')

        const proximaPagina = document.querySelector('.perguntasQuizz');
        proximaPagina.classList.remove('esconde-tela')
    }   
}

function prossegueCriarNiveis() {
    /* VARIAVEL PARA TESTE DE PADRAO '# + a até f ou A até F ou 0 até 9 com 6 caracteres */
    const regex = /^#([A-Fa-f0-9]{6})$/;
    
    for(let i = 1; i < qtdPerguntas + 1; i++) {
        /* VERIFICA SE TITULO TEM MAIS QUE 20 CARACTERES */
        let textoPergunta = document.querySelector(`.texto_pergunta${i}`).value;
        if(textoPergunta.length < 20) {
            return alert(`A texto da Pergunta ${i} possui ${textoPergunta.length} caracter(es).\nO texto da pergunta deve conter pelo menos 20 caracteres!`);
        } else {         
            quizzEmConstrução[0].questions[i - 1].title = textoPergunta;   
        }

        /* VERIFICA SE O INPUT TEM O PADRAO DE COR HEXADECIMAL*/
        let hexa = document.querySelector(`.fundo_pergunta${i}`).value;
        if(regex.test(hexa)) {
            quizzEmConstrução[0].questions[i - 1].color = hexa;
        } else {
            return alert(`A cor de fundo da Pergunta ${i} deve estar no formato hexadecimal.\nExemplos: #000000 ou #AFAFAF.\nO valor no campo é ${hexa}`);
        }

        /* VERIFICA SE CAMPO DA RESPOSTA CORRETA NÃO ESTÁ VAZIO */
        let respostaCorreta = document.querySelector(`.resposta_correta_pergunta${i}`).value;
        if(respostaCorreta === '') {
            return alert(`A resposta correta da Pergunta ${i} não pode estar vazia.\nPor gentileza, digite uma resposta.`);
        } else {
            quizzEmConstrução[0].questions[i - 1].answers[0].text = respostaCorreta;
        }

        /* VERIFICA SE A URL DA RESPOSTA CORRETA É VÁLIDA */
        let url = document.querySelector(`.url_resposta_correta_pergunta${i}`).value;
        if(!((url.includes('http://')) || (url.includes('https://')))) {
                return alert(`A URL da resposta correta da Pergunta ${i} não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
        } else {
            quizzEmConstrução[0].questions[i - 1].answers[0].image = url;
        }

        /* VERIFICA RESPOSTAS INCORRETAS */
        let respostaIncorreta1 = document.querySelector(`.resposta_incorreta1_pergunta${i}`).value;
        let urlRespostaIncorreta1 = document.querySelector(`.url_resposta_incorreta1_pergunta${i}`).value;
        let respostaIncorreta2 = document.querySelector(`.resposta_incorreta2_pergunta${i}`).value;
        let urlRespostaIncorreta2 = document.querySelector(`.url_resposta_incorreta2_pergunta${i}`).value;
        let respostaIncorreta3 = document.querySelector(`.resposta_incorreta3_pergunta${i}`).value;
        let urlRespostaIncorreta3 = document.querySelector(`.url_resposta_incorreta3_pergunta${i}`).value;
        let qtdRespostasIncorretas = 0;

        if((respostaIncorreta1 === '' && urlRespostaIncorreta1 === '') && (respostaIncorreta2 === '' && urlRespostaIncorreta2 === '') && (respostaIncorreta3 === '' && urlRespostaIncorreta3 === '')) {
            return alert(`A Pergunta ${i} deve haver ao menos uma resposta incorreta com sua url correspondente.`)
        }

        if(respostaIncorreta1 && urlRespostaIncorreta1) {
            if(!((urlRespostaIncorreta1.includes('http://')) || (urlRespostaIncorreta1.includes('https://')))) {
                return alert(`A URL da Resposta incorreta 1 da Pergunta ${i} não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
            }
            qtdRespostasIncorretas++;
        }

        if(respostaIncorreta2 && urlRespostaIncorreta2) {
            if(!((urlRespostaIncorreta2.includes('http://')) || (urlRespostaIncorreta2.includes('https://')))) {
                return alert(`A URL da Resposta incorreta 2 da Pergunta ${i} não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
            }
            qtdRespostasIncorretas++;
        }

        if(respostaIncorreta3 && urlRespostaIncorreta3) {
            if(!((urlRespostaIncorreta3.includes('http://')) || (urlRespostaIncorreta3.includes('https://')))) {
                return alert(`A URL da Resposta incorreta 3 da Pergunta ${i} não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
            }
            qtdRespostasIncorretas++;
        }
        
        

        /* COLOCA A RESPOSTA NO OBJ */
        if(qtdRespostasIncorretas < 1) {
            return alert(`Não foi encontrado nenhuma Resposta incorreta válida na Pergunta ${i}`);
        } else {            

            for(j = 0; j < qtdRespostasIncorretas; j++) {
                if(respostaIncorreta1 && urlRespostaIncorreta1) {
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].text = respostaIncorreta1;
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].image = urlRespostaIncorreta1;
                    j++;
                }
                if(respostaIncorreta2 && urlRespostaIncorreta2) {
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].text = respostaIncorreta2;
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].image = urlRespostaIncorreta2;
                    j++;
                }
                if(respostaIncorreta3 && urlRespostaIncorreta3) {
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].text = respostaIncorreta3;
                    quizzEmConstrução[0].questions[i - 1].answers[j + 1].image = urlRespostaIncorreta3;
                }
            }

            /* RETIRA RESPOSTA EM BRANCO */
            if(qtdRespostasIncorretas === 1){
                quizzEmConstrução[0].questions[i - 1].answers.pop();
                quizzEmConstrução[0].questions[i - 1].answers.pop();
            }
            if(qtdRespostasIncorretas === 2){
                quizzEmConstrução[0].questions[i - 1].answers.pop();
            }
        }
    }

    /* TRANSIÇÃO DE TELA */
    const paginaAnterior = document.querySelector('.perguntasQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.niveisQuizz');
    proximaPagina.classList.remove('esconde-tela')
} 

function prossegueFinalizarQuizz() {

    for(let i = 1; i < qtdNiveis + 1; i++) {

        /* VERIFICA TAMANHO DO TITULO */
        let tituloNivel = document.querySelector(`.tituloNivel${i}`).value;
        if(tituloNivel.length < 10) {
            return alert(`O título do nível ${i} possui ${tituloNivel.length} caracter(es).\nO título deve conter pelo menos 10 caracteres.`);
        } else {
            quizzEmConstrução[0].levels[i - 1].title = tituloNivel;
        }
    
        /* VERIFICA PORCENTAGEM */
        let porcentoNivel = document.querySelector(`.porcentagemNivel${i}`).value;
        if(porcentoNivel === '') {
            return alert(`A porcentagem de acerto mínima do Nível ${i} deve ser um número entre 0 e 100.\nO valor digitado foi: ${porcentoNivel}`);
        }
        porcentoNivel = Number(porcentoNivel);
        if(porcentoNivel > 100 || porcentoNivel < 0 || isNaN(porcentoNivel) || porcentoNivel === '') {
            return alert(`A porcentagem de acerto mínima do Nível ${i} deve ser um número entre 0 e 100.\nO valor digitado foi: ${document.querySelector(`.porcentagemNivel${i}`).value}`);
        } else {
            quizzEmConstrução[0].levels[i - 1].minValue = porcentoNivel;
        }
    
        /* VERIFICA URL */
        let url = document.querySelector(`.urlNivel${i}`).value;
        if(!((url.includes('http://')) || (url.includes('https://')))) {
                return alert(`A URL do Nivel ${i} não é válida!\nPor gentileza insira uma URL válida.\nEx: http://www.exemplo.com`);
        } else {
            quizzEmConstrução[0].levels[i - 1].image = url;
        }
    
        /* VERIFICA DESCRIÇÃO */
        let descriçãoNivel = document.querySelector(`.descriçãoNivel${i}`).value;
        if(descriçãoNivel.length < 30) {
            return alert(`A descrição do Nivel ${i} possui ${descriçãoNivel.length} caracter(es).\nA descrição do nível deve conter pelo menos 30 caracteres!`);
        } else {         
            quizzEmConstrução[0].levels[i - 1].text = descriçãoNivel;   
        }        
    }   
        /* VERIFICA SE ALGUM NIVEL TEM PORCENTAGEM 0 */
        let temZero = false;
        for(i = 0; i < qtdNiveis; i++) {
            if(quizzEmConstrução[0].levels[i].minValue === 0){
                temZero = true;
            }
        }
        if(!(temZero)){
            return alert('Ao menos um dos níveis deve ter a porcentagem = 0.')
        }

        /* VOLTA QTD DE PERGUNTAS PARA PADRÃO */
        const htmlPerguntas = document.querySelector('.infosCriarPerguntas');
        htmlPerguntas.innerHTML = `
            <div data-test="question-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input_pergunta1" checked>
                <label data-test="toggle" for="accordion_input_pergunta1" class="accordion_label">Pergunta 1</label>
                <div class="accordion_content">
                    <div class="p2">
                        <input data-test="question-input" class="texto_pergunta1" type="text" placeholder="Texto da pergunta">
                        <input data-test="question-color-input" class="fundo_pergunta1" type="text" placeholder="Cor de fundo da pergunta">
                        <p>Resposta correta</p>
                        <input data-test="correct-answer-input" class="resposta_correta_pergunta1" type="text" placeholder="Resposta correta">
                        <input data-test="correct-img-input" class="url_resposta_correta_pergunta1" type="text" placeholder="URL da imagem">
                        <p>Respostas incorretas</p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta1_pergunta1" type="text" placeholder="Resposta incorreta 1">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta1_pergunta1" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta1" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta2_pergunta1" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta1" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta3_pergunta1" type="text" placeholder="URL da imagem 3">
                    </div>  
                </div>
            </div>
            <div data-test="question-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input_pergunta2">
                <label data-test="toggle" for="accordion_input_pergunta2" class="accordion_label">Pergunta 2</label>
                <div class="accordion_content">
                    <div class="p2">
                        <input data-test="question-input" class="texto_pergunta2" type="text" placeholder="Texto da pergunta">
                        <input data-test="question-color-input" class="fundo_pergunta2" type="text" placeholder="Cor de fundo da pergunta">
                        <p>Resposta correta</p>
                        <input data-test="correct-answer-input" class="resposta_correta_pergunta2" type="text" placeholder="Resposta correta">
                        <input data-test="correct-img-input" class="url_resposta_correta_pergunta2" type="text" placeholder="URL da imagem">
                        <p>Respostas incorretas</p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta1_pergunta2" type="text" placeholder="Resposta incorreta 1">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta1_pergunta2" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta2" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta2_pergunta2" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta2" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta3_pergunta2" type="text" placeholder="URL da imagem 3">
                    </div>  
                </div>
            </div>
            <div data-test="question-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input_pergunta3">
                <label data-test="toggle" for="accordion_input_pergunta3" class="accordion_label">Pergunta 3</label>
                <div class="accordion_content">
                    <div class="p2">
                        <input data-test="question-input" class="texto_pergunta3" type="text" placeholder="Texto da pergunta">
                        <input data-test="question-color-input" class="fundo_pergunta3" type="text" placeholder="Cor de fundo da pergunta">
                        <p>Resposta correta</p>
                        <input data-test="correct-answer-input" class="resposta_correta_pergunta3" type="text" placeholder="Resposta correta">
                        <input data-test="correct-img-input" class="url_resposta_correta_pergunta3" type="text" placeholder="URL da imagem">
                        <p>Respostas incorretas</p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta1_pergunta3" type="text" placeholder="Resposta incorreta 1">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta1_pergunta3" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta3" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta2_pergunta3" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta3" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-img-input" class="url_resposta_incorreta3_pergunta3" type="text" placeholder="URL da imagem 3">
                    </div>  
                </div>
            </div>
        `;

        /* VOLTA QTD DE NIVEIS PARA PADRÃO */
        const htmlNiveis = document.querySelector('.infosNiveis');
        htmlNiveis.innerHTML = `
            <div data-test="level-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input" checked>
                <label data-test="toggle" for="accordion_input" class="accordion_label">Nível 1</label>
                <div class="accordion_content">
                    <div class="p2">
                        <input data-test="level-input" class="tituloNivel1" type="text" placeholder="Título do nível">
                        <input data-test="level-percent-input" class="porcentagemNivel1" type="text" placeholder="% de acerto mínima">
                        <input data-test="level-img-input" class="urlNivel1" type="text" placeholder="URL da imagem do nível">
                        <textarea data-test="level-description-input" class="descriçãoNivel1" name="" id="" cols="30" rows="10" placeholder="Descrição do nível"></textarea>
                    </div>  
                </div>
            </div>
            <div data-test="level-ctn" class="accordion">
                <input type="checkbox" class="accordion_input" id="accordion_input2">
                <label data-test="toggle" for="accordion_input2" class="accordion_label">Nível 2</label>
                <div class="accordion_content">
                    <div class="p2">
                        <input data-test="level-input" class="tituloNivel2" type="text" placeholder="Título do nível">
                        <input data-test="level-percent-input" class="porcentagemNivel2" type="text" placeholder="% de acerto mínima">
                        <input data-test="level-img-input" class="urlNivel2" type="text" placeholder="URL da imagem do nível">
                        <textarea data-test="level-description-input" class="descriçãoNivel2" name="" id="" cols="30" rows="10" placeholder="Descrição do nível"></textarea>
                    </div>  
                </div>
            </div>
        `;

        const paginaAnterior = document.querySelector('.niveisQuizz');
        paginaAnterior.classList.add('esconde-tela');

        const proximaPagina = document.querySelector('.sucessoQuizz');
        proximaPagina.classList.remove('esconde-tela');

        const promise = axios.post('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes', quizzEmConstrução[0]);
        promise.then(resposta => { myQuizzesId.push({id: resposta.data.id}); 
            let myQuizzesIdSerializado = JSON.stringify(myQuizzesId);
            localStorage.setItem('ids', myQuizzesIdSerializado);
        });

        promise.catch(resposta => console.log(resposta));    
}

function acessarQuizz() {
    myQuizz();
} 

function voltarHome() {
    const paginaAnterior = document.querySelector('.sucessoQuizz');
    paginaAnterior.classList.add('esconde-tela')

    /* ATUALIZA QUIZES */
    const promise = axios.get('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes');
    promise.then(response => {
        allQuizzes = response.data;
    }).catch(error => {
        alert(`Erro ao tentar acessar o servidor\n
              ${error.status}\n
              ${error.statusMessage}`);

        window.location.reload();        
    })

    showQuizzes();
}

///////////////////////////////////FIM FUNÇÕES TELA 3/////////////////////////////////////////


/* STARTA QUIZ */
showQuizzes();