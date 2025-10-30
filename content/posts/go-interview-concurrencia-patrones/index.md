---
title: "Go interview: Concurrencia - patrones"
date: 2025-09-01T13:59:26-06:00
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

Preguntas sobre patrones de diseño para código eficiente de concurrencia en Go

<!--more-->

## ❓Indice preguntas

**1. ¿Qué patrones de diseño de código concurrente conoce?**

**2. Explicar en que consiste el patrón "Generator" que problemas resuelve y sus ventajas**

**3. Explicar en que consiste el patrón "Timeout", "Quit signal" y "Context" juntos, cuales son sus ventajas**

**4. Explicar en que consiste el patrón "Worker Pool" que problemas resuelve y sus ventajas**

**5. Explicar en que consiste el patrón "Fan-Out/Fan-In" que problemas resuelve y sus ventajas**

**6. ¿Cuáles son las diferencias clave entre los patrones "Worker Pool" y "Fan-Out/Fan-In"?**

**7. Explicar en que consiste el patrón "Producer-Consumer" que problemas resuelve y sus ventajas**

**8. Explicar en que consiste el patrón "Pipeline" que problemas resuelve y sus ventajas**

---

## ✅Respuestas

### 1. ¿Qué patrones de diseño de código concurrente conoce?

Por mecionar el concepto o idea de algunos:

- ***Generator:*** Funciones que devuelven canales
- ***Timeout:*** Adición de límites de tiempo a la ejecución de goroutines
- ***Quit Signal:*** Detención controlada de goroutines
- ***Context:*** Gestión de cancelaciones y plazos en goroutines
- ***Worker Pool:*** Gestión en la ejecución de tareas en múltiples goroutines
- ***Fan-Out/Fan-In:*** Distribución de tareas y recopilación de resultados
- ***Producer-Consumer:*** Desacoplamiento de producción y consumo de datos mediante búfer
- ***Pipeline:*** Procesamiento de datos por etapas
- ***Multiplexing:*** Combinación de múltiples canales
- ***Bounded Parallelism:*** Limitación de la ejecución concurrente
- ***Semaphore:*** Control del acceso a recursos compartidos
- ***Fork/Join:*** Paradigma fundamental de divide y vencerás aplicado al procesamiento paralelo del que nace o derivan patrones como: Map/Reduce, Work-Stealing, Task Graphs, y pipelines paralelos.

---

### 2. Explicar en que consiste el patrón "Generator" que problemas resuelve y sus ventajas

El patrón "**Generator**" en Go utiliza goroutines y canales para generar flujos de datos bajo demanda, lo que permite la generación de valores concurrente y diferida. Es ideal para iterar eficientemente sobre secuencias grandes o infinitas sin bloqueos ni uso excesivo de memoria.

#### Problemas resueltos por este patrón

- **Uso eficiente de memoria** para conjuntos de datos grandes/infinitos mediante evaluación diferida
- **Capacidad de encapsulación** de lógica compleja de generación de datos
- **Permitir producción concurrente de datos** sin bloquear a los consumidores
- **Iteración simplificada** sobre flujos de datos asíncronos

#### Ventajas clave

- ***Evaluación diferida:*** Los valores se generan solo cuando se solicitan
- ***Seguridad de concurrencia:*** Sincronización de canales integrada
- ***Facilidad de composición:*** Integración sencilla con pipelines y otros patrones
- ***Control de recursos:*** Terminación limpia mediante el cierre del canal

#### Ejemplo

```go
func oddsGenerator(max int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 1; i <= max; i += 2 {
			out <- i
		}
	}()

	return out
}

func main() {
	for num := range oddsGenerator(10) {
		fmt.Println(num)
	}
}
```

#### Explicación del flujo de código

1. ***Creación de canal:*** `make(chan int)` crea un canal sin búfer
2. ***Inicio de goroutine:*** Una función anónima inicia la ejecución concurrente
3. ***Cierre de canal:*** `defer close(out)` indica la finalización desde la función emisora
4. ***Producción de valor:*** El bucle envía números impares mediante `out <- i`
5. ***Consumo:*** La función principal recibe valores mediante `range`

#### Ejemplos de casos de uso

- Operaciones de E/S en streaming (procesamiento de archivos)
- Simulación de datos en tiempo real (datos de sensores)
- Implementación de iteradores concurrentes
- Generación de datos de prueba

---

### 3. Explicar en que consiste el patrón "Timeout", "Quit signal" y "Context" juntos, cuales son sus ventajas

Los patrones de "**tiempo de espera (Timeout)**, **señal de salida (Quit signal)** y **contexto (Context)**" en Go es una combinación común que coordinan la cancelación, los tiempos de espera y los apagados graduales para operaciones concurrentes. Para esto la instrucción `select` permite la gestión ágil de estos eventos mediante la espera en múltiples canales simultáneamente.

#### Útil para:

- Prevenir de bloqueos indefinidos mediante la aplicación de tiempos de espera
- Permitir un apagado ordenado ante señales de salida del usuario o del sistema
- Propagar la cancelación entre goroutines para la limpieza de recursos
- Gestionar eficientemente múltiples fuentes de cancelación (tiempo de espera, salida controlada, manual)

#### Ventajas clave

- Control centralizado y agilizado de los ciclos de vida de las goroutines
- Gestión de recursos eficiente y apagado predecible
- Mecanismo simple y legible para gestionar múltiples eventos asincrónicos

#### Ejemplo

```go

func main() {
	// Crear contexto con tiempo de espera del programa
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Capturar señales del sistema operativo para un apagado controlado
	quit := make(chan os.Signal, 1)
	defer close(quit)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Tarea de larga duración
	msgC := oddsGenerator(ctx, 6)

	// Bloquear goroutine principal
	for {
		select {
		case message, ok := <-msgC:
			if !ok { // confirmar canal esta cerrado
				fmt.Println("Trabajo realizado!")
				return
			}
			fmt.Println(message)
		case <-quit:
			fmt.Printf("\nDetenido por parte del usuario")
			return
		// Cronometrando cada mensaje:
		// Si no se ha recibido mensaje dentro de tiempo especificado
		case <-time.After(500 * time.Millisecond):
			fmt.Println("¡No se puede esperar tanto tiempo!")
			return
		}
	}
}

func oddsGenerator(ctx context.Context, max int) <-chan string {
	msgC := make(chan string)
	go func() {
		defer close(msgC)

		for i := 1; i <= max; i += 2 {
			select {
			case <-ctx.Done():
				fmt.Println("Ejecución de tiempo de espera...")
				return
			default:
				msgC <- fmt.Sprintf("No. resultante: %v", i)
				time.Sleep(499 * time.Millisecond)
			}
		}
	}()

	return msgC
}
```

#### Ejemplos de casos de uso

- Apagado controlado de servidores y trabajadores en segundo plano
- Aplicación de tiempos de espera en operaciones de E/S o de red
- Cancelación de consultas a base de datos o solicitudes HTTP si el cliente se desconecta
- Gestión de interrupciones del usuario en programas de CLI
- Coordinación de cancelaciones entre múltiples goroutines

---

### 4. Explicar en que consiste el patrón "Worker Pool" que problemas resuelve y sus ventajas

El patrón "**Worker Pool**" es un diseño en código de concurrencia que gestiona un número fijo de goroutines como trabajadores para procesar tareas de una cola compartida. Gestiona eficientemente un gran número de tareas independientes a la vez que controla el uso de recursos. Los trabajadores extraen tareas continuamente, las procesan simultáneamente y envían los resultados a una cola de salida. Este patrón evita la sobrecarga del sistema, mejora el rendimiento mediante el procesamiento en paralelo y mantiene un uso predecible de los recursos, lo que lo hace ideal para escenarios como operaciones por lotes o la gestión de solicitudes de API.

#### Problemas resueltos por este patrón

1. Gestión adecuada de recursos
   - Limitar las operaciones concurrentes para evitar la sobrecarga del sistema.
   - Controlar el uso de memoria limitando el número de goroutines.
   - Evitar la sobrecarga generada por subprocesos (threads) y goroutines.

2. Concurrencia eficiente
   - Procesar "N trabajos" en **~**(_N/Trabajadores_) segundos frente a _N_ segundos secuencialmente
   - Reutilizar trabajadores existentes en lugar de crear goroutines por tarea
   - Equilibrar carga de trabajo entre núcleos de CPU disponibles

3. Coordinación de tareas 
   - Garantizar el procesamiento ordenado de tareas.
   - Proporcionar un mecanismo de apagado limpio
   - Permitir la recopilación y agregación de resultados

#### Ventajas clave

- Uso predecible de recursos
- Mejor manejo de errores
- Escalado de rendimiento mejorado
- Monitoreo y depuración más sencillos
- Capacidades de apagado controlado

#### Ejemplo

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs { // Salir automáticamente cuando se cierra el canal de trabajos
        fmt.Printf("Worker %d procesando trabajo %d\n", id, job)
        time.Sleep(time.Second) // Simular trabajo
        results <- job * 2      // Enviar resultado
    }
}

func main() {
    const numJobs = 5
    const numWorkers = 3

    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)
    wg := sync.WaitGroup{}

    // Iniciar grupo de trabajadores
    for w := 1; w <= numWorkers; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }

    // Enviar trabajos a trabajadores
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs) // Señal de no enviar más trabajos

    // Esperar que todos los trabajadores terminen de procesar
    wg.Wait()
    close(results) // Hacer seguro cerrar resultados después de que todos los trabajadores terminen

    // Recopilar y mostrar resultados
    fmt.Println("Resultados:")
    for result := range results {
        fmt.Printf("- %d\n", result)
    }
}
```

#### Explicación del flujo de código

1. Los trabajadores inician y bloquean en espera de trabajo.
    - 3 trabajadores procesan 5 trabajos simultáneamente
2. Cada trabajador:
    - Recibe trabajos del canal `jobs`
    - Procesa trabajo (simulado con 1s de suspensión)
3. Los trabajadores procesan trabajos simultáneamente (concurrentemente).
    - Envian resultados al canal `results`
    - Salen cuando se cierra el canal de trabajos `jobs`
4. Después de completarse todos los trabajos:
   - Los trabajadores salen a través del canal de trabajos cerrado
   - El canal de resultados se cierra
5. En **main()** se recopila e imprime resultados.
    - `sync.WaitGroup` garantiza que **main()** espere para finalización de **worker()**
    - Cerrando canales se indica finalización:
        - `close(jobs)` provoca la salida de **worker()**
        - `close(results)` habilita la recopilación segura de resultados

#### Ejemplos de casos de uso

- Procesamiento por lotes de grandes conjuntos de datos
- Gestionar límites de velocidad de APIs
- Canalizaciones de procesamiento de imágenes y vídeos
- Colas de operaciones de base de datos
- Solicitudes de red simultáneas

---

### 5. Explicar en que consiste el patrón "Fan-Out/Fan-In" que problemas resuelve y sus ventajas

El patrón "**Fan-Out/Fan-In**" es un diseño en código de concurrencia utilizado para paralelizar y coordinar tareas. En la etapa de **fan-out** (distribuir), una tarea se divide en subtareas más pequeñas, ejecutadas simultáneamente por varias goroutines. La etapa de **fan-in** recopila y combina los resultados de todas las subtareas. Este patrón mejora el rendimiento al distribuir la carga de trabajo entre las goroutines, lo que permite el procesamiento en paralelo. Se implementa mediante goroutines y canales en Go, lo que lo hace eficiente para gestionar tareas divisibles a gran escala.

#### Problemas resueltos por este patrón

1. Procesamiento de alto volumen
    - Distribuir cargas de trabajo entre multiples trabajadores
    - Manejar grandes conjuntos de datos o tareas de manera eficiente
    - Procesar tareas independientes simultáneamente para minimizar tiempo total de ejecución

2. Optimización de recursos
    - Limitar operaciones simultáneas (concurrentes) para evitar la sobrecarga del sistema 
    - Maximizar utilización de la CPU

3. Agregación de resultados 
    - Simplificar recopilación de resultados de operaciones paralelas en un flujo unificado
    
#### Ventajas clave

- ***Escalabilidad:*** Ajuste fácil de la cantidad de trabajadores para satisfacer las demandas de la carga de trabajo
- ***Componentes desacoplados:*** Los trabajadores operan de forma independiente, lo que mejora el aislamiento de fallos
- ***Procesamiento independiente del orden:*** Ideal para tareas donde el orden de los resultados no importa
- ***Eficiencia de costo:*** Reduce los costos de la nube mediante el uso optimizado de recursos (ej: invocaciones paralelas de AWS Lambda)

#### Ejemplo

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		fmt.Printf("Worker %d procesando trabajo %d\n", id, job)
		time.Sleep(500 * time.Millisecond) // Simular trabajo
		results <- job * 2
	}
}

func main() {
	const (
		numJobs    = 10
		numWorkers = 3
	)

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	// Fan-Out: Iniciar grupo de trabajadores
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// Dar trabajo a los trabajadores
	go func() {
		for j := 1; j <= numJobs; j++ {
			jobs <- j
		}
		close(jobs)
	}()
(
	// Fan-In: Recopilar resultados
	go func() {
		wg.Wait()
		close(results)
	}()

	// Procesar resultados agregados
  fmt.Println("Resultados:")
	for result := range results {
		fmt.Printf("- %d\n", result)
	}
}
```

#### Explicación del flujo de código

1. Inicialización
   - Crear canales con buffer para trabajos y resultados
   - Inicializar _WaitGroup_ para sincronización de trabajadores **worker()**

2. Fase Fan-Out
   - Ejecutar goroutines de trabajador **worker()** que extraen datos del canal `jobs`
   - Cada trabajador procesa trabajos simultáneamente

3. Distribución de trabajo
   - Dar trabajo a los trabajadores a través de canal
   - Cerrar canal cuando se termine para activar salida de trabajadores **worker()**

4. Fase Fan-In
   - Cerrar canal de resultados después de que todos los trabajadores terminen
   - Habilitar una salida limpia del bucle de resultados

5. Agregación de resultados
   - **main**: El hilo/goroutine principal procesa salidas combinadas

#### Ejemplos de casos de uso

- Procesamiento de datos en tiempo real (flujos de sensores IoT)
- Transcodificación masiva de imágenes y vídeos
- Web scraping distribuido
- Manejo simultáneo de solicitudes a API
- Agregación de registros de múltiples fuentes
- Procesos ETL (Extracción-Transformación-Carga)

---

### 6. ¿Cuáles son las diferencias clave entre los patrones "Worker Pool" y "Fan-Out/Fan-In"?

Las diferencias clave entre los patrones "**Worker Pool**" y "**Fan-Out/Fan-In**" son:

1. **Distribución de tareas**:
   - Fan-out/fan-in: Crea goroutines dinámicamente para cada tarea, lo que potencialmente genera una gran cantidad de goroutines simultáneas.
   - Worker pool: Utiliza una cantidad fija de gorutinas de trabajo que procesan tareas desde una cola compartida.

2. **Control de concurrencia**:
   - Fan-out/fan-in: Ofrece menos control sobre la concurrencia máxima, ya que puede generar muchas goroutines.
   - Worker pool: Proporciona un mejor control sobre el uso de recursos al limitar la cantidad de trabajadores simultáneos.

3. **Flexibilidad**:
   - Fan-out/fan-in: Más flexible para gestionar distintas cargas de trabajo y tipos de tareas.
   - Worker pool: Más adecuado para cargas de trabajo consistentes y tipos de tareas similares.

4. **Gestión de recursos**:
   - Fan-out/fan-in: Puede requerir mecanismos adicionales como semáforos o limitadores de velocidad para el control de recursos.
   - Worker pool: Administra esencialmente los recursos al limitar la cantidad de trabajadores simultáneos.

5. **Complejidad de implementación**:
   - Fan-out/fan-in: Puede ser más sencillo de implementar para tareas de pequeña escala.
   - Worker pool: Puede requerir más configuración, pero ofrece una mejor escalabilidad a largo plazo.

_Ambos patrones se pueden utilizar para el procesamiento simultáneo distribuido y la elección depende de los requisitos específicos de la aplicación y de las limitaciones de recursos._

---

### 7. Explicar en que consiste el patrón "Producer-Consumer" que problemas resuelve y sus ventajas

El patrón "**Producer-Consumer**" es un diseño en código de concurrencia donde uno o más hilos (subprocesos) productores generan datos o tareas, y uno o más hilos consumidores los procesan o ejecutan. Este patrón utiliza una cola compartida como intermediario, lo que permite que productores y consumidores trabajen de forma independiente y a diferentes velocidades. Ayuda a desacoplar la producción del consumo de datos, permite una distribución eficiente de la carga de trabajo y facilita la gestión de recursos en sistemas concurrentes.

#### Problemas resueltos por este patrón

- ***Acceso concurrente:*** Evitar condiciones de carrera cuando varios productores/consumidores acceden a recursos compartidos.
- ***Desajuste de velocidad:*** Almacenar datos en búfer cuando las velocidades de producción y consumo difieren.
- ***Gestión de recursos:*** Evitar sobrecarga de los sistemas limitando el procesamiento concurrente (contrapresión).
- ***Desacoplamiento:*** Separar lógica de generación de datos de la lógica de procesamiento.

#### Ventajas clave

- ***Modularidad:*** Los productores y consumidores operan de forma independiente.
- ***Escalabilidad:*** Permite agregar fácilmente más productores/consumidores sin necesidad de rediseñar la arquitectura.
- ***Eficiencia:*** Permite el procesamiento en paralelo y el balanceo de carga.
- ***Gestión de contrapresión:*** Evita la sobrecarga del sistema mediante búferes limitados.

#### Ejemplo

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func Producer(id int, jobs chan<- int, wg *sync.WaitGroup, count int) {
	defer wg.Done()
	for i := 0; i < count; i++ {
		job := id*100 + i
		jobs <- job // enviar trabajo al canal
		fmt.Printf("Producer %d mandó a procesar %d\n", id, job)
		time.Sleep(100 * time.Millisecond) // simular trabajo
	}
}

func Consumer(id int, jobs <-chan int, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs { // recibe hasta que el canal se cierre
		fmt.Printf("Consumer %d procesando %d\n", id, job)
		time.Sleep(250 * time.Millisecond) // simular procesamiento
	}
	fmt.Printf("Consumer %d terminado\n", id)
}

func main() {
	jobs := make(chan int)   // canal sin buffer (sin cola adicional/temporal)
	var prodWg sync.WaitGroup   // espera productores
	var consWg sync.WaitGroup   // espera consumidores

	// Iniciar consumidores
	numConsumers := 3
	consWg.Add(numConsumers)
	for i := 1; i <= numConsumers; i++ {
		go Consumer(i, jobs, &consWg)
	}

	// Iniciar productores
	numProducers := 2
	produceCount := 5
	prodWg.Add(numProducers)
	for i := 1; i <= numProducers; i++ {
		go Producer(i, jobs, &prodWg, produceCount)
	}

	// Esperar terminen los productores y cerrar el canal
	prodWg.Wait()
	close(jobs) // señal a consumidores que no habrá más trabajos

	// Esperar que terminen los consumidores
	consWg.Wait()
	fmt.Println("Terminado...")
}

```

#### Explicación del flujo de código

- Canal `jobs`: medio de comunicación entre productores y consumidores. Es un canal sin buffer aquí, lo que hace que los envíos bloqueen si no hay consumidor listo.
- Productores (_Producer_): generan trabajos y los envían a `jobs`. Usan `prodWg` para señalar cuando terminan.
- Consumidores (_Consumer_): reciben trabajos desde `jobs` en un bucle `for range` hasta que el canal se cierra; usan `consWg` para señalar finalización.
- Coordinación: en **main** se espera que todos los productores terminen (_prodWg.Wait()_), luego cierra el canal para indicar a los consumidores que no habrá más trabajos; después se espera a los consumidores (_consWg.Wait()_).
- Bloqueos y sincronización: con canal sin buffer, un envio bloquea hasta que algún consumidor reciba (con buffer se permite encolado hasta la capacidad del buffer). El cierre del canal es la forma segura y típica de indicar producción terminada.

#### Alternativas en el flujo

- Canal con buffer: usa `make(chan int, N)` para permitir que productores encolen hasta _N_ elementos sin bloquear; para desacoplar ritmos de producción/consumo.
- Context para cancelación: si se necesita cancelar todo por timeout o error, se propaga un context.Context y hacer que productores/consumidores salgan cuando se cancele.

#### Ejemplos de casos de uso

- ***Datos en tiempo real:*** Cotizaciones bursátiles, procesamiento de datos de sensores
- ***Colas de tareas:*** Servidores web que gestionan solicitudes HTTP
- ***Sistemas de registro:*** Agregación de registros de múltiples fuentes
- ***Sistemas distribuidos:*** Comunicación asíncrona entre microservicios

---

### 8. Explicar en que consiste el patrón "Pipeline" que problemas resuelve y sus ventajas

El patrón "**Pipeline**" es un diseño en código de concurrencia que se utiliza para procesar datos de forma secuencial a través de múltiples etapas, donde cada etapa realiza una operación específica y pasa el resultado a la siguiente etapa mediante canales. Permite un procesamiento de datos eficiente y modular.

#### Problemas resueltos por este patrón

- ***Procesamiento secuencial de datos:*** Gestionar flujos de trabajo de varios pasos donde los datos deben transformarse o procesarse por etapas.
- ***Optimizar concurrencia:*** Permitir la ejecución simultánea de varias etapas, mejorando el rendimiento.
- ***Desacoplamiento:*** Separar la lógica de cada etapa, lo que hace que el código sea más modular y fácil de mantener.
- ***Escalabilidad:*** Procesar eficientemente grandes conjuntos de datos aprovechando el paralelismo.

#### Ventajas clave

- ***Modularidad:*** Cada etapa es independiente, lo que facilita agregar, eliminar o modificar etapas sin afectar el resto del flujo de trabajo.
- ***Ejecución concurrente:*** Varias etapas pueden operar simultáneamente, reduciendo el tiempo total de procesamiento.
- ***Mayor rendimiento:*** Permite un uso eficiente de los recursos de CPU y E/S mediante el procesamiento paralelo de datos.
- ***Gestión de errores:*** Los errores se pueden aislar y gestionar en etapas específicas sin afectar a las demás.

#### Ejemplo:

```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func produce(num int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 0; i < num; i++ {
			out <- rand.Intn(100) // Generar números aleatorios
		}
	}()
	return out
}

func double(input <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for value := range input {
			out <- value * 2 // Duplicar el valor
		}
	}()
	return out
}

func filterGt10(input <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for value := range input {
			if value > 10 { // Filtrar valores mayores que 10
				out <- value
			}
		}
	}()
	return out
}

func main() {
	rand.Seed(time.Now().UnixNano())    // Semilla del generador de números
	numbersCh := produce(10)            // Etapa 1: Generar números aleatorios
	doubledCh := double(numbersCh)      // Etapa 2: Duplicar los números
	filteredCh := filterGt10(doubledCh) // Etapa 3: Filtrar números mayores que 10
	fmt.Println("Resultados:")
  for value := range filteredCh {     // Etapa 4: Mostrar el resultado final
		fmt.Printf("- %d\n", value)
	}
}

```

#### Explicación del flujo de código

1. Etapa de inicialización:
    - Cada etapa se implementa como una función que toma un canal de entrada y devuelve un canal de salida.
    - Las goroutines se utilizan para ejecutar cada etapa simultáneamente.
2. Flujo de datos:
    - Los datos fluyen a través del pipeline mediante canales.
    - Cada etapa procesa su entrada y envía los resultados a la siguiente etapa.
3. Terminación:
    - Los canales se cierran cuando una etapa termina de procesar todos los datos de entrada (`defer close(out)`).
    - El cierre de los canales indica a las etapas posteriores que dejen de leer.
4. Salida final:
    - La etapa final (_Etapa 4_) consume los valores filtrados de la etapa anterior (_Etapa 3_) y los muestra.

#### Ejemplos de casos de uso

- ***ETL (Extracción, Transformación y Carga):*** Procesamiento y transformación de grandes conjuntos de datos
- ***Procesamiento de imágenes o vídeo:*** Operaciones secuenciales como redimensionamiento, filtrado y guardado de imágenes
- ***Análisis de texto:*** Tokenización, filtrado y análisis de sentimiento de datos de texto
- ***Análisis de datos financieros:*** Cálculos secuenciales en grandes flujos de datos financieros
- ***Procesamiento de registros:*** Filtrado, transformación y agregación de registros en tiempo real


#### Buenas prácticas

- Cerrar siempre los canales de salida cuando una etapa termine de procesar (`defer close(out)`).

- Si las etapas tienen velocidades diferentes, usar canales con búfer para evitar bloquear productores rápidos o consumidores lentos.

- Usar una estructura personalizada (ej: `Result { Value int, Err error }`) para propagar errores a través del pipeline sin generar _panic_.

- Usar `context.Context` o un canal `done` para indicar a las goroutines que finalicen anticipadamente durante errores o cierres.

- Identificar las etapas lentas y paralelizar usando patrones como _Fan-Out/Fan-In_ si es necesario.

- Diseñar cada etapa como una unidad aislada para facilitar las pruebas y depuración.