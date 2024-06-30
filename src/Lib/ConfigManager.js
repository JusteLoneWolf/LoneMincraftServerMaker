const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
async function copyConfigContentsToMohistServers() {
    const downloadsDir = path.join('downloads'); // Dossier racine
    const configSourceDir = path.join('config', 'Mohist'); // Dossier source à copier

    try {
        const serverDirs = await fs.readdir(downloadsDir, { withFileTypes: true });

        for (const dirent of serverDirs) {
            if (dirent.isDirectory()) {
                const serverDirPath = path.join(downloadsDir, dirent.name);
                const mohistJarPath = path.join(serverDirPath, 'mohist.jar');

                if (await fs.pathExists(mohistJarPath)) {
                    const files = await fs.readdir(configSourceDir);
                    for (const file of files) {
                        const srcFilePath = path.join(configSourceDir, file);
                        const destFilePath = path.join(serverDirPath, file);
                        await fs.copy(srcFilePath, destFilePath);
                    }
                    console.log(`Copie du contenue de ${configSourceDir} a ${serverDirPath}`);
                }
            }
        }
    } catch (error) {
        console.error('une Erreur est survenue:', error);
    }
}
async function configureServerPorts() {
    console.clear()
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const downloadsDir = path.join( 'downloads'); // Dossier racine

    try {
        const serverDirs = await fs.readdir(downloadsDir, { withFileTypes: true });

        for (const dirent of serverDirs) {
            if (dirent.isDirectory()) {
                const serverDirPath = path.join(downloadsDir, dirent.name);
                const mohistJarPath = path.join(serverDirPath, 'mohist.jar');

                if (await fs.pathExists(mohistJarPath)) {
                    await new Promise((resolve) => {
                        rl.question(`Entrée un port pour ${dirent.name}: `, async (port) => {
                            const serverPropertiesPath = path.join(serverDirPath, 'server.properties');
                            let properties = '';

                            if (await fs.pathExists(serverPropertiesPath)) {
                                properties = await fs.readFile(serverPropertiesPath, 'utf8');
                            }

                            const newProperties = properties
                                .split('\n')
                                .map(line => line.startsWith('server-port=') ? `server-port=${port}` : line)
                                .join('\n');

                            if (!newProperties.includes(`server-port=${port}`)) {
                                properties += `\nserver-port=${port}`;
                            } else {
                                properties = newProperties;
                            }

                            await fs.writeFile(serverPropertiesPath, properties, 'utf8');
                            console.log(`Mise a jour du port de ${dirent.name} en ${port} `);
                            resolve();
                        });
                    });
                }
            }
        }
    } catch (error) {
        console.error('Une Erreur est survenue:', error);
    } finally {
        rl.close();
    }
}

async function configureVelocityAndServers(secret) {
    const downloadsDir = path.join('downloads');

    try {
        const serverDirs = await fs.readdir(downloadsDir, { withFileTypes: true });
        let velocityExists = false;
        let velocityDirPath = '';

        for (const dirent of serverDirs) {
            if (dirent.isDirectory()) {
                const serverDirPath = path.join(downloadsDir, dirent.name);
                const velocityJarPath = path.join(serverDirPath, 'velocity.jar');

                if (await fs.pathExists(velocityJarPath)) {
                    velocityExists = true;
                    velocityDirPath = serverDirPath;
                    break;
                }
            }
        }

        if (velocityExists) {
            const forwardingSecretPath = path.join(velocityDirPath, 'forwarding.secret');
            await fs.writeFile(forwardingSecretPath, secret, 'utf8');
            console.log(`[Velocity] Creation de fowarding.secret...`);
            for (const dirent of serverDirs) {
                if (dirent.isDirectory()) {
                    const serverDirPath = path.join(downloadsDir, dirent.name);
                    const mohistJarPath = path.join(serverDirPath, 'mohist.jar');

                    if (await fs.pathExists(mohistJarPath)) {
                        const spigotYmlPath = path.join(serverDirPath, 'spigot.yml');
                        const mohistYmlPath = path.join(serverDirPath, 'mohist-config', 'mohist.yml');
                        if (await fs.pathExists(spigotYmlPath)) {
                            let spigotYml = await fs.readFile(spigotYmlPath, 'utf8');
                            spigotYml = spigotYml.replace(/bungeecord:\s*(false|true)/, 'bungeecord: true');
                            await fs.writeFile(spigotYmlPath, spigotYml, 'utf8');
                            console.log(`[${serverDirPath.split("\\")[1]}] spigot.yml mis a jour avec les paramettre velocity`)
                        }
                        if (await fs.pathExists(mohistYmlPath)) {
                            let mohistYml = await fs.readFile(mohistYmlPath, 'utf8');
                            mohistYml = mohistYml.replace(/enabled:\s*(false|true)/, 'enabled: true');
                            mohistYml = mohistYml.replace(/secret:\s*\S*/, `secret: ${secret}`);
                            await fs.writeFile(mohistYmlPath, mohistYml, 'utf8');
                            console.log(`[${serverDirPath.split("\\")[1]}] Mise a jour de mohist.yml avec les paramettre velocity.`);
                        }
                    }
                }
            }
            console.log('Configuration de mohist terminer pour Velocity.');
        } else {
            console.log('Aucun Velocity trouve .');
        }
    } catch (error) {
        console.error('Une erreur est survenue:', error);
    }
}

async function startConfig(){
    await copyConfigContentsToMohistServers();
    await configureServerPorts();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Fowarding.secret pour velocity: ', async (secret) => {
        await configureVelocityAndServers(secret);
        rl.close();
    });
}

module.exports = {
    startConfig
}