/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from './../components/AuthContext';

import './../styles/components/ABCMatrix.css';

function ABCMatrix( params ) {
     const [inputs, setInputs] = useState({
        varAlta: params[0] || '1.5',
        varMedia: params[1] || '0.5',
        VaMbDmb: params[3] || 'D', VaMaDmb: params[4] || 'D', VaMbDb: params[5] || 'C', VaMaDb: params[6] || 'C',
        VaMbDm: params[7] || 'C', VaMaDm: params[8] || 'B', VaMbDa: params[9] || 'B', VaMaDa: params[10] || 'B',
        VmMbDmb: params[11] || 'D', VmMaDmb: params[12] || 'C', VmMbDb: params[13] || 'C', VmMaDb: params[14] || 'C',
        VmMbDm: params[15] || 'B', VmMaDm: params[16] || 'B', VmMbDa: params[17] || 'A', VmMaDa: params[18] || 'A',
        VbMbDmb: params[19] || 'C', VbMaDmb: params[20] || 'C', VbMbDb: params[21] || 'C', VbMaDb: params[22] || 'B',
        VbMbDm: params[23] || 'B', VbMaDm: params[24] || 'A', VbMbDa: params[25] || 'A', VbMaDa: params[26] || 'A',
        MbDmb: params[27] || '30', MaDmb: params[28] || '30', MbDb: params[27] || '30', MaDb: params[28] || '30',
        MbDm: params[27] || '30', MaDm: params[28] || '30', MbDa: params[27] || '30', MaDa: params[28] || '30',
        Dmb: params[29] || '30', Db: params[30] || '30', Dm: params[31] || '30', Da: params[32] || '30'
    });

    const [loaded, setLoaded] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        async function fetchData() {
            try {
                const url = 'https://optiscportal.com/showParams';

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

                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                    setInputs({
                        varAlta: result[0],
                        varMedia: result[1],
                        varBaja: result[2],
                        VaMbDmb: result[3], VaMaDmb: result[4], VaMbDb: result[5], VaMaDb: result[6],
                        VaMbDm: result[7], VaMaDm: result[8], VaMbDa: result[9], VaMaDa: result[10],
                        VmMbDmb: result[11], VmMaDmb: result[12], VmMbDb: result[13], VmMaDb: result[14],
                        VmMbDm: result[15], VmMaDm: result[16], VmMbDa: result[17], VmMaDa: result[18],
                        VbMbDmb: result[19], VbMaDmb: result[20], VbMbDb: result[21], VbMaDb: result[22],
                        VbMbDm: result[23], VbMaDm: result[24], VbMbDa: result[25], VbMaDa: result[26],
                        MbDmb: result[27], MaDmb: result[28], MbDb: result[27], MaDb: result[28],
                        MbDm: result[27], MaDm: result[28], MbDa: result[27], MaDa: result[28],
                        Dmb: result[29], Db: result[30], Dm: result[31], Da: result[32]
                    });

                    // enviar a la pagina
                    if (typeof setParams === 'function') {
                        setParams(result.slice(33, 39));
                    }
                    if (typeof setLoaded === 'function') {
                        setLoaded(true);
                    }
                } else {
                    alert('Error en la carga del archivo');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        if (!loaded && user) {
            console.log("user", user);
            fetchData();
            setLoaded(true);
        }
    }, [user, loaded, setLoaded2, setParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="row align-items-center">
            <div className="col-10">
                <div className="m-2">
                    <div className="table-responsive">
                        <table className="table table-bordered" id="dataTableg" cellSpacing="0" style={{ textAlign: 'center' }}>
                            <thead>
                                <tr></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th rowSpan="3" style={{ backgroundColor: 'rgb(84, 130, 53)', color: 'white', writingMode: 'vertical-rl', transform: 'rotate(180deg)', lineHeight: '5%', marginTop: '30%', width:'5%' }} className="ml-2">
                                        <br /><br />VARIABILIDAD
                                        <a data-toggle="modal" data-target="#variMod">
                                            <i className="fas fa-info-circle fa-sm fa-fw mr-2 text-gray-400" data-toggle="modal" data-target="#variMod"></i>
                                        </a>
                                    </th>
                                    <th rowSpan="3" className="verdito">
                                        <p>Alta</p>
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '80%', marginLeft: '10%', marginTop: '10px' }}
                                            name="varAlta"
                                            placeholder="varAlta%"
                                            onChange={handleChange}
                                            value={inputs.varAlta}
                                        />
                                        <p>Media</p>
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '80%', marginLeft: '10%' }}
                                            name="varMedia"
                                            placeholder="varMed%"
                                            onChange={handleChange}
                                            value={inputs.varMedia}
                                        />
                                        <p>Baja</p>
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMbDmb"
                                            placeholder="VaMbDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMbDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMaDmb"
                                            placeholder="VaMaDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMaDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMbDb"
                                            placeholder="VaMbDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMbDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMaDb"
                                            placeholder="VaMaDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMaDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMbDm"
                                            placeholder="VaMbDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMbDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMaDm"
                                            placeholder="VaMaDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMaDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMbDa"
                                            placeholder="VaMbDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMbDa}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VaMaDa"
                                            placeholder="VaMaDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VaMaDa}
                                        />
                                    </th>
                                </tr>
                                <tr>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMbDmb"
                                            placeholder="VmMbDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMbDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMaDmb"
                                            placeholder="VmMaDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMaDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMbDb"
                                            placeholder="VmMbDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMbDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMaDb"
                                            placeholder="VmMaDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMaDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMbDm"
                                            placeholder="VmMbDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMbDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMaDm"
                                            placeholder="VmMaDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMaDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMbDa"
                                            placeholder="VmMbDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMbDa}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VmMaDa"
                                            placeholder="VmMaDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VmMaDa}
                                        />
                                    </th>
                                </tr>
                                <tr>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMbDmb"
                                            placeholder="VbMbDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMbDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMaDmb"
                                            placeholder="VbMaDmb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMaDmb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMbDb"
                                            placeholder="VbMbDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMbDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMaDb"
                                            placeholder="VbMaDb"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMaDb}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMbDm"
                                            placeholder="VbMbDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMbDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMaDm"
                                            placeholder="VbMaDm"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMaDm}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMbDa"
                                            placeholder="VbMbDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMbDa}
                                        />
                                    </th>
                                    <th className="amarillito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="VbMaDa"
                                            placeholder="VbMaDa"
                                            onKeyDown="ValidateActInsert(this)"
                                            maxLength="1"
                                            minLength="1"
                                            onChange={handleChange}
                                            value={inputs.VbMaDa}
                                        />
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan="2" rowSpan="2" style={{ backgroundColor: 'rgb(48, 84, 150)', color: 'white'}}>
                                        <br />MARGEN
                                        <a data-toggle="modal" data-target="#margMod">
                                            <i className="fas fa-info-circle fa-sm fa-fw mr-2 text-gray-400" data-toggle="modal" data-target="#margMod"></i>
                                        </a>
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MbDmb"
                                            placeholder="mBajo%"
                                            onKeyUp="updInpsMargen()"
                                            onChange={handleChange}
                                            value={inputs.MbDmb}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MaDmb"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MaDmb}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MbDb"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MbDb}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MaDb"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MaDb}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MbDm"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MbDm}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MaDm"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MaDm}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MbDa"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MbDa}
                                        />
                                    </th>
                                    <th className="azulito">
                                        <input
                                            type="text"
                                            className="form-control form-control-user text-center"
                                            name="MaDa"
                                            placeholder="%"
                                            onChange={handleChange}
                                            value={inputs.MaDa}
                                        />
                                    </th>
                                </tr>
                                <tr>
                                    <th className="azulito2" >Bajo</th>
                                    <th className="azulito2" >Alto</th>
                                    <th className="azulito2" >Bajo</th>
                                    <th className="azulito2" >Alto</th>
                                    <th className="azulito2" >Bajo</th>
                                    <th className="azulito2" >Alto</th>
                                    <th className="azulito2" >Bajo</th>
                                    <th className="azulito2" >Alto</th>
                                </tr>
                                <tr>
                                    <th className="borderless"></th>
                                    <th className="borderless"></th>
                                    <th colSpan="2" className="naranjita">
                                        <input
                                            type="number"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '60%', marginLeft: '15%' }}
                                            name="Dmb"
                                            placeholder="Muy Baja %"
                                            onChange={handleChange}
                                            value={inputs.Dmb}
                                        />
                                    </th>
                                    <th colSpan="2" className="naranjita">
                                        <input
                                            type="number"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '60%', marginLeft: '15%' }}
                                            name="Db"
                                            placeholder="Baja %"
                                            onKeyUp="valDemanda()"
                                            onChange={handleChange}
                                            value={inputs.Db}
                                        />
                                    </th>
                                    <th colSpan="2" className="naranjita">
                                        <input
                                            type="number"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '60%', marginLeft: '15%' }}
                                            name="Dm"
                                            placeholder="Media %"
                                            onKeyUp="valDemanda()"
                                            onChange={handleChange}
                                            value={inputs.Dm}
                                        />
                                    </th>
                                    <th colSpan="2" className="naranjita">
                                        <input
                                            type="number"
                                            className="form-control form-control-user text-center"
                                            style={{ width: '60%', marginLeft: '15%' }}
                                            name="Da"
                                            placeholder="Alta %"
                                            onKeyUp="valDemanda()"
                                            onChange={handleChange}
                                            value={inputs.Da}
                                        />
                                    </th>
                                </tr>
                                <tr>
                                    <th className="borderless"></th>
                                    <th className="borderless"></th>
                                    <th colSpan="2" className="naranjita">Muy Baja</th>
                                    <th colSpan="2" className="naranjita">Baja</th>
                                    <th colSpan="2" className="naranjita">Media</th>
                                    <th colSpan="2" className="naranjita">Alta</th>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th className="borderless"></th>
                                    <th className="borderless"></th>
                                    <th colSpan="8" style={{ backgroundColor: 'rgb(198, 89, 17)', color: 'white', padding:'1.5%' }}>DEMANDA
                                        <a data-toggle="modal" data-target="#demaMod">
                                            <i className="fas fa-info-circle fa-sm fa-fw mr-2 text-gray-400" data-toggle="modal" data-target="#demaMod"></i>
                                        </a>
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            <div className="col-1"></div>
        </div>
    );
}

export default ABCMatrix;
