let MOHIST,PAPER;
const fs = require('fs');
const path = require('path');
const axios = require ("axios")
async function getVersion(version) {
    try {
        const mohistPromise = axios.get(`https://mohistmc.com/api/v2/projects/mohist/${version}/builds`);
        const paperPromise = axios.get(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
        const velocityPromise = axios.get(`https://api.papermc.io/v2/projects/velocity/versions/3.3.0-SNAPSHOT/builds`);
        const [mohistResponse, paperResponse, velocityResponse] = await Promise.all([mohistPromise, paperPromise,velocityPromise]);

        const mohistUrl = mohistResponse.data.builds[0].url;
        const latestBuildPaper = paperResponse.data.builds.pop();
        const latestBuildVelocity = velocityResponse.data.builds.pop();
        const paperUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latestBuildPaper.build}/downloads/${latestBuildPaper.downloads.application.name}`;
        const velocityUrl = `https://api.papermc.io/v2/projects/velocity/versions/3.3.0-SNAPSHOT/builds/${latestBuildVelocity.build}/downloads/${latestBuildVelocity.downloads.application.name}`;
        const result = {
            Mohist: {
                url: mohistUrl,
                filename:"mohist.jar"
            },
            velocity: {
                url: velocityUrl,
                filename:"velocity.jar"
            },
        };

        const resultFilePath = path.join('data/jarsVersion.json');
        fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 2), 'utf-8');
    } catch (error) {
        console.error('Erreur lors de la recuperation des version', error);
    }
}
module.exports ={

    getVersion,
}