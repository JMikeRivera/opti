const fs = require('fs'); 
const MongoClient = require('mongodb').MongoClient;
const conex= require('../../Configuraciones/ConStrDB');
const moment = require('moment');


const { host, puerto} = require('../../Configuraciones/ConexionDB');

const dbName = process.argv.slice(2)[0];
const DBUser = process.argv.slice(2)[1];
const DBPassword = process.argv.slice(2)[2];

//const uri = `mongodb://${host}:${puerto}/${dbName}`;
//const uri = `mongodb://${DBUser}:${DBPassword}@${host}:${puerto}/${dbName}?authSource=admin`;
const mongoUri =  conex.getUrl(DBUser,DBPassword,host,puerto,dbName);


const parametro = dbName;
const parte = parametro.substring(parametro.lastIndexOf("_") + 1);
const parametroFolder = parte.toUpperCase();
const logFile = `../../${parametroFolder}/log/ClasABCD_PolInvent.log`; 
const now = moment().format('YYYY-MM-DD HH:mm:ss');

// Configurar la conexión a MongoDB
//const uri = 'mongodb://127.0.0.1:27017'; // Cambia esta URL si tu servidor MongoDB está en otro lugar
//const dbName = 'btc_opti_a001';

async function calcularDiasCobertura() {

  //writeToLog('------------------------------------------------------------------------------');
  writeToLog(`\nPaso 17 - Transforamación de datos de salida a días de cobertura`);

  try {
    // Conectar a la base de datos
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);

    // Obtener los documentos de la colección política_inventarios_01 y ordenarlos
    const inventarios01Collection = db.collection('politica_inventarios_01');
    const inventarios01 = await inventarios01Collection.find().sort({ "Ubicacion": 1, "Producto": 1 }).toArray();

    // Calcular los valores y crear los documentos para la colección política_inventarios_dias_cobertura
    const diasCobertura = inventarios01.map((inventario) => ({
      Tipo_Calendario:"Dia",
      SKU: inventario.SKU,
      Producto: inventario.Producto,
      Desc_Producto: inventario.Desc_Producto,
      Familia_Producto: inventario.Familia_Producto,
      Categoria: inventario.Categoria,
      Segmentacion_Producto: inventario.Segmentacion_Producto,
      Presentacion: inventario.Presentacion,
      Ubicacion: inventario.Ubicacion,
      Desc_Ubicacion: inventario.Desc_Ubicacion,
      SS: Math.ceil(inventario.SS_Cantidad / inventario.Demanda_Promedio_Diaria),
      Demanda_LT: Math.ceil(inventario.Demanda_LT / inventario.Demanda_Promedio_Diaria),
      MOQ: Math.ceil(inventario.MOQ / inventario.Demanda_Promedio_Diaria),
      ROQ: Math.ceil(inventario.ROQ / inventario.Demanda_Promedio_Diaria),
      ROP: Math.ceil(inventario.ROP / inventario.Demanda_Promedio_Diaria),
      META: Math.ceil(inventario.META / inventario.Demanda_Promedio_Diaria),
      Inventario_Promedio: Math.ceil(inventario.Inventario_Promedio / inventario.Demanda_Promedio_Diaria),
      Vida_Util_Dias:0,
      Tolerancia_Vida_Util_Dias:0,
      ROP_Alto:" ",
      SobreInventario_Dias:0
    }));

    //console.log(diasCobertura);
    // Insertar los documentos en la colección política_inventarios_dias_cobertura
    //const diasCoberturaCollection = db.collection('política_inventarios_dias_cobertura');
    const diasCoberturaCollection = db.collection('ui_pol_inv_dias_cobertura');
    await diasCoberturaCollection.insertMany(diasCobertura);

    console.log('Los datos de días de cobertura se han calculado y guardado correctamente.');

    // Cerrar la conexión a MongoDB
    //writeToLog(`${now} - Ejecucion exitosa`);
    writeToLog(`\tTermina la Transforamación de datos de salida a días de cobertura`);
    client.close();
  } catch (error) {
    //console.error('Ocurrió un error:', error);
    writeToLog(`${now} - [ERROR] ${error.message}`);
    client.close();
  } 
}

function writeToLog(message) {
  fs.appendFileSync(logFile, message + '\n');
}


// Ejecutar la función principal
calcularDiasCobertura();
