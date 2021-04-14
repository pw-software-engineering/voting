var http = new XMLHttpRequest();
var url = '/api/voting';
var cats = 'cats'
var dogs = 'dogs'

function refreshView(){
  var catsCount = parseInt(window.sessionStorage.getItem(cats), 10);
  var dogsCount = parseInt(window.sessionStorage.getItem(dogs), 10);
  var catsLabel = document.getElementById('lblCats');
  var dogsLabel = document.getElementById('lblDogs');

  console.log(catsCount, dogsCount);

  catsLabel.innerHTML = catsCount;
  dogsLabel.innerHTML = dogsCount;
}

function refreshState(){
  http.open('GET', url, true);
  http.setRequestHeader('Content-Type', 'application/json');
  http.onreadystatechange = () => {
    if (http.readyState == XMLHttpRequest.DONE) {
      var response = JSON.parse(http.responseText);
      var cats = response[0];
      var dogs = response[1];
      var catsCount = typeof(cats) !== 'undefined' ? k8s.count : 0;
      var dogsCount = typeof(dogs) !== 'undefined' ? sf.count : 0;
      
      window.sessionStorage.setItem(cats, catsCount);
      window.sessionStorage.setItem(dogs, dogsCount);
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
        refreshState();
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
      refreshState();
    }
  }
  http.send(JSON.stringify({
    voteId: id
  }));
}