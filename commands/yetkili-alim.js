const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yetkili-alım')
        .setDescription('Yetkili alım komutları')
        .addSubcommand(subcommand =>
            subcommand
                .setName('kanal')
                .setDescription('Başvuru mesajlarının gönderileceği yazı kanalını ayarlar')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Yazı kanalını seç')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)) // Filter only text channels
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('basvuru')
                .setDescription('Başvuru mesajlarının gönderileceği yazı kanalını ayarlar')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Yazı kanalını seç')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)) // Filter only text channels
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('aç')
                .setDescription('Yetkili alımını başlatır')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('kapat')
                .setDescription('Yetkili alımını kapatır')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rol')
                .setDescription('Kabul edildiğinde verilecek rolü ayarlar')
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('Verilecek rolü seç')
                        .setRequired(true))
        ),

    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz yok.', ephemeral: true });
        }

        const subCommand = interaction.options.getSubcommand();
        const kanal = interaction.options.getChannel('kanal');
        const rol = interaction.options.getRole('rol');
        const client = interaction.client;

        try {
            if (subCommand === 'kanal') {
                if (!kanal) {
                    return await interaction.reply({ content: 'Lütfen geçerli bir yazı kanalı seçin.', ephemeral: true });
                }

                client.applicationChannel = kanal.id;
                return await interaction.reply({ content: `Başvuru mesajlarının gönderileceği kanal başarıyla ${kanal.name} olarak ayarlandı.`, ephemeral: true });
            }

            if (subCommand === 'basvuru') {
                if (!kanal) {
                    return await interaction.reply({ content: 'Lütfen geçerli bir yazı kanalı seçin.', ephemeral: true });
                }

                client.applicationMessageChannel = kanal.id;
                return await interaction.reply({ content: `Başvuruların gönderileceği kanal başarıyla ${kanal.name} olarak ayarlandı.`, ephemeral: true });
            }

            if (subCommand === 'rol') {
                if (!rol) {
                    return await interaction.reply({ content: 'Lütfen geçerli bir rol seçin.', ephemeral: true });
                }

                client.applicationRole = rol.id;
                return await interaction.reply({ content: `Kabul edilen başvurulara verilecek rol başarıyla ${rol.name} olarak ayarlandı.`, ephemeral: true });
            }

            if (subCommand === 'aç') {
                if (!client.applicationChannel) {
                    return await interaction.reply({ content: 'Öncelikle bir başvuru kanalı ayarlamalısınız.\n /yetkili-alım kanal <kanal>', ephemeral: true });
                }

                if (!client.applicationMessageChannel) {
                    return await interaction.reply({ content: 'Öncelikle başvuruların atılacağı kanalı ayarlamalısınız.\n /yetkili-alım başvuru <kanal>', ephemeral: true });
                }

                if (!client.applicationRole) {
                    return await interaction.reply({ content: 'Öncelikle kabul edildiğinde verilecek rolü ayarlamalısınız.\n /yetkili-alım rol <rol>', ephemeral: true });
                }

                if (client.applicationMessage) {
                    // Mevcut mesaj varsa düzenle
                    await client.applicationMessage.edit({
                        content: 'Yetkili alımları başlamıştır! Başvuru yapmak için aşağıdaki butona tıklayın.',
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('basvuru_yap')
                                        .setLabel('Başvuru Yap')
                                        .setStyle(ButtonStyle.Primary),
                                ),
                        ],
                    });

                    return await interaction.reply({ content: 'Yetkili alım süreci başlatıldı.', ephemeral: true });
                }

                // Mevcut mesaj yoksa yeni mesaj gönder
                const alımKanal = await client.channels.fetch(client.applicationChannel);
                if (!alımKanal) {
                    return await interaction.reply({ content: 'Yetkili alım kanalı bulunamadı.', ephemeral: true });
                }

                client.applicationMessage = await alımKanal.send({
                    content: 'Yetkili alımları başlamıştır! Başvuru yapmak için aşağıdaki butona tıklayın.',
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('basvuru_yap')
                                    .setLabel('Başvuru Yap')
                                    .setStyle(ButtonStyle.Primary),
                            ),
                    ],
                });

                return await interaction.reply({ content: 'Yetkili alım süreci başlatıldı.', ephemeral: true });
            }

            if (subCommand === 'kapat') {
                if (!client.applicationMessage) {
                    return await interaction.reply({ content: 'Zaten kapalı bir yetkili alım süreci var.', ephemeral: true });
                }

                await client.applicationMessage.edit({
                    content: 'Yetkili alım süreci kapanmıştır.',
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('basvuru_yap')
                                    .setLabel('Başvuru Yap')
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true), // Disable the button
                            ),
                    ],
                });

                return await interaction.reply({ content: 'Yetkili alımlar kapatılmıştır.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            return await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
        }
    },
};
