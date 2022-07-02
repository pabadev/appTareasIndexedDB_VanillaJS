// Módulo principal----------------------------------------------
window.addEventListener("load", iniciar);

var bd, cuerpoTablaHTML, botonEnviar, solicitud, modalHTML, botonEditar;

function iniciar() {
    
    solicitud = indexedDB.open("tareasDB");
    solicitud.addEventListener("error", mostrarError);
    solicitud.addEventListener("success", comenzar);
    solicitud.addEventListener("upgradeneeded", crearTablas);     
    
    formu = document.getElementById("formTarea");
    formu.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    botonEnviar = document.getElementById("btnEnviar");
    botonEnviar.addEventListener("click", agregarTarea);

    }

function mostrarError(evento) {
    alert("Error: " + evento.code + " " + evento.message);
    }

function comenzar(evento) {
    bd = evento.target.result;
    mostrar();
    }

    //================= Funciones utilitarias =================

function crearTablas(evento) {
    var baseDeDatos = evento.target.result;
    var tabTareas = baseDeDatos.createObjectStore("tabTareas", {keyPath: "id", autoIncrement: true});
    tabTareas.createIndex("porEstado", "completed", {unique: false});
    tabTareas.createIndex("porTexto", "texto", {unique: false});
    }

function agregarTarea() {
    var inputTarea = document.getElementById("txtTarea").value;
    if(inputTarea.trim() !== ""){
    var transaccion = bd.transaction(["tabTareas"], "readwrite");
    var almacen = transaccion.objectStore("tabTareas");
    almacen.put({
        texto: inputTarea.trim(), 
        completed: false,
        });
    }
    else{
        alert("Debe escribir un texto para la nueva tarea");
    }
    mostrar();
    }

function mostrar() {
    document.getElementById("txtTarea").value = "";
    // document.getElementById("txtTarea").focus(focus);
    cuerpoTablaHTML="";
    cuerpoTabla.innerHTML="";
    var transaccion = bd.transaction(["tabTareas"]);
    var almacen = transaccion.objectStore("tabTareas");
    var puntero = almacen.openCursor(null, "prev");
    puntero.addEventListener("success", mostrarTareas);      
    }

function mostrarTareas(evento) {
    var puntero = evento.target.result;
    if (puntero) {
        let id1 = puntero.value.id;
        let tarea1 = puntero.value.texto;
        let clase = puntero.value.completed;
        toogleClase = !clase;
        let claseOn = (clase == true) ? 'completada' : null;
        cuerpoTablaHTML += "\n\
            <tr class='"+ claseOn+1 +"' id="+ id1 +">\n\
                <td class='"+ claseOn +"'id='b"+ id1 +
                "' onclick='cambiarEstado("+ id1 +", "+ toogleClase +")'>" + tarea1 + "</td>\n\
                <td class='btnFilas "+ claseOn +
                "' onclick='showModal("+ id1 +", "+ clase +")'>\n\
                <span class='icon-pencil-outline'></span></td>\n\
                <td class='btnFilas' onclick='eliminarTarea("+ id1 +")'>\n\
                <span class='icon-trash-can-outline'></span></td>\n\
            </tr>";
        
        puntero.continue();
        
        }
        else {
            cuerpoTabla.innerHTML = cuerpoTablaHTML;
        }
    }

function eliminarTarea(id) {
    var transaccion = bd.transaction(["tabTareas"], "readwrite");
    var almacen = transaccion.objectStore("tabTareas");
    almacen.delete(id);
    mostrar();
    }

function cambiarEstado(id, toogleClase) {
    let textoActual = document.querySelector('#b'+id).innerHTML;
    var transaccion = bd.transaction(["tabTareas"], "readwrite");
    var almacen = transaccion.objectStore("tabTareas");
    almacen.put({
        id: id,
        texto: textoActual, 
        completed: toogleClase,
        });
        mostrar();
    }

function showModal(id1, clase1){
    let texto = document.querySelector('#b'+id1).innerHTML;

    modalHTML = 
    "<div class='modal' id='modal1'>\n\
    <div class='modal-dialog'>\n\
        <header class='modal-header'>\n\
          <h3>Editar tarea</h3>\n\
          <button  onclick='cerrarModal()' class='close-modal' id='btnClose'><span class='icon-close'></span></button>\n\
        </header>\n\
        <section class='modal-content'>\n\
          <form name='formEditar' class='formTarea' id='formEditar'>\n\
            <input type='text' class='txtTarea' id='txtEditar' value='"+ texto +"' \n\
            placeholder='Nuevo texto' autocomplete='off'>\n\
            <button class='btnEnviar' id='btn-editar' onclick='editarTarea("+ id1 +", "+ clase1 +")'>Editar</button>\n\
          </form>\n\
        </section>\n\
        </div>\n\
      </div>"
      cajaModal.innerHTML = modalHTML;    
      document.getElementById("modal1").classList.add("isvisible");
    }

function editarTarea(id2, clase2) {
    formu2 = document.getElementById("formEditar");
    formu2.addEventListener("submit", (e) => {
    e.preventDefault();
    });
    let texto = document.getElementById("txtEditar").value;
        if(texto.trim() == ""){
            alert("Debe escribir un texto para la nueva tarea");
        }
        else{
            var transaccion = bd.transaction(["tabTareas"], "readwrite");
            var almacen = transaccion.objectStore("tabTareas");
            almacen.put({
                id: id2,
                texto: texto, 
                completed: clase2,
                });  
        }  
        document.getElementById("modal1").classList.add("noVisible");
            document.getElementById("modal1").classList.remove("isVisible");
            mostrar();
    }

function cerrarModal(){
    document.getElementById("modal1").classList.remove("isVisible");
    document.getElementById("modal1").classList.add("noVisible");
}