axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes;
let myQuizzes;

showQuizzes();

showScreen(2);


function playQuizz(quizzSelecionado){
    showScreen(2)
    // pegar o nome do quiz // h2 quiz selecionado
    // pesquisar o quiz no all quizzes usando o title // hof find
    // depois que achou, pegar o objeto para renderizar o objeto na tela 
    // onclick - mudar o display
    // contabilizar os acertos
    // comparar com o numero quizz
    // montar a porcentagem de acerto
    // display a comparacao e sucesso ou nao
    // habilita dois botoes 1- reset pro proprio quizz 2- se clicar ele volta pra showquizzes
    


}

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
    myQuizzes = [];
}

function showQuizzes() {
    document.querySelector('.tela1').style.display = 'flex';
    document.querySelector('.tela2').style.display = 'none';
    document.querySelector('.tela3').style.display = 'none';
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
        separateMyquizzesandNotMyQuizzes(arrayMyQuizzes, arrayNotMyQuizzes);

        if (myQuizzes) {
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
}

function renderQuizzes(adress, Quizzes) {
    const container = document.querySelector(adress);
    container.innerHTML = '';

    Quizzes.forEach(quiz => {
        container.innerHTML += `
            <div class="quiz sobreposition">
                <img src=${quiz.image}>
                <h2>${quiz.title}</h2>
            </div>
        `;
        })
}