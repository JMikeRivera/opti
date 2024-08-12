const fs = require('fs');
const moment = require('moment');
const { MongoClient } = require('mongodb');
const conex= require('../Configuraciones/ConStrDB');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const now = moment().format('YYYY-MM-DD HH:mm:ss');

const dbName = process.argv.slice(2)[0];
const parametroFolder = process.argv.slice(2)[1];

const { decryptData } = require('./DeCriptaPassAppDb');
const { host, puerto } = require('../Configuraciones/ConexionDB');
const { DBUser, DBPassword } = require(`../../${parametroFolder}/cfg/uservars`);
const logFile = `../../${parametroFolder}/log/LogdeCargaRequConfCSV.log`; // Cambia esta ruta según la ubicación de tu archivo CSV
const csvPath = `../../${parametroFolder}/reportes/RequConfirmados_SKUs_Faltantes.csv`;

//const mongoUri = `mongodb://${host}:${puerto}/${dbName}`;



const csvWriterOptions = {
  path: csvPath,
  header: [
    { id: 'SKU', title: 'SKU' },
    { id: 'Producto', title: 'Producto' },
    { id: 'Ubicacion', title: 'Ubicacion' },
    { id: 'Cliente', title: 'Cliente' },
    { id: 'Cantidad_Confirmada', title: 'Cantidad_Confirmada' },
  ],
};


async function main() {
  //const mongoUri = `mongodb://dbTEST05:dfgh2354ikofhdsf@${host}:${puerto}/${dbName}?authSource=admin`;
  const passadminDeCripta = await getDecryptedPassadmin();
  //const mongoUri = `mongodb://${DBUser}:${passadminDeCripta}@${host}:${puerto}/${dbName}?authSource=admin`;
  const mongoUri =  conex.getUrl(DBUser,passadminDeCripta,host,puerto,dbName);
  const client = new MongoClient(mongoUri);

  writeToLog(`\nPaso 07 - Validacion de Integridad de los SKU.`);

  try {

    // Comprueba si el archivo existe
    if (fs.existsSync(csvPath)) {
      // Elimina el archivo si existe
      fs.unlinkSync(csvPath);
      console.log(`El archivo ${csvPath} ha sido eliminado.`);
    } else {
      console.log(`El archivo ${csvPath} no existe, no se ha realizado ninguna acción.`);
    }

    
    
    
    


    await client.connect();

    const db = client.db(dbName);
    const skuCollection = db.collection('sku');
    const RequConfCollection = db.collection('requerimientos_confirmados');
    const ColeccionRespaldo = db.collection('report_sin_sku_reqconf_vs_sku');

    // Obtener todos los SKUs de la colección "sku"
    const skuDocs = await skuCollection.find({}).toArray();
    const skus = skuDocs.map((doc) => doc.SKU);

    // Obtener los registros del historial de demanda que no tienen SKU en la colección "sku"
    const skusNoEncontrados = await RequConfCollection
      .find({ SKU: { $nin: skus } })
      .toArray();

    if (skusNoEncontrados.length === 0) {
      writeToLog(`\tIntegridad de SKUs correcta.`);
      return;
    }

    // Formatear la fecha en el formato "DD/MM/YYYY"
    const registrosFormateados = skusNoEncontrados.map((registro) => {
    /*  const fecha = registro.Fecha.toISOString().substring(8, 10) + '/' +
        registro.Fecha.toISOString().substring(5, 7) + '/' +
        registro.Fecha.toISOString().substring(0, 4);*/

      return {
        SKU: registro.SKU,
        Producto: registro.Producto,
        Ubicacion: registro.Ubicacion,
        Cliente: registro.Cliente,
        Cantidad_Confirmada: registro.Cantidad_Confirmada,
      };
    });

    const csvWriter = createCsvWriter(csvWriterOptions);
    await csvWriter.writeRecords(registrosFormateados);


    const documentosAInsertar = skusNoEncontrados.map((registro) => {
      return {
        _id: registro._id,
        SKU: registro.SKU,
        Ubicacion: registro.Ubicacion,
        Cliente: registro.Cliente,
        Cantidad_Confirmada: registro.Cantidad_Confirmada
      };
    });
    

    await ColeccionRespaldo.deleteMany({});
    await ColeccionRespaldo.insertMany(documentosAInsertar);


    const skusNoEncontradosIds = skusNoEncontrados.map((registro) => registro._id);
    await RequConfCollection.deleteMany({ _id: { $in: skusNoEncontradosIds } });

    writeToLog(`\tSe encontraron ${skusNoEncontradosIds.length} registros en "Los Requerimientos Confirmados" con problemas de Integridad de SKUs`);
    writeToLog(`\t\tSe eliminan dichos registros para evitar errores en los calculos`);
  } catch (error) {
    writeToLog(`${now} - Error: ${error}`);
  } finally {
    await client.close();
  }
}

function writeToLog(message) {
  fs.appendFileSync(logFile, message + '\n');
}


// Obtener el valor desencriptado de passadmin
async function getDecryptedPassadmin() {
  try {
    return await decryptData(`${DBPassword}`);
  } catch (error) {
    console.error('Error al desencriptar el passadmin:', error);
    throw error;
  }
}



main().catch(console.error);
