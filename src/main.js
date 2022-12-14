import './css/style.css'
import './css/boostrap.min.css'

import { DOMParser, XMLSerializer, DOMImplementation } from '@xmldom/xmldom'
import { DiscoverExtractor } from '@nodecfdi/cfdi-expresiones'
import { SoapConsumerClient, SoapClientFactory } from '@nodecfdi/sat-estado-cfdi-soap'
import { install } from '@nodecfdi/cfdiutils-common'

install(new DOMParser(), new XMLSerializer(), new DOMImplementation())

const alertPlaceholder = document.querySelector('#liveAlertPlaceholder')
let input = document.querySelector('#cfdi')
let output = document.querySelector('#output')
let dataXML = ''

const alert = (message, type) => {
    alertPlaceholder.innerHTML =
        `<div class="alert alert-${type} alert-dismissible" role="alert">
       <div>${message}</div>
    </div>`
}

const getData = () => {

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Su navegador no soporta este componente', 'danger')
        return;
    }
    if (!input) {
        alert("Existe un error al cargar la extensión", 'danger');
    }
    else if (!input.files) {
        alert("Su navegador no soporta cargar archivos", 'danger');
    }
    else if (!input.files[0]) {
        alert('Seleccione un xml y presione en el botón "Cargar archivo"', 'danger')
    }
    else {

        let fr = new FileReader();
        fr.onload = async function() {
            output.textContent = fr.result
            const dataFile = fr.result
            // creamos el extractor
            const extractor = new DiscoverExtractor()
            let expression = ''
            try{
                // Accedemos al contenido en nuestro archivo XML
                const document = new DOMParser().parseFromString(dataFile, 'text/xml')
                expression = extractor.extract(document)
                // y también podemos obtener los valores inviduales
                dataXML = extractor.obtain(document)
            } catch (error) {
                alert('El archivo cargado no es un xml de un CFDi, no se encuentra timbrado o cuenta con un formato que impide ser leído', 'danger')
                clearData()
                return
            }

            alert(`
              Archivo cargado exitosamente, esperando respuesta del servidor...
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only"></span>
              </div>
              `, 'success')

            // Queda pendiente implementación
            const dataExpression = `?re=${dataXML.re}&rr=${dataXML.rr}&tt=${dataXML.tt}&id=${dataXML.id}`
            const soapClientFactory = new SoapClientFactory({ timeout: 20000 });
            const client = new SoapConsumerClient(soapClientFactory);
            const response = await client.consume(
                'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc',
                dataExpression
            );
            const satResponse = {
                CodigoEstatus: response.get('CodigoEstatus'),
                EsCancelable: response.get('EsCancelable'),
                Estado: response.get('Estado'),
                EstatusCancelacion: response.get('EstatusCancelacion'),
                ValidacionEFOS: response.get('ValidacionEFOS'),
            }
            alert(`
                    <a href="${expression}" target="_blank">Consulta directa en el SAT</a> <br><br>
                    <strong>UUID:</strong> ${dataXML.id} <br>
                    <strong>Codigo de Estatus:</strong> ${satResponse.CodigoEstatus} <br>
                    <strong>Es cancelable:</strong> ${satResponse.EsCancelable} <br>
                    <strong>Estado:</strong> ${satResponse.Estado} <br>
                    <strong>Estatus de cancelación:</strong> ${satResponse.EstatusCancelacion} <br>
                    <strong>Validación EFOS:</strong> ${satResponse.ValidacionEFOS}
                    `,'success')
        }

        fr.readAsText(input.files[0])
    }
}

const clearData = () => {
    input.value = ''
    output.innerHTML = ''
}
document.querySelector('#loadFile').addEventListener("click", getData)
