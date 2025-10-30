---
title: "Go interview: Concurrencia - goroutines"
date: 2025-09-01T13:59:00-06:00
draft: false
author: zeroidentidad
year: "2025"
month: "2025/09"
categories:
- Estudio
- Experiencias
tags:
- questions
- golang
- interviews
keywords:
- go
disableComments: false
---

Preguntas y respuestas sobre Goroutines comunes de tratar en entrevistas técnicas

<!--more-->

## ❓Indice preguntas

**1. ¿Qué es una gorutina (goroutine) y en qué se diferencia de un hilo o subproceso (thread)?**

**2. ¿Qué ocurre si la función main finaliza su ejecución antes de que se complete una gorutine?**

**3. Explique cómo gestionar eficazmente la propagación del contexto entre gorutines (ej: usando `context.Context`).**

**4. ¿Cómo gestiona el Scheduler (planificador de ejecución) de Go las gorutines?**

---

## ✅Respuestas

### 1. ¿Qué es una gorutina (goroutine) y en qué se diferencia de un hilo o subproceso (thread)?

Una gorutina en Go es una unidad de ejecución ligera, gestionada por el entorno de ejecución de Go, diseñada para la programación concurrente. Permite que las funciones se ejecuten de forma independiente y concurrente con otras partes del programa. Las gorutinas son eficientes y requieren una memoria y una sobrecarga mínimas en comparación con los hilos tradicionales, lo que las hace ideales para aplicaciones que requieren miles o incluso millones de tareas concurrentes.

#### Diferencias clave entre goroutines y threads

| Aspecto               | Goroutines                                         | Threads                                                   |
|-----------------------|----------------------------------------------------|-----------------------------------------------------------|
| Gestión               | Administrado por runtime de Go                     | Administrado por sistema operativo                        |
| Uso de memoria        | Comienza con ~2 KB                                 | Generalmente requiere varios megabytes                    |
| Costo de creación     | Ligero y rápido                                    | Más pesado y más lento                                    |
| Planificación         | Cooperativa (espacio de usuario)                   | Preemptivo (espacio del kernel)                           |
| Cambio de contexto    | Más rápido, por programación en espacio de usuario | Más lento, por contexto al nivel de sistema operativo     |
| Modelo de concurrencia| Modelo M:N (muchas goroutines en menos subprocesos)| Modelo 1:1 (un hilo por tarea)                            |
| Facilidad de uso      | Más fácil y seguro                                 | Complejo, requiere mecanismos de sincronización explícitos|

#### Ventajas de las goroutines

1. ***Ligereza:*** Las goroutines consumen menos memoria y tienen un menor coste de inicio en comparación con los threads.
2. ***Escalabilidad:*** Miles o millones de goroutines pueden ejecutarse simultáneamente, ya que se multiplexan en un número menor de threads del sistema operativo.
3. ***Planificación eficiente:*** El entorno de ejecución de Go programa las goroutines en el espacio de usuario, evitando la sobrecarga de la gestión de threads a nivel de núcleo del sistema operativo.
4. ***Concurrencia más sencilla:*** Las goroutines gestionan la memoria compartida de forma segura por defecto, lo que reduce la necesidad de mecanismos de sincronización explícitos como los bloqueos (locks).

---

### 2. ¿Qué ocurre si la función main finaliza su ejecución antes de que se complete una gorutine?

Si la función **main** finaliza su ejecución antes de que se complete una gorutine, el programa saldrá de su ejecución y la gorutine finalizará prematuramente. Esto significa:

- Es posible que la goroutine no complete su tarea prevista.
- Se perderán todos los resultados o efectos secundarios de las goroutines que no se hayan completado.
- No hay garantía de que la goroutine tenga oportunidad de realizar operaciones de limpieza o liberar los recursos que estaba utilizando.

Para evitar que esto suceda, se puede utilizar mecanismos de sincronización como:

- *sync.WaitGroup:* Permite que la función main espere a que todas las goroutines se completen antes de salir.
- *Channels:* Se puede usar canales para comunicarse entre goroutines y garantizar que la función main no salga hasta que todas las goroutines hayan terminado su trabajo.

Como estos hay otras opciones que igual se combinan con patrones de diseño de código concurrente para uso de los mecanismos disponibles. 

_Es importante administrar adecuadamente los ciclos de vida de las goroutines para garantizar que todas las operaciones concurrentes se completen según lo previsto antes de que el programa termine su ejecución._

---

### 3. Explique cómo gestionar eficazmente la propagación del contexto entre gorutines (ej: usando `context.Context`).

Para gestionar la propagación de contexto entre varias goroutines en Go, se puede usar el paquete `context.Context`. Este enfoque garantiza la correcta cancelación, el tiempo de espera y distribución de valores entre goroutines.

#### Pasos clave para propagación de contexto

1. Crear un Context (contexto) base
   
   Iniciar con un contexto base, como `context.Background()` o `context.TODO()`. Y usar `context.WithCancel`, `context.WithTimeout` o `context.WithDeadline` para derivar un nuevo contexto con funciones de cancelación o tiempo de espera.

   ```go
   ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
   defer cancel() // Asegura que los recursos se liberen cuando el contexto ya no sea necesario
   ```

2. Pasar contexto a goroutines

   Pass the created context to all goroutines that need to perform work related to the same task. This allows them to listen for cancellation signals or deadlines.

   Transfiere el contexto creado a todas las goroutines que necesitan realizar tareas relacionadas con la misma tarea. Esto permite detectar señales de cancelación o tiempo límite.

   ```go
   go func(ctx context.Context) {
       for {
           select {
           case <-ctx.Done():
               fmt.Println("Goroutine cancelada:", ctx.Err())
               return
           default:
               // Realizar tarea
           }
       }
   }(ctx)
   ```

3. Gestionar cancelación y limpieza

   Dentro de cada goroutine, usar la instrucción `select` para escuchar el canal `ctx.Done()`. Esto garantiza que las goroutines finalicen correctamente al cancelar el contexto.

4. Utilizar `errgroup` para manejo simplificado

   El paquete `golang.org/x/sync/errgroup` se integra con contextos y simplifica la gestión de múltiples goroutines. Propaga errores y cancelaciones automáticamente.

5. Evitar fugas de contexto
   
   Siempre llamar a la función `cancel()` (si se usa `WithCancel`, `WithTimeout` o `WithDeadline`) para liberar recursos asociados con el contexto.


#### Beneficios de usar Context

- Cancelación apropiada: Garantiza que todas las goroutines generadas se detengan al cancelarse la tarea principal.
- Tiempos de espera y límite: Evita que las tareas de larga duración consuman recursos indefinidamente.
- Propagación de valores: Permite compartir valores de solicitud, como ID de usuario o tokens, entre goroutines.

#### Desafíos comunes

1. *Mal uso del contexto:* Evitar almacenar grandes cantidades de datos en contexto; está diseñado para valores ligeros como los metadatos de solicitudes.
2. *Cancelación olvidada:* Asegurar siempre de llamar `cancel()` para evitar fugas de recursos.
3. *Fugas de goroutines:* Asegurar que todas las goroutines escuchen la señal de cancelación del contexto (`ctx.Done()`).

_Seguir estas prácticas puede servir para gestionar eficazmente la propagación del contexto en múltiples goroutines, lo que garantiza operaciones concurrentes limpias y eficientes._

---

### 4. ¿Cómo gestiona el Scheduler (planificador de ejecución) de Go las gorutines?

#### Cómo funciona la planificación de ejecución

1. Al crearse una goroutine, se añade a la cola de ejecución local (LRQ=local run queue) del procesador que la creó. Las goroutines que no caben en una LRQ o que requieren balanceo de carga se colocan en la cola de ejecución global (GRQ=global run queue).

2. El procesador selecciona goroutines de su LRQ o GRQ y las asigna a un hilo (thread) del sistema operativo para su ejecución.

3. Si la LRQ está vacía, el procesador extrae tareas de la GRQ o "roba" trabajo de otros procesadores, lo que garantiza un equilibrio de carga eficiente entre todos los procesadores.

4. Las goroutines de larga duración o bloqueantes se interrumpen después de 10 ms, lo que permite la ejecución de otras goroutines. Esto garantiza imparcialidad y evita que una sola gorutina monopolice el tiempo de CPU.

#### Desafíos resueltos por el planificador de ejecución

- Gracias al modelo M:N (muchos a varios), el planificador de ejecución de Go gestiona eficientemente millones de tareas simultáneas con una sobrecarga mínima.

- Garantiza imparcialidad mediante mecanismo de antelación y planificación round-robin en colas locales.

- Equilibra las cargas de trabajo entre las CPU mediante el robo de trabajo y colas globales.

- Garantiza una utilización óptima de los recursos ajustando dinámicamente el número de subprocesos (threads) del sistema operativo según las demandas de la carga de trabajo.

- El planificador de ejecución (scheduler) utiliza bloqueos y primitivas de sincronización como `mutex` y `gopark` para gestionar el acceso a recursos compartidos y gestionar las goroutines aparcadas (aplazadas) de forma eficiente.