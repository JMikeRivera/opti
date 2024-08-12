import React, { useState } from 'react';
import Spinner from './../components/Spinner';
import { useAuth } from './../components/AuthContext';

import './../styles/pages/planArchivos.css';
import InfoButton from '../components/InfoButton';

const PlanArchivos = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState('inventario');
    const [results, setResults] = useState('Resultado de la carga de información');
    const { user } = useAuth();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUploadTypeChange = (event) => {
        setUploadType(event.target.value);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Por favor selecciona un archivo para subir.');
            return;
        }

        let append;
        switch (uploadType) {
            case 'inventario':
                append = 'CargaInvDisponible';
                break;
            case 'transito':
                append = 'CargaInvTrans';
                break;
            case 'confirmados':
                append = 'CargaRequerimientosConfirmados';
                break;
            default:
                alert('Tipo de carga no reconocido');
                return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('doc', selectedFile);
        formData.append('appUser', user.AppUser);
        formData.append('appPass', user.password);
        formData.append('DBName', user.dbName);

        const url = `https://optiscportal.com:3000/${append}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                alert('Carga exitosa');
                console.log(result);
                setResults(result);
            } else {
                alert('Error en la carga del archivo');
                const errorText = await response.text();
                setResults(`Error: ${errorText}`);
            }
        } catch (error) {
            console.error('Error al cargar el archivo:', error);
            alert('Error de conexión. Por favor, intente nuevamente.');
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
    };

    const descargarTemplates = () => {
        const templates = [
            { path: "/templates/template-inventario_disponible.csv", name: "template-inventario_disponible.csv" },
            { path: "/templates/template-inventario_transito.csv", name: "template-inventario_transito.csv" },
            { path: "/templates/template-requerimientos_confirmados.csv", name: "template-requerimientos_confirmados.csv" }
        ];

        templates.forEach(template => {
            const a = document.createElement('a');
            a.href = template.path;
            a.download = template.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    const descargarActual = async () => {
        const url = 'https://optiscportal.com:3000/getActualCSVInvDisp';

        setIsUploading(true);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appUser: user.AppUser,
                    appPass: user.password,
                    DBName: user.dbName,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const fileUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = fileUrl;

            const filename = response.headers.get('Content-Disposition')
                ? response.headers.get('Content-Disposition').split('filename=')[1].replace(/"/g, '')
                : 'csv_actual.zip';

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(fileUrl);

            alert('Descarga exitosa');
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Por favor, intente nuevamente.');
        } finally {
            setIsUploading(false);
        }
    }

    const descargarLog = () => {
        const blob = new Blob([results], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'log-resultados.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <div className='planArchivos'>
            {isUploading && <Spinner />}
            <h1 className='titulo'>Archivos de Entrada</h1>
            <div className='container'>
                <div className='upload-section'>
                    <h2>Carga de Información</h2>
                    <div className='radio-buttons'>
                        <label>
                            <input type="radio" value="inventario" checked={uploadType === 'inventario'} onChange={handleUploadTypeChange} />
                            Inventario Disponible
                            <InfoButton information='Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información del inventario disponible (léase tabla “Inventario disponible”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.'/>
                        </label>
                        <label>
                            <input type="radio" value="transito" checked={uploadType === 'transito'} onChange={handleUploadTypeChange} />
                            Inventario en Tránsito
                            <InfoButton information='Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información del inventario en tránsito (léase tabla “Inventario en tránsito”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.'/>
                        </label>
                        <label>
                            <input type="radio" value="confirmados" checked={uploadType === 'confirmados'} onChange={handleUploadTypeChange} />
                            Requerimientos Confirmados
                            <InfoButton information='Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información de los requerimientos confirmados (léase tabla “Requerimientos confirmados”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.'/>
                        </label>
                    </div>
                    <input type="file" onChange={handleFileChange} />
                    <div>
                        <button className='archivos-button' onClick={handleFileUpload} disabled={isUploading}>Cargar Nuevo</button>
                        <InfoButton information='Permite importar desde un archivo CSV a BTC OPTISmart de la opción elegida. La carga de este archivo borra la información previamente cargada y la reemplaza con la del archivo cargado. Nota: Para una carga exitosa, asegúrese de acomodar la información del CSV de acuerdo con la plantilla de la opción elegida. Un mal acomodo de la información, así como usar caracteres no permitidos puede generar errores de carga.'/>
                    </div>
                    <div>
                        <button className='archivos-button' onClick={descargarActual}>Descargar Actual</button>
                        <InfoButton information='Permite exportar la información actual y previamente cargada a BTC OPTISmart de la opción elegida.'/>     
                    </div>
                    <div>
                        <button className='archivos-button' onClick={descargarTemplates}>Descargar Plantillas</button>
                        <InfoButton information='Permite descargar una plantilla base en la cual se encuentran los encabezados y el orden que deben llevar para importar la opción seleccionada en el botón cargar nuevo.'/>
                    </div>
                </div>
                <div className='results-section'>
                    <textarea readOnly value={results} />
                    <div>
                        <button className='archivos-button' onClick={descargarLog}>Descargar Log de Resultados</button>
                        <InfoButton information='Permite exportar la información del resultado de la carga.'/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanArchivos;
