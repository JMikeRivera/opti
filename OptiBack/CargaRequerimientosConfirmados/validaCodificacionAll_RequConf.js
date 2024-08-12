const fs = require('fs');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const moment = require('moment');
 
const now = moment().format('YYYY-MM-DD');

const parametroUsuario = process.argv.slice(2)[0];
const parametroFolder = parametroUsuario.toUpperCase();

const filePath = `../../${parametroFolder}/csv/in/requerimientos_confirmados.csv`;
const logFile = `../../${parametroFolder}/log/LogdeCargaRequConfCSV.log`;

writeToLog(`Paso 01 - Revision de Encoding del CSV`);


const contentBuffer = fs.readFileSync(filePath);


const detectedResult = jschardet.detect(contentBuffer);
const detectedEncoding = detectedResult.encoding;

const originalFilePath = filePath.replace('.csv', `_org_${now}.csv`);
const newFilePath = filePath;
const tempFolderPath = `../../${parametroFolder}/temp`;
const movedFilePath = `${tempFolderPath}/requerimientos_confirmados_org_${now}.csv`;


fs.renameSync(filePath, originalFilePath);


const content = iconv.decode(contentBuffer, detectedEncoding);
const utf8Content = iconv.encode(content, 'utf-8');

fs.writeFileSync(newFilePath, utf8Content);

writeToLog(`\tValidacion de Encoding del archivo requerimientos_confirmados.csv realizada con exito.\n`);

if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath);
}

fs.renameSync(originalFilePath, movedFilePath);

function writeToLog(message) {
  fs.appendFileSync(logFile, message + '\n');
}