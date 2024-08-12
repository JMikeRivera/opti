const fs = require('fs').promises;
const Papa = require('papaparse');

const parametroUsuario = process.argv.slice(2)[0];
const parametroFolder = parametroUsuario.toUpperCase();

const csvFilePath = `../../${parametroFolder}/csv/in/requerimientos_confirmados.csv`;
const logFileName = 'LogdeCargaRequConfCSV';
const logFile = `../../${parametroFolder}/log/${logFileName}.log`;


const encabezadosRequeridos = [
  'Producto',
  'Ubicacion',
  'Cliente',
  'Cantidad_Confirmada'
]; 



async function validarEncabezados() {
  const errores = [];
  writeToLog(`Paso 02.- Validacion de Headers del CSV`);
  try {
    // Leer el contenido del archivo CSV
    const contenidoCSV = await fs.readFile(csvFilePath, 'utf-8');

    // Parsear el contenido CSV
    const resultado = Papa.parse(contenidoCSV, { header: true });

    // Obtener los encabezados del CSV
    const encabezadosCSV = resultado.meta.fields;

    // Validar la cantidad de encabezados
    //if (encabezadosCSV.length !== encabezadosRequeridos.length) {
      const encabezadosFaltantes = encabezadosRequeridos.filter(header => !encabezadosCSV.includes(header));
      const encabezadosExtras = encabezadosCSV.filter(header => !encabezadosRequeridos.includes(header));

      if (encabezadosFaltantes.length > 0) {
        const mensajeErrorFaltantes = `\t-Encabezados faltantes: ${encabezadosFaltantes.join(', ')}\n`;
        errores.push(mensajeErrorFaltantes);
        await writeToLog(mensajeErrorFaltantes);
      }

      if (encabezadosExtras.length > 0) {
        const mensajeErrorExtras = `\t-Encabezados extras: ${encabezadosExtras.join(', ')}\n`;
        errores.push(mensajeErrorExtras);
        await writeToLog(mensajeErrorExtras);
      }
    //}

    // Validar el orden de los encabezados
    const encabezadosOrdenIncorrecto = encabezadosRequeridos.filter((header, index) => header !== encabezadosCSV[index]);

    if (encabezadosOrdenIncorrecto.length > 0) {
      const mensajeErrorOrden = `\t-El orden de los encabezados es incorrecto.\n`;
      errores.push(mensajeErrorOrden);
      await writeToLog(mensajeErrorOrden);
    }

    if (errores.length > 0) {
      console.log('OK');
      writeToLog('\tRevisa la Plantilla.');
      throw new Error(errores.join('\n'));
      
    }

    //console.log('Los encabezados son válidos y están en el orden correcto.');
    writeToLog('\tLos encabezados son válidos y están en el orden correcto.\n');
    console.log('OK');
  } catch (error) {
    console.error('Error:\n', error.message);
    console.log('ERROR');
  }
}

// Llamada a la función principal
validarEncabezados();


async function writeToLog(message) {
  try {
    await fs.appendFile(logFile, `${message}\n`);
  } catch (error) {
    console.error('Error al escribir en el archivo de registro:', error.message);
  }
}



