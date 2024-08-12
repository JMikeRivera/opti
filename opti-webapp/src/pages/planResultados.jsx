/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, TablePagination } from '@mui/material';
import MyButton from '../components/ButtonConsult';
import InfoButton from '../components/InfoButton';
import './../styles/pages/planResultados.css';
import Spinner from './../components/Spinner';
import { useAuth } from './../components/AuthContext';

const stickyColumnStyle = {
    backgroundColor: '#012148',
    position: 'sticky',
    left: 0,
    zIndex: 1000,
    color: 'white',
    boxShadow: '2px 0px 5px rgba(0,0,0,0.5)', 
};

const stickyHeadStyle = {
    position: 'sticky',
    left: 0,
    boxShadow: '2px 0px 5px rgba(0,0,0,0.5)',
    zIndex: 1200,
};

function PlanResultados() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [loaded, setLoaded] = useState(false); // Estado para controlar la carga
    const [calendar, setCalendar] = useState('');  // Estado para controlar el calendario
    const [error, setError] = useState(''); // Estado para manejar errores
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('CSV'); // Estado para el tipo de reporte
    const { user } = useAuth();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleCalendarChange = (event) => {
        setCalendar(event.target.value);
    };

    const handleReportTypeChange = (event) => {
        setReportType(event.target.value);
    };

    const handleExecutePlanReposicion = async () => {
        setLoading(true); // Activar el spinner al inicio de la operación
        try {
            if (calendar !== 'Ambos') {
                const url = calendar === 'Diario' ? 'https://optiscportal.com:3000/runPlanReposicionDiario' : 'https://optiscportal.com:3000/runPlanReposicionSemanal';
    
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        appUser: user.AppUser,
                        appPass: user.password,
                        DBName: user.dbName
                    })
                });
    
                if (!response.ok) {
                    throw new Error('Error en la ejecución');
                }
            } else {
                // Ejecutar ambas funciones asincrónicamente y esperar que ambas terminen
                const [response, response2] = await Promise.all([
                    fetch('https://optiscportal.com:3000/runPlanReposicionDiario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            appUser: user.AppUser,
                            appPass: user.password,
                            DBName: user.dbName
                        })
                    }),
                    fetch('https://optiscportal.com:3000/runPlanReposicionSemanal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            appUser: user.AppUser,
                            appPass: user.password,
                            DBName: user.dbName
                        })
                    })
                ]);
    
                if (!response.ok || !response2.ok) {
                    throw new Error('Error en la ejecución');
                }
            }
            alert('Se ejecutó correctamente el Plan de Reposición');
        } catch (error) {
            console.error('Error en la ejecución:', error);
            alert('Error en la ejecución');
        } finally {
            setLoading(false); // Desactivar el spinner al finalizar todas las operaciones
        }
    };

    const handleButtonClick = async () => {
        setLoading(true);

        if (reportType === 'CSV') {
            const url = 'https://optiscportal.com:3000/getCSVPlanReposicion';
    
            if (url && calendar) {
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
                            type: 'PlanReposicion',
                            cal: calendar,
                        }),
                    });
    
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.statusText}`);
                    }
    
                    const blob = await response.blob();
                    const reader = new FileReader();
    
                    reader.onload = (event) => {
                        const text = event.target.result;
                        Papa.parse(text, {
                            header: true,
                            skipEmptyLines: true,
                            complete: (results) => {
                                setData(results.data);
                                setLoading(false);
                            },
                        });
                    };
    
                    reader.readAsText(blob);
                } catch (error) {
                    console.error('Error while fetching and parsing the CSV file:', error);
                    setError(`Error: ${error.message}`);
                    setLoading(false);
                }
            } else {
                alert('Por favor selecciona un calendario');
                setLoading(false);
            }
        } else if (reportType === 'Dashboard') {
            setLoading(false);
        }
    };

    const handleDownloadClick = () => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultados.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
        <div className='planResultados' style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            {loading && <Spinner />}
            {error && <div className='error'>{error}</div>}
            <h1 className='titulo'>Ejecución y Resultados</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '3vh', flexWrap: 'wrap' }}>
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel id="cal-label">Calendario</InputLabel>
                    <Select
                        labelId="cal-label"
                        id="cal"
                        value={calendar}
                        onChange={handleCalendarChange}
                        label="Calendario"
                    >
                        <MenuItem value="Diario">Diario</MenuItem>
                        <MenuItem value="Semanal">Semanal</MenuItem>
                        <MenuItem value="Ambos">Ambos</MenuItem>
                    </Select>
                </FormControl>
                <InfoButton information='Define la granularidad de los periodos de tiempo con los que se va a calcular la política de inventarios.'/>
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel id="report-type-label">Tipo de Reporte</InputLabel>
                    <Select
                        labelId="report-type-label"
                        id="report-type"
                        value={reportType}
                        onChange={handleReportTypeChange}
                        label="Tipo de Reporte"
                    >
                        <MenuItem value="CSV">CSV</MenuItem>
                        <MenuItem value="Dashboard">Dashboard</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '3vh' }}>
                <div>
                    <MyButton onClick={handleExecutePlanReposicion} texto={"Ejecutar Plan de Reposición"} />
                    <InfoButton information='Este botón permite generar el plan de reposición con la información recolectada de los archivos cargados en esta sección y la política de inventarios elegida.'/>
                </div>
                <div>
                    <MyButton onClick={handleButtonClick} texto={"Consultar Resultados"} />
                    <InfoButton information='Al apretar el botón, se genera una consulta de la tabla de salida'/>
                </div>
                <div>
                    <MyButton onClick={handleDownloadClick} texto={"Descargar Resultados"} />
                    <InfoButton information='Permite exportar la información del resultado de la carga.'/>
                </div>
                
            </div>
            {reportType === 'Dashboard' && (
                <div style={{ marginTop: '3vh', height: '600px' }}>
                    <iframe 
                        src="https://app.powerbi.com/view?r=eyJrIjoiMjk2ZjMxMTEtMTRiNy00N2VmLTg1MDUtYTdkOWY1ZDgwZTU5IiwidCI6ImM2NWEzZWE2LTBmN2MtNDAwYi04OTM0LTVhNmRjMTcwNTY0NSIsImMiOjR9&cache_buster=20240727123000" 
                        style={{ border: 'none', width: '100%', height: '100%' }} 
                        title="Dashboard"
                        allowFullScreen
                    />
                </div>
            )}
            <TableContainer component={Paper} className='tableContainer'>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {data.length > 0 && Object.keys(data[0]).map((key) => (
                                <TableCell key={key}>{key}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rowsPerPage > 0 && data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Object.keys(row).map((colKey) => (
                                    <TableCell key={colKey}>{row[colKey]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage) > 0 && (
                            <TableRow style={{ height: 53 * (rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)) }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={data.length}
                labelRowsPerPage={"Filas por página"}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
}

export default PlanResultados;
