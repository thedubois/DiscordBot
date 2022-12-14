const {
  ecommerceShowAllBuilder,
} = require('../../helpers/responseBuilders/ecommerceResponseBuilder.js');
const { getAllUserSubscriptions } = require('../../helpers/dataBaseQueries.js');

const ecommerceSubscriptions = async (interaction) => {
  const subscriptions = await getAllUserSubscriptions(interaction, 'ecommerce');
  return ecommerceShowAllBuilder(subscriptions, interaction);
};

module.exports = ecommerceSubscriptions;
