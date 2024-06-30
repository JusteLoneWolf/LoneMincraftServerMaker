const TerminalManager = require('./src/Lib/TerminalManager');
const DownloadManager = require('./src/Lib/DownloadManager')
const ConfigManager = require('./src/Lib/ConfigManager')
const version = require('./src/Version');
const jarsVersion = require('./data/jarsVersion.json')
let urls =[]
const Terminal = new TerminalManager();
const Downloader = new DownloadManager();
(async () => {
    let infra = await Terminal.createMenu(["Mohist"], "Quel Infra serveur ?");
    let currentVersion = version.getVersion(await Terminal.createMenu(["1.20", "1.20.1", "1.20.2"], "Quelle version ?"));
    let velocity = await Terminal.createMenu(["Oui", "Non"], "Velocity ?")
    let length = await Terminal.createMenu(["1", "2", "3", "4", "5"], "Combien de serveur ?")
    if (velocity === "Oui") {
        console.clear()
        urls.push(jarsVersion.velocity.url)
    }

    const outputRootFolder = './downloads';
    switch (infra) {
        case "Mohist":
            for (let i = 1; length >= i; i++) {
                urls.push(jarsVersion.Mohist.url)
            }
            break
    }

    Terminal.close()
    console.clear()
    await Downloader.downloadFile(urls, outputRootFolder, length);
    await ConfigManager.startConfig()


})();