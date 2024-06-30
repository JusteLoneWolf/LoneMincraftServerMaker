const readline = require("readline");
class TerminalManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    rl(){
        return this.rl
    }
    close() {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        process.stdin.removeAllListeners('keypress');
        console.log('Terminal closed.');
    }
    async createMenu(options, question) {
        return new Promise((resolve) => {
            let currentIndex = 0;
            function displayMenu() {
                console.clear();
                console.log(question);
                console.log('Utilisez les flèches haut et bas pour naviguer, et appuyez sur Entrée pour sélectionner.\n');
                options.forEach((option, index) => {
                    if (index === currentIndex) {
                        console.log(`> ${option}`);
                    } else {
                        console.log(`  ${option}`);
                    }
                });
            }

            function handleInput(key) {
                if (key.name === 'up') {
                    currentIndex = (currentIndex === 0) ? options.length - 1 : currentIndex - 1;
                } else if (key.name === 'down') {
                    currentIndex = (currentIndex === options.length - 1) ? 0 : currentIndex + 1;
                } else if (key.name === 'return') {
                    resolve(options[currentIndex]);

                }
                displayMenu();
            }

            readline.emitKeypressEvents(process.stdin);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }
            process.stdin.setRawMode(true);

            process.stdin.on('keypress', (str, key) => {
                handleInput(key);
            });

            displayMenu();
        });
    }
}

module.exports = TerminalManager;
