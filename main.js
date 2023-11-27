const http = require ('http'); 
const xml = require ('fast-xml-parser');
const XMLBuilder = require ("fast-xml-parser");
const fs = require ('fs');

const host = 'localhost';
const port = 8000;
const type = "utf-8";

const parser = new xml.XMLParser();
const builder = new XMLBuilder.XMLBuilder();
let jsonData;
const FilePathXML = 'C:\\Veb\\bc2023-4\\data.xml';

function parseXml(data, callback) {
    try {
        jsonData = parser.parse(data, false );
        console.log( 'XML data parsed successfully' );
        callback(null, jsonData);
    } catch (error) {
       //  callback(error, null);
    }
}

function filterXml(record) {
    const kuValue = record.field.find((field) => field['@name'] === 'ku')?.['@value'];
    const valueField = record.field.find((field) => field['@name'] === 'value');
    const numericValue = parseFloat(valueField?.['@value']);

    if (kuValue === '13' && numericValue > 5) {
        return true;  
    }

    return false;  
}


const requestListener = function (req, res) {
    fs.readFile(FilePathXML, 'utf8', (err, data) => {
        if (err) {
            console.error(`File reading error: ${err}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.send(err.message);
            return;
        }

        parseXml(data, (err, parsedData) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.send(err.message);
                return;
            }

            // Тут викликаємо filterXml та перевіряємо результат
            const isFiltered = filterXml(parsedData);
            if (isFiltered) {
                // Якщо дані відповідають умовам фільтрації, виконайте потрібні дії.
                console.log(`${parsedData.indicators.inflation[0].dt}`);
                res.status(200).send("yes");
            } else {
                // Якщо дані не відповідають умовам фільтрації, відправте відповідь з іншим статусом.
                res.status(403).send("Filtered out");
            }
        });
    });
}


    

const server = http.createServer(requestListener);  
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
})