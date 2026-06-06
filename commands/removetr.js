const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadTempRoles, saveTempRoles } = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetr')
        .setDescription('Annulla un ruolo temporaneo rimuovendolo subito dall\'utente')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('L\'utente a cui revocare il ruolo temporaneo')
                .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName('ruolo')
                .setDescription('Il ruolo temporaneo da rimuovere')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Usiamo una risposta immediata senza deferReply per evitare lag di sincronizzazione
        const targetUser = interaction.options.getMember('utente');
        const role = interaction.options.getRole('ruolo');

        if (!targetUser || !role) {
            return interaction.reply({ content: '❌ Utente o ruolo non valido.', ephemeral: true });
        }

        let tempRoles = loadTempRoles();
        
        // Controlla se la sessione esiste nel file JSON
        const index = tempRoles.findIndex(entry => entry.userId === targetUser.id && entry.roleId === role.id);

        if (index === -1) {
            return interaction.reply({ 
                content: `❌ Non ho trovato nessun timer attivo per ${targetUser.user.tag} con il ruolo **${role.name}**.`, 
                ephemeral: true 
            });
        }

        try {
            // Rimuove il ruolo su Discord se l'utente ce l'ha ancora
            if (targetUser.roles.cache.has(role.id)) {
                await targetUser.roles.remove(role);
            }

            // Elimina il record dal JSON e salva
            tempRoles.splice(index, 1);
            saveTempRoles(tempRoles);

            return interaction.reply({ 
                content: `✅ Ruolo temporaneo annullato. Il ruolo **${role.name}** è stato rimosso da ${targetUser} e il timer è stato rimosso dal database.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({ 
                content: '❌ Impossibile rimuovere il ruolo. Verifica che il mio ruolo (del bot) sia posizionato sopra il ruolo che vuoi rimuovere nelle impostazioni del server.', 
                ephemeral: true 
            });
        }
    }
};
