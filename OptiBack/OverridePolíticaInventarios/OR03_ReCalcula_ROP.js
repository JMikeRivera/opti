const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const conex= require('../Configuraciones/ConStrDB');
const moment = require('moment');

const { host, puerto } = require('../Configuraciones/ConexionDB');

const dbName = process.argv.slice(2)[0];
const DBUser = process.argv.slice(2)[1];
const DBPassword = process.argv.slice(2)[2];

//const uri = `mongodb://${host}:${puerto}/${dbName}`;
//const uri = `mongodb://${DBUser}:${DBPassword}@${host}:${puerto}/${dbName}?authSource=admin`;
const mongoUri =  conex.getUrl(DBUser,DBPassword,host,puerto,dbName);


const parametro = dbName;
const parte = parametro.substring(parametro.lastIndexOf("_") + 1);
const parametroFolder = parte.toUpperCase();
const logFile = `../../${parametroFolder}/log/Override_PolInvent.log`; 
const now = moment().format('YYYY-MM-DD HH:mm:ss');

  //const uri = 'mongodb://127.0.0.1:27017'; 

async function calculateAndSetSSCantidad() {
  //writeToLog('------------------------------------------------------------------------------');
  writeToLog(`\nPaso 03 - Re-Calculo del ROP`);

  let client;
  client = new MongoClient(mongoUri);
  //const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(`${dbName}`); 
    const col = db.collection('politica_inventarios_01');


    const result = await col.aggregate([
      {
        $project: {
          SS_Cantidad: 1,
          Prom_LT: 1,
          Demanda_Promedio_Diaria: 1,
          Tipo_Override: 1,
          Medida_Override: 1,
          Override_Min_Politica_Inventarios: 1,
          Override_Max_Politica_Inventarios: 1,
          ROP: {
            $cond: {
              if: { $or: [{ $ne: ['$Override_Min_Politica_Inventarios', ''] }, { $ne: ['$Override_Max_Politica_Inventarios', ''] }] },
              then: {
                $cond: {
                  if: { $eq: ['$Tipo_Override', 'SS'] },
                  then: { $add: ['$SS_Cantidad', { $multiply: ['$Prom_LT', '$Demanda_Promedio_Diaria'] }] },
                  else: {
                    $cond: {
                      if: { $gt: ['$SS_Cantidad', 0] },
                      then: { $add: ['$SS_Cantidad', { $multiply: ['$Prom_LT', '$Demanda_Promedio_Diaria'] }] },
                      else: {
                        $cond: {
                          if: { $eq: ['$Medida_Override', 'Cantidad'] },
                          then: '$Override_Max_Politica_Inventarios',
                          else: { $multiply: ['$Override_Max_Politica_Inventarios', '$Demanda_Promedio_Diaria'] }
                        }
                      }
                    }
                  }
                }
              },
              else: { $add: ['$SS_Cantidad', { $multiply: ['$Prom_LT', '$Demanda_Promedio_Diaria'] }] }
            }
          }
        }
      }
    ]).toArray();
    

    
/*
    const result = await col.aggregate([
      {
        $project: {
          ROP: {
            $cond: {
              if: { $ne: ["$Override_Politica_Inventarios", ""] },
              then: {
                $cond: {
                  if: { $eq: ["$Tipo_Override", "SS"] },
                  then: {
                    $cond: {
                      if: { $eq: ["$Medida_Override", "Cantidad"] },
                      then: {
                        $add: ["$Override_Politica_Inventarios", { $multiply: ["$Prom_LT", "$Demanda_Promedio_Diaria"] }]
                      },
                      else: {
                        $add: [
                          { $multiply: ["$Override_Politica_Inventarios", "$Demanda_Promedio_Diaria"] },
                          { $multiply: ["$Prom_LT", "$Demanda_Promedio_Diaria"] }
                        ]
                      }
                    }
                  },
                  else: {
                    $cond: {
                      if: { $eq: ["$Medida_Override", "Cantidad"] },
                      then: "$Override_Politica_Inventarios",
                      else: { $multiply: ["$Override_Politica_Inventarios", "$Demanda_Promedio_Diaria"] }
                    }
                  }
                }
              },
              else: {
                $add: ["$SS_Cantidad", { $multiply: ["$Prom_LT", "$Demanda_Promedio_Diaria"] }]
              }
            }
          }
        }
      }
    ]).toArray();
*/

    //console.log(JSON.stringify(result, null, 2));

    //writeToLog(JSON.stringify(result, null, 2));

//    const result = await col.find().toArray();

    // Escribir el resultado en el log
/*    writeToLog("Contenido de la colección 'politica_inventarios_01':");
    result.forEach((doc, index) => {
      writeToLog(`Documento ${index + 1}:`);
      Object.entries(doc).forEach(([key, value]) => {
        writeToLog(`  ${key}: ${JSON.stringify(value)}`);
      });
      writeToLog("\n");
    });
*/

    for (const doc of result) {
      await col.updateOne(
        { _id: doc._id },
        { $set: { 'ROP': doc.ROP } }
      );
    }
    


    writeToLog(`\tTermina el Re-Calculo del ROP`);
  } catch (error) {
    writeToLog(`${now} - [ERROR] ${error.message}`);
  } finally {
    await client.close();
  }
}

function writeToLog(message) {
  fs.appendFileSync(logFile, message + '\n');
}

calculateAndSetSSCantidad();
