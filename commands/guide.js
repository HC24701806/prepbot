const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guide')
		.setDescription('Guide to using the bot'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
        .setColor(0x14C7B2)
        .setTitle('Commands')
        .addFields(
            {name: 'register', value: 'Makes an account. You need an account to use this bot.'},
            {name: 'prob', value: 'Gives a problem. Each problem will give a certain number of points. Currently supported tests: AMC 10/12, AIME'},
            {name: 'top', value: 'Returns leaderboard. Sort by either points scored (default) or problems solved. Ranks updated once per minute.'},
            {name: 'review', value: 'Gives a problem that you have gotten wrong before.'},
            {name: 'user', value: 'Returns user profile.'},
            {name: 'guide', value: 'Guide to using the bot.'}
        )

        await interaction.reply({embeds: [embed]})
	},
};