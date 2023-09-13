const PRODUCT_CARD_SELECTOR = 'a.product-item';
const PRODUCT_COLLECTION_SECTION_SELECTOR = '#section-collection';
const PRODUCT_TITLE_SELECTOR = 'h1.product-title';
const SEE_MORE_SELECTOR = 'a.block-fade';
const PRODUCTS_PAGE_URL = '/collections/all';
const PRODUCT_WEIGHT_SELECTOR = 'select#product-weight';
const PRODUCT_COST_SELECTOR = 'span.product-price';

describe('Coffea Circulor', () => {
  const coffees = {};

  it('finds coffees', () => {
    const urlsToVisit = [];
    cy.visit(PRODUCTS_PAGE_URL);

    cy.get(PRODUCT_COLLECTION_SECTION_SELECTOR)
      .within(() => {
        cy.get(SEE_MORE_SELECTOR).click();
        cy.get(SEE_MORE_SELECTOR).click();
        cy.get(SEE_MORE_SELECTOR).click();
        cy.get(SEE_MORE_SELECTOR).should('not.exist');
        cy.get(PRODUCT_CARD_SELECTOR).each(($card) => {
          const url = $card.attr('href');
          urlsToVisit.push(url);
        });
      })
      .then(() => {
        urlsToVisit.forEach((url) => {
          cy.visit(url).then(() => {
            if (
              !cy.$$(PRODUCT_WEIGHT_SELECTOR).length ||
              /hyperfood/i.test(cy.$$(PRODUCT_TITLE_SELECTOR).text()) ||
              cy.$$('button:contains(Sold out)').length
            ) {
              cy.log('Not a coffee product');
              return;
            }
            cy.all([
              () => cy.get(PRODUCT_TITLE_SELECTOR),
              () => cy.get(`${PRODUCT_WEIGHT_SELECTOR} option`),
              () => cy.contains('SCA SCORE').parent(),
              () =>
                cy
                  .findAllByRole('cell', { name: /flavor/i })
                  .first()
                  .next(),
            ]).then(([$name, $weights, $score, $flavors]) => {
              cy.wrap($weights).each(($weight) => {
                const name = $name.text();
                const weight = $weight.text();
                const score = $score.text().replace('SCA SCORE', '').trim();
                const flavors = $flavors.text();
                cy.findByLabelText(/weight/i)
                  .select(weight, { force: true })
                  .then(() => {
                    const price = cy.$$(PRODUCT_COST_SELECTOR).text();
                    coffees[name] = {
                      ...coffees[name],
                      [weight]: price,
                      url: `${Cypress.config().baseUrl}${url}`,
                      score,
                      flavors,
                    };
                  });
              });
            });
          });
        });
      });
  });

  after(() => {
    const coffeesTable = Object.entries(coffees)
      // @ts-ignore
      .map(([name, { '250g': weight, url, score, flavors }]) => ({
        name,
        price: weight,
        url,
        score,
        flavors,
      }))
      .filter(({ price }) => !!price)
      .map(({ price, ...coffee }) => ({
        price: Number(price.slice(1).replace(',', '')) / 100,
        ...coffee,
      }))
      .sort((a, b) => a.price - b.price)
      .filter(({ price }) => price <= 30);

    cy.writeFile(
      `./coffea-circulor/${Date.now()}.json`,
      JSON.stringify(coffeesTable, null, 2),
    );
  });
});
