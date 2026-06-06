const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../data/temproles.json');
const configFile = path.join(__dirname, '../data/config.json');

// Inizializza le cartelle se non esistono
if (!fs.existsSync(path.dirname(dbFile))) fs.mkdirSync(path.dirname(dbFile), { recursive: true });

// Funzione di supporto per leggere i file in sicurezza e ripararli se vuoti
const safeReadFile = (filePath, defaultContent) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultContent);
        return JSON.parse(defaultContent);
    }
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) { // Se il file è vuoto (0 caratteri), inserisce il default
        fs.writeFileSync(filePath, defaultContent);
        return JSON.parse(defaultContent);
    }
    try {
        return JSON.parse(content);
    } catch (e) { // Se il JSON è corrotto, lo ripara
        fs.writeFileSync(filePath, defaultContent);
        return JSON.parse(defaultContent);
    }
};

const loadTempRoles = () => safeReadFile(dbFile, '[]');
const saveTempRoles = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 4));

const loadConfig = () => safeReadFile(configFile, '{"logChannelId": null}');
const saveConfig = (data) => fs.writeFileSync(configFile, JSON.stringify(data, null, 4));

module.exports = { loadTempRoles, saveTempRoles, loadConfig, saveConfig };
