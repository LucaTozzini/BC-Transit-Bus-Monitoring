// Thanks ChatGPT

import fs from 'fs';
import https from 'https';

function downloadFile(fileUrl, filePath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filePath);

    file.on('open', () => {
      https.get(fileUrl, (response) => {
        file.on('error', (error) => {
          console.error(error);
          resolve(500);
        });

        // Truncate the file to remove existing content
        fs.truncate(filePath, 0, (error) => {
          if (error) {
            console.error(error);
            resolve(500);
          }

          // Write the new content to the file
          response.pipe(file);
          resolve(201);
        });
      });
    });
  });
}

export default downloadFile;