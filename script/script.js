axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes = [];
let myQuizzes;
let selectedQuizz;


showQuizzes();


/////////////////////////////FUNÇÕES GERAIS/////////////////////////////////////////////////

function showScreen(n) {
    if (n === 1) {
        document.querySelector('.tela1').style.display = 'flex';
        document.querySelector('.tela2').style.display = 'none';
        document.querySelector('.tela3').style.display = 'none';
    } else if (n === 2) {
        document.querySelector('.tela1').style.display = 'none';
        document.querySelector('.tela2').style.display = '';
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
    // myQuizzes = [
    //                 {id: 16},
    //                 {id: 17},
    //                 {id: 13},
    //                 {id: 14}
    //             ];

    myQuizzes = '';
}
////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////FUNÇÕES TELA 1///////////////////////////////////////////////////////

function showQuizzes() {
    showScreen(1);
    getMyQuizzes();

    if (myQuizzes) { //Se myQuizzes não for vazio ou undefined
        document.querySelector('.tela1 .myQuizzes').style.display = 'flex';
        document.querySelector('.tela1 .makeAQuizz').style.display = 'none';
    } else {
        document.querySelector('.tela1 .myQuizzes').style.display = 'none';
        document.querySelector('.tela1 .makeAQuizz').style.display = 'flex';
    }

    const promise = getAllQuizzes();
    promise.then(response => {
        allQuizzes = response.data;

        let arrayMyQuizzes = [];
        let arrayNotMyQuizzes = [];
        [arrayMyQuizzes, arrayNotMyQuizzes] = separateMyquizzesandNotMyQuizzes(arrayMyQuizzes, arrayNotMyQuizzes);

        if (myQuizzes) { //Se myQuizzes não for vazio ou undefined
            renderQuizzes('.tela1 .myQuizzes', arrayMyQuizzes);
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
    if (myQuizzes) { //Se myQuizzes não for vazio ou undefined
        allQuizzes.forEach(quiz => {
            if(myQuizzes.some(myQuizId => quiz.id === myQuizId.id)) {
                arrayMyQuizzes.push(quiz);
            } else {
                arrayNotMyQuizzes.push(quiz);
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
    } else {
        container.innerHTML = `<div class="container-title">Seus Quizzes 
                                    <button onclick="makeAQuizz()"><ion-icon name="add-circle"></ion-icon></button>
                               </div>`;
    }

    Quizzes.forEach(quiz => {
        container.innerHTML += `
            <div class="quiz-card" onclick="playQuizz(${quiz.id})">
                <h2>${quiz.title}</h2>
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


/* FUNÇÕES TELA 2 */
//////////////////////////////////////////////////////////////////////////////////////////

let totalPerguntas = 0;
let totalAcertos = 0;
let perguntasRespondidas = 0;
const perguntas = document.getElementById('quizResult');

function renderQuizz(question) {
  const containerPerguntas = document.createElement('div');
  containerPerguntas.className = 'container-perguntas';
  perguntas.appendChild(containerPerguntas);

  const perguntasQuiz = document.createElement('div');
  perguntasQuiz.className = 'perguntas-quiz';
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
          resposta.style.pointerEvents = "none";
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
    const levelContainer = document.querySelector('.level-container');
    
    // Cria um novo elemento button
    const resetButton = document.createElement('button');
    resetButton.classList.add('reset-button');
    resetButton.innerHTML = 'Resetar Quizz';
    resetButton.addEventListener('click', resetQuizz); // Adiciona o evento de clique ao botão
    levelContainer.appendChild(resetButton); // Adiciona o botão à div 'level-container'

     // Cria um novo elemento button para voltar à home
  const homeButton = document.createElement('button');
  homeButton.classList.add('home-button');
  homeButton.innerHTML = 'Voltar à Home';
  homeButton.addEventListener('click', showQuizzes); // Adiciona o evento de clique ao botão
  levelContainer.appendChild(homeButton); // Adiciona o botão à div 'level-container'
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
    selectedQuizz.levels.forEach(level => {
        if (!levelEncontrado && porcentagemAcertos >= level.minValue) {
            // Crie um novo elemento div para exibir os detalhes do level
            const levelContainer = document.createElement('div');
            levelContainer.className = 'level-container'; // Classe personalizada para o container do level

            // Crie um novo elemento div para exibir o título do level com a porcentagem de acertos
            const levelTitle = document.createElement('div');
            levelTitle.innerHTML = `${porcentagemAcertosArredondada}% de acerto:${level.title}`;
            levelTitle.className = 'level-title'; // Classe personalizada para o título do level
            levelContainer.appendChild(levelTitle);

            // Crie um novo elemento img para exibir a imagem do level
            const levelImage = document.createElement('img');
            levelImage.src = level.image;
            levelImage.alt = `${level.title}`;
            levelImage.className = 'level-image'; // Classe personalizada para a imagem do level
            levelContainer.appendChild(levelImage);

            // Crie um novo elemento div para exibir o texto do level
            const levelText = document.createElement('div');
            levelText.innerHTML = `${level.text}`;
            levelText.className = 'level-text'; // Classe personalizada para o texto do level
            levelContainer.appendChild(levelText);

            resultadoContainer.appendChild(levelContainer);
            levelEncontrado = true;

            criarBotaoReset()
        }
    });

  }


  function playQuizz(quizzSelecionado) {
    // Rolando a página para o topo
    window.scrollTo(0, 0);
  
    selectedQuizz = allQuizzes.find(quiz => quiz.id === quizzSelecionado);
    console.log(selectedQuizz);
  
    const quizResultElement = document.getElementById('quizResult');
    if (quizResultElement) { 
        quizResultElement.innerHTML = `        
        <div class="header-pergunta" ><span>${selectedQuizz.title}</span></div> 
        `;
    }

    quizResultElement.querySelector('.header-pergunta').style.backgroundImage = `url(${selectedQuizz.image})`;
    const sectionPerguntas = quizResultElement.querySelector('.container-perguntas');
    selectedQuizz.questions.forEach(renderQuizz)

    showScreen(2);
}



    
     



/* FUNÇÕES TELA 3 */
//////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////FUNÇÕES TELA 3/////////////////////////////////////////

function makeAQuizz() {
    showScreen(3);
}

function prossegueCriarPerguntas() {
    const paginaAnterior = document.querySelector('.infoQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.perguntasQuizz');
    proximaPagina.classList.remove('esconde-tela')
}

function prossegueCriarNiveis() {
    const paginaAnterior = document.querySelector('.perguntasQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.niveisQuizz');
    proximaPagina.classList.remove('esconde-tela')
} 

function prossegueFinalizarQuizz() {
    const paginaAnterior = document.querySelector('.niveisQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.sucessoQuizz');
    proximaPagina.classList.remove('esconde-tela')
} 

function acessarQuizz() {
    const paginaAnterior = document.querySelector('.sucessoQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.infoQuizz');
    proximaPagina.classList.remove('esconde-tela')

    playQuizz();
} 

function voltarHome() {
    const paginaAnterior = document.querySelector('.sucessoQuizz');
    paginaAnterior.classList.add('esconde-tela')

    const proximaPagina = document.querySelector('.infoQuizz');
    proximaPagina.classList.remove('esconde-tela')

    showQuizzes();
}

///////////////////////////////////FIM FUNÇÕES TELA 3/////////////////////////////////////////
