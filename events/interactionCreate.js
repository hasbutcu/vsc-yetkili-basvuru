const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Komut yürütülürken bir hata oluştu!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'basvuru_yap') {
                const modal = new ModalBuilder()
                    .setCustomId('basvuru_formu')
                    .setTitle('Yetkili Başvuru Formu');

                const adInput = new TextInputBuilder()
                    .setCustomId('ad')
                    .setLabel('Adınız')
                    .setStyle(TextInputStyle.Short);

                const yasInput = new TextInputBuilder()
                    .setCustomId('yas')
                    .setLabel('Yaşınız')
                    .setStyle(TextInputStyle.Short);

                const deneyimInput = new TextInputBuilder()
                    .setCustomId('deneyim')
                    .setLabel('Daha önceki deneyimleriniz')
                    .setStyle(TextInputStyle.Paragraph);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(adInput),
                    new ActionRowBuilder().addComponents(yasInput),
                    new ActionRowBuilder().addComponents(deneyimInput),
                );

                await interaction.showModal(modal);
            } else if (interaction.customId === 'kabul_et' || interaction.customId === 'reddet') {
                const basvuruID = interaction.customId.split('_')[0]; // başvuru ID'sini al
                const basvuruKanal = await client.channels.fetch(client.applicationMessageChannel);
                
                if (basvuruKanal) {
                    const messages = await basvuruKanal.messages.fetch();
                    const basvuruMessage = messages.find(msg => msg.embeds.length > 0 && msg.embeds[0].title === 'Yeni Yetkili Başvurusu');

                    if (basvuruMessage) {
                        const applicantId = basvuruMessage.embeds[0].fields[0].value.replace(/[<>@!]/g, ''); // Başvuran kişinin ID'sini çıkar
                        const applicantUser = await client.users.fetch(applicantId);

                        if (interaction.customId === 'kabul_et') {
                            // Saklanan rol ID'sini kullanarak rolü bulun
                            const role = interaction.guild.roles.cache.get(client.applicationRole);
                            if (role) {
                                // Başvuru sahibinin ID'sini al
                                const applicantId = interaction.message.embeds[0].fields[0].value.replace(/[<>@!]/g, '');
                                const member = await interaction.guild.members.fetch(applicantId);
                                
                                // Rolü ekle
                                await member.roles.add(role);
                                
                                // Kullanıcıya özelden bilgilendirme
                                const applicantUser = await client.users.fetch(applicantId);
                                const sunucuAdi = interaction.guild.name;
                                await applicantUser.send(`${sunucuAdi} sunucusundaki başvurunuz kabul edilmiştir ve ${role.name} rolü verilmiştir!`);
                                
                                // Kullanıcıya yanıt ver
                                await interaction.reply({ content: 'Başvuru kabul edildi ve kullanıcı bilgilendirildi!', ephemeral: true });
                            } else {
                                console.error('Rol bulunamadı.');
                                await interaction.reply({ content: 'Rol bulunamadı.', ephemeral: true });
                            }
                         } else if (interaction.customId === 'reddet') {
                            // Özelden bilgilendirme
                            const sunucuAdi = interaction.guild.name;
                            await applicantUser.send(`${sunucuAdi} sunucusundaki başvurunuz reddedilmiştir!!`);
                            await interaction.reply({ content: 'Başvuru reddedildi ve kullanıcı bilgilendirildi!', ephemeral: true });
                        }
                        
                        // Orijinal başvuru mesajını silin
                        await basvuruMessage.delete();
                    } else {
                        console.error('Başvuru mesajı bulunamadı.');
                    }
                } else {
                    console.error('Başvuru kanalı bulunamadı.');
                }
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'basvuru_formu') {
                const ad = interaction.fields.getTextInputValue('ad');
                const yas = interaction.fields.getTextInputValue('yas');
                const deneyim = interaction.fields.getTextInputValue('deneyim');

                const basvuruEmbed = new EmbedBuilder()
                    .setTitle('Yeni Yetkili Başvurusu')
                    .addFields(
                        { name: 'Başvuran Kişi', value: `<@${interaction.user.id}>`, inline: false },
                        { name: 'Ad', value: ad, inline: false },
                        { name: 'Yaş', value: yas, inline: false },
                        { name: 'Deneyim', value: deneyim },
                    )
                    .setTimestamp();

                const kabulEtButton = new ButtonBuilder()
                    .setCustomId('kabul_et')
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success);

                const reddetButton = new ButtonBuilder()
                    .setCustomId('reddet')
                    .setLabel('Reddet')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder()
                    .addComponents(kabulEtButton, reddetButton);

                const basvuruKanal = await client.channels.fetch(client.applicationMessageChannel);
                if (basvuruKanal) {
                    await basvuruKanal.send({ embeds: [basvuruEmbed], components: [actionRow] });
                } else {
                    console.error('Başvuru kanalı bulunamadı.');
                }

                await interaction.reply({ content: 'Başvurunuz alındı ve değerlendirilmek üzere gönderildi!', ephemeral: true });
            }
        }
    },
};
