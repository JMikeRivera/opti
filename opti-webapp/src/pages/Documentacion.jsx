import React, { useState } from 'react';
import './../styles/pages/documentacion.css';
import './../styles/components/Sidebar.css';
function Documentacion() {
  const [openSection, setOpenSection] = useState(null);
  const [openSubsection, setOpenSubsection] = useState(null);
  const [openSubSubsection, setOpenSubSubsection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(section === openSection ? null : section);
    setOpenSubsection(null);
    setOpenSubSubsection(null);
  };

  const toggleSubsection = (subsection) => {
    setOpenSubsection(subsection === openSubsection ? null : subsection);
    setOpenSubSubsection(null);
  };

  const toggleSubSubsection = (subsubsection) => {
    setOpenSubSubsection(subsubsection === openSubSubsection ? null : subsubsection);
  };
  return (
    <div className='scrollable-page'>
      <div className='Documentacion'>
        <h1 className='text1'>Documentación BTC OPTI-smart</h1>

        {sections.map(section => (
          <div key={section.key} className="panel">
            <div className="panel-heading" onClick={() => toggleSection(section.key)}>
              <h2>{section.title}</h2>
            </div>
            {openSection === section.key && (
              <div className="panel-content">
                {section.content.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
                {section.subsections.map(subsection => (
                  <div key={subsection.key} className="sub-panel">
                    <div className="sub-panel-heading" onClick={() => toggleSubsection(subsection.key)}>
                      <h3>{subsection.title}</h3>
                    </div>
                    {openSubsection === subsection.key && (
                      <div className="sub-panel-content">
                        {subsection.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                        {subsection.subsubsections?.map(subsub => (
                          <div key={subsub.key} className="sub-sub-panel">
                            <div className="sub-sub-panel-heading" onClick={() => toggleSubSubsection(subsub.key)}>
                              <h4>{subsub.title}</h4>
                            </div>
                            {openSubSubsection === subsub.key && (
                              <div className="sub-sub-panel-content">
                                {subsub.content.map((item, index) => (
                                  <p key={index}>{item}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documentacion;

const sections = [
  {
    key: 'gestionArchivos',
    title: 'Módulo Politicas de Inventario – Página de Gestión de Archivos',
    content: [
     
    ],
    subsections: [
      {
        key: 'gestionDetalles',
        title: 'Detalles de Gestión de Archivos',
        content: [
          'La página de gestión de archivos permite al usuario cargar información...',
          'La página de gestión de archivos permite al usuario cargar información de entrada para ser utilizada por el optimizador BTC OPTISmart. ',
          'Esta sección permite descargar las plantillas de cada archivo, y permite exportar los archivos cargados.',
          'Además de tener una sección de resultado de la carga, para validar que los datos se hayan cargado correctamente',
          'Los campos que se cubren dentro de esta sección y que serán explicados son: ',
          '-	La función de los botones',
          '-	Archivos plantilla/base',
          '-	Archivo Log.'

        ],
        subsubsections: [
          {
            key: 'botonesYSecciones',
            title: 'Botones y Secciones',
            content: [
              '1.	Catálogo de SKU’s:  Si está activa esta casilla, los procesos que se ejecuten en esta sección serán pertenecientes al Catálogo de Productos (SKU).',
              '2.	Histórico de Demanda: Con esta casilla activa los procesos ejecutados modificarán o descargarán los datos del Histórico de Ventas de los productos.',
              '3.	Cargar Nuevo: Este botón nos permitirá seleccionar un archivo de nuestro ordenador para introducirlo como información base para la aplicación, ya sea, de los datos SKU (1) o del Histórico (2).',
              '4.	Descargar Actual: Este botón descargará los datos actuales que se tienen guardados en la aplicación ya sea del SKU (1) o del Histórico (2), dependiendo de la casilla que se tenga seleccionada.',
              '5.	Descargar Plantilla: Este botón descargará el template/plantilla base que se debe seguir en nuestros archivos (SKU e Histórico) a la hora de cargarlos en la aplicación. De no seguir el formato de la plantilla podrá haber varios errores en los resultados.',
              '6.	Resulado de la carga de información: En esta sección se muestran los errores que se encontraron en los archivos, para que se pueda tener visibilidad de las correcciones que se les debería hacer. ',
              '7.	Descargar Log de Resultados: Permite descargar un archivo de texto con la información del resultado de la carga.'
            ]
          },
          {
            key: 'archivoSKU',
            title: 'Archivo de SKU',
            content: [
              'Dentro de la plantilla de SKU se deben incluir los datos base de los SKU y sus atributos que nos servirán para la Clasificación y la definición de Niveles de Inventario a nivel Producto-Ubicación. ',
              '1.	Producto: Código con el que se le reconoce al producto dentro del inventario',
              '2.	Desc_Producto: Descripción del producto.',
              '3.	Familia_Producto: Agrupador de producto para identificar atributos propios de una familia de productos, como marca, sabor, tamaño.',
              '4.	Categoria: Agrupador de producto por categoría, p.e. “Producto Terminado, Materia Prima, Semiterminados”.',
              '5.	Segmentacion_producto: Agrupación adicional otorgada al producto dentro de la organización.',
              '6.	Ubicacion: Se identifica la ubicación a la que pertenecen los códigos de los productos, ya que, los parámetros de estos pueden cambiar dependiendo de la ubicación.',
              '8.	OverrideClasificacionABCD: Celda que permite modificar el resultado de la clasificación recomendada por la herramienta a una designada por el usuario.',
              '9.	Override_Min_Politica_Inventarios: Si el campo tiene un valor, el inventario de seguridad calculado por la herramienta se sobreescribirá al valor asignado en este campo, si es que cae por debajo del valor de este campo.',
              '10.	Override_Max_Politica_Inventarios: Si el campo tiene un valor, el inventario de seguridad calculado por la herramienta se sobreescribirá al valor asignado en este campo, si es que cae por arriba del valor de este campo.',
              '11.	Medida_Override: Define si el override mínimo y máximo de la política de inventarios para cada producto es por “Cantidad” o por “Días de Cobertura”',
              '12.	Tipo_Override: Define si el override mínimo y máximo de la política de inventarios para cada producto es para el ROP (Punto de Reorden) o SS (Inventario de seguridad)',
              '13.	MargenUnitario: Contribución marginal del producto con respecto al costo del producto.',
              '14.	LeadTime_Abasto_Dias: Tiempo de entrega y traslado desde que se pide la orden de reposición hasta que llega.',
              '15.	Frecuencia_Revision_Dias: Número de días que pasan entre una revisión y la siguiente para identificar la necesidad de poner una orden de reposición que abastece la localidad para la cual se está calculando el inventario; o bien, el número de días típico que pasan entre cada vez que ese producto se manufactura.',
              '16.	Fill_Rate: El porcentaje promedio del producto que llegó dentro del Lead Time compromiso.',
              '17.	MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido.',
              '18.	Tamano_Lote: Múltiplo en el que el producto debe resurtirse en el momento de hacer un pedido de este.',
              '19.	Unidades_Pallet: Cantidad de unidades base de un producto que caben en una tarima o pallet.',
              '20.	Costo_Unidad: Costo del producto por cada unidad de producto (NO es el precio del producto).',
              '21.	Tolerancia_Vida_Util_Dias: Vida de anaquel mínima permisible del producto a la hora de ser surtido al cliente, según las políticas de la empresa o el cliente.',
              '22.	Vida_Util_Dias: Vida de anaquel del producto al ser producido o comprado.',
              '23.	Unidad_Medida_UOM: Unidad de medida mínima usada para el producto.',
              '24.	Presentacion: Decripción de la presentación de la unidad de medida mínima.',
              '25.	Desc_Empaque_UOM_Base: Unidad de medida estándar.',
              '26.	Unidades_Empaque: Cantidad de productos medidos en cantidad de medida mínima que caben dentro de la unidad de medida estándar.'
            ]
            
          },
          {
            key: 'archivoHistorico',
            title: 'Archivo Histórico de Demanda',
            content: [
              'Dentro de la plantilla del Histórico se deben incluir los datos de la demanda histórica de los SKUs por ubicación. ',
              '1. Ubicación: Ubicación a la que pertenece el producto cuya cantidad fue facturada.',
              '2. Producto: Código del Producto que se surtió por la ubicación listada. ',
              '3. Fecha: Fecha en la cual se realizo el surtimiento del producto dado.',
              '4. Cantidad: Cantidad en unidades de producto base que se surtió en la fecha dada, por la ubicación y código de producto dado.'
            
            ]
          }
        ]
      }
    ]
  },

  {
    key: 'parametros',
    title: 'Parametros de Clasificacion y Niveles de Inventario',
    content: [],
    subsections: [
      {
        key: 'gestionParametros',
        title: 'Detalles de Gestión de Parametros',
        content: [
          'En esta sección se incluyen la explicación de los parámetros que serán utilizados para los cálculos de los archivos salida de clasificación y política de inventarios.',
          'Estos parámetros utilizan la información que existe en los archivos de entrada de la vista “Gestión de Archivos” y asignan la clasificación y nivel de servicio a utilizar en el cálculo de la política de inventario y clasificación de productos.',
          '1.	Guardar Cambios: Guarda las modificaciones que se hayan realizado para esta y las sesiones posteriores.',
          '2.	Ejecuta Clasificación y Políticas: Corre el optimizador para generar los archivos de salida de clasificación ABC y políticas de inventario',
          '3.	Horizonte del Histórico: Días por considerar del archivo de “Histórico” para los cálculos de demanda y variabilidad, contando de la fecha fin del horizonte hacia atrás',
          '4.	Fin del Horizonte: Última fecha por considerar en el horizonte del archivo “Histórico” para los cálculos de demanda y variabilidad.',
          '5.	Calendario: Define la granularidad de los periodos de tiempo con los que se va a calcular la política de inventarios.',
          '6.	Matriz de clasificación ABC: Valores ABCD para clasificar los registros de acuerdo con los criterios de variabilidad, margen y demanda definidos. De acuerdo con los criterios que tengan mayor valor para la organización, se le dará una clasificación (A, B, C o D) a cada celda de la matriz. Por ejemplo, normalmente el segmento A, se incluiría en la sección con Demanda Alta, variabilidad Baja y margen Alto.',
          '7.	Variabilidad: Rangos de clasificación por variabilidad por SKU. Se refiere a la dispersión de la demanda con respecto al promedio. Estos rangos vienen de la proporción de la desviación estándar entre la demanda promedio por producto, y son establecidos por el usuario. Por ejemplo, normalmente se considera variabilidad alta a los productos que exceden el valor de 1 de variabilidad.',
          '8.	Margen: Rangos de clasificación por Margen por SKU. La clasificación por Margen Unitario tomara el margen unitario de los datos base por producto para definir como un producto de margen Alto o Bajo. Por ejemplo, la organización podría considerar que los productos con margen superior al 30% tienen un margen unitario alto, y de acuerdo con este valor se le dará una clasificación distinta a los productos que tengan un margen unitario Bajo (<30%).',
          '9.	Demanda: Rangos de clasificación por Demanda por SKU. Estos rangos se utilizarán para definir a partir de que porcentajes de la demanda acumulada total se irán definiendo como productos de clasificación Alta, Media, Baja o Muy Baja. Por ejemplo, si definimos nuestro porcentaje de demanda alta con el valor de 70%; todos los productos que pertenezcan al 70% de la venta acumulada total, considerándolos de mayor a menor demanda serán clasificados como productos de demanda Alta.',
          '10.	Nivel de Servicio: Nivel de servicio requerido para cada clasificación. Estos valores de nivel de servicio para cada clasificación de producto servirán para definir qué % de la demanda quedará cubierta dependiendo de la clasificación que se le asigne al producto.'
        ]
      }
    ]
  },
 
  {
    key: 'paginaResultados',
    title: 'Pagina de Resultados',
    content: [],
    subsections: [
      {
        key: 'gestionResultados',
        title: 'Detalles de Gestión de Resultados',
        content: [
          'En esta sección se detalla sobre cada uno de los campos y botones dentro de la vista de Resultados, así como las bases teóricas necesarias para entender los campos de los archivos de salida que se generaron en las corridas de cálculo de clasificación y políticas de inventario.',
          'Los campos que se cubren dentro de esta sección y que serán explicados son:',
          '- Botones y secciones',
          '- Archivo de Politicas de Inventario',
          '- Teoria de conceptos de Politica de Inventarios'
        ],
        subsubsections: [
          {
            key: 'botonesYSecciones',
            title: 'Botones y Secciones',
            content: [
              '1. Políticas de Inventario: Cuando se selecciona esta opción, la consulta generada muestra la salida del proceso de cálculo de políticas de inventario a nivel Producto-Ubicación.',
              '2. Selecciona: Cuando se selecciona la opción de Políticas de inventario, se debe seleccionar de una lista desplegable la opción de visualización deseada:',
              'a. SKU: muestra información relativa a los cálculos intermedios que se obtuvieron para generar la política de inventarios.',
              'b. Cantidad: Muestra las políticas de inventarios calculadas a nivel SKU (MOQ, ROQ, ROP, META, Inventario_Promedio) en términos de piezas.',
              'c. Días de Cobertura: Muestra las políticas de inventarios calculadas a nivel SKU (MOQ, ROQ, ROP, META, Inventario_Promedio) en términos de días de cobertura.',
              'd. Pallets: Muestra las políticas de inventarios calculadas a nivel SKU (MOQ, ROQ, ROP, META, Inventario_Promedio) en términos de pallets.',
              'e. Costo: Muestra las políticas de inventarios calculadas a nivel SKU (MOQ, ROQ, ROP, META, Inventario_Promedio) en términos de costo.',
              '3. Calendario: Elige la granularidad de los periodos de tiempo con los que se calculó la política de inventarios.',
              '4. Sección de Resultados: En esta sección se muestra la tabla de salida consultada',
              '5. Descargar Tabla: Permite exportar los resultados consultados en un archivo .CSV'
            ]
          }
        ]
      }
    ]
  },
  
  {
    key: 'clasificacionABCD',
    title: 'Módulo Clasificación ABCD',
    content: [],
    subsections: [
      {
        key: 'archivoClasificacionABCD',
        title: 'Archivo de Clasificación ABCD',
        content: [
          '1. SKU: Identificador del registro concatenando el producto y la ubicación. El formato es “Producto@Ubicación”.',
          '2. Producto: Código con el que se le reconoce al producto dentro del inventario.',
          '3. Ubicación: Se identifica la ubicación a la que pertenecen los códigos de los productos, ya que los parámetros de estos pueden cambiar dependiendo de la ubicación.',
          '4. Demanda (Costo): Demanda total histórica calculada para el SKU entre el periodo válido indicado en la página de parámetros de Clasificación ABC en términos de costo.',
          '5. Demanda_Promedio_Diaria (Costo): Demanda diaria calculada como el promedio de la demanda total representada en costo, dentro de la cantidad de días evaluados. Su fórmula es: Demanda_Promedio_Diadia_Costo = Demanda_Costo/cantidad de días',
          '6. Clasificacion_Demanda: Subclasificación calculada de acuerdo con los criterios de la página de “Parámetros de Clasificación ABC”. Para calcular la clasificación por demanda se ordenan los productos por ubicación de mayor demanda a menor demanda y se calcula el porcentaje de la demanda acumulada por ubicación.',
          '7. Variabilidad_Demanda (Costo): Cálculo de la volatilidad de los registros de acuerdo con el histórico de demanda de cada uno de éstos.',
          '8. DS_Demanda (Costo): Distribución estándar de la demanda histórica expresada como la raíz cuadrada de su variabilidad.',
          '9. Coeficiente_Variabilidad: Coeficiente de variabilidad de la demanda histórica en términos de costo usada para definir la subclasificación por variabilidad del registro de SKU al evaluarlo contra los criterios de variabilidad en la página de parámetros de Clasificación. Se calcula dividiendo la desviación estándar entre la demanda promedio diaria.',
          '10. Clasificacion_Variabilidad: Subclasificación definida de acuerdo con los criterios de la página de “Parámetros de Clasificación ABC” al evaluarlos contra el coeficiente de variabilidad del registro.',
          '11. Margen_Unitario: Contribución marginal del producto con respecto al costo del producto definido en la tabla de entrada “SKU”.',
          '12. Clasificacion_Margen: Subclasificación definida de acuerdo con los criterios de la página de “Parámetros de Clasificación ABC” al evaluarlos contra el “Margen Unitario” definido. El criterio sólo tiene un valor que define si el registro se toma como margen “Alto” o “Bajo”. Por ejemplo, si el criterio es 30, significa que los SKUs que tengan un “Margen Unitario” menor a 30% son clasificados como margen “Bajo”, en cambio, los SKUs que tengan un “Margen Unitario” mayor a 30% son clasificados como margen “Alto”.',
          '13. Clasificacion_ABCD: Clasificación del registro de SKU definida de acuerdo con la matriz de criterios de la página “Parámetros de Clasificación ABC” al evaluar las subclasificaciones definidas para el registro de demanda, variabilidad, y margen. Los valores que pueden existir en esta columna son A, B, C, D. Por ejemplo, con una matriz definida como a continuación:'
        ]
      },
      {
        key: "archivoPoliticasdeInventario",
        title: "Archivo de Políticas de Inventario",
        content: [
          "Archivo de salida que contiene la información de las políticas de inventario calculadas. Además, contiene los campos utilizados por la herramienta para su definición, expresados en términos de días de unidad de medida base.",
          "1. _id: Identificador interno en la aplicación BTC Opti.",
          "2. Tipo_Calendario: Indicador de que los cálculos se realizaron de manera diaria o semanal.",
          "3. SKU: Identificador del registro concatenando el producto y la ubicación. El formato es 'Producto@Ubicación'.",
          "4. Producto: Código con el que se reconoce al producto dentro del inventario.",
          "5. Desc_Producto: Descripción del producto.",
          "6. Familia_Producto: En este caso para Accelerium se toma como la marca.",
          "7. Categoría: Código de clasificación otorgada al producto dentro de la organización.",
          "8. Segmentación: Código de segmentación del producto dentro de la organización.",
          "9. Presentación: Forma en la que se presenta el producto.",
          "10. Ubicación: Se identifica la ubicación a la que pertenecen los códigos de los productos, ya que los parámetros de estos pueden cambiar dependiendo de la ubicación.",
          "11. Desc_Ubicacion: Descripción de la ubicación.",
          "12. Clasificación: Clasificación del registro de SKU definida de acuerdo con la matriz de criterios de la página 'Parámetros de Clasificación ABC' al evaluar las subclasificaciones definidas para el registro de demanda, variabilidad y margen. Para más información, véase Archivo de clasificación ABCD.",
          "13. Nivel_Servicio: Valor definido de acuerdo con los 'Parámetros de Clasificación ABC'. Se evalúa el campo 'Clasificación' del SKU y se asigna el nivel de servicio definido.",
          "14. Valor_Z: Número de desviaciones estándar según el nivel de servicio objetivo del registro, este valor se usa para calcular el inventario de seguridad requerido.",
          "15. UOM: Unidad de Medida.",
          "16. UOM_Base: Unidad de Medida Base.",
          "17. Unidades_Empaque: Número de unidades que hay en cada empaque.",
          "18. Demanda_Promedio_Semanal: Demanda semanal calculada como el promedio de la demanda total representada en cantidad, dentro de la cantidad de días evaluados.",
          "19. Lead_Time_Abasto: Tiempo en el que el producto tarda en reabastecerse.",
          "20. Variabilidad_Demanda_Cantidad: Cálculo de la volatilidad de los registros de acuerdo con el histórico de demanda de cada uno de estos.",
          "21. DS_Demanda: Desviación estándar de la demanda histórica expresada como la raíz cuadrada de su variabilidad.",
          "22. Fill_Rate: El porcentaje promedio del producto que llegó dentro del Lead Time compromiso.",
          "23. Frecuencia_Revision (Días): Número de días que pasan entre una revisión y la siguiente para identificar la necesidad de poner una orden de reposición que abastece la localidad para la cual se está calculando el inventario; o bien, el número de días típico que pasan entre cada vez que ese producto se manufactura.",
          "24. Prom_LT: Valor promedio del Lead Time de acuerdo con el supuesto de que el porcentaje de Fill Rate cumple con el LT de abasto y el resto (1 - % Fill Rate) se entregará en la siguiente revisión, sumando la frecuencia de revisión al Lead time de abasto.",
          "25. DS_LT: Desviación estándar del Lead Time entendida como la raíz cuadrada de la variación de los pedidos entregados dentro del Lead Time compromiso y los pedidos entregados en la siguiente revisión contra el lead time promedio, basado en el fill rate del registro.",
          "26. Override_SI_NO: Bandera que indica si el valor del inventario de seguridad es calculado (No) o un Override (Sí) definido por la columna Override_Politica_Inventarios.",
          "27. Override_Politica_Inventarios: Cantidad aplicada en el override.",
          "28. SS_Cantidad: Inventario de seguridad del registro.",
          "29. Demanda_LT: Demanda pronosticada a requerir en el Lead Time promedio.",
          "30. MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido.",
          "31. ROQ: Cantidad típica a reponer de acuerdo con la demanda del LT redondeado al MOQ.",
          "32. ROP: Punto de reorden en el cual si el inventario cae por debajo de este se debe generar un nuevo pedido.",
          "33. META: Inventario objetivo al momento de hacer un pedido.",
          "34. Inventario_Promedio: Media del inventario estimado bajo la política de inventario.",
          "35-37. Medida_Override, Tipo_Override y STAT_SS: Variables para controlar el override, de haberse aplicado.",
          "38. DC_SS: Inventario de seguridad del registro, expresado en Días de Cobertura (DC).",
          "39. DC_Demanda_LT: Demanda pronosticada a requerir en el Lead Time promedio, expresado en Días de Cobertura.",
          "40. DC_MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido, expresado en Días de Cobertura.",
          "41. DC_ROQ: Cantidad típica a reponer de acuerdo con la demanda del LT redondeado al MOQ, expresado en Días de Cobertura.",
          "42. DC_ROP: Punto de reorden en el cual si el inventario cae por debajo de este se debe generar un nuevo pedido, expresado en Días de Cobertura.",
          "43. DC_META: Inventario objetivo al momento de hacer un pedido, expresado en Días de Cobertura.",
          "44. DC_Inventario_Promedio: Media del inventario estimado bajo la política de inventario, expresado en Días de Cobertura.",
          "45. DC_Vida_Util_Dias: Días que tiene el producto antes de caducar.",
          "46. DC_Tolerancia_Vida_Util_Dias: Días de tolerancia que tiene el producto antes de caducar.",
          "47. DC_ROP_Alto: Indica si los días de inventario del punto de reorden de los productos están sobre los días de caducidad de ese mismo producto.",
          "48. DC_Sobreinventario_Dias: Cantidad de días por los cuales excedería la fecha de caducidad del producto.",
          "49. P_SS: Inventario de seguridad del registro, expresado en Pallets (P).",
          "50. P_Demanda_LT: Demanda pronosticada a requerir en el Lead Time promedio, expresado en Pallets.",
          "51. P_MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido, expresado en Pallets.",
          "52. P_ROQ: Cantidad típica a reponer de acuerdo con la demanda del LT redondeado al MOQ, expresado en Pallets.",
          "53. P_ROP: Punto de reorden en el cual si el inventario cae por debajo de este se debe generar un nuevo pedido, expresado en Pallets.",
          "54. P_META: Inventario objetivo al momento de hacer un pedido, expresado en Pallets.",
          "55. P_Inventario_Promedio: Media del inventario estimado bajo la política de inventario, expresado en Pallets.",
          "56. C_SS: Inventario de seguridad del registro, expresado en Costo (C).",
          "57. C_Demanda_LT: Demanda pronosticada a requerir en el Lead Time promedio, expresado en Costo.",
          "58. C_MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido, expresado en Costo.",
          "59. C_ROQ: Cantidad típica a reponer de acuerdo con la demanda del LT redondeado al MOQ, expresado en Costo.",
          "60. C_ROP: Punto de reorden en el cual si el inventario cae por debajo de este se debe generar un nuevo pedido, expresado en Costo.",
          "61. C_META: Inventario objetivo al momento de hacer un pedido, expresado en Costo.",
          "62. C_Inventario_Promedio: Media del inventario estimado bajo la política de inventario, expresado en Costo.",
          "63. U_SS: Inventario de seguridad del registro, expresado en UOMs.",
          "64. U_Demanda_LT: Demanda pronosticada a requerir en el Lead Time promedio, expresado en UOMs.",
          "65. U_MOQ: Cantidad mínima de unidades de producto que se requiere ordenar en un solo pedido, expresado en UOMs.",
          "66. U_ROQ: Cantidad típica a reponer de acuerdo con la demanda del LT redondeado al MOQ, expresado en UOMs.",
          "67. U_ROP: Punto de reorden en el cual si el inventario cae por debajo de este se debe generar un nuevo pedido, expresado en UOMs.",
          "68. U_META: Inventario objetivo al momento de hacer un pedido, expresado en UOMs.",
          "69. U_Inventario_Promedio: Media del inventario estimado bajo la política de inventario, expresado en UOMs."
        ]
      }
    ]
  },
 


        

          
          ///////////////////////////////////

          {
            key: 'gestionArchivos1',
            title: 'Módulo Reposición – Página de Gestión de Archivos',
            content: [
             
            ],
            subsections: [
              {
                key: 'gestionDetalles',
                title: 'Detalles de Gestión de Archivos',
                content: [
                  'La página de gestión de archivos del módulo de reposición funciona similar al del módulo de políticas de inventarios. ',
                  'Permite al usuario cargar información de entrada para ser utilizada por BTC OPTISmart para generar un plan de reposición',
                  'Esta sección permite descargar las plantillas de cada archivo, y permite exportar los archivos cargados. Además de tener una sección de resultado de la carga, para validar que los datos se hayan cargado correctamente.',
                  'A continuación, se explicará cada uno de los campos y botones dentro de la vista de gestión de archivos, así como los procesos de actualización de la información de la herramienta.',
                  'Y se detallará acerca de las plantillas y los campos requeridos para el correcto funcionamiento de la herramienta.'
        
                ],
                subsubsections: [
                  {
                    key: 'botonesYSecciones',
                    title: 'Botones y Secciones',
                    content: [
                      '1. Calendario: Elige las políticas de inventario que serán usadas por el plan de reposición (con calendario diario, o semanal). Nota: no se puede correr un plan de reposición si no se han corrido las políticas de inventario en el calendario seleccionado.',
                      '2. Botón Ejecutar plan de reposición: Este botón permite generar el plan de reposición con la información recolectada de los archivos cargados en esta sección y la política de inventarios elegida.',
                      '3. Sección Carga de información: En esta sección se eligen los archivos que se van a cargar/descargar para ser leídos por el módulo de reposición.',
                      '4. Inventario disponible: Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información del inventario disponible (léase tabla “Inventario disponible”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.',
                      '5. Inventario en tránsito: Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información del inventario en tránsito (léase tabla “Inventario en tránsito”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.',
                      '6. Requerimientos confirmados: Al seleccionar esta opción, permite al usuario cargar el archivo que contiene la información de los requerimientos confirmados (léase tabla “Requerimientos confirmados”), así como descargar el archivo actualmente cargado en la herramienta, o descargar la plantilla para ser usada en una carga inicial.',
                      '7. Botón cargar nuevo: Permite importar desde un archivo CSV a BTC OPTISmart de la opción elegida. La carga de este archivo borra la información previamente cargada y la reemplaza con la del archivo cargado. Nota: Para una carga exitosa, asegúrese de acomodar la información del CSV de acuerdo con la plantilla de la opción elegida. Un mal acomodo de la información, así como usar caracteres no permitidos puede generar errores de carga.',
                      '8. Botón Descargar Actual: Permite exportar la información actual y previamente cargada a BTC OPTISmart de la opción elegida.',
                      '9. Botón descargar plantillas: Permite descargar una plantilla base en la cual se encuentran los encabezados y el orden que deben llevar para importar la opción seleccionada en el botón cargar nuevo.',
                      '10. Sección Resultado de la carga de información: En esta sección se visualiza el log de carga, aquí se ve el estatus de la carga, así como posibles errores o alertas que hayan sucedido durante la carga.',
                      '11. Botón descargar Log de resultados: Permite exportar la información del resultado de la carga.'
                     
                    ]
                  },
                  {
                    key: 'InvDisp',
                    title: 'Inventario Disponible',
                    content: [
                      '1. SKU: Identificador del registro concatenando el producto y la ubicación. El formato es “Producto@Ubicación”.',
                      '2. Producto: Código con el que se le reconoce al producto dentro del inventario.',
                      '3. Ubicación: Se identifica la ubicación a la que pertenecen los códigos de los productos, ya que los parámetros de estos pueden cambiar dependiendo de la ubicación.',
                      '4. Inventario_disponible: Registro actual de la cantidad disponible del producto en el almacén de la ubicación.'
                      ]
                    
                  },

                  {
                    key: 'InvTrans',
                    title: 'Inventario en Transito',
                    content: [
                      '1. SKU: Identificador del registro concatenando el producto y la ubicación. El formato es “Producto@Ubicación”.',
                      '2. Producto: Código con el que se le reconoce al producto dentro del inventario.',
                      '3. Ubicación: Se identifica la ubicación a la que pertenecen los códigos de los productos, ya que los parámetros de estos pueden cambiar dependiendo de la ubicación.',
                      '4. Cantidad en tránsito: Registro actual de la cantidad de producto previsto que llegue al almacén de la ubicación, pero aún no está disponible.'
                   
                      ]
                    
                  },

                  {
                    key: 'ReqConf',
                    title: 'Requerimientos Confirmados',
                    content: [
                      '1. SKU: Identificador del registro concatenando el producto y la ubicación. El formato es “Producto@Ubicación”. Este identificador es clave para rastrear los productos de manera precisa en diferentes ubicaciones.',
                      '2. Producto: Código con el que se le reconoce al producto dentro del inventario. Este código facilita la identificación y manejo del stock dentro del sistema.',
                      '3. Ubicación: Identificación de la ubicación a la que pertenecen los códigos de los productos. Los parámetros de estos productos pueden variar dependiendo de la ubicación, permitiendo una gestión adecuada del inventario por región o almacén.',
                      '4. Cliente: Cliente que está realizando el pedido confirmado. Este campo identifica al cliente para asociar sus pedidos específicos con el inventario disponible y las ubicaciones correspondientes.',
                      '5. Cantidad confirmada: Cantidad del producto confirmada por el cliente que ha sido ordenada para una ubicación registrada. Esta cantidad es crucial para gestionar el flujo de salida de productos del inventario hacia los clientes.'
  
                    
                    ]
                  }
                ]
              }
            ]
          },


          /////////////////////////////////////////////////////////////

        {
            key: 'PaginR',
            title: 'Módulo Reposición – Página de Resultados',
            content: [
             
            ],
            subsections: [
              {
                key: 'gestionDetalles',
                title: 'Detalles de Gestión Resultados',
                content: [
                  'El plan de reposición genera una sugerencia de pedido basada en el análisis del inventario actual, patrones de ventas, y predicciones de demanda futura. Este enfoque ayuda a mantener los niveles de stock óptimos, reduciendo tanto el exceso de inventario como el riesgo de agotamiento de existencias.',
                  'Además, el plan se adapta automáticamente a los cambios en las condiciones del mercado y a las variaciones estacionales, asegurando que la empresa pueda responder de manera efectiva a las necesidades de sus clientes sin incurrir en costos innecesarios de almacenamiento o pérdida de ventas por falta de productos.'
                  
      
                ],
                subsubsections: [
                  {
                    key: 'botonesYSecciones',
                    title: 'Botones y Secciones',
                    content: [
                      '1. Calendario: Elige la política de inventarios que se usó para generar el plan de reposición',
                      '2. Botón Consultar: Al apretar el botón, se genera una consulta de la tabla de salida ',
                      '3.	Sección de Resultados: En esta sección se muestra la tabla de salida consultada',
                      '4.	Descargar Tabla: Permite exportar los resultados consultados en un archivo .CSV'
                      
                
                    ]
                  },
                  
                ]
              }
            ]
          },

          ///////////////////////////////////////
          {
            key: 'CasosH',
            title: 'Casos on Hold',
            content: [
             
            ],
            subsections: [
              {
                key: 'CasosonHo',
                title: 'Casos on Hold',
                content: [
                  'En esta sección se formulan escenarios en los cuales se ejemplifican los pasos requeridos',
                  'Así como la interpretación de resultados y comparación de estos para diferentes casos ejecutados dentro de esta herramienta.',

                  
      
                ],
                subsubsections: [
                  {
                    key: 'Pasos',
                    title: 'Pasos',
                    content: [
                      'a.	Definir clasificación de producto ',
                      'b.	Cálculo de Inventario de Seguridad con 60 días de Historia ',
                      'i.	Inventario de Seguridad Base ',
                      'ii.	Inventario de Seguridad con cambios en el Nivel de Servicio '
                      
                
                    ]
                  },
                  
                ]
              }
            ]
          },

          
        ]
      
    
  




