var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var deferredPrompt;

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100%)';
  setTimeout(function () {
    createPostArea.style.display = 'none';
  }, 300);
}

shareImageButton.addEventListener('click', openCreatePostModal);
closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  // Usa la imagen dinamica de Firebase (o una por defecto)
  cardTitle.style.backgroundImage = 'url("' + (data.image || '/src/images/sf-boat.jpg') + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title || 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location || 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

// URL real de tu Realtime Database terminada en /post.json
var url = 'https://uteq-testfany-default-rtdb.firebaseio.com/post.json';
var networkDataReceived = false;

// 1. Obtener datos desde la red (Firebase)
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

// 2. Obtener datos desde la caché (IndexedDB) si está disponible
// Verifica si IndexedDB está disponible en el navegador
// Si está disponible, lee los datos de la base de datos 'posts-store'
// y actualiza la interfaz de usuario con esos datos
// Esto permite que la aplicación funcione sin conexión y muestre datos previamente almacenados
// Si no hay datos en la caché, no se hace nada y se espera a que lleguen los datos de la red
// Esto es útil para aplicaciones PWA que necesitan funcionar sin conexión
if ('indexedDB' in window) {
  readAllData('posts')
  .then(function (data) {
    if (!networkDataReceived) {
      console.log('From cache', data);
      updateUI(data);
    }
  });
}

function sendData() {
  fetch('https://uteq-testfany-default-rtdb.firebaseio.com/post.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,    
      image: 'https://firebasestorage.googleapis.com/v0/b/uteq-testfany.appspot.com/o/sf-boat.jpg?alt=media&token=1e5c8b9a-3d4e-4c6e-9b7e-1c2f1e1e1e1e'
    })
  })
  .then(function (res) {
    console.log('Sent data', res);
    updateUI();
  })
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(function(sw) {
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,  
          location: locationInput.value
        };
        writeData('sync-posts', post)
          .then(function() {
            return sw.sync.register('sync-new-posts');
          })
          .then(function() {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = {message: 'Your Post was saved for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});


