---
title: "Go interview: Puntos clave depuración"
date: 2025-09-01T13:56:12-06:00
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

Preguntas clave para resolución de problemas eficaz trabajando en código Go.

<!--more-->

## ❓Indice preguntas

**1. ¿Cómo depurar código concurrente en Go?**

**2. ¿Cuáles son los desafíos habituales al depurar aplicaciones de producción?**

**3. ¿Cómo se depuran y resuelven problemas de producción?**

**4. ¿Qué es `pprof`? Mencionar algunas características clave.**

**5. ¿Cómo se usa `pprof`?**

---

## ✅Respuestas

### 1. ¿Cómo depurar código concurrente en Go?

A continuación algunos ejemplos de ideas de cómo depurar código concurrente en Go:

- **Usando el depurador Delve:**

	```bash
	dlv debug
	(dlv) break main.go:line
	(dlv) continue
	(dlv) goroutines
	(dlv) goroutine 1 next
	(dlv) print var_name
	(dlv) locals
	```

- **Con el detector de carrera incluido en Go:**

Una condición de carrera se produce cuando dos o más operaciones simultáneas (concurrentes) acceden a datos compartidos y al menos una de ellas los modifica, lo que puede provocar un comportamiento impredecible debido a la sincronización y la secuencia de las operaciones.

  Ejemplo:

  ```go
  var counter int
  var wg sync.WaitGroup
  wg.Add(2)

  go func(wg *sync.WaitGroup) {
    counter++
    wg.Done()
  }(&wg)

  go func(wg *sync.WaitGroup) {
    counter++
    wg.Done()
  }(&wg)

  wg.Wait()
  ```

  ```bash
  go run -race .
  ```

- **Registro de salida con identificadores de goroutine:**

	```go
	func goID() int {
		var buf [64]byte
		n := runtime.Stack(buf[:], false)
		idField := strings.Fields(strings.TrimPrefix(string(buf[:n]), "goroutine "))[0]
		id, err := strconv.Atoi(idField)
		if err != nil {
			panic(err)
		}
		return id
	}

	func main() {
		ch := make(chan int) // Canal sin búfer

		go func() {
			log.Printf("Goroutine %d:*** Starting work", goID())

			ch <- 42 // Bloquea hasta que el receptor esté listo
		}()

		value := <-ch // Bloquea hasta que el remitente envíe datos
		fmt.Println(value)
	}
	```

- **Visualización con seguimiento de goroutines incluido en Go:**

	* recopilar datos por comandos

	```bash
	go test -trace trace.out
	```
	o por código
    
	```go
	import "runtime/trace"
	...
	file, _ := os.Create("trace.out")
	trace.Start(file)
	Run()
	trace.Stop()
	```

	* y visualizar

	```bash
	go tool trace trace.out
	```

- **Nombrar gorutines para fácil identificación:**

	```go
	runtime.SetFinalizer(go func() {
		debug.SetGoroutineLabels(context.TODO(), "worker")
		// ... worker logic
	}(), nil)
	```

_Estos ejemplos dan varias ideas de técnicas para depurar código Go concurrente, desde el uso de depuradores especializados hasta el aprovechamiento de herramientas de Go integradas para análisis y visualización._

---

### 2. ¿Cuáles son los desafíos habituales al depurar aplicaciones de producción?

La depuración de aplicaciones a nivel de producción presenta varios desafíos:

- ***Las infraestructuras:*** Los sistemas distribuidos, las arquitecturas sin servidor y los microservicios dificultan el rastreo de los problemas hasta su origen.

- ***Visibilidad limitada:*** Las infraestructuras modernas a menudo reducen la visibilidad del comportamiento del software, lo que dificulta la comprensión y la depuración de los entornos de producción.

- ***Depuración remota:*** Cuando ocurren problemas en producción, es posible que los desarrolladores no tengan acceso directo a un entorno local equivalente. La depuración en producción puede interrumpir el trabajo de los usuarios, ralentizar el rendimiento de la aplicación o incluso bloquearla.

- ***Diferencias de datos:*** Los entornos de producción a menudo utilizan conjuntos de datos diferentes a los de desarrollo o control de calidad, lo que genera problemas imprevistos.

- ***Problemas de reproducción:*** Puede resultar complicado replicar problemas de producción en entornos locales o de prueba.

- ***Análisis de registros:*** Revisar numerosos archivos de registro para encontrar datos relevantes requiere mucho tiempo y puede requerir escribir registros adicionales y volver a implementar la aplicación.

- ***Errores impredecibles:*** Algunos errores pueden manifestarse de formas inesperadas, lo que dificulta su detección y resolución.

- ***Equilibrio entre velocidad y calidad:*** Los desarrolladores deben mantener un equilibrio entre soluciones rápidas y soluciones exhaustivas, siendo ambas de alta calidad.

---

### 3. ¿Cómo depurar y resolver problemas de producción?

Para depurar y resolver problemas de producción de manera efectiva algunos pasos clave son:

1. Pasos para reproducir
	- Recopilar contexto desde informes de los usuarios, las descripciones de errores y los registros de ejecución.
	- Definir las condiciones bajo las cuales ocurre el problema.
	- Configurar un entorno de prueba para recrear condiciones similares a las de producción.

2. Registros y métricas
	- Examinar los registros de aplicaciones, servidores e infraestructura.
	- Utilizar herramientas de monitoreo para identificar anomalías dentro de los parámetros óptimos o saludables del sistema.
	- Comparar datos antes, durante y después del problema.

3. Análisis de causa raíz
	- Generar hipótesis basadas en los datos recopilados.
	- Probar hipótesis mediante experimentos controlados.
	- Rastrear rutas de código y analizar dependencias.

4. Colaborar
	- Involucrar a las partes interesadas relevantes: desarrolladores, responsables de control de calidad, DevOps, etc.
	- Asignar roles y responsabilidades claras.

5. Implementar solución
	- Desarrollar una solución que aborde la causa raíz.
	- Realizar revisiones y pruebas exhaustivas por pares.
	- Implementar gradualmente utilizando técnicas de versionamiento.
	- Supervisar de cerca la implementación para detectar regresiones.

6. Documentar
	- Registrar los hallazgos y las decisiones tomadas durante el proceso.
	- Realizar análisis post mortem para identificar mejoras en el proceso.
	- Actualizar documentación e implementar medidas preventivas.

7. Seguir buenas prácticas
	- Utilizar frameworks de logging para obtener y guardar información detallada.
	- Implementar el manejo y registro de errores apropiadamente en la base de código.
	- Utilizar herramientas de depuración de producción para el monitoreo y análisis en tiempo real.
	- Contar con un equipo de depuración de producción experto y preparado para responder con rapidez.

---

### 4. ¿Qué es `pprof`? Mencionar algunas características clave.

`pprof` es una herramienta para creación de perfiles de ejecución en programas de código Go que permite a los desarrolladores analizar el uso de la CPU, la asignación de memoria y el comportamiento de las goroutines. Forma parte de la biblioteca estándar de Go y puede generar perfiles detallados. Entre sus características principales se incluyen:

- ***Perfiles de CPU:*** Recopila datos de uso de la CPU para identificar el tiempo empleado en diferentes partes de la aplicación.

- ***Perfiles de memoria:*** Registra las asignaciones en Heap para monitorear el uso de memoria y detectar posibles fugas.

- ***Perfiles de bloqueo:*** Identifica las ubicaciones donde las goroutines se bloquean o esperan la sincronización

- ***Perfiles Mutex:*** Informa sobre la contención de mutex en la aplicación.

- ***Capacidades de visualización:*** Genera informes tanto de texto como gráficos para análisis.

- ***Integración de servidor HTTP:*** Puede servir datos de creación de perfiles a través de HTTP para facilitar el acceso.

- ***Simbolización:*** Puede traducir direcciones en código máquina a nombres de funciones y números de línea legibles para humanos.

- ***Comparación y agregación:*** Permite comparar o combinar múltiples perfiles para su análisis.

- ***Informes personalizables:*** Ofrece opciones para ajustar la granularidad (ej: funciones, archivos, líneas) y la clasificación de los resultados.

---

### 5. ¿Cómo se usa `pprof`?

#### 1. Usar `pprof` para analizar pila de goroutines:
- Importar el paquete pprof: `import _ "net/http/pprof"`
- Iniciar un servidor HTTP: 
	```go
	go func() {
		log.Println(http.ListenAndServe("localhost:1414", nil))
	}()
	```

- Generar perfil de goroutines:
	- Acceder al endpoint de pprof: `http://localhost:1414/debug/pprof/goroutine?debug=2`
	- Esto proporciona un volcado completo de la pila de goroutines.

- Analizar perfil:
	- Utilice el comando `go tool pprof` para examinar el perfil generado.
	- Por ejemplo: `go tool pprof http://localhost:1414/debug/pprof/goroutine`

- Interpretar resultados:
	- pprof agrupa goroutines según la firma del seguimiento de pila
	- Proporciona información sobre estados de goroutine, llamadas de función y firmas de parámetros.

- Visualizar datos:
	- pprof puede generar varios reportes, incluidos resúmenes de uso de CPU, detalles de asignación de memoria y gráfico de llamas (flame graphs)

#### 2. Utilizar `pprof` para crear perfiles de CPU o memoria:
- Importar `"github.com/pkg/profile"`
- Establecer al inicio de la aplicación instrucciones para iniciar y detener la creación de perfiles con las opciones apropiadas:
	```Go
	defer profile.Start(profile.MemProfile, profile.MemProfileRate(1), profile.ProfilePath(".")).Stop()

	```
	Esto generará `cpu.pprof` o `mem.pprof`

- Examinar los perfiles generados:
	```bash
	go tool pprof -http=:8080 mem.pprof 
	```

---

### Anexo:

Algunos videos (en Inglés) de referencia sobre depuración, en serie de charlas en el FOSDEM:

- **Técnicas avanzadas de depuración de código Go:** https://av.tib.eu/media/47299

- **Depuración determinista con Delve**: https://av.tib.eu/media/47307

- **Depuración avanzada de Go con Delve:** https://av.tib.eu/media/41140

- **Depuración de generación de código Go:** https://av.tib.eu/media/47336

- **Depuración de programas concurrentes en Go:** https://av.tib.eu/media/62050