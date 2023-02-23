// Thanks ChatGPT
import fs from 'fs';
import http from 'http';

function downloadFile(fileUrl, filePath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filePath);

    file.on('open', () => {
      http.get(fileUrl, (response) => {
        file.on('error', (error) => {
          console.error(error);
          resolve(500);
        });

        // Truncate the file to remove existing content
        fs.truncate(filePath, 0, (err) => {
          if(err){
            console.error(err);
            resolve(500);
          }
          // Write the new content to the file
          response.pipe(file);
          file.on('finish', () => {
            resolve(201);
          });
        });
      }).on('error', (err) => {
        resolve(500)
      });
    });
  });
}

export default downloadFile;