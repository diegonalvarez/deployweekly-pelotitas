Ademas de las funcionalidades de Architecture.md. Queremos cubrir los siguientes casos de uso:

La aplicación debe estar pensada para Web como para aplicación Móvil, con una UX y UI adaptada a ambos frentes porque los usuarios utilizarán ambas versiones. La idea es tener un build central y de ahí poder disfitrubir a WebAPP, iPhone y Android.

También necesitamos una landing destacando e incentivando a que se registren, mostrando dinamismo y profesionalidad.

### Reglas generales:

Al crear una cuenta debe ser como "global" y luego al ingresar elige como darse de alta, si como profesor, jugador, complejo y/o organizador de torneos.

Publicamente se debe poder ver al ingresar al sitio todos los complejos dados de alta, cantidad de torneos, distribucion en un mapa por geofrafia y el listado completo de jugadores solo mostrando nombre, apellido, ubicacion pero no informacion personal y si ver cantida de jugadores en un mapa por ubicación de registro.

Todo los perfiles necesitan un usuario que esté vinculado. Un usuario puede ser parte de varios perfiles y poder asumir el rol como tal de cada perfil.

Todos los usuarios deben pasar por un proceso de validación en que el que se debe utilizar una plataforma donde escaneen su documento para de este modo evitar usuarios fraudulentos o reservas inválidas.

Todos los usuarios deben tener un teléfono válido al que se le enviarán código de autenticación para validar que son ellos y evitar fraudes.

El registro debe ser por Google o bien por usuario y contraseña pero unificado y ambos den validar identidad.

Los términos y condiciones deben explicitar que se puede compartir el número para agilizar procesos. Por ejemplo el número de teléfono de un jugador con el complejo o con el profesor u organizador de torneo para que lo contacten por dudas. A futuro pueden existir mensajes dentro de la APP o envíos desde la App por WhatsApp solicitando contacto.

Se debe poder definir un límite de torneos organizados. La idea es ir liberando a los organizadores a que organicen gratis pero en un momento vamos a cobrar una parte, aunque los organizadores que mas gente traigan a la aplicación tendrán condiciones permitidas y les iremos dando torneos gratis. 

### Tengo que poder como administrador:

1. Torneos organizados totales con sus fechas y total de participantes, complejo ubicacion y quien lo organizó. Si tenia cupo de organización o bien es un torneo que debemos cobrar
2. Jugadores totales para poder filtrarlos
2. Profesores
3. Complejos con su status pending o aprobados
4. 


### UX:

Utilizar una UX amigable y de gaming estilo Spotify. (Ver Claude plugin)

### Perfil Complejo:

Cuando alguien de el alta del complejo, se deben comunicar con X teléfono o bien por email para que se valide la solicitud. Deben poder cargar toda la información como una imagen del complejo, la dirección, teléfonos, contactos, ciudad, provincia y otros datos que consideres relevantes y que diga que la solicitud está pendiente.

Luego desde un panel administrador veremos los complejos pendientes y de ahí decidimos cuál ir habilitando a medida que los contactamos y validamos su identidad.

1. Como dueño de un complejo deseo poder dar de alta el complejo, con su dirección, teléfono, formas de pago, precio si así lo deseo
2. Debo poder configurar un calendario de reservas.
3. En el calendario de reservas tengo que poder definir si la reserva es libre para cualquier usuario registrado con validación de DNI o solo aquellos usuarios que enviaron una solicitud al complejo o a la inversa y son "amigos" entre sí son los que pueden hacer reservas.



### Perfil Organizador de torneo:

1. Como organizador debo primero conectar con un complejo, para enviar la solicitud y que este me acepte o a la inversa. Es decir el complejo puede decir en una sección suya "organizadores de torneo", buscar un usuario y enviarle la conexión y de esta manera se auto acepte así el organizador puede realizar torneos en ese complejo y mostrarlo al resto.
2. Al organizar un torneo se puede definir cantidad de jugadores, se debe habilitar el cuadro poder registrar los resultados, games, sets, ganadores, para que luego todo esto quede cargado en cada organizador de torneo pero tambien en cada jugador son su palmares e historico de resultados que si será publico para que se pueda jugar de manera global.
3. Se debe poder buscar por ubicación, provincia, ciudad, teléfono y DNI, no se va a mostrar el teléfono y el DNI pero si se puede buscar si hay match con el jugador. Tambien nombre apellido y ver todo su timeline historico de como viene ese jugador en cuanto a participaciones y juegos. No se debe visualizar si el jugador tomo clases con profesores
4. Ante cada partido que se le definiran horarios, una vez confirmados por el organizador del torneo, se enviarna las notificaciones por whatsapp para confirmar cuando juegan e incluso 30 minutos antes tambien se debe enviar la notificacion a modo recordatorio.


### Perfil Profesor:

1. Como profesor puedo mostrar mi calendario de reservas
2. Mi calendario de reservas puede indicar por ejemplo que por la mañana estaré en un complejo y por la tarde en otro
3. Como profesor puedo decidir si el jugador que reserva el turno tiene que estar en mi lista de "amigos" o "conectados" o bien cualquiera puede reservar un turno. Por defecto solo pueden reservar los conectados para evitar que una persona que no conocemos de Salta pueda reservarle a un profesor que esta en Cordoba, al menos que estén conectados.
4. Cuando se recibe una reserva se debe notificar al profesor por WhatsApp integrado, el profesor puede elegir que se autocepten las reservas o bien que requieran de su aprobación, esto lo puede hacer por jugador, algunos jugadores que estén conectados con él pudieran tener el auto-accept.
5. El jugador debe recibir una notificación de pre-aprobación y otra de aprobado para entrenar con el profesor.
6. Un profesor puede enviar una reseña al alumno si es necesario por si es un alumno que no va nunca, lo puede quitar de sus conectados directamente pero puede informar y esto no es público sino que desde la administración se deben ver toda esta información para ir validando los jugadores.


### Perfil Jugador:

1. Como jugador puedo conectar para hacer reservas con Complejos, Profesores. Esto quiere decir que al enviarles solicitud si me aceptan, puedo realizarles reservas
2. Puedo postularme para torneos 
3. Existira un historico de torneos inscriptos, sabiendo las categorias y hasta donde llegó en cada torneo, ya que los organizadores de torneos cargaran los resultados. De esta manera se tiene un historico y un organizador de torneo puede saber si alguien que salió campeón en 6ta se registró para jugar en 8va y de ahí deciri si lo acepta o no.
4. En el perfil del jugador el mismo puede subir su foto, elegir mostrar su teléfono a organizadores de torneo para que se contacten con él.
5. Desafios entre jugadores.
6. Debo poder tener un historico o timeline de todo lo que hice, como cuantas clases tome, torneos que participe, donde, categorias, set games ganados y perdidos, con que companero jugue mas, con cual gane mas.
7. Al registrarme como jugador debo poder seleccionar a que categoria pertenezco
8. Luego se puede hacer un ranking de jugadores de acuerdo a toda la info registrada

Casos de Uso:

Se puede dar el caso de uso en el que Javier Perez registra su complejo como dueño y habilita el panel de reservas. Adicionalmente Javier Perez es profesor, por lo que tiene su propio calendario de reservas para que entrenen con él.
Y en ocasionaes participa activamente de torneos en otros complejos. Este es un caso que el usuario tiene todos los perfiles, la plataforma debe poder dar la opción de decidir a que perfil está usando en ese momento y de ir cambiando.
