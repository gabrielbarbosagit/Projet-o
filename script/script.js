axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes;
let myQuizzes;

showQuizzes();

function getAllQuizzes() {
    const promise = axios.get('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes');
    promise.then(response => allQuizzes = response.data);
}

function getMyquizzes() {
    
    if (myQuizzes) {
        renderQuizzes('.myQuizzes ul', arrayMyQuizzes);
    }

    renderQuizzes('.allQuizzes ul', arrayMyQuizzes);
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
                                    <li class="quiz sobreposition">
                                        <img src=${quiz.image}>
                                        <h2>${quiz.title}</h2>
                                    </li>
                                `;
                             })
}