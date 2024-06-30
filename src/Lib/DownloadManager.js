const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const ProgressBar = require('progress');
const jarsVersion = require('../../data/jarsVersion.json')
const parseContentDisposition = require('content-disposition-parser');
module.exports = class DownloadManager{
    async downloadFile(urls, outputRootFolder) {
        let i = 1
        for (let url of urls) {

            const response = await axios({
                url: url,
                method: 'GET',
                responseType: 'stream'
            });
            const totalLength = parseInt(response.headers['content-length'], 10);
            const contentDisposition = response.headers['content-disposition'];
            const progressBar = new ProgressBar(`Téléchargement ${parseContentDisposition(contentDisposition).filename} [:bar] :percent :etas`, {
                complete: '=',
                incomplete: ' ',
                width: 20,
                total: totalLength
            });
            const outputFolder = path.join(outputRootFolder, `server${i++}`);
            if (!fs.existsSync(outputFolder)) {
                fs.mkdirSync(outputFolder, { recursive: true });
            }
            let filename = 'unknown-file';
            if (contentDisposition) {
                const disposition = parseContentDisposition(contentDisposition);
                if (disposition && disposition.filename) {
                    filename = disposition.filename.split('-')[0]+".jar";
                }
            }

            const filePath = path.join(outputFolder, filename);

            const writer = fs.createWriteStream(filePath);

            response.data.on('data', (chunk) => {
                progressBar.tick(chunk.length);
            });

            await new Promise((resolve, reject) => {
                pipeline(response.data, writer, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
}