/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, TablePagination, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import MyButton from '../components/ButtonConsult';
import { useAuth } from './../components/AuthContext';
import Spinner from './../components/Spinner';

import './../styles/pages/polResultados.css';
import InfoButton from '../components/InfoButton';

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

const PolResultados = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [selectedValue, setSelectedValue] = useState('clasifABCD');
    const [calendar, setCalendar] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleNoChange = (event) => {
        /* hola */
    };

    const handleCalendarChange = (event) => {
        setCalendar(event.target.value);
    };

    const handleButtonClick = async () => {
        setLoading(true);

        const url = 'https://optiscportal.com:3000/getCSVPol';

        if(url, selectedValue, calendar) {
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
                        type: selectedValue,
                        cal: calendar
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const blob = await response.blob();
                const reader = new FileReader();

                reader.onload = function(event) {
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
                setLoading(false);
            }
        } else {
            alert('Por favor selecciona una clasificación y un calendario');
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


    return (
        <div className='polResultados'>
            {loading && <Spinner />}
            <h1 className='titulo'>Resultados</h1>
            <div className='ParamsDiv'>
                <div className='radio'>
                    <FormControl component="fieldset">
                        <RadioGroup 
                            aria-label="classification" 
                            name="classification" 
                            value={selectedValue} 
                            onChange={handleRadioChange}
                            style={{ flexDirection: 'column' }}
                        >
                            <div>
                                <FormControlLabel
                                    value="clasifABCD"
                                    control={<Radio />}
                                    label="Clasificación ABCD"    
                                />
                                <InfoButton information='Cuando se selecciona esta opción, la consulta generada muestra la salida del proceso de cálculo de clasificación ABCD a nivel Producto-Ubicación.'/>
                            </div>
                            
                            <div>
                                <FormControlLabel
                                    value="polInv"
                                    control={<Radio />}
                                    label="Políticas de Inventario"
                                />
                                <InfoButton information='Cuando se selecciona esta opción, la consulta generada muestra la salida del proceso de cálculo de políticas de inventario a nivel Producto-Ubicación.'/>
                            </div>
                            
                        </RadioGroup>
                    </FormControl>
                </div>

                <FormControl variant="outlined" className='Form' style={{ marginTop: '3vh' }}>
                    <InputLabel id="cal-label">Calendario</InputLabel>
                    <Select
                    labelId="cal-label"
                    id="cal"
                    label="Calendario"
                    value={calendar}
                    onChange={handleCalendarChange}
                    >
                        {["Diario", "Semanal"].map((tiempo) => (
                            <MenuItem key={tiempo} value={tiempo}>
                                {tiempo}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <InfoButton information='Elige la granularidad de los periodos de tiempo con los que se calculó la política de inventarios.'/>
                <MyButton onClick={handleButtonClick} texto={"Consultar"} mL='3vw' height='7vh' mT='3vh' mR='.1vw' backColor='#3e4251' />
            </div>

            <div className='TablaDiv'>
                <TableContainer component={Paper} className='tableContainer'>
                    <Table stickyHeader aria-label="simple table">
                        <TableHead>
                        <TableRow>
                        {data.length > 0 && Object.keys(data[0]).map((key) => (
                        <TableCell
                            key={key} style={key === 'SKU' ? stickyHeadStyle : null}
                        > 
                            {key}
                        </TableCell>
                        ))}
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {Object.keys(row).map((colKey, colIndex) => (
                                        <TableCell key={colIndex} style={colKey === 'SKU' ? stickyColumnStyle : null}>
                                            {row[colKey]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
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

            {data.length > 0 && <MyButton onClick={handleDownloadClick} texto={"Descargar Resultados"} mL='55vw' height='7vh' mT='3vh' mR='.1vw' backColor='#3d4c87' />} 
        </div>
    );
};

export default PolResultados;