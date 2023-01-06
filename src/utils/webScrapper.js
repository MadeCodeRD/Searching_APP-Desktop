const puppeteer = require('puppeteer');

const MESSAGES = {
  INVALID_USER_VALUES: 'Please provide correct values!',
  SOMETHING_WRONG: 'Oops! something went wrong, please try again. If error persists, try later on!',
  INFO: `oops! something went wrong, please try again!
  these can happen due to an internet error while making the search or wrong values that didn't lead
  to a result`
};

async function getWebResults(infoSearch, domainSearch) {
  if (!infoSearch || !domainSearch) {
    console.error(MESSAGES.INVALID_USER_VALUES);
    return;
  }

  const userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36`;

  const userValues = {
    query: infoSearch.trim().toLowerCase(),
    domain: domainSearch.trim().toLowerCase(),
  };

  const searchEngines = getSearchEngines(userValues.domain);

  try {

    const result = await openWebBrowser({ userValues, searchEngines, userAgent });
    
    return {
      ...userValues,
      search: result,
    };
    
  } catch (error) {
    console.error(error);
  }
 
}

function getSearchEngines(domain) {

  return [
    {
      name: 'Google.com',
      url: 'https://google.com',
      searchInput: 'div[jsname="gLFyf"] input[name="q"]',
      searchLinksContainer: 'div.yuRUbf a',
      searchButton: 'input.gNO89b[name="btnK"]',
      startPage: 1,
      endPage: 3,
      nextPage: '#pnnext',
      regexToMatch: `(?<=(\/\/|[\\w\\.]))\\b${domain}\\b`,
    },

    {
      name: 'Bing.com',
      url: 'https://www.bing.com',
      searchInput: '#sb_form_q',
      searchLinksContainer: 'li.b_algo h2 a',
      startPage: 1,
      endPage: 3,
      searchButton: '#sb_form_go',
      nextPage: `a.sb_pagN.sb_pagN_bp.b_widePag.sb_bp`,
      regexToMatch: `(?<=(\/\/|[\\w\\.]))\\b${domain}\\b`,
    },

    {
      name: 'Yahoo.com',
      url: 'https://yahoo.com',
      searchInput: '#ybar-sbq',
      searchLinksContainer:
        'div.compTitle.options-toggle h3.title a[data-matarget="algo"]',
      startPage: 1,
      endPage: 3,
      searchButton: '#ybar-search',
      nextPage: `a.next`,
      regexToMatch: `(?<=(\/\/|[\\w\\.]))\\b${domain}\\b|\\b%2f%2f${domain}\\b`,
    },

    {
      name: 'Aol.com',
      url: 'https://www.aol.com',
      searchInput: '#header-form-search-input',
      searchLinksContainer:
        'div.compTitle.options-toggle h3.title a[data-matarget="algo"]',
      startPage: 1,
      endPage: 3,
      searchButton: '#header-form-search-button',
      nextPage: `a.next`,
      regexToMatch: `(?<=(\/\/|[\\w\\.]))\\b${domain}\\b|\\b%2f%2f${domain}\\b`,
    },

    {
      name: 'Ecosia.org',
      url: 'https://www.ecosia.org',
      searchInput:
        'div.search-form__input-wrapper input[data-test-id="search-form-input"]',
      searchLinksContainer: 'div.result__title a[data-test-id="result-link"]',
      startPage: 1,
      endPage: 3,
      searchButton:
        'button[data-test-id="search-form-submit"][icon-class="searchf-form__submit-icon"]',
      nextPage: `a[aria-label="Next page"]`,
      regexToMatch: `(?<=(\/\/|[\\w\\.]))\\b${domain}\\b`,
    },
  ];
}

async function openWebBrowser({ userValues, searchEngines, userAgent }) {

  const browser = await puppeteer.launch({ headless: true });

  try {
    const webResults = [];

    for (const searchEngine of searchEngines) {
      const page = await browser.newPage();
      webResults.push(
        webScrapper({ page, userAgent, userValues, searchEngine })
      );
    }

    const results = await Promise.all(webResults);

    return results;
  } catch (error) {

    console.log(MESSAGES.SOMETHING_WRONG);
    console.error(error);
    

  } finally {
    await browser.close();
  }
}

async function webScrapper({ page, userAgent, userValues, searchEngine }) {
  try {
    await page.setUserAgent(userAgent);
    await page.setDefaultNavigationTimeout(0);
    await page.goto(searchEngine.url);

    await page.waitForSelector(searchEngine.searchInput);
    await page.type(searchEngine.searchInput, userValues.query);

    const searchButton = await page.waitForSelector(searchEngine.searchButton);
    await searchButton.evaluate((button) => button.click());

    const linkContainer = await page.waitForSelector(
      searchEngine.searchLinksContainer
    );

    let initialPage = searchEngine.startPage;
    let links;

    do {
      links = await page.evaluate(
        (searchEngine, userValues, page) => {
          const urls = document.querySelectorAll(
            searchEngine.searchLinksContainer
          );

          const regexToMatch = new RegExp(searchEngine.regexToMatch, 'i');

          for (const url of urls) {
            let link = url.href;
            if (regexToMatch.test(link)) {
              url.click();
              return {
                success: true,
                searchEngine: searchEngine.name,
                url: link,
                page,
              };
            }
          }
        },
        searchEngine,
        userValues,
        initialPage
      );

      if (links) {
        break;
      }

      initialPage++;

      if (!(initialPage <= searchEngine.endPage)) {
        break;
      }

      const isNextPage = searchEngine.nextPage;

      const goTonextPage = await page.evaluate((isNextPage) => {
        const isElementOnPage = document.querySelector(isNextPage);
        if (!isElementOnPage) {
          return false;
        }

        isElementOnPage.click();
        return true;
      }, isNextPage);

      if (!goTonextPage) {
        break;
      }

      await page.waitForSelector(searchEngine.searchLinksContainer);
    } while (initialPage <= searchEngine.endPage);

    if (!links) {
      links = {
        success: false,
        searchEngine: searchEngine.name,
      };
    }

    return links;
  } catch (error) {

    console.log(MESSAGES.INFO);
    console.error(error);
    
  } finally {
    await page.close();
  }
}

module.exports = {
  getWebResults,
};
