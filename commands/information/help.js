const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        const prefix = message.guild?.prefix || '&'; // Default prefix if not set

        // Single MessageSelectMenu for all categories
        const selectMenu = new MessageSelectMenu()
            .setCustomId('categorySelect')
            .setPlaceholder('> Select Category')
            .addOptions([
                { label: 'AntiNuke', value: 'antinuke', description: 'Commands related to AntiNuke' },
                { label: 'Moderation', value: 'mod', description: 'Commands related to Moderation' },
                { label: 'Utility', value: 'info', description: 'Utility commands' },
                { label: 'Welcomer', value: 'welcomer', description: 'Commands for Welcomer' },
                { label: 'Voice', value: 'voice', description: 'Commands related to Voice' },
                { label: 'Logging', value: 'logging', description: 'Commands for Logging' },
                { label: 'Automod', value: 'automod', description: 'Commands for Automod' },
                { label: 'Custom Role', value: 'customrole', description: 'Commands for Custom Roles' },
                { label: 'Giveaway', value: 'giveaway', description: 'Commands for Giveaway' },
                { label: 'Autoresponder', value: 'autoresponder', description: 'Commands for AutoResponder' },
                { label: 'Ticket', value: 'ticket', description: 'Commands for Ticket' },
            ]);

        // Action row with buttons
        const actionRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Home')
                    .setCustomId('homeButton')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setLabel('All Commands')
                    .setCustomId('allCommandsButton')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setLabel('Invite Me')
                    .setStyle('LINK')
                    .setURL('https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot'),
                new MessageButton()
                    .setLabel('Support')
                    .setStyle('LINK')
                    .setURL('https://discord.gg/YOUR_SUPPORT_SERVER'),
                new MessageButton()
                    .setLabel('Delete')
                    .setCustomId('deleteButton')
                    .setStyle('DANGER')
            );

        // Embed message
        const defaultEmbed = new MessageEmbed()
            .setColor(client.color)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `Hello! I'm Flixo, your server security bot with powerful AntiNuke features.\n\n<a:prefix:1332406471551484029>  Prefix for this server: \`${prefix}\`\n<:security:1332406841467998300> Type \`${prefix}antinuke enable\` to get started!\n<:commands:1332408563624316992> Total Commands: \`${client.commands.size}\`\n`
            )
            .addField('__Modules__', `<a:antinuke:1331344608520831057> AntiNuke\n<a:moderation:1331344760107040940> Moderation\n<a:utility67:1331345116249460849> Utility\n<:welcome:1331345037505593427> Welcomer\n<:vc:1331347713903824947> Voice\n<:role:1332410341862408282> Custom Role\n<:Logging:1332410618208063641> Logging\n<:automod:1331571744468762675> Automod\n<a:giveaway:1331183416946982925> Giveaway\n<:reply:1332411194446843975> AutoResponder\n<a:Ticket:1332412384727400488> Ticket`, true)
            .setFooter({
                text: 'Made By Surya With ❤️',
                iconURL: client.user.displayAvatarURL()
            });

        // Send the initial help message
        const helpMessage = await message.channel.send({
            embeds: [defaultEmbed],
            components: [actionRow, new MessageActionRow().addComponents(selectMenu)]
        });

        // Component collector
        const collector = helpMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'deleteButton') {
                await helpMessage.delete();
                return;
            }

            if (interaction.customId === 'homeButton') {
                await interaction.update({
                    embeds: [defaultEmbed],
                    components: [actionRow, new MessageActionRow().addComponents(selectMenu)]
                });
                return;
            }

            if (interaction.customId === 'allCommandsButton' || interaction.values?.[0] === 'all') {
                const groupedCommands = client.commands
                    .filter((cmd) => cmd.category !== 'dev') // Exclude 'dev' commands
                    .reduce((acc, cmd) => {
                        if (!acc[cmd.category]) acc[cmd.category] = [];
                        acc[cmd.category].push(cmd.name);
                        return acc;
                    }, {});

                const allCommandsEmbed = new MessageEmbed()
                    .setColor(client.color)
                    .setTitle('All Commands')
                    .setDescription('Below are all the commands grouped by their categories:')
                    .setFooter({ text: 'Use the menu to select specific categories!' });

                for (const [categoryName, cmds] of Object.entries(groupedCommands)) {
                    allCommandsEmbed.addField(
                        `${categoryName.toUpperCase()} COMMAND`,
                        cmds.map((cmd) => `\`${cmd}\``).join(', ') || 'No commands available.'
                    );
                }

                await interaction.update({
                    embeds: [allCommandsEmbed],
                    components: [actionRow, new MessageActionRow().addComponents(selectMenu)]
                });
                return;
            }

            const categoryMap = {
                antinuke: 'security',
                mod: 'mod',
                info: 'info',
                welcomer: 'welcomer',
                voice: 'voice',
                logging: 'logging',
                automod: 'automod',
                customrole: 'customrole',
                giveaway: 'giveaway',
                autoresponder: 'autoresponder',
                ticket: 'ticket',
            };

            const category = interaction.values?.[0];
            const filteredCategory = categoryMap[category];
            const commands = client.commands
                .filter((cmd) => cmd.category === filteredCategory && cmd.category !== 'dev') // Exclude 'dev'
                .map((cmd) => `\`${cmd.name}\``);

            const categoryEmbed = new MessageEmbed()
                .setColor(client.color)
                .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setDescription(commands.join(', ') || 'No commands available.');

            await interaction.update({
                embeds: [categoryEmbed],
                components: [actionRow, new MessageActionRow().addComponents(selectMenu)]
            });
        });

        collector.on('end', () => {
            helpMessage.edit({ components: [] });
        });
    }
};