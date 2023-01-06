const resultModal = document.getElementById('myModal');
const closeButton_resultModal = document.querySelector('#closeResultModal');
const modal = document.getElementById('peeek-loading');
const searchInput = document.getElementById('searchInfo');
const domainInput = document.getElementById('domain');
const searchButton = document.getElementById('searchButton');
const modalHeader = document.querySelector('#modal-header');
const modalBody = document.querySelector('#modal-body');
const headerContainer = document.querySelector('#header-container');
const initalValues = document.querySelector('#intialValues');
const historyButton = document.querySelector('#buttonHistory');

closeButton_resultModal.onclick = function () {
  resultModal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == resultModal) {
    resultModal.style.display = 'none';
  }
};

searchButton.addEventListener('click', () => {
  const infoSearch = searchInput.value;
  const domainSearch = domainInput.value;
  window.searchInfo.getSearchInfo({ infoSearch, domainSearch });
});

window.searchInfo.hideShowLoading((_event, cssProperty) => {
  hideShowLoading(cssProperty);
});

window.searchInfo.showWebResult((_event, cssProperty, isError, webResult) => {
  showWebResult(cssProperty, isError, webResult);
});

const hideShowLoading = (cssProperty) => {
  modal.style.display = cssProperty;
};

const showModalError = () => {
  modalHeader.innerHTML = '';
  const title = `<h2>Oops! Something went wrong!</h2>`;
  headerContainer.style.backgroundColor = '#DC143C';
  modalHeader.innerHTML = title;

  const INFO = `Please try again!
  these can happen due to an internet error while making the search or wrong values that didn't lead
  to a result`;
  const body = `<p>${INFO}</p>`;
  modalBody.innerHTML = body;
};

const showSuccessWebResult = (webResult) => {
  modalHeader.innerHTML = '';
  const title = `<h2>Resultados de la busqueda!</h2>`;
  headerContainer.style.backgroundImage = `linear-gradient(90deg, rgba(255, 255, 0, 1) 0%, rgba(255, 239, 0, 1) 29%, rgba(255, 106, 0, 1) 100%)`;
  modalHeader.innerHTML = title;

  modalBody.innerHTML = '';
  let body;

  body = `<h2>Query: ${webResult.query}</h2>
   <h2>Domain: ${webResult.domain}</h2>
   <br>
   <hr>`;

  for (const result of webResult.search) {
    body += `<br>
    <div class="webResults">
    <h2>SearchEngine: ${result.searchEngine}</h2>
    <h2>Success: ${result.success}</h2>`;

    if (result.success) {
      body += `<h2>Page: ${result.page}</h2>`;
    }

    body += `<br> </div>`;
  }

  modalBody.innerHTML = body;
};

const showWebResult = (cssProperty, isError, webResult) => {
  resultModal.style.display = cssProperty;

  if (isError) {
    showModalError();
  } else {
    showSuccessWebResult(webResult);
  }
};

historyButton.addEventListener('click', event=>{
    window.searchInfo.showHistoryWindow();
    console.log('clicked!');
});