document.addEventListener('DOMContentLoaded', function () {
  const addEventBtn = document.getElementById('addEventBtn');
  const eventCard = document.getElementById('eventCard');
  const eventForm = document.getElementById('eventForm');
  const eventList = document.getElementById('eventList');
  let editingEvent = null;  // Variable que mantendrá la tarjeta que estamos editando
  let db;

  // Abrir la base de datos IndexedDB
  const request = indexedDB.open('agendaDB', 1);

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    
    if (!db.objectStoreNames.contains('events')) {
      const store = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
      store.createIndex('title', 'title', { unique: false });
    }
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    loadEventsFromDB(); // Cargar los eventos desde IndexedDB al abrir la base de datos
  };

  request.onerror = function(event) {
    console.error('Error al abrir IndexedDB', event.target.error);
  };

  // Función para cargar los eventos desde IndexedDB y mostrarlos en la página
  function loadEventsFromDB() {
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const request = store.getAll(); // Obtener todos los eventos almacenados

    request.onsuccess = function(event) {
      const events = event.target.result;
      eventList.innerHTML = ''; // Limpiar las tarjetas antes de recargarlas
      if (events.length === 0) {
        eventList.innerHTML = '<p>No hay eventos.</p>';
      }
      events.forEach(event => {
        displayEvent(event); // Mostrar cada evento recuperado
      });
    };

    request.onerror = function(event) {
      console.error('Error al cargar eventos de IndexedDB', event.target.error);
    };
  }

  // Función para mostrar un evento en el DOM
  function displayEvent(event) {
    const newEventCard = document.createElement('div');
    newEventCard.classList.add('col-12', 'col-md-6', 'col-lg-4');
    newEventCard.innerHTML = `
      <div class="event-card" data-id="${event.id}">
        <h5 class="event-title">${event.title}</h5>
        <p class="event-description">${event.description}</p>
        <button class="editBtn">Editar</button>
        <button class="deleteBtn">Eliminar</button>
      </div>
    `;

    const editBtn = newEventCard.querySelector('.editBtn');
    const deleteBtn = newEventCard.querySelector('.deleteBtn');

    editBtn.addEventListener('click', function () {
      editingEvent = newEventCard;  // Guardamos la tarjeta que se va a editar
      document.getElementById('eventTitle').value = event.title;
      document.getElementById('eventDescription').value = event.description;
      eventCard.style.display = 'block';
      document.getElementById('formTitle').textContent = 'Editar Evento';
    });

    deleteBtn.addEventListener('click', function () {
      deleteEvent(event.id); // Eliminar evento de la base de datos
      eventList.removeChild(newEventCard); // Eliminar evento del DOM
    });

    eventList.appendChild(newEventCard); // Agregar la tarjeta al contenedor de la agenda
  }

  // Función para guardar un nuevo evento o actualizar uno existente en IndexedDB
  function saveEvent(eventData) {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    
    // Usamos 'put' para agregar o actualizar un evento en la base de datos
    const request = store.put(eventData);

    request.onsuccess = function() {
      console.log('Evento guardado correctamente');
    };

    request.onerror = function(event) {
      console.error('Error al guardar el evento', event.target.error);
    };
  }

  // Función para eliminar un evento de IndexedDB
  function deleteEvent(eventId) {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    const request = store.delete(eventId);

    request.onsuccess = function() {
      console.log('Evento eliminado');
    };

    request.onerror = function(event) {
      console.error('Error al eliminar el evento', event.target.error);
    };
  }

  // Función para manejar el formulario de eventos (Agregar o Editar)
  function handleEventSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;

    const eventData = {
      title: title,
      description: description
    };

    if (editingEvent) {
      const eventId = editingEvent.querySelector('.event-card').dataset.id; // Obtiene el ID de la tarjeta que estamos editando
      eventData.id = parseInt(eventId, 10); // Asignamos el ID del evento

      // Actualizamos la tarjeta en el DOM
      editingEvent.querySelector('.event-title').textContent = title;
      editingEvent.querySelector('.event-description').textContent = description;
    }

    saveEvent(eventData); // Guardar evento en IndexedDB

    // Limpiar formulario y cerrar la card de evento
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    eventCard.style.display = 'none';

    loadEventsFromDB(); // Recargar eventos después de guardar
  }

  // Mostrar el formulario para agregar un nuevo evento
  addEventBtn.addEventListener('click', function () {
    eventCard.style.display = 'block';
    document.getElementById('formTitle').textContent = 'Agregar Evento';
    editingEvent = null; // Reiniciar variable de edición
  });

  // Manejar el formulario de eventos
  eventForm.addEventListener('submit', handleEventSubmit);
});
