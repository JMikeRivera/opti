const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');
const moment = require('moment-timezone');
const archiver = require('archiver'); 
const { Parser } = require('json2csv');
const logger = require('./logger'); // Importa la configuración de winston

const cors = require('cors');

const conex= require('./Configuraciones/ConStrDB');
const { decryptData } = require('./DeCriptaPassAppDb');
//const { host, puerto, useradmin, passadmin } = require('./Configuraciones/ConexionDB');
const app = express();
app.use(cors());
const port = 3000;

const directorioActual = __dirname;
const rutaDirConfiguraCliente = path.join(directorioActual, 'ConfiguraCliente');
const rutaDirCargaSKU = path.join(directorioActual, 'CargaSKU');
const rutaDirCargaHistorico = path.join(directorioActual, 'CargaHistorico');
const rutaDirClasifABCD = path.join(directorioActual, 'ClasifABCD_PoliticaInvent');
const rutaDirClasifABCDSem = path.join(directorioActual, 'ClasifABCD_PoliticaInvent_Sem');
const rutaDirCargaInvDisponible = path.join(directorioActual, 'CargaInvDisponible');
const rutaDirCargaInvTrans = path.join(directorioActual, 'CargaInvTrans');
const rutaDirCargaRequerimientosConfirmados = path.join(directorioActual, 'CargaRequerimientosConfirmados');
const rutaDirPlanReposicion = path.join(directorioActual, 'PlanReposicion');
const rutaDirPlanReposicion_Sem = path.join(directorioActual, 'PlanReposicion_Sem');

// Configuración de conexión a MongoDB
//const mongoURL = 'mongodb://127.0.0.1:27017';
//const userDbName = 'opti_users';
//const userCollectionName = 'usuarios';*/
//const dataDbName = 'btc_opti_jtx01';

//const mongoURL2 = 'mongodb://127.0.0.1:27017';
//const userDbName2 = 'btc_opti_jtx01';
//const userCollectionName2 = 'usuarios';

const adminDbName = 'OptiBTC';
const usersCollectionName = 'usuarios';

//let userDbName = ''; 
//let userLogged = ''; 
// Configurar EJS como motor de plantillas
//app.set('view engine', 'ejs');
app.use(express.static(__dirname));
// Middleware para procesar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

// Middleware para el manejo de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Carpeta donde se guardarán los archivos cargados
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Ruta para mostrar la página de inicio de sesión
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/login', async (req, res) => {
  const logUsername = req.body.username;
  const logPassword = req.body.password;

  console.log("usuario: " + logUsername + " pass: " + logPassword);

  try {
    const client = await conex.connectToDatabase();
    const dbUsuarios = client.db(adminDbName).collection(usersCollectionName);

    const user = await dbUsuarios.findOne({
      $or: [
        { AppUser: logUsername },
        { 'UserUI.AppUser': logUsername }
      ]
    });

    if (!user) {
      res.redirect('/?error=Usuario no encontrado');
      return;
    }

    let p_AppUser, p_AppPass, dbUser, dbPass, dbName, userType, userName, userActivo;

    if (user.AppUser === logUsername) {
      // Main user
      p_AppUser = user.AppUser;
      p_AppPass = user.AppPassword;
      dbUser = user.DBUser;
      dbPass = user.DBPassword;
      dbName = `btc_opti_${p_AppUser}`;
      userType = user.Type;
      userName = user.UserName;
      userActivo = user.Activo;
    } else {
      // Sub-user
      const subUser = user.UserUI.find(sub => sub.AppUser === logUsername);
      p_AppUser = subUser.AppUser;
      p_AppPass = subUser.AppPassword;
      userType = subUser.Type;
      userName = subUser.UserName;
      userActivo = subUser.Activo;
      const userDB = user.UserDB.find(db => db.DBName === logUsername) || user.UserDB[0];
      dbUser = userDB.DBUser;
      dbPass = userDB.DBPassword;
      dbName = userDB.DBName;
    }

    const passuserDeCripta = await getDecryptedPassUser(p_AppPass);

    if (logPassword !== passuserDeCripta) {
      res.redirect('/?error=Contraseña incorrecta');
      return;
    }

    client.close();

    conex.setUserData(p_AppUser, passuserDeCripta, dbName);

    rutaDirLogFile = `../${conex.getUser()}/log/LogdeCargaCSV.log`;
      
    const comando = `cd /d "${rutaDirConfiguraCliente}" && node exec_js_Main_ConfiguraCliente_process_v2.js ${p_AppUser}`;
    
    console.log('ruta:'+rutaDirConfiguraCliente);
    console.log('Comando:'+comando);

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        return;
      }
    });


    res.status(200).json({
      AppUser: p_AppUser,
      password: p_AppPass,
      userType,
      userName,
      userActivo,
      dbName
    });
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});


//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//
app.post('/CargaCSVsku', upload.fields([
  { name: 'doc', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("cargar SKU");

    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("user: "+appUser+"\npass: "+decryptedAppPass+"\nDBName: "+DBName);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("conex generado");

    const skuCsv = req.files['doc'][0];
    // Ruta donde se guardarán los archivos en Windows
    const windowsDir = `../${DBName}/csv/`;

    // Mover y renombrar los archivos CSV cargados a la ruta de Windows
    //fs.renameSync(skuCsv.path, windowsDir + skuCsv.originalname);
    fs.renameSync(skuCsv.path, windowsDir + 'in/sku.csv');

    const rutaDirLogFile = path.join(__dirname, `../${DBName}/log/LogdeCargaCSV.log`);
    
    //Comando que ejecuta la carga del SKU
    const comando = `cd /d "${rutaDirCargaSKU}" && node exec_js_SKUMain_LoadData.js ${appUser}`;
   
    try {
      console.log(comando);

      const resultado = execSync(comando);
      console.log(resultado);
      const filePath = path.resolve(__dirname, rutaDirLogFile);
      //console.log(filePath);

      // Verificar si el archivo existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // El archivo no existe, crearlo vacío
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error al crear el archivo LogdeCargaCSV.log:', err);
              res.status(500).send('Error al crear el archivo LogdeCargaCSV.log');
              return;
            }
            leerArchivoLog(filePath);
          });
        } else {
          // El archivo existe, leerlo
          leerArchivoLog(filePath);
        }
      });
      
      function leerArchivoLog(filePath) {
        const logContent = fs.readFile(filePath, 'utf-8', (err, logContent) => {
          if (err) {
            console.error('Error al leer el archivo LogdeCargaCSV.log:', err);
            res.status(500).send('Error al leer el archivo LogdeCargaCSV.log');
            return;
          }
          res.send(logContent);
        });
      }
      console.log('Comando ejecutado con éxito:', resultado.toString());
    } catch (error) {
      //console.error('Error al ejecutar el comando:', error.stderr.toString());
      console.error('Error al ejecutar el comando:', error);
      res.status(500).send('Error al ejecutar el comando');
      return;
    }
  } catch (err) {
    console.error('Error al procesar los archivos CSV:', err);
    res.status(500).send('Error al procesar los archivos CSV');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/getActualCSVPol', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("user: "+appUser+"\npass: "+decryptedAppPass+"\nDBName: "+DBName);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("conex generado");

    // Ruta donde se guardarán los archivos en Windows
    const processedDir = `../${DBName}/csv/in/procesados/`;

    const files = fs.readdirSync(processedDir);

    const skuFiles = files
      .filter(file => file.startsWith('sku'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(processedDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    const historicoFiles = files
      .filter(file => file.startsWith('historico_demanda'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(processedDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (skuFiles.length === 0 && historicoFiles.length === 0) {
      return res.status(404).send('No relevant CSV files found');
    }

    const filesToDownload = [];
    if (skuFiles.length > 0) {
      filesToDownload.push({ name: skuFiles[0].name, path: path.join(processedDir, skuFiles[0].name) });
    }
    if (historicoFiles.length > 0) {
      filesToDownload.push({ name: historicoFiles[0].name, path: path.join(processedDir, historicoFiles[0].name) });
    }

    if (filesToDownload.length === 1) {
      const file = filesToDownload[0];
      res.download(file.path, file.name, (err) => {
        if (err) {
          console.error('Error downloading the file:', err);
          res.status(500).send('Error downloading the file');
        }
      });
    } else {
      const zipPath = path.join(processedDir, 'latest_csvs.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        res.download(zipPath, 'latest_csvs.zip', (err) => {
          if (err) {
            console.error('Error downloading the file:', err);
            res.status(500).send('Error downloading the file');
          }
          fs.unlinkSync(zipPath);
        });
      });

      archive.on('error', (err) => {
        console.error('Error creating zip archive:', err);
        res.status(500).send('Error creating zip archive');
      });

      archive.pipe(output);
      filesToDownload.forEach(file => {
        archive.file(file.path, { name: file.name });
      });
      archive.finalize();
    }
  } catch (error) {
    console.error('Error getting the latest CSV:', error);
    res.status(500).send('Error getting the latest CSV');
  }
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// historico_demanda.csv
app.post('/CargaCSVhist', upload.fields([
  { name: 'doc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("user: "+appUser+"\npass: "+decryptedAppPass+"\nDBName: "+DBName);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("conex generado");

    const historicoDemandaCsv = req.files['doc'][0];
    // Ruta donde se guardarán los archivos en Windows
    const windowsDir = `../${DBName}/csv/`;

    // Mover y renombrar los archivos CSV cargados a la ruta de Windows
    //fs.renameSync(historicoDemandaCsv.path, windowsDir + historicoDemandaCsv.originalname);
    fs.renameSync(historicoDemandaCsv.path, windowsDir + 'in/historico_demanda.csv');

    const rutaDirLogFile = path.join(__dirname, `../${DBName}/log/LogdeCargaCSV.log`);

    const comando = `cd /d "${rutaDirCargaHistorico}" && node exec_js_HistoricoMain_LoadData.js ${appUser}`;

    try {
      const resultado = execSync(comando);
      const filePath = path.resolve(__dirname, rutaDirLogFile);
      // Verificar si el archivo existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // El archivo no existe, crearlo vacío
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error al crear el archivo LogdeCargaCSV.log:', err);
              res.status(500).send('Error al crear el archivo LogdeCargaCSV.log');
              return;
            }
            // El archivo se ha creado con éxito, ahora podemos leerlo
            leerArchivoLog(filePath);
          });
        } else {
          // El archivo existe, leerlo
          leerArchivoLog(filePath);
        }
      });
      
      function leerArchivoLog(filePath) {
        const logContent = fs.readFile(filePath, 'utf8', (err, logContent) => {
          if (err) {
            console.error('Error al leer el archivo LogdeCargaCSV.log:', err);
            res.status(500).send('Error al leer el archivo LogdeCargaCSV.log');
            return;
          }
          res.send(logContent);
        });
      }
      //console.log('Comando ejecutado con éxito:', resultado .toString());
    } catch (error) {
      // Ocurrió un error al ejecutar el comando
      console.error('Error al ejecutar el comando:', error);
      res.status(500).send('Error al ejecutar el comando');
      return;
    }
  } catch (err) {
    console.error('Error al procesar los archivos CSV:', err);
    res.status(500).send('Error al procesar los archivos CSV');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
const esValorValido = (valor) => {
  const valoresPermitidos = ['A', 'B', 'C', 'D'];
  return valoresPermitidos.includes(valor);
};


app.post('/showParams', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    console.log("user: "+appUser+"\npass: "+appPass+"\nDBName: "+DBName);
    const decryptedAppPass = await getDecryptedPassUser(appPass);


    console.log("Pase");

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("conex generado");

    const userdb = conex.getDB();
    const client = await conex.connectToDatabase();
    const db = client.db(userdb);

    //----------------------------Variabilidad-----------------------------------
    const parametrosVariabilidadAlta = await db.collection('parametros_usuario').findOne({
      "Tipo": "Criterios",
      "Criterio_Clasificacion": "Variabilidad",
      "SubClasificacion": "Alta",
      "Orden": 3
    });
    const parametrosVariabilidadMedia = await db.collection('parametros_usuario').findOne({
      "Tipo": "Criterios",
      "Criterio_Clasificacion": "Variabilidad",
      "SubClasificacion": "Media",
      "Orden": 2
    });
    const parametrosVariabilidadBaja = await db.collection('parametros_usuario').findOne({
      "Tipo": "Criterios",
      "Criterio_Clasificacion": "Variabilidad",
      "SubClasificacion": "Baja",
      "Orden": 1
    });
    const valorVarAlta = parametrosVariabilidadAlta?.Parametros ?? 'N/A';
    const valorVarMedia = parametrosVariabilidadMedia?.Parametros ?? 'N/A';
    const valorVarBaja = parametrosVariabilidadBaja?.Parametros ?? 'N/A';

  //-------------------------Clasificacion A, B, C, D---------------------------------------
  //AltaBajoMuy_Baja
const parametrosClasAltaBajoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaBajoMuy Baja"
});
const valorClasAltaBajoMuy_Baja = parametrosClasAltaBajoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//AltaAltoMuy_Baja
const parametrosClasAltaAltoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaAltoMuy Baja"
});
const valorClasAltaAltoMuy_Baja = parametrosClasAltaAltoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//AltaBajoBaja
const parametrosClasAltaBajoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaBajoBaja"
});
const valorClasAltaBajoBaja = parametrosClasAltaBajoBaja?.Clasificacion_ABCD ?? 'N/A';

//AltaAltoBaja
const parametrosClasAltaAltoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaAltoBaja"
});
const valorClasAltaAltoBaja = parametrosClasAltaAltoBaja?.Clasificacion_ABCD ?? 'N/A';

//AltaBajoMedia
const parametrosClasAltaBajoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaBajoMedia"
});
const valorClasAltaBajoMedia = parametrosClasAltaBajoMedia?.Clasificacion_ABCD ?? 'N/A';

//AltaAltoMedia
const parametrosClasAltaAltoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaAltoMedia"
});
const valorClasAltaAltoMedia = parametrosClasAltaAltoMedia?.Clasificacion_ABCD ?? 'N/A';

//AltaBajoAlta
const parametrosClasAltaBajoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaBajoAlta"
});
const valorClasAltaBajoAlta = parametrosClasAltaBajoAlta?.Clasificacion_ABCD ?? 'N/A';

//AltaAltoAlta
const parametrosClasAltaAltoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"AltaAltoAlta"
});
const valorClasAltaAltoAlta = parametrosClasAltaAltoAlta?.Clasificacion_ABCD ?? 'N/A';

//MediaBajoMuy_Baja
const parametrosClasMediaBajoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaBajoMuy Baja"
});
const valorClasMediaBajoMuy_Baja = parametrosClasMediaBajoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//MediaAltoMuy_Baja
const parametrosClasMediaAltoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaAltoMuy Baja"
});
const valorClasMediaAltoMuy_Baja = parametrosClasMediaAltoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//MediaBajoBaja
const parametrosClasMediaBajoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaBajoBaja"
});
const valorClasMediaBajoBaja = parametrosClasMediaBajoBaja?.Clasificacion_ABCD ?? 'N/A';

//MediaAltoBaja
const parametrosClasMediaAltoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaAltoBaja"
});
const valorClasMediaAltoBaja = parametrosClasMediaAltoBaja?.Clasificacion_ABCD ?? 'N/A';

//MediaBajoMedia
const parametrosClasMediaBajoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaBajoMedia"
});
const valorClasMediaBajoMedia = parametrosClasMediaBajoMedia?.Clasificacion_ABCD ?? 'N/A';

//MediaAltoMedia
const parametrosClasMediaAltoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaAltoMedia"
});
const valorClasMediaAltoMedia = parametrosClasMediaAltoMedia?.Clasificacion_ABCD ?? 'N/A';

//MediaBajoAlta
const parametrosClasMediaBajoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaBajoAlta"
});
const valorClasMediaBajoAlta = parametrosClasMediaBajoAlta?.Clasificacion_ABCD ?? 'N/A';

//MediaAltoAlta
const parametrosClasMediaAltoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"MediaAltoAlta"
});
const valorClasMediaAltoAlta = parametrosClasMediaAltoAlta?.Clasificacion_ABCD ?? 'N/A';

//BajaBajoMuy_Baja
const parametrosClasBajaBajoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaBajoMuy Baja"
});
const valorClasBajaBajoMuy_Baja = parametrosClasBajaBajoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//BajaAltoMuy_Baja
const parametrosClasBajaAltoMuy_Baja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaAltoMuy Baja"
});
const valorClasBajaAltoMuy_Baja = parametrosClasBajaAltoMuy_Baja?.Clasificacion_ABCD ?? 'N/A';

//BajaBajoBaja
const parametrosClasBajaBajoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaBajoBaja"
});
const valorClasBajaBajoBaja = parametrosClasBajaBajoBaja?.Clasificacion_ABCD ?? 'N/A';

//BajaAltoBaja
const parametrosClasBajaAltoBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaAltoBaja"
});
const valorClasBajaAltoBaja = parametrosClasBajaAltoBaja?.Clasificacion_ABCD ?? 'N/A';


//BajaBajoMedia
const parametrosClasBajaBajoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaBajoMedia"
});
const valorClasBajaBajoMedia = parametrosClasBajaBajoMedia?.Clasificacion_ABCD ?? 'N/A';


//BajaAltoMedia
const parametrosClasBajaAltoMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaAltoMedia"
});
const valorClasBajaAltoMedia = parametrosClasBajaAltoMedia?.Clasificacion_ABCD ?? 'N/A';

//BajaBajoAlta
const parametrosClasBajaBajoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaBajoAlta"
});
const valorClasBajaBajoAlta = parametrosClasBajaBajoAlta?.Clasificacion_ABCD ?? 'N/A';

//BajaAltoAlta
const parametrosClasBajaAltoAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Variabilidad",
  "ID":"BajaAltoAlta"
});
const valorClasBajaAltoAlta = parametrosClasBajaAltoAlta?.Clasificacion_ABCD ?? 'N/A';

//---------Margen--------------
//MargenBajo
const parametrosMargenBajo = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Margen",
  "SubClasificacion": "Bajo",
  "Orden": 1

});
const valorMargenBajoPre = parametrosMargenBajo?.Parametros ?? 'N/A';
const valorMargenBajo = valorMargenBajoPre * 100;
//MargenAlto
const parametrosMargenAlto = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Margen",
  "SubClasificacion": "Alto",
  "Orden": 2

});
const valorMargenAltoPre = parametrosMargenAlto?.Parametros ?? 'N/A';
const valorMargenAlto = valorMargenAltoPre * 100;

  //---------------------Demanda------------------------------------------------ 
//DemandaMuyBaja
const parametrosDemandaMuyBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Demanda",
  "SubClasificacion": "Muy Baja",
  "Orden": 4
});
const valorDemandaMuyBaja = parametrosDemandaMuyBaja?.Parametros ?? 'N/A';

//DemandaBaja
const parametrosDemandaBaja = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Demanda",
  "SubClasificacion": "Baja",
  "Orden": 3
});
const valorDemandaBaja = parametrosDemandaBaja?.Parametros ?? 'N/A';

//DemandaMedia
const parametrosDemandaMedia = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Demanda",
  "SubClasificacion": "Media",
  "Orden": 2
});
const valorDemandaMedia = parametrosDemandaMedia?.Parametros ?? 'N/A';

//DemandaAlta
const parametrosDemandaAlta = await db.collection('parametros_usuario').findOne({
  "Tipo": "Criterios",
  "Criterio_Clasificacion":"Demanda",
  "SubClasificacion": "Alta",
  "Orden": 1
});
const valorDemandaAlta = parametrosDemandaAlta?.Parametros ?? 'N/A';

  //--------------------------------------------------------------------- 

  //HorizonteHistorico
  const parametrosHorizonteHistorico = await db.collection('parametros_usuario').findOne({
    "Tipo": "Horizontes",
    "Num_Param":1
  });
  const valorHorizonteHistorico = parametrosHorizonteHistorico?.Horizonte_Historico_dias ?? 'N/A';

  //FinHorizonte
  const parametrosFinHorizonte = await db.collection('parametros_usuario').findOne({
    "Tipo": "Horizontes",
    "Num_Param":2
  });
  //const valorFinHorizonte = parametrosFinHorizonte?.Fecha_Fin_Horizonte ?? 'N/A';
  const fechaMongoDB = parametrosFinHorizonte?.Fecha_Fin_Horizonte ?? 'N/A';
  //const fechaLocal = moment.utc(fechaMongoDB).local().format('DD/MM/YYYY');
  const fechaFormateada = moment.utc(fechaMongoDB).format('DD/MM/YYYY');
  const valorFinHorizonte = fechaFormateada;

  //--------------------------------------------------------------------- 

  //NivelServ_A
  const parametrosNivelServ_A = await db.collection('parametros_usuario').findOne({
    "Tipo": "Nivel_Servicio",
    "Clasificacion": "A"
  });
  const valorNivelServ_A = parametrosNivelServ_A?.NivelServicio ?? 'N/A';

  //NivelServ_B
  const parametrosNivelServ_B = await db.collection('parametros_usuario').findOne({
    "Tipo": "Nivel_Servicio",
    "Clasificacion": "B"
  });
  const valorNivelServ_B = parametrosNivelServ_B?.NivelServicio ?? 'N/A';

  //NivelServ_C
  const parametrosNivelServ_C = await db.collection('parametros_usuario').findOne({
    "Tipo": "Nivel_Servicio",
    "Clasificacion": "C"
  });
  const valorNivelServ_C = parametrosNivelServ_C?.NivelServicio ?? 'N/A';

  //NivelServ_D
  const parametrosNivelServ_D = await db.collection('parametros_usuario').findOne({
    "Tipo": "Nivel_Servicio",
    "Clasificacion": "D"
  });
  const valorNivelServ_D = parametrosNivelServ_D?.NivelServicio ?? 'N/A';
  //--------------------------------------------------------------------- 
   // res.render('index', {
  const allParams = [ 
    valorVarAlta, 
    valorVarMedia, 
    valorVarBaja, 
    valorClasAltaBajoMuy_Baja,
    valorClasAltaAltoMuy_Baja,
    valorClasAltaBajoBaja,
    valorClasAltaAltoBaja,
    valorClasAltaBajoMedia,
    valorClasAltaAltoMedia,
    valorClasAltaBajoAlta,
    valorClasAltaAltoAlta,
    valorClasMediaBajoMuy_Baja,
    valorClasMediaAltoMuy_Baja,
    valorClasMediaBajoBaja,
    valorClasMediaAltoBaja,
    valorClasMediaBajoMedia,
    valorClasMediaAltoMedia,
    valorClasMediaBajoAlta,
    valorClasMediaAltoAlta,
    valorClasBajaBajoMuy_Baja,
    valorClasBajaAltoMuy_Baja,
    valorClasBajaBajoBaja,
    valorClasBajaAltoBaja,
    valorClasBajaBajoMedia,
    valorClasBajaAltoMedia,
    valorClasBajaBajoAlta,
    valorClasBajaAltoAlta,
    valorMargenBajo,
    valorMargenAlto,
    valorDemandaMuyBaja,
    valorDemandaBaja,
    valorDemandaMedia,
    valorDemandaAlta,
    valorHorizonteHistorico,
    valorFinHorizonte,
    valorNivelServ_A,
    valorNivelServ_B,
    valorNivelServ_C,
    valorNivelServ_D
  ];

  res.json(allParams);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el valor desde la base de datos.');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Guardar parametros
app.post('/saveParams', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    console.log("user: "+appUser+"\npass: "+appPass+"\nDBName: "+DBName);
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("Pase");

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("conex generado");

    const userdb = conex.getDB();
    const client = await conex.connectToDatabase();
    const db = client.db(userdb);
   
    const NvarAlta = req.body.NvarAlta;
    const NvarMedia = req.body.NvarMedia;
    //const NvarBaja = req.body.NvarBaja;

    const NVaMbDmb = req.body.NVaMbDmb;
    const NVaMaDmb = req.body.NVaMaDmb;
    const NVaMbDb = req.body.NVaMbDb;
    const NVaMaDb = req.body.NVaMaDb;
    const NVaMbDm = req.body.NVaMbDm;
    const NVaMaDm = req.body.NVaMaDm;
    const NVaMbDa = req.body.NVaMbDa;
    const NVaMaDa = req.body.NVaMaDa;

    const NVmMbDmb = req.body.NVmMbDmb;
    const NVmMaDmb = req.body.NVmMaDmb;
    const NVmMbDb = req.body.NVmMbDb;
    const NVmMaDb = req.body.NVmMaDb;
    const NVmMbDm = req.body.NVmMbDm;
    const NVmMaDm = req.body.NVmMaDm;
    const NVmMbDa = req.body.NVmMbDa;
    const NVmMaDa = req.body.NVmMaDa;


    const NVbMbDmb = req.body.NVbMbDmb;
    const NVbMaDmb = req.body.NVbMaDmb;
    const NVbMbDb = req.body.NVbMbDb;
    const NVbMaDb = req.body.NVbMaDb;
    const NVbMbDm = req.body.NVbMbDm;
    const NVbMaDm = req.body.NVbMaDm;
    const NVbMbDa = req.body.NVbMbDa;
    const NVbMaDa = req.body.NVbMaDa;

    const NMbDmb = req.body.NMbDmb;
    const NMaDmb = req.body.NMaDmb;

    console.log("Margen Alto:"+NMaDmb);

    const NDmb = req.body.NDmb;
    const NDb = req.body.NDb;
    const NDm = req.body.NDm;
    const NDa = req.body.NDa;

    const NhorHist = req.body.NhorHist;
    const NfinHist = req.body.NfinHist;
    console.log("FechaFin:"+NfinHist);

    const NNSA = req.body.NNSA;
    const NNSB = req.body.NNSB;
    const NNSC = req.body.NNSC;
    const NNSD = req.body.NNSD;
   
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion": "Variabilidad",
        "SubClasificacion": "Alta",
        "Orden": 3
      },
      { $set: { "Parametros": NvarAlta } }
    );
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion": "Variabilidad",
        "SubClasificacion": "Media",
        "Orden": 2
      },
      { $set: { "Parametros": NvarMedia } }
    );
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion": "Variabilidad",
        "SubClasificacion": "Baja",
        "Orden": 1
      },
      { $set: { "Parametros": '0.5' } }
    );
    //------------------------
    //AltaBajoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaBajoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVaMbDmb } }
    );
    //AltaAltoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaAltoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVaMaDmb } }
    );
    //AltaBajoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaBajoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVaMbDb } }
    );
    //AltaAltoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaAltoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVaMaDb } }
    );
    //AltaBajoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaBajoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVaMbDm } }
    );
    //AltaAltoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaAltoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVaMaDm } }
    );
    //AltaBajoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaBajoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVaMbDa } }
    );
    //AltaAltoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"AltaAltoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVaMaDa } }
    );
    //--------------------------------------------
    //MediaBajoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaBajoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVmMbDmb } }
    );
    //MediaAltoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaAltoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVmMaDmb } }
    );
    //MediaBajoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaBajoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVmMbDb } }
    );
    //MediaAltoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaAltoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVmMaDb } }
    );


    //MediaBajoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaBajoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVmMbDm } }
    );
    //MediaAltoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaAltoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVmMaDm } }
    );
    //MediaBajoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaBajoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVmMbDa } }
    );
    //MediaAltoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"MediaAltoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVmMaDa } }
    );
    //BajaBajoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaBajoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVbMbDmb } }
    );
    //BajaAltoMuy_Baja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaAltoMuy Baja"
      },
      { $set: { "Clasificacion_ABCD": NVbMaDmb } }
    );
    //BajaBajoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaBajoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVbMbDb } }
    );
    //BajaAltoBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaAltoBaja"
      },
      { $set: { "Clasificacion_ABCD": NVbMaDb } }
    );
    //BajaBajoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaBajoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVbMbDm } }
    );
    //BajaAltoMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaAltoMedia"
      },
      { $set: { "Clasificacion_ABCD": NVbMaDm } }
    );
    //BajaBajoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaBajoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVbMbDa } }
    );
    //BajaAltoAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Variabilidad",
        "ID":"BajaAltoAlta"
      },
      { $set: { "Clasificacion_ABCD": NVbMaDa } }
    );

    //-----------------------------------------------------------------
    //MargenBajoAlto

    const adNMbDmb = NMbDmb / 100;
    //console.log(nuevovalorMargenBajoAlto_2);
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Margen",
        "SubClasificacion": "Bajo",
        "Orden": 1
      },
      { $set: { "Parametros": adNMbDmb } }
    );
    const adNMaDmb = NMaDmb / 100;
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Margen",
        "SubClasificacion": "Alto",
        "Orden": 2
      },
      { $set: { "Parametros": adNMaDmb } }
    );
    //--------------Demanda-----------

    //DemandaMuyBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Demanda",
        "SubClasificacion": "Muy Baja",
        "Orden": 4
      },
      { $set: { "Parametros": NDmb } }
    );
    //DemandaBaja
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Demanda",
        "SubClasificacion": "Baja",
        "Orden": 3
      },
      { $set: { "Parametros": NDb } }
    );
    //DemandaMedia
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Demanda",
        "SubClasificacion": "Media",
        "Orden": 2
      },
      { $set: { "Parametros": NDm } }
    );
    //DemandaAlta
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Criterios",
        "Criterio_Clasificacion":"Demanda",
        "SubClasificacion": "Alta",
        "Orden": 1
      },
      { $set: { "Parametros": NDa } }
    );

    //-------------------------

    //HorizonteHistorico
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Horizontes",
        "Num_Param": 1
      },
      { $set: { "Horizonte_Historico_dias": NhorHist } }
    );
    //FinHorizonte
    //const fechaFinHorizonte = moment(nuevovalorFinHorizonte, 'DD/MM/YYYY').toDate();
    //const fechaFinHorizonte = moment(nuevovalorFinHorizonte, 'DD/MM/YYYY').startOf('day').toDate();
    
    var tye = NfinHist.slice(0, 4);
    var tmo = NfinHist.slice(5, 7);
    var tda = NfinHist.slice(8, 10);
    adNfinHist= tda+'/'+tmo+'/'+tye;
    
    console.log("FechaFin reor:"+adNfinHist);
    const adadNfinHist = moment.tz(adNfinHist, 'DD/MM/YYYY', 'UTC').toDate();
    console.log("FechaFin adjusted:"+adadNfinHist);
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Horizontes",
        "Num_Param": 2
      },
      { $set: { "Fecha_Fin_Horizonte": adadNfinHist } }
    );
    //-------------------------
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Nivel_Servicio",
        "Clasificacion": "A"
      },
      { $set: { "NivelServicio": NNSA } }
    );
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Nivel_Servicio",
        "Clasificacion": "B"
      },
      { $set: { "NivelServicio": NNSB } }
    );
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Nivel_Servicio",
        "Clasificacion": "C"
      },
      { $set: { "NivelServicio": NNSC } }
    );
    await db.collection('parametros_usuario').updateOne(
      {
        "Tipo": "Nivel_Servicio",
        "Clasificacion": "D"
      },
      { $set: { "NivelServicio": NNSD } }
    );

//-------------------------

    client.close();

    console.log("Fin save params");

    // Enviar una respuesta de éxito al cliente
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar los nuevos valores en la base de datos.');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/runProcess', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    //console.log("user: "+appUser+"\npass: "+appPass+"\nDBName: "+DBName);
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("running x dia");
    const usuarioLog = conex.getUser();
    const comando = `cd /d "${rutaDirClasifABCD}" && node exec_js_Main_ClasABCD_PolInvent_process_v2.js ${usuarioLog}`;
    //const comando = `cd /d "${rutaDirClasifABCD}" && node exec_js_Main_ClasABCD_PolInvent_process_v2.js TEST01`;
    
    try {
      const resultado = execSync(comando);
      //const filePath = path.resolve(__dirname, rutaDirLogFile);

      console.log('Comando ejecutado con éxito:', resultado.toString());
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al ejecutar el comando:', error.stderr.toString());
      return;
    }
  } catch (err) {
    console.error('Error al procesar:', err);
    res.status(500).send('Error al procesar');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/runProcessSem', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    //console.log("user: "+appUser+"\npass: "+appPass+"\nDBName: "+DBName);
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_'+DBName);

    console.log("running x sem");
    const usuarioLog = conex.getUser();
    const comando = `cd /d "${rutaDirClasifABCDSem}" && node exec_js_Main_Sem_ClasABCD_PolInvent_process.js ${usuarioLog}`;
    `cd /d " && node exec_js_Main_Sem_ClasABCD_PolInvent_process.js DemoUser01`;
    try {
      const resultado = execSync(comando);
      //const filePath = path.resolve(__dirname, rutaDirLogFile);

      console.log('Comando ejecutado con éxito:', resultado.toString());
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al ejecutar el comando:', error.stderr.toString());
      return;
    }
  } catch (err) {
    console.error('Error al procesar:', err);
    res.status(500).send('Error al procesar');
  }
});





//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/getCSVPol', async (req, res) => {
  let client;

  try {
    const { appUser, appPass, DBName, type, cal } = req.body;
    console.log(`user: ${appUser}\npass: ${appPass}\nDBName: ${DBName}\ntype: ${type}\ncal: ${cal}`);
    const decryptedAppPass = await decryptData(appPass);

    console.log("Pase");

    client = await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("conex generado");

    const userdb = conex.getDB();
    const db = client.db(userdb);

    let collectionName = '';

    if (type === 'clasifABCD') {
      collectionName = cal === 'Diario' ? 'ui_demanda_abcd' : 'ui_sem_demanda_abcd';
  } else if (type === 'polInv') {
      collectionName = cal === 'Diario' ? 'ui_all_pol_inv' : 'ui_sem_all_pol_inv';
  }

  console.log(collectionName);

    const collection = db.collection(collectionName);

    const data = await collection.find({}).toArray();

    if (!data.length) {
      res.status(404).json({ error: 'No data found' });
      return;
    }

    const fields = Object.keys(data[0]);
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    const filePath = path.join(__dirname, 'exported_data.csv');
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'exported_data.csv', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).json({ error: 'Error downloading the file' });
      }

      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('Error connecting to the database or exporting data:', err);
    res.status(500).json({ error: 'Error exporting data' });
  } finally {
    if (client) {
      client.close();
    }
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Plan de Reposicion
app.post('/CargaInvDisponible', upload.fields([{ name: 'doc', maxCount: 1 }]), async (req, res) => {
  try {
    console.log("Cargar Inventario Disponible");

    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("user: " + appUser + "\npass: " + decryptedAppPass + "\nDBName: " + DBName);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("Conexión generada");

    const invDispCsv = req.files['doc'][0];
    const windowsDir = `../${DBName}/csv/`;

    fs.renameSync(invDispCsv.path, windowsDir + 'in/inventario_disponible.csv');

    const rutaDirLogFile = path.join(__dirname, `../${DBName}/log/LogdeCargaInvDispoCSV.log`);

    const comando = `cd /d "${rutaDirCargaInvDisponible}" && node exec_js_InvDispoMain_LoadData.js ${appUser}`;

    try {
      console.log(comando);

      const resultado = execSync(comando);
      console.log(resultado);
      const filePath = path.resolve(__dirname, rutaDirLogFile);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error al crear el archivo de log:', err);
              res.status(500).send('Error al crear el archivo de log');
              return;
            }
            leerArchivoLog(filePath);
          });
        } else {
          leerArchivoLog(filePath);
        }
      });

      function leerArchivoLog(filePath) {
        fs.readFile(filePath, 'utf-8', (err, logContent) => {
          if (err) {
            console.error('Error al leer el archivo LogdeCargaInvDisp.log:', err);
            res.status(500).send('Error al leer el archivo LogdeCargaInvDisp.log');
            return;
          }
          res.send(logContent);
        });
      }

      console.log('Comando ejecutado con éxito:', resultado.toString());
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      res.status(500).send('Error al ejecutar el comando');
      return;
    }
  } catch (err) {
    console.error('Error al procesar los archivos CSV:', err);
    res.status(500).send('Error al procesar los archivos CSV');
  }
});

// Otras configuraciones y middlewares de Express

//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
//  console.log(`Servidor corriendo en el puerto ${PORT}`);
//});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

app.post('/getActualCSVInvDisp', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log("user: " + appUser + "\npass: " + decryptedAppPass + "\nDBName: " + DBName);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("conex generado");

    // Ruta donde se guardarán los archivos procesados
    const processedDir = `../${DBName}/csv/in/procesados/`;

    const files = fs.readdirSync(processedDir);

    // Ordenar los archivos por fecha de modificación para obtener el más reciente
    const sortedFiles = files
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(processedDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (sortedFiles.length === 0) {
      return res.status(404).send('No relevant CSV files found');
    }

    // Descargar el archivo CSV más reciente del directorio procesado
    const file = sortedFiles[0];
    res.download(file.path, file.name, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file');
      }
    });
  } catch (error) {
    console.error('Error getting the latest CSV:', error);
    res.status(500).send('Error getting the latest CSV');
  }
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

app.post('/CargaInvTrans', upload.fields([
  { name: 'doc', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Cargar Inventario en Tránsito");

    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log(`user: ${appUser}\npass: ${decryptedAppPass}\nDBName: ${DBName}`);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("Conexión generada");

    const invTransCsv = req.files['doc'][0];
    const windowsDir = `../${DBName}/csv/`;

    // Mover y renombrar los archivos CSV cargados a la ruta de Windows
    fs.renameSync(invTransCsv.path, windowsDir + 'in/inventario_transito.csv');

    const rutaDirLogFile = path.join(__dirname, `../${DBName}/log/LogdeCargaInvTransCSV.log`);

    const comando = `cd /d "${rutaDirCargaInvTrans}" && node exec_js_InvTransMain_LoadData.js ${appUser}`;

    try {
      console.log(comando);

      const resultado = execSync(comando);
      console.log(resultado);
      const filePath = path.resolve(__dirname, rutaDirLogFile);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error al crear el archivo LogdeCargaInvTransCSV.log:', err);
              res.status(500).send('Error al crear el archivo LogdeCargaInvTransCSV.log');
              return;
            }
            leerArchivoLog(filePath);
          });
        } else {
          leerArchivoLog(filePath);
        }
      });

      function leerArchivoLog(filePath) {
        const logContent = fs.readFile(filePath, 'utf8', (err, logContent) => {
          if (err) {
            console.error('Error al leer el archivo LogdeCargaInvTransCSV.log:', err);
            res.status(500).send('Error al leer el archivo LogdeCargaInvTransCSV.log');
            return;
          }
          res.send(logContent);
        });
      }
      console.log('Comando ejecutado con éxito:', resultado.toString());
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      res.status(500).send('Error al ejecutar el comando');
      return;
    }
  } catch (err) {
    console.error('Error al procesar los archivos CSV:', err);
    res.status(500).send('Error al procesar los archivos CSV');
  }
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

app.post('/CargaRequerimientosConfirmados', upload.fields([
  { name: 'doc', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Cargar Requerimientos Confirmados");

    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);

    console.log(`user: ${appUser}\npass: ${decryptedAppPass}\nDBName: ${DBName}`);

    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("Conexión generada");

    const reqConfCsv = req.files['doc'][0];
    const windowsDir = `../${DBName}/csv/`;

    // Mover y renombrar los archivos CSV cargados a la ruta de Windows
    fs.renameSync(reqConfCsv.path, windowsDir + 'in/requerimientos_confirmados.csv');

    const rutaDirLogFile = path.join(__dirname, `../${DBName}/log/LogdeCargaRequConfCSV.log`);

    const comando = `cd /d "${rutaDirCargaRequerimientosConfirmados }" && node exec_js_RequConfir_Main_LoadData.js ${appUser}`;

    try {
      console.log(comando);

      const resultado = execSync(comando);
      console.log(resultado);
      const filePath = path.resolve(__dirname, rutaDirLogFile);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error al crear el archivo LogdeCargaReqConf.log:', err);
              res.status(500).send('Error al crear el archivo LogdeCargaReqConf.log');
              return;
            }
            leerArchivoLog(filePath);
          });
        } else {
          leerArchivoLog(filePath);
        }
      });

      function leerArchivoLog(filePath) {
        const logContent = fs.readFile(filePath, 'utf8', (err, logContent) => {
          if (err) {
            console.error('Error al leer el archivo LogdeCargaReqConf.log:', err);
            res.status(500).send('Error al leer el archivo LogdeCargaReqConf.log');
            return;
          }
          res.send(logContent);
        });
      }
      console.log('Comando ejecutado con éxito:', resultado.toString());
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      res.status(500).send('Error al ejecutar el comando');
      return;
    }
  } catch (err) {
    console.error('Error al procesar los archivos CSV:', err);
    res.status(500).send('Error al procesar los archivos CSV');
  }
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// Endpoint para ejecutar el plan de reposición diario
app.post('/runPlanReposicionDiario', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);
    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);
    console.log("Running plan de reposición - Diario");
    const usuarioLog = conex.getUser();
    const comando = `cd /d "${rutaDirPlanReposicion}" && node exec_js_Main_PlanReposicion_process.js ${usuarioLog}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error('Diario - Error al ejecutar el comando:', error);
        res.status(500).send('Error al ejecutar el comando diario');
        return;
      }
      console.log('Diario - Comando ejecutado con éxito:', stdout);
      res.sendStatus(200);
    });
  } catch (err) {
    console.error('Diario - Error al procesar:', err);
    res.status(500).send('Error al procesar el plan de reposición diario');
  }
});

// Endpoint para ejecutar el plan de reposición semanal
app.post('/runPlanReposicionSemanal', async (req, res) => {
  try {
    const { appUser, appPass, DBName } = req.body;
    const decryptedAppPass = await getDecryptedPassUser(appPass);
    await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);
    console.log("Running plan de reposición - Semanal");
    const usuarioLog = conex.getUser();
    const comando = `cd /d "${rutaDirPlanReposicion_Sem}" && node exec_js_Main_Sem_PlanReposicion_process.js ${usuarioLog}`;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error('Semanal - Error al ejecutar el comando:', error);
        res.status(500).send('Error al ejecutar el comando semanal');
        return;
      }
      console.log('Semanal - Comando ejecutado con éxito:', stdout);
      res.sendStatus(200);
    });
  } catch (err) {
    console.error('Semanal - Error al procesar:', err);
    res.status(500).send('Error al procesar el plan de reposición semanal');
  }
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
app.post('/getCSVPlanReposicion', async (req, res) => {
  let client;

  try {
    const { appUser, appPass, DBName, type, cal } = req.body;
    if (!appUser || !appPass || !DBName || !type || !cal) {
      console.error('Faltan parámetros necesarios');
      return res.status(400).send('Faltan parámetros necesarios');
    }

    console.log(`user: ${appUser}\npass: ${appPass}\nDBName: ${DBName}\ntype: ${type}\ncal: ${cal}`);
    const decryptedAppPass = await decryptData(appPass);

    client = await conex.connectToDatabase();
    conex.setUserData(appUser, decryptedAppPass, 'btc_opti_' + DBName);

    console.log("conex generado");

    const userdb = conex.getDB();
    const db = client.db(userdb);
    
    let collectionName = '';

    if (type === 'PlanReposicion') {
      if (cal === 'Diario') {
        collectionName = 'ui_plan_reposicion';
      } else if (cal === 'Semanal') {
        collectionName = 'ui_sem_plan_reposicion';
      } else {
        console.error('Calendario no soportado');
        return res.status(400).send('Calendario no soportado');
      }
    } else {
      console.error('Tipo de plan no soportado');
      return res.status(400).send('Tipo de plan no soportado');
    }

    console.log(`Fetching data from collection: ${collectionName}`);
    const collection = db.collection(collectionName);

    const data = await collection.find({}).toArray();

    if (!data.length) {
      console.error('No data found in the collection');
      res.status(404).send('No data found');
      return;
    }

    const fields = Object.keys(data[0]);
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    const filePath = path.join(__dirname, 'exported_data.csv');
    fs.writeFileSync(filePath, csv);

    res.download(filePath, `${type}_data.csv`, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file');
      }

      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('Error connecting to the database or exporting data:', err);
    res.status(500).send('Error exporting data');
  } finally {
    if (client) {
      client.close();
    }
  }
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


// Iniciar el servidor
// app.listen(port, () => {
  // console.log(`Servidor iniciado en http://localhost:${port}`);
// });


// Iniciar el servidor https
var https = require('https');
var http = require('http');
///var fs = require('fs');

var options = {
 key: fs.readFileSync('C:\\SSLcert\\optiscportal.com_key.txt'),
 cert: fs.readFileSync('C:\\SSLcert\\optiscportal.com.crt'),
 ca: fs.readFileSync ('C:\\SSLcert\\optiscportal.com.ca-bundle')
};

 
// var app = function (req, res) {
//  res.writeHead(200);
//  res.end("hello world\n");
//}

/*
http.createServer(app).listen(80, () => {
  console.log('Servidor HTTP iniciado en http://localhost:80');
});*/

https.createServer(options, app).listen(3000, () => {
  console.log('Servidor HTTPS iniciado en https://localhost:3000');
});


//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


// Obtener el valor desencriptado del User
async function getDecryptedPassUser(p_AppPass) {
  try {
    return await decryptData(p_AppPass);
  } catch (error) {
    console.error('Error al desencriptar el User:', error);
    throw error;
  }
}
