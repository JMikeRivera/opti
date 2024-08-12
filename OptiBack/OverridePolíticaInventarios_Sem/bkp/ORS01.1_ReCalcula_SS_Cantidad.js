const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const conex= require('../../Configuraciones/ConStrDB');
const moment = require('moment');

const { host, puerto } = require('../../Configuraciones/ConexionDB');

const dbName = process.argv.slice(2)[0];
const DBUser = process.argv.slice(2)[1];
const DBPassword = process.argv.slice(2)[2];

//const uri = `mongodb://${host}:${puerto}/${dbName}`;
//const uri = `mongodb://${DBUser}:${DBPassword}@${host}:${puerto}/${dbName}?authSource=admin`;
const mongoUri =  conex.getUrl(DBUser,DBPassword,host,puerto,dbName);


const parametro = dbName;
const parte = parametro.substring(parametro.lastIndexOf("_") + 1);
const parametroFolder = parte.toUpperCase();
const logFile = `../../${parametroFolder}/log/Override_PolInvent_Sem.log`; 
const now = moment().format('YYYY-MM-DD HH:mm:ss');

  //const uri = 'mongodb://127.0.0.1:27017'; 

async function calculateAndSetSSCantidad() {
  //writeToLog('------------------------------------------------------------------------------');
  writeToLog(`\nPaso 01.1 - Re-Calculo del SS Cantidad`);

  let client;
  client = new MongoClient(mongoUri);
  //const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(`${dbName}`); 
    const col = db.collection('politica_inventarios_01_sem');



    const result = await col.aggregate([
      {
        $project: {
          SS_Cantidad: {
            $cond: {
              if: {
                $or: [
                  { $ne: ['$Override_Max_Politica_Inventarios', ''] },
                  { $ne: ['$Override_Min_Politica_Inventarios', ''] }
                ]
              },
              then: {
                $cond: {
                  if: { $eq: ['$Tipo_Override', 'SS'] },
                  then: {
                    $cond: {
                      if: { $eq: ['$Medida_Override', 'Cantidad'] },
                      then: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ['$Override_Max_Politica_Inventarios', ''] },
                              { $lt: ['$Override_Max_Politica_Inventarios', '$STAT_SS'] }
                            ]
                          },
                          then: '$Override_Max_Politica_Inventarios',
                          else: {
                            $cond: {
                              if: { $gt: ['$Override_Min_Politica_Inventarios', '$STAT_SS'] },
                              then: '$Override_Min_Politica_Inventarios',
                              else: '$STAT_SS'
                            }
                          }
                        }
                      },
                      else: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ['$Override_Max_Politica_Inventarios', ''] },
                              { $lt: [{ $multiply: ['$Override_Max_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, '$STAT_SS'] }
                            ]
                          },
                          then: { $multiply: ['$Override_Max_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] },
                          else: {
                            $cond: {
                              if: { $gt: [{ $multiply: ['$Override_Min_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, '$STAT_SS'] },
                              then: { $multiply: ['$Override_Min_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] },
                              else: '$STAT_SS'
                            }
                          }
                        }
                      }
                    }
                  },
                  else: {
                    $max: [
                      0,
                      {
                        $cond: {
                          if: { $eq: ['$Medida_Override', 'Cantidad'] },
                          then: {
                            $cond: {
                              if: {
                                $and: [
                                  { $ne: ['$Override_Max_Politica_Inventarios', ''] },
                                  { $lt: [{ $subtract: ['$Override_Max_Politica_Inventarios', { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] }, '$STAT_SS'] }
                                ]
                              },
                              then: { $subtract: ['$Override_Max_Politica_Inventarios', { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] },
                              else: {
                                $cond: {
                                  if: { $gt: [{ $subtract: ['$Override_Min_Politica_Inventarios', { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] }, '$STAT_SS'] },
                                  then: { $subtract: ['$Override_Min_Politica_Inventarios', { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] },
                                  else: '$STAT_SS'
                                }
                              }
                            }
                          },
                          else: {
                            $cond: {
                              if: {
                                $and: [
                                  { $ne: ['$Override_Max_Politica_Inventarios', ''] },
                                  { $lt: [{ $subtract: [{ $multiply: ['$Override_Max_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] }, '$STAT_SS'] }
                                ]
                              },
                              then: { $subtract: [{ $multiply: ['$Override_Max_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] },
                              else: {
                                $cond: {
                                  if: { $gt: [{ $subtract: [{ $multiply: ['$Override_Min_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] }, '$STAT_SS'] },
                                  then: { $subtract: [{ $multiply: ['$Override_Min_Politica_Inventarios', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }, { $multiply: ['$Prom_LT', { $divide: ['$Demanda_Promedio_Semanal', 7] }] }] },
                                  else: '$STAT_SS'
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              },
              else: '$STAT_SS'
            }
          }
        }
      }
    ]).toArray();
    
    

  /*  
    const result = await col.aggregate([
      {
        $project: {
          SS_Cantidad: {
            $cond: {
              if: { $ne: ["$Override_Politica_Inventarios", ""] },
              then: {
                $cond: {
                  if: { $eq: ["$Tipo_Override", "SS"] },
                  then: {
                    $cond: {
                      if: { $eq: ["$Medida_Override", "Cantidad"] },
                      then: "$Override_Politica_Inventarios",
                      else: {
                        $multiply: ["$Override_Politica_Inventarios", "$Demanda_Promedio_Semanal"]
                      }
                    }
                  },
                  else: {
                    $max: [
                      0,
                      {
                        $subtract: [
                          "$Override_Politica_Inventarios",
                          { $multiply: ["$Prom_LT", "$Demanda_Promedio_Semanal"] }
                        ]
                      }
                    ]
                  }
                }
              },
              else: {
                    $let: {
                      vars: {
                        promLT: '$Prom_LT',
                        frecuencia: '$Frecuencia_Revision_dias',
                        dsDemanda: '$DS_Demanda',
                        demandaPromedioSemanal: '$Demanda_Promedio_Semanal',
                        dsLt: '$DS_LT',
                        valorZ: '$Valor_Z'
                      },
                      in: {
                        $multiply: [
                          '$$valorZ',
                          {
                            $sqrt: {
                              $add: [
                                {
                                      $multiply: [
                                        { 
                                          $add: [
                                            { $divide: ['$$promLT', 7] },
                                            { $divide: ['$$frecuencia', 7] }
                                          ]
                                        },
                                        { $pow: ['$$dsDemanda', 2] }
                                      ]
                                    },
                                    {
                                      $multiply: [
                                        { $pow: ['$$demandaPromedioSemanal', 2] },
                                        { 
                                          $pow: [
                                            { $divide: ['$$dsLt', 7] },
                                            2
                                          ]
                                        }
                                      ]
                                    }
                              ]
                            }
                          }
                        ]
                      }
                    }
              }
            }
          }
        }
      }
    ]).toArray();
*/

    for (const doc of result) {
      await col.updateOne(
        { _id: doc._id },
        { $set: { 'SS_Cantidad': doc.SS_Cantidad } }
      );
    }
    


    writeToLog(`\tTermina el Re-Calculo del SS Cantidad`);
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
