axios.defaults.headers.common['Authorization'] = '6egTHlqTKMxEUcF23T3ePOB9';

let allQuizzes;
let myQuizzes;

function getAllQuizzes() {
    const promise = axios.get('https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes');
    promise.then(response => {
      const allQuizzes = response.data;
      console.log('Quizzes data:', allQuizzes); // Log quizzes data to console
    }).catch(error => {
      console.error('Error fetching quizzes:', error);
    });
  }
  

function getMyquizzes() {
    
}