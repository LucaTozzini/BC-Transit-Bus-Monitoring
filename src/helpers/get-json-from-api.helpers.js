import https from 'https'

function getJsonFromApi(url){
    return new Promise(resolve => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
    
            response.on('end', async () => {
                const json = await JSON.parse(data);
                resolve(json);
            });
    
        }).on('error', (error) => {
            console.error(error);
            resolve('error');
        });
    })
} 

export default getJsonFromApi