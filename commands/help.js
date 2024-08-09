const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Botun komutlarını gösterir'),

    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz yok.', ephemeral: true });
        }
        // Sabit komut açıklamaları
        const embed = new EmbedBuilder()
            .setTitle('Yardım Menüsü')
            .setDescription('Aşağıda botun mevcut komutları bulunmaktadır:')
            .addFields(
                { name: '/yetkili-alım kanal <kanal>', value: 'Yetkili alım durumlarının duyurulduğu mesajının gönderileceği kanalı ayarlar.' },
                { name: '/yetkili-alım basvuru <kanal>', value: 'Başvuruların gönderileceği kanalı ayarlar.' },
                { name: '/yetkili-alım aç', value: 'Yetkili alımını başlatır.' },
                { name: '/yetkili-alım rol', value: 'Başvuru kabul edilince verilecek rolü ayarlar.' },
                { name: '/kabul', value: 'Başvuruyu kabul eder.' },
                { name: '/red', value: 'Başvuruyu reddeder' },
                { name: '/help', value: 'Botun komutlarını gösterir.' }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot Yardım Menüsü' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
