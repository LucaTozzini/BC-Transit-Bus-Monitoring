import http from 'http';
import fs from 'fs';
import AdmZip from 'adm-zip';

function downloadExtractZipFolder(zipFileUrl, destinationPath) {
  return new Promise((resolve, reject) => {
    http.get(zipFileUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download zip file: ${response.statusCode} ${response.statusMessage}`));
      }

      const zipData = [];

      response.on('data', (chunk) => {
        zipData.push(chunk);
      });

      response.on('end', () => {
        const zipBuffer = Buffer.concat(zipData);

        // Write the downloaded zip file to disk
        fs.writeFile('downloaded.zip', zipBuffer, (err) => {
          if (err) {
            reject(err);
          }

          // Extract the zip file to the specified destination path
          const zip = new AdmZip('downloaded.zip');
          zip.extractAllTo(destinationPath);

          resolve(201);
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export default downloadExtractZipFolder;
