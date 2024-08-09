const { Client, REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('../config.json');
const config = require('../config.json');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    // ActivityType enum'ında mevcut türleri küçük harfli olarak saklayarak normalize et
    const activityTypes = {
        'playing': ActivityType.Playing,
        'streaming': ActivityType.Streaming,
        'listening': ActivityType.Listening,
        'watching': ActivityType.Watching,
        'competing': ActivityType.Competing,
        'custom': ActivityType.Custom,
      };
  
      const statusTypes = {
        'dnd': 'dnd',
        'idle': 'idle',
        'online': 'online',
        'invisible': 'invisible',
  
      };
  
      // Config türünü normalize et
      const cfgType = (config.status || '').toLowerCase();
      const statusType = statusTypes[cfgType];
  
      const configType = (config.type || '').toLowerCase(); // Küçük harfe çevir
      const activityType = activityTypes[configType];
  
      if (!activityType) {
        console.error('config.json ==> yanlış tip');
        return;
      }
  
      try {
        await client.user.setPresence({
          activities: [{ name: config.activity, type: activityType }],
          status: statusType, 
        });
        console.log('Durum Başarıyla Ayarlandı.');
      } catch (error) {
        console.error('Durum Ayarlanırken Hata Oluştur:', error);
      }
    // Komutları yükleme
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON()); // Komutları API formatında ekleyin
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Komutlar yükleniyor...');
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('Komutlar başarıyla yüklendi.');
    } catch (error) {
      console.error('Komutlar yüklenirken bir hata oluştu:', error);
    }
  }
};
