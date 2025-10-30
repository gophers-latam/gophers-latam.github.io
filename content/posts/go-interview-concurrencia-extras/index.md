---
title: "Go interview: Concurrencia - extras"
date: 2025-09-01T13:59:59-06:00
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

Preguntas frecuentes y esenciales sobre paquetes de uso estándar para concurrencia (sync, context, etc.) en Go

<!--more-->

## ❓Indice preguntas

**1. ¿Cuándo se usa WaitGroup?**

**2. ¿Para qué se usa el paquete errgroup?**

**3. ¿Cómo ayudan las goroutines y canales a aprovechar los sistemas multinúcleo? Proporcione ejemplos**

**4. ¿Cuál es el propósito de la instrucción `select` en Go y cómo se usa con los canales?**

**5. ¿Qué es un interbloqueo (deadlock)? Dar un ejemplo**

**6. ¿Para qué se usa el paquete `sync/atomic`?**

**7. ¿Cómo se podría gestionar el acceso concurrente a recursos compartidos en Go?**

---

## ✅Respuestas

### 1. ¿Cuándo se usa WaitGroup?

#### Utilizar WaitGroup cuando:

- Se debe esperar a que varias goroutines completen su ejecución antes de continuar.
- Se debe esperar la ejecución de un número determinado de goroutines, generalmente en escenarios donde se generan muchas goroutines en un bucle.
- No se necesita comunicar datos entre goroutines, simplemente sincronizar su finalización.

En algunos escenarios complejos, se pueden usar WaitGroups y canales juntos para lograr sincronización y comunicación más sofisticadas entre goroutines.

Al usar **sync.WaitGroup** y canales para concurrencia en Go, se deben seguir algunas prácticas recomendadas importantes:

#### Ubicación de wg.Add()
- Llamar **wg.Add()** antes de iniciar goroutines, no dentro.
- Esto evita condiciones de carrera entre wg.Add() y wg.Wait().
```go
wg.Add(1)
go func() {
    defer wg.Done()
    // Hacer tarea
}()
```
*_Actualmente de manera envuelta **wg.Go({...})** simplifica y evita esta situación._

#### Conteo de goroutines
- Usar **wg.Add(n)** antes de un bucle si se conoce el número exacto de goroutines.
- O llamar **wg.Add(1)** en cada iteración para mayor flexibilidad.

#### Buenas prácticas
- Usar **defer wg.Done()** dentro de las goroutines para garantizar que siempre se llame.
- Considerar usar canales con búfer cuando sea apropiado.
- Usar el **flag -race** al compilar para detectar condiciones de carrera.
- Para escenarios complejos, considerar usar grupos de trabajadores (worker pools) o primitivas de sincronización más avanzadas.

_Estas prácticas ayudan a prevenir problemas de concurrencia comunes, como condiciones de carrera y bloqueos._

---

### 2. ¿Para qué se usa el paquete errgroup?

El paquete `golang.org/x/sync/errgroup` se utiliza para simplificar la gestión de múltiples goroutines que trabajan en subtareas de una tarea común. Extiende al paquete `sync.WaitGroup` estándar añadiendo funciones de gestión de errores y cancelación de contexto. A continuación, se detallan sus principales características y casos de uso:

#### Características principales

1. Propagación de errores:
   - Propaga automáticamente el primer error no nulo devuelto por cualquier goroutine del grupo.
   - Cancela otras goroutines en ejecución cuando ocurre un error.

1. Integración de contexto:
   - Proporciona un `context.Context` derivado cuando se utiliza `errgroup.WithContext`.
   - Cancela el contexto cuando cualquier goroutine en el grupo devuelve un error o cuando se llama `Wait`.

1. Sincronización:
   - Similar a `sync.WaitGroup`, espera a que todas las goroutines del grupo se completen antes de continuar.

1. Limitación de concurrencia:
   - Permite establecer un límite en la cantidad de goroutines activas usando `SetLimit`, evitando el agotamiento de recursos.

1. Manejo simplificado de errores:
   - Reduce el código repetitivo para gestionar errores y sincronización en programación concurrente.

#### Ejemplos de casos de uso

- Obtener datos de múltiples API en paralelo y gestionar errores controlados con fluidez
- Procesar flujos de datos simultáneamente, garantizando al mismo tiempo una gestión de errores adecuada
- Paralelizar tareas en controladores HTTP, como la consulta de múltiples bases de datos o servicios
- Limitar el número de operaciones simultáneas para evitar la sobrecarga de los recursos del sistema

#### Ejemplo
```go
package main

import (
	"context"
	"fmt"
	"golang.org/x/sync/errgroup"
	"net/http"
)

func main() {
	g, ctx := errgroup.WithContext(context.Background())

	urls := []string{
		"https://golang.org",
		"https://acme.net",
		"https://example.com",
	}

	for _, url := range urls {
		url := url // Variable de bucle para captura
		
		g.Go(func() error {
			req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
			if err != nil {
				return err
			}
			
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return fmt.Errorf("error al obtener %s: %w", url, err)
			}
			defer resp.Body.Close()
			
			fmt.Printf("Se obtuvo %s con estatus %s\n", url, resp.Status)
			
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Println("Se obtuvieron exitosamente todas las URL.")
	}
}
```

#### Funciones avanzadas
1. Limitación de concurrencia:
   ```go
   g.SetLimit(2) // Límitar a 2 goroutines concurrentes
   ```

1. Uso de `TryGo`:
   - Inicia una goroutine solo si no excede el límite de concurrencia.
   ```go
   if g.TryGo(func() error { /* tarea */ }) {
       fmt.Println("Goroutine iniciada")
   } else {
       fmt.Println("Límite de concurrencia alcanzado")
   }
   ```

#### Ventajas sobre `sync.WaitGroup`
- Gestiona errores directamente, a diferencia de `sync.WaitGroup`, que requiere lógica adicional para el seguimiento de errores.
- Cancela automáticamente otras goroutines en caso de fallo mediante la propagación del contexto.
- Proporciona control de concurrencia con `SetLimit`.

#### Buenas prácticas
- Siempre capturar las variables del bucle al ejecutar goroutines dentro de bucles (ej: `for _, url := range urls { url := url }`) para confirmar usar el valor correcto de iteración actual.
- Gestionar la cancelación del contexto derivado (`ctx`) dentro de las goroutines para garantizar una terminación oportuna.
- Usar `errgroup` para tareas donde la gestión y cancelación de errores sean cruciales.

_Al utilizar `errgroup` se puede escribir código concurrente limpio, más eficiente y robusto con sincronización y manejo de errores optimizados._

---

### 3. ¿Cómo ayudan las goroutines y canales a aprovechar los sistemas multinúcleo? Proporcione ejemplos

#### Computación paralela
Las goroutines son subprocesos o hilos ligeros gestionados por el entorno de ejecución de Go. Permiten la ejecución concurrente y pueden distribuirse entre varios núcleos de CPU.

En este sentido las goroutines y canales pueden aprovechar hacer paralelismo cuando el runtime de Go usa múltiples núcleos. La computación paralela ocurre bajo ciertas condiciones y solo si el scheduler de Go asigna goroutines a múltiples hilos del sistema (según **GOMAXPROCS**).

```go
func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8}
    results := make([]int, len(numbers))

    var wg sync.WaitGroup
    for i, num := range numbers {
        wg.Add(1)
        go func(i, num int) {
            defer wg.Done()
            results[i] = doWork(num)
        }(i, num)
    }
    wg.Wait()

    fmt.Println("Resultado:", results)
}

func doWork(n int) int {
    time.Sleep(100 * time.Millisecond)
    return n * n
}
```

Este ejemplo distribuye los cálculos entre múltiples goroutines, utilizando potencialmente múltiples núcleos de CPU.

#### Canales
Los canales facilitan la comunicación y la sincronización entre goroutines, lo que permite un procesamiento paralelo coordinado.

```go
func main() {
    const numJobs = 100
    const numWorkers = 5

    jobs := make(chan int, numJobs)
    defer close(jobs)
    results := make(chan int, numJobs)
    defer close(results)

    // Iniciar goroutines de trabajadores
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }

    // Enviar trabajos
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }

    // Recopilar resultados
    for a := 1; a <= numJobs; a++ {
        <-results
    }
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d procesando trabajo %d\n", id, j)
        time.Sleep(time.Millisecond) // Simular trabajo
        results <- j * 2
    }
}
```

Este ejemplo de grupo de trabajadores (worker pool) demuestra cómo los canales pueden distribuir el trabajo entre múltiples goroutines, utilizando de manera eficiente sistemas de múltiples núcleos.

_Al utilizar goroutines y canales, los programas en Go pueden paralelizar tareas de manera efectiva, mejorando el rendimiento en sistemas multinúcleo y manteniendo al mismo tiempo una estructura de código clara y manejable._

---

### 4. ¿Cuál es el propósito de la instrucción `select` en Go y cómo se usa con los canales?

La instrucción `select` en Go es un potente mecanismo de control de concurrencia diseñado para gestionar operaciones simultáneas en múltiples canales. Su propósito principal es permitir que una goroutine espere y responda eficientemente a las comunicaciones de múltiples canales. A continuación, se detalla:

#### Propósito de `select`
1. **Multiplexar operaciones por canal**: Permite que una goroutine espere y procese la primera comunicación disponible entre múltiples canales.
2. **Comunicación no bloqueante**: Con la opción `default`, realiza operaciones sin bloqueo cuando ningún canal está listo.
3. **Sincronización**: Coordina la comunicación entre goroutines ejecutando casos a medida que los canales están listos.

#### Sintaxis y uso
La instrucción `select` se parece a un `switch` pero funciona exclusivamente con canales:
```go
select {
case msg1 := <-channel1:
    // Manejar datos del canal 1
case channel2 <- data:
    // Enviar datos al canal 2
case <-time.After(1 * time.Second):
    // Timeout después de 1 segundo
default:
    // Ejecutar si no hay canales listos (sin bloqueo)
}
```

#### Comportamientos clave

1. Comportamiento de bloqueo:
   - Sin `default`, `select` se bloquea indefinidamente hasta que uno de sus casos esté listo.
   - Ejemplo:
        ```go
        select {
        case v := <-ch1: // Bloquea hasta que ch1 tenga datos
            fmt.Println(v)
        case ch2 <- 42:  // Bloquea hasta que ch2 pueda recibir
        }
        ```

2. Sin bloqueo con `default`:
   - Ejecuta inmediatamente `default` si no hay canales listos:
        ```go
        select {
        case msg := <-ch:
            fmt.Println("Recibido:", msg)
        default:
            fmt.Println("No hay ningún mensaje")
        }
        ```

        El caso `default` en una instrucción `select` se ejecuta inmediatamente si ninguna de las demás operaciones de canal está lista, lo que hace que la selección sea no bloqueante. Esto permite que el código intente enviar o recibir sin esperar; si ningún canal está listo, se ejecuta el caso `default` y el programa continúa. Esto es útil para implementar operaciones no bloqueantes, sondeos o evitar interbloqueos cuando se desea continuar incluso si no se puede establecer comunicación en ese momento.


3. Selección aleatoria:
   - Si hay varios casos listos simultáneamente, se elige uno **al azar** para garantizar la imparcialidad:
        ```go
        ch1, ch2 := make(chan int), make(chan int)
        go func() { ch1 <- 1 }()
        go func() { ch2 <- 2 }()
        
        select { // Selección aleatoria si ambos canales están listos
        case v := <-ch1: 
            fmt.Println(v)
        case v := <-ch2:
            fmt.Println(v)
        }
        ```

#### Casos de uso comunes

1. Tiempos de espera (Timeouts):
    ```go
    select {
    case res := <-apiCall:
        fmt.Println(res)
    case <-time.After(3 * time.Second):
        fmt.Println("Tiempo de solicitud agotado")
    }
    ```

2. Bucles de eventos (Event loops):
    ```go
    for {
        select {
        case job := <-jobs:
            process(job)
        case <-shutdown:
            return
        }
    }
    ```

3. Canales prioritarios:
    ```go
    select {
    case highPri := <-highPriorityChan: // Verificar primero lo de alta prioridad
        handleHighPri(highPri)
    default:
        select {
        case lowPri := <-lowPriorityChan: // Regresar a lo de baja prioridad
            handleLowPri(lowPri)
        }
    }
    ```

#### Buenas prácticas
- **Evitar `select{}` vacío**: Esto bloquea permanentemente (útil para evitar que `main` salga).
- **Manejo de cierre**: Usar `_, ok := <-ch` en los casos para detectar canales cerrados.
- **Combinar con `for`**: Se usa a menudo en bucles para procesar continuamente eventos de canal.

_Al aprovechar `select` se puede escribir código concurrente legible y eficiente que maneja con elegancia interacciones de canales complejas._

---

### 5. ¿Qué es un interbloqueo (deadlock)? Dar un ejemplo

Un interbloqueo es una situación en la programación concurrente en la que dos o más procesos o subprocesos no pueden continuar porque cada uno está esperando que el otro libere un recurso, lo que genera una dependencia circular que impide que cualquiera de ellos avance.

 ```go
package main

func main() {
	ch1 := make(chan int)
	ch2 := make(chan int)

	go func() {
		ch1 <- 11 // Bloquea aquí esperando al receptor
		<-ch2     // Nunca recibirá
	}()

	ch2 <- 22 // Bloquea aquí esperando al receptor
	<-ch1     // Nunca recibirá

}
```
```bash
fatal error: all goroutines are asleep - deadlock!
```

---

### 6. ¿Para qué se usa el paquete `sync/atomic`?

El paquete `sync/atomic` de Go se utiliza para operaciones de memoria atómica de bajo nivel, principalmente para implementar algoritmos de sincronización en programación concurrente. Proporciona funciones para operaciones atómicas con enteros, punteros y booleanos, garantizando que estas operaciones se ejecuten como unidades indivisibles sin interferencias de otras operaciones concurrentes.

Los usos clave de `sync/atomic` incluyen:
- Prevenir condiciones de carrera en programas concurrentes
- Realizar operaciones atómicas de lectura-modificación-escritura, como el incremento de contadores
- Implementar operaciones de comparación e intercambio para primitivas de sincronización
- Garantizar la sincronización de la memoria entre núcleos e hilos
- Ofrecer alternativas eficientes a los bloqueos mutex para gestión sencilla del estado compartido

El paquete es particularmente útil para escenarios que requieren un control detallado sobre recursos compartidos y cuando el rendimiento es crítico, ya que las operaciones atómicas son generalmente más rápidas que el bloqueo de mutex para operaciones simples de lectura o escritura.

Es importante tener en cuenta que `sync/atomic` requiere un uso cuidadoso y está diseñado principalmente para aplicaciones de bajo nivel. Para la mayoría de las tareas de programación concurrente, Go recomienda usar canales o primitivas de sincronización de alto nivel del paquete sync.

---

### 7. ¿Cómo se podría gestionar el acceso concurrente a recursos compartidos en Go?

#### Uso de Mutex (exclusión mutua)

El enfoque más común para la protección de estado compartido simple:

```go
package main

import (
    "fmt"
    "sync"
)

type SafeCounter struct {
    mu    sync.Mutex
    value int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func main() {
    counter := SafeCounter{}
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            counter.Increment()
            wg.Done()
        }()
    }

    wg.Wait()
    fmt.Println("Valor final:", counter.value) // debe ser = 1000
}
```

#### Uso de canales (Comunicación de procesos secuenciales - Patrón CSP)

El enfoque idiomático de Go utilizando comunicación:

```go
package main

import (
    "fmt"
    "sync"
)

type Counter struct {
    value int
    cmd   chan func()
}

func NewCounter() *Counter {
    c := &Counter{cmd: make(chan func())}
    go c.run()
    return c
}

func (c *Counter) run() {
    for fn := range c.cmd {
        fn()
    }
}

func (c *Counter) Increment() {
    c.cmd <- func() {
        c.value++
    }
}

func main() {
    counter := NewCounter()
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            counter.Increment()
            wg.Done()
        }()
    }

    wg.Wait()
    fmt.Println("Valor final:", counter.value) // debe ser = 1000
}
```

#### Operaciones atómicas

Para tipos numéricos simples:

```go
package main

import (
    "fmt"
    "sync/atomic"
    "sync"
)

func main() {
    var counter int64
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            atomic.AddInt64(&counter, 1)
            wg.Done()
        }()
    }

    wg.Wait()
    fmt.Println("Valor final:", counter) // debe ser = 1000
}
```

#### Comparación de métodos clave en la stlib

| Método          | Mejor para                             | Ventajas                      | Desventajas                               |
|-----------------|----------------------------------------|-------------------------------|-------------------------------------------|
| **Mutex**       | Estado general compartido              | Control simple y explícito    | Riesgo de bloqueos si se hace un mal uso  |
| **RWMutex**     | Cargas de trabajo de lectura intensiva | Permite lecturas concurrentes | Más complejo que mutex básico             |
| **Channels**    | Flujos de trabajo complejos            | Go idiomático, más seguro     | Costoso para casos sencillos              |
| **Atomic**      | Contadores/marcadores simples          | Costo mínimo                  | Limitado a operaciones básicas            |

_En la mayoría de los casos en Go, se prefieren los **canales** para coordinación y los **mutexes** para protección del estado compartido. La elección depende del caso de uso específico y de los requisitos de rendimiento._