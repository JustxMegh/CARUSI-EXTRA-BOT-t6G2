const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadTempRoles, saveTempRoles } = require('../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetr')
        .setDescription('Annulla un ruolo temporaneo rimuovendolo subito dall\'utente')
        .addUserOption(opt => opt.setName('utente').setDescription('L\'utente a cui revocare il ruolo temporaneo').setRequired(true))
        .addRoleOption(opt => opt.setName('ruolo').setDescription('Il ruolo temporaneo da rimuovere').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getMember('utente');
        const role = interaction.options.getRole('ruolo');

        if (!targetUser || !role) {
            return interaction.editReply({ content: '❌ Utente o ruolo non valido.' });
        }

        let tempRoles = loadTempRoles();
        
        // Cerca se esiste una sessione attiva per questo utente e questo ruolo
        const index = tempRoles.findIndex(entry => entry.userId === targetUser.id && entry.roleId === role.id);

        if (index === -1) {
            return interaction.editReply({ 
                content: `❌ Non ho trovato nessun timer attivo per ${targetUser} con il ruolo ${role}. Forse il ruolo è stato assegnato manualmente e non tramite \`/temprole\`.` 
            });
        }

        try {
            // Rimuove il ruolo su Discord se l'utente lo possiede ancora
            if (targetUser.roles.cache.has(role.id)) {
                await targetUser.roles.remove(role);
            }

            // Elimina la riga dal file JSON
            tempRoles.splice(index, 1);
            saveTempRoles(tempRoles);

            return interaction.editReply({ 
                content: `✅ Ruolo temporaneo annullato con successo. Il ruolo ${role} è stato rimosso da ${targetUser} e il timer è stato cancellato.` 
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ 
                content: '❌ Si è verificato un errore durante la rimozione del ruolo. Controlla che il mio ruolo sia posizionato sopra quello che stai provando a rimuovere nella gerarchia del server.' 
            });
        }
    }
};
