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
let webResults = [];


window.dbSearchInfo.searchInfo((_event, values) => {
  const results = JSON.parse(values);
  if(results.length > 0){
    webResults = results;
    webResultRenderer(results);
  }
  
});

window.dbSearchInfo.provokeRender((event,value)=>{
       webResults = webResults.filter(val => val._id !== value);
      webResultRenderer(webResults);
});


function webResultRenderer(webResultList) {

  cardsContainer.innerHTML = '';
  let cardInfo = '';

  for (const card of webResultList) {
    cardInfo += `
    <div class="card">
    <div class="infoCardContainer">
      <p class="infoSearched">${card.domain}</p>
    </div>
    <div class="searchEngineResult">`;

    for (const cardDetails of card.search) {
      cardInfo += `
            <div class=${cardDetails.success ? "searchEnginecardContainerTrue" : "searchEnginecardContainerFalse" }>
              <p>${cardDetails.searchEngine}</p>
            </div>`;
    }

    cardInfo += ` 
      </div>
        <div class="DateContainer">
            <p>${card.date}</p>
          </div>
          <div class="deleteCardContainer">
            <button class="btn danger" id=${card._id}>Delete</button>
            </div>
        </div>`;
  }

  cardsContainer.innerHTML = cardInfo;
}

cardsContainer.addEventListener('click', async e =>{
  if(e.target.className === 'btn danger'){
    await window.dbSearchInfo.deleteSearch(e.target.id) 
  }
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