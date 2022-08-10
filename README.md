# vite ⚡

> Extensión para google chrome que permite validar ante el SAT México un XML CFDI

## Instalación usando npm

```bash
$ npm install
$ npm run dev
```

Usando Yarn:

``` bash
$ yarn install
$ yarn dev
```
## Uso y prueba de la extensión

Para poder testear esta extensión se debe de contar con Google Chrome y seguir los pasos:

- Se requiere habilitar el modo desarrollo en la sección de Extensiones de Google Chrome 
- Se debe de crear el build
  - ```
    Usando npm
    
    npm run build
    ```
  - ```
    Usando yarn
    
    yarn build
    ```
- Cargar la carpeta dist en la opción llamada 'Cargar descomprimida'.
  - Esta opción permitirá cargar la extensión en modo prueba
- En caso de realizar un cambio es necesario ejecutar build nuevamente y presionar en el botón 'Actualizar', con ello es posible ver los cambios y realizar las pruebas correspondientes

## Advertencia

Esta extensión no puede ser probada en modo dev desde el navegador debido a los permisos CORS, es forzoso su uso como extensión

## Agradecimientos

Se agradece a la comunidad de [PhpCfdi](https://www.phpcfdi.com/) por la contribución realizada a la sección de [
NodeCfdi](https://github.com/nodecfdi) de las cuales este proyecto hace uso de sus dependencias

## License

MIT
