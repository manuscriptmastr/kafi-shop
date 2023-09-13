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
          cy.visit(url)
            .then(() => !!cy.$$(PRODUCT_WEIGHT_SELECTOR).length)
            .then((isCoffeeProduct) => {
              if (!isCoffeeProduct) {
                cy.log('Not a coffee product');
                return;
              }

              const name = cy.$$(PRODUCT_TITLE_SELECTOR).text();
              cy.get(`${PRODUCT_WEIGHT_SELECTOR} option`).then(($weights) => {
                cy.wrap($weights).each(($weight) => {
                  const weight = $weight.text();
                  cy.findByLabelText(/weight/i)
                    .select(weight, { force: true })
                    .then(() => {
                      const price = cy.$$(PRODUCT_COST_SELECTOR).text();
                      coffees[name] = {
                        ...coffees[name],
                        [weight]: price,
                        url,
                      };
                    });
                });
              });
            });
        });
      });
  });

  after(() => {
    cy.writeFile(
      `./coffea-circulor/${Date.now()}.json`,
      JSON.stringify(coffees, null, 2),
    );
  });
});
