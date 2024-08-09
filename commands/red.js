const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('red')
    .setDescription('Başvuruyu reddeder ve kullanıcıya mesaj gönderir.')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Reddedilecek kullanıcıyı seçin')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');

    try {
      await user.send('Başvurunuz reddedildi. Başka bir zaman tekrar başvurabilirsiniz.');
      await interaction.reply({ content: `${user.tag} başarıyla reddedildi ve özelden mesaj gönderildi.`, ephemeral: true });
    } catch (error) {
      console.error('Özel mesaj gönderilirken bir hata oluştu:', error);
      await interaction.reply({ content: 'Özel mesaj gönderilirken bir hata oluştu.', ephemeral: true });
    }
  },
};
