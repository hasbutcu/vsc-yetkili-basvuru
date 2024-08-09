const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kabul')
    .setDescription('Başvuruyu kabul eder ve kullanıcıya rol verir.')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Kabul edilecek kullanıcıyı seçin')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const member = await interaction.guild.members.fetch(user.id);

    // Deneme yetkili rolünü belirleyin
    const role = interaction.guild.roles.cache.find(r => r.name === 'Deneme Yetkili');

    if (!role) {
      return await interaction.reply({ content: 'Deneme Yetkili rolü bulunamadı.', ephemeral: true });
    }

    try {
      await member.roles.add(role);
      await interaction.reply({ content: `${user.tag} başarıyla kabul edildi ve rol verildi.`, ephemeral: true });
    } catch (error) {
      console.error('Rol eklenirken bir hata oluştu:', error);
      await interaction.reply({ content: 'Rol eklenirken bir hata oluştu.', ephemeral: true });
    }
  },
};
