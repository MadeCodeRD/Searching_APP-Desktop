// let cards = document.querySelectorAll('.card2');

// console.log(cards);

// for (const card of cards) {
//    card.addEventListener('mouseenter', (e)=>showHistorial(e.target));
//    card.addEventListener('mouseleave', (e)=>hideHistorial(e.target));
// }

// function showHistorial(card){
//   card.classList.remove('card2');
//   card.classList.add('card');
// }

// function hideHistorial(card){
//   card.classList.remove('card');
//   card.classList.add('card2');
// }

const cardsContainer = document.querySelector('#cardsContainer');
const searchInput = document.querySelector('#searchInput');
const emojiIcon = document.querySelector('#emojiIcon');
const deleteAll = document.querySelector('#deleteAll');
const showResultInfo = document.querySelector('#myModal');
const closeModalButton = document.querySelector('#closeModalSpan');
const modalDetails = document.querySelector('#modalDetails');

let webResults = [];


window.dbSearchInfo.searchInfo((_event, values) => {
  const results = JSON.parse(values);
  if(results.length > 0){
    webResults = results;
    webResultRenderer(results);
  }
  
});

window.dbSearchInfo.provokeRender((event,value)=>{
      if(value){
        webResults = webResults.filter(val => val._id !== value);
      }else{
        webResults = [];
      }
      webResultRenderer(webResults);
});


function webResultRenderer(webResultList) {

  cardsContainer.innerHTML = '';
  let cardInfo = '';

  for (const card of webResultList) {

    const newDate = new Date(card.date)

    cardInfo += `
    <div class="card">
    <div class="infoCardContainer">
      <p class="infoDomain">Dominio: ${card.domain}</p>
      <p class="infoSearched">Busqueda: ${card.query}</p>
    </div>
    <div class="searchEngineResult" id="${card._id}">`;

    for (const cardDetails of card.search) {
      cardInfo += `
            <button class=${cardDetails.success ? "searchEnginecardContainerTrue" : "searchEnginecardContainerFalse" }>${cardDetails.searchEngine}</button>`;
    }

    cardInfo += ` 
      </div>
        <div class="DateContainer">
            <p>${newDate.toLocaleString()}</p>
          </div>
          <div class="deleteCardContainer">
            <button class="btn danger" id=${card._id}>Delete</button>
            </div>
        </div>`;
  }

  cardsContainer.innerHTML = cardInfo;
}

cardsContainer.addEventListener('click', async e =>{

  //delete search by ID
  if(e.target.className === 'btn danger'){
    await window.dbSearchInfo.deleteSearch(e.target.id) 
  }

  //show modal with search info
  if(e.target.className === 'searchEnginecardContainerTrue'){
      const searchEngine = e.target.innerText;
      let webSearchId = e.target.parentElement.id;

      const searchInfo = webResults.find(search => search._id === webSearchId);
      const searchDetail = searchInfo.search.find(search => search.searchEngine === searchEngine);
      showResultInfo.style.display ="block";

      modalDetails.innerHTML = '';

      const details = `
       <p><span>Search Engine: </span> ${searchEngine}</p> 
       <p><span>URL: </span> ${searchDetail.url}</p> 
       <p><span>Page: </span> ${searchDetail.page}</p> 
      `
      modalDetails.innerHTML = details;

      console.log(searchDetail);
            
  }
});

closeModalButton.addEventListener('click', event =>{
  showResultInfo.style.display ="none";
});


searchInput.addEventListener('input', event =>{
  const searchValue = event.target.value.toLowerCase();

  let filterArr = webResults.filter(searchResults=> searchResults.query.includes(searchValue) || searchResults.domain.includes(searchValue));
  webResultRenderer(filterArr);

  if(searchValue === ''){
    emojiIcon.innerHTML = '🤔';
  }else if(filterArr.length > 0){
    emojiIcon.innerHTML = '😄';
  }else{
    emojiIcon.innerHTML = '😭';
  }

});

deleteAll.addEventListener('click', async event=>{
  await window.dbSearchInfo.deleteAll(); 
});


window.onclick = function(event) {
  if (event.target == showResultInfo) {
    showResultInfo.style.display = "none";
  }
}
