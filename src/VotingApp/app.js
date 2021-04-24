var http = new XMLHttpRequest();
var url = '/api/voting';

var catsKey = 'cats'
var dogsKey = 'dogs'

function refreshView(){
  var catsCount = parseInt(window.sessionStorage.getItem(catsKey), 10);
  var dogsCount = parseInt(window.sessionStorage.getItem(dogsKey), 10);
  var catsLabel = document.getElementById('lblCats');
  var dogsLabel = document.getElementById('lblDogs');

  console.log(catsCount, dogsCount);

  catsLabel.innerHTML = catsCount;
  dogsLabel.innerHTML = dogsCount;
}

function displayError(text) {
  var errorLabel = document.getElementById('lblError');
  errorLabel.innerHTML = text;
}

function refreshState(){
  http.open('GET', url, true);
  http.setRequestHeader('Content-Type', 'application/json');
  http.onreadystatechange = () => {
    if (http.readyState == XMLHttpRequest.DONE) {
      var response = JSON.parse(http.responseText);
      var cats = response[0];
      var dogs = response[1];
      var catsCount = typeof(cats) !== 'undefined' ? cats.numberOfVotes : 0;
      var dogsCount = typeof(dogs) !== 'undefined' ? dogs.numberOfVotes : 0;
      
      window.sessionStorage.setItem(catsKey, catsCount);
      window.sessionStorage.setItem(dogsKey, dogsCount);
      refreshView();
    }
  }
  http.send();
}

refreshState();

document.getElementById('btnCats').addEventListener('click', () => {
  sendXhrRequest('0')
});

document.getElementById('btnDogs').addEventListener('click', () => {
  sendXhrRequest('1');
});

document.getElementById('btnReset').addEventListener('click', () => {
    var http = new XMLHttpRequest();
    http.open('DELETE', url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    http.onreadystatechange = () => {
      if (http.readyState == XMLHttpRequest.DONE) {
        if(http.status == 200)
        {
          refreshState();
        }
        else
        {
          displayError(http.responseText);
        }
      }
    }
    
    http.send();
});

function sendXhrRequest(id) {
  var http = new XMLHttpRequest();

  http.open('PUT', url, true);
  http.setRequestHeader('Content-Type', 'application/json');
  http.onreadystatechange = () => {
    if (http.readyState == XMLHttpRequest.DONE) {
      if(http.status == 200)
      {
        refreshState();
      }
      else
      {
        displayError(http.responseText);
      }
    }
  }
  http.send(JSON.stringify({
    voteId: id
  }));
}