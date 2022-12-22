const fetchURL = require('../helpers/fetchURL');

const bestBuyScrape = async (item, region) => {
  const productInfoApi = `https://www.bestbuy.ca/api/v2/json/search?&currentRegion=${region}&include=facets%2C%20redirects&lang=en-CA&page=1&pageSize=24&path=&query=${item}&exp=search_abtesting_5050_conversion%3Ab&sortBy=relevance&sortDir=desc`;
  const productInfojson = await fetchURL(productInfoApi).catch(() => null);

  //bad request
  if (!productInfojson) {
    throw Error('Region not found');
  }

  //0 search results
  if (productInfojson.total === 0) {
    throw Error('Item not found');
  }

  //get top 5 results //* maybe can get user to input how many results
  const products = productInfojson.products.slice(0, 5).map((product) => {
    return {
      sku: product.sku,
      name: product.name,
      productUrl: `https://www.bestbuy.ca${product.productUrl}`,
      salePrice: product.salePrice,
      thumbnailImage: product.thumbnailImage,
    };
  });

  //concat strings for api search
  const skus = products.map((product) => product.sku).join('%7C');

  //will be in order of the inserted skus, so we can just traverse normally without mapping
  const stockInfoApi = `https://www.bestbuy.ca/ecomm-api/availability/products?accept=application%2Fvnd.bestbuy.simpleproduct.v1%2Bjson&accept-language=en-CA&locations=961%7C796%7C915%7C958%7C600%7C929%7C973%7C701%7C994%7C952%7C941%7C705%7C242%7C13%7C911%7C992&postalCode=&skus=${skus}`;

  //find availability for each item
  const stockInfojson = await fetchURL(stockInfoApi);
  const totalNumOfProducts = stockInfojson.availabilities.length;
  //add info property to products
  for (let i = 0; i < totalNumOfProducts; i++) {
    const product = stockInfojson.availabilities[i];

    products[i].inStorePurchase = checkInStoreStatus(product.pickup.status);
    products[i].onlinePurchase = checkOnlineStatus(product.shipping.status);
  }

  return products;
};

const checkInStoreStatus = (itemStatus) => {
  switch (itemStatus) {
    case 'InStock':
      return 'Item is in stock';

    case 'OutOfStock':
      return 'Item is out of stock';

    case 'Preorder':
      return 'Item can be preordered online';

    case 'OnlineOnly':
      return 'Item can only be purchased online';

    default:
      return itemStatus;
  }
};

const checkOnlineStatus = (itemStatus) => {
  switch (itemStatus) {
    case 'InStock':
      return 'Item is in stock';

    case 'SoldOutOnline':
      return 'Item is out of stock';

    case 'Preorder':
      return 'Item can be preordered online';

    case 'InStoreOnly':
      return 'Item can only be purchased in store';

    case 'InStockOnlineOnly':
      return 'Item is in stock';

    default:
      return itemStatus;
  }
};

module.exports = bestBuyScrape;