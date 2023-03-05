import https from 'https';

function downloadFile(fileUrl) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/octet-stream',
      }
    };

    https.get(fileUrl, options, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`);
        reject(500);
      }

      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    }).on('error', (err) => {
      console.error(err.message);
      reject(500);
    });
  });
}

export default downloadFile;
