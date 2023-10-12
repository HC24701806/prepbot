const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies ping'),
	async execute(interaction) {
		await interaction.reply('ping');
	},
};