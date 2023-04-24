axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes = [];
let myQuizzes;
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
    const myQuizzesIdSerializado = localStorage.getItem('id');
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
////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////FUNÇÕES TELA 1///////////////////////////////////////////////////////

function showQuizzes() {
    showScreen(1);
    getMyQuizzes();

    if (myQuizzesId) { //Se myQuizzes não for vazio ou undefined
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

        if (myQuizzesId) { //Se myQuizzes não for vazio ou undefined
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
    if (myQuizzesId) { //Se myQuizzes não for vazio ou undefined
        allQuizzes.forEach(quiz => {
            if(myQuizzesId.some(myQuizId => quiz.id === myQuizId.id)) {
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
                                    <button data-test="create-btn" onclick="makeAQuizz()"><ion-icon name="add-circle"></ion-icon></button>
                               </div>`;
    }

    Quizzes.forEach(quiz => {
        container.innerHTML += `
            <div data-test="others-quiz" class="quiz-card" onclick="playQuizz(${quiz.id})">
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
    document.querySelector('.level-container').innerHTML = ''; // Limpa o conteúdo da div 'perguntas'
    levelContainer.innerHTML = '' // Limpa o conteúdo da div 'level-container'
    playQuizz(selectedQuizz.id); // Chama a função 'playQuizz' para reiniciar o quizz
  }
  
  // Função para criar o botão de reset na div 'level-container'
  function criarBotaoReset() {
    const levelContainer = document.querySelector('.level-container');
    
    // Cria um novo elemento button
    const resetButton = document.createElement('button');
    resetButton.classList.add('reset-button');
    resetButton.setAttribute('data-test', 'restart');
    resetButton.innerHTML = 'Resetar Quizz';
    resetButton.addEventListener('click', resetQuizz); // Adiciona o evento de clique ao botão
    levelContainer.appendChild(resetButton); // Adiciona o botão à div 'level-container'

     // Cria um novo elemento button para voltar à home
  const homeButton = document.createElement('button');
  homeButton.classList.add('home-button');
  homeButton.setAttribute('data-test', 'go-home');
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
        selectedQuizz.levels.forEach((level, index) => {
        if ((!levelEncontrado && porcentagemAcertos < selectedQuizz.levels[index+i].minValue) || (!levelEncontrado && index === selectedQuizz.levels.length - 1) ) {
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


  function playQuizz(quizzSelecionado) {
    // Rolando a página para o topo
    window.scrollTo(0, 0);

    selectedQuizz = allQuizzes.find(quiz => quiz.id === quizzSelecionado);
    console.log(selectedQuizz);
  
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
}

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
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta1_pergunta1" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta1" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta2_pergunta1" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta1" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta3_pergunta1" type="text" placeholder="URL da imagem 3">
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
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta1_pergunta2" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta2" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta2_pergunta2" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta2" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta3_pergunta2" type="text" placeholder="URL da imagem 3">
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
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta1_pergunta3" type="text" placeholder="URL da imagem 1">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta2_pergunta3" type="text" placeholder="Resposta incorreta 2">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta2_pergunta3" type="text" placeholder="URL da imagem 2">
                        <p></p>
                        <input data-test="wrong-answer-input" class="resposta_incorreta3_pergunta3" type="text" placeholder="Resposta incorreta 3">
                        <input data-test="wrong-answer-input" class="url_resposta_incorreta3_pergunta3" type="text" placeholder="URL da imagem 3">
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
            localStorage.setItem('id', myQuizzesIdSerializado);
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