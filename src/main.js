import './css/style.css'
import './css/boostrap.min.css'

import { DOMParser } from '@xmldom/xmldom'
import { DiscoverExtractor } from '@nodecfdi/cfdi-expresiones'
import { SoapConsumerClient, SoapClientFactory } from '@nodecfdi/sat-estado-cfdi-soap'
import { install } from '@nodecfdi/cfdiutils-common'

const alertPlaceholder = document.querySelector('#liveAlertPlaceholder')

const alert = (message, type) => {
    alertPlaceholder.innerHTML =
        `<div class="alert alert-${type} alert-dismissible" role="alert">
       <div>${message}</div>
    </div>`
}

let input = document.querySelector('#cfdi')
let output = document.querySelector('#output')
let dataXML = ''
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
            try{
                // Accedemos al contenido en nuestro archivo XML
                const document = new DOMParser().parseFromString(dataFile, 'text/xml')
                const expression = extractor.extract(document)
                // y también podemos obtener los valores inviduales
                dataXML = extractor.obtain(document)
            } catch (error) {
                alert('El archivo cargado no es un xml de un CFDi, no se encuentra timbrado o cuenta con un formato que impide ser leído', 'danger')
                return
            }

            const expresion = `?re=${dataXML.re}&rr=${dataXML.rr}&tt=${dataXML.tt}&id=${dataXML.id}`

            input.value = ''
            alert(`
              Archivo cargado exitosamente, esperando respuesta del servidor...
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only"></span>
              </div>
              `, 'success')

            // Queda pendiente implementación
            /*
            const soapClientFactory = new SoapClientFactory({ timeout: 20000 });
            const client = new SoapConsumerClient(soapClientFactory);
            const response = await client.consume(
                'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc',
                expresion
            );
            console.log(response)
            const satResponse = {
                CodigoEstatus: response.get('CodigoEstatus'),
                EsCancelable: response.get('EsCancelable'),
                Estado: response.get('Estado'),
                EstatusCancelacion: response.get('EstatusCancelacion'),
                ValidacionEFOS: response.get('ValidacionEFOS'),
            };
            alert(`
                    <a href="${expression}" target="_blank">Consulta directa en el SAT</a> <br><br>
                    <strong>UUID:</strong> ${dataXML.id} <br>
                    <strong>Codigo de Estatus:</strong> ${satResponse.CodigoEstatus} <br>
                    <strong>Es cancelable:</strong> ${satResponse.EsCancelable} <br>
                    <strong>Estado:</strong> ${satResponse.Estado} <br>
                    <strong>Estatus de cancelación:</strong> ${satResponse.EstatusCancelacion}
                    <strong>Validación EFOS:</strong> ${satResponse.ValidacionEFOS}
                    `
                    ,'success')
            */

            const sr =
                `<soapenv:Envelope 
                    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tem="http://tempuri.org/">
                    <soapenv:Header/>
                    <soapenv:Body>
                      <tem:Consulta>
                        <tem:expresionImpresa>?re=${dataXML.re}&amp;rr=${dataXML.rr}&amp;tt=${dataXML.tt}&amp;id=${dataXML.id}</tem:expresionImpresa>
                      </tem:Consulta>
                    </soapenv:Body>
                  </soapenv:Envelope>`

            const xmlhttp = new XMLHttpRequest()
            xmlhttp.open('POST', 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc', true)
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        const documentResponse = new DOMParser().parseFromString(xmlhttp.responseText, 'text/xml')
                        const codigoEsatus = (documentResponse.getElementsByTagName('a:CodigoEstatus')[0].firstChild) ? documentResponse.getElementsByTagName('a:CodigoEstatus')[0].firstChild.data : ''
                        const esCancelable = (documentResponse.getElementsByTagName('a:EsCancelable')[0].firstChild) ? documentResponse.getElementsByTagName('a:EsCancelable')[0].firstChild.data : ''
                        const estado = (documentResponse.getElementsByTagName('a:Estado')[0].firstChild) ? documentResponse.getElementsByTagName('a:Estado')[0].firstChild.data : ''
                        const estatusCancelacion = (documentResponse.getElementsByTagName('a:EstatusCancelacion')[0].firstChild) ? documentResponse.getElementsByTagName('a:EstatusCancelacion')[0].firstChild.data : ''
                        const validacionEFOS = (documentResponse.getElementsByTagName('a:ValidacionEFOS')[0].firstChild) ? documentResponse.getElementsByTagName('a:ValidacionEFOS')[0].firstChild.data : ''

                        let estadoColor = estado
                        if(estado === 'Cancelado') {
                            estadoColor = `<span class="text-danger">${estado}</span>`
                        }

                        alert(`
                              <a href="${expression}" target="_blank">Consulta directa en el SAT</a> <br><br>
                              <strong>UUID:</strong> ${dataXML.id} <br>
                              <strong>Codigo de Estatus:</strong> ${codigoEsatus} <br>
                              <strong>Es cancelable:</strong> ${esCancelable} <br>
                              <strong>Estado:</strong> ${estadoColor} <br>
                              <strong>Estatus de cancelación:</strong> ${estatusCancelacion} <br>
                              <strong>Validación EFOS:</strong> ${validacionEFOS}
                              `
                            ,'success')
                    }
                }
            }
            // Send the POST request
            xmlhttp.setRequestHeader('Accept', 'text/xml')
            xmlhttp.setRequestHeader('Content-Type', 'text/xml;charset="utf-8"')
            xmlhttp.setRequestHeader('SOAPAction', 'http://tempuri.org/IConsultaCFDIService/Consulta')
            xmlhttp.send(sr)

        }

        fr.readAsText(input.files[0])
    }
}

document.querySelector('#loadFile').addEventListener("click", getData)
