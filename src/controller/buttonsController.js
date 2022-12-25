const { serverTimestamp } = require('firebase/firestore');
const {
  addToDatabase,
  deleteFromDatabase,
} = require('../helpers/dataBaseQueries.js');

const subscribe = async (interaction) => {
  const channel = interaction.message.channelId;
  const embed = JSON.parse(JSON.stringify(interaction.message.embeds));
  const customId = interaction.customId;
  const location = customId.split('/').slice(0, 2).join('/');
  const productId = customId.split('/').slice(2, 4).join('/');
  const createdAt = serverTimestamp();
  const userId = interaction.user.id;

  let user = { location, userId, productId, channel, embed, createdAt };
  const response = await addToDatabase(user);

  if (!response) {
    await interaction.reply({ content: 'You have already subscribed to this' });
    return;
  }

  await interaction.reply({ content: 'successfully subscribed to this item' });
};

const unSubscribe = async (interaction) => {
  //customId : productSku/userId/buttontype
  const customId = interaction.customId;
  const productId = customId.split('/').slice(0, 2).join('/');

  const response = await deleteFromDatabase(productId);
  if (!response) {
    await interaction.reply({
      content: 'You already unsubscribed from this',
    });
    return;
  }

  await interaction.reply({ content: 'sucessfully unsubscribed' });
};

module.exports = { subscribe, unSubscribe };
