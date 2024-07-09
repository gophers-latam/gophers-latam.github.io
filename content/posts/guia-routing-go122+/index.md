---
title: "Guía de enrutamiento http estándar Go 1.22+"
date: 2024-07-09T11:48:56-06:00
draft: false
author: zeroidentidad
year: "2024"
month: "2024/07"
categories:
- Tutorial
- Ejemplos
tags:
- routing
- golang
keywords:
- apis
- rest
- guia
disableComments: false
---

{{<postimage "images/servmux.png" "new servmux">}}

Considerando la promesa de retrocompatibilidad esta guía o tutorial se estima sirva de referencia para la era de versiones de Go 1.22+

<!--more-->

Desde Go 1.22, **ServeMux** se adaptó para permitir declaraciones de métodos dentro de la ruta. A continuación se ejemplifica de manera resumida el uso de los verbos de métodos http más esenciales o comunes.

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type greeting struct {
	Greeting string `json:"greeting"`
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`Hello`))
	})

	mux.HandleFunc("POST /greetings", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		var g greeting
		_ = decoder.Decode(&g)
		w.Write([]byte(g.Greeting))
	})

	mux.HandleFunc("PUT /greetings/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		fmt.Fprintf(w, "Update greeting with id: %s", id)
	})

	mux.HandleFunc("DELETE /greetings/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		fmt.Fprintf(w, "Delete order with id: %s", id)
	})

	if err := http.ListenAndServe(":3000", mux); err != nil {
		log.Panic(err)
	}
}
```
`[METHOD ][HOST]/[PATH]` - solo se acepta UN método, no se puede hacer `"GET POST /hello"`.

## Wildcards en patrones de ruta

Las nuevas reglas de enrutamiento permiten aceptar parámetros en la ruta. Los parámetros de ruta no son raros; el hecho de que no existía soporte para ellos habia sido una de las principales razones por las que muchas personas han usado Gorilla u otras librerias de enrutamiento.

Un parámetro de ruta es una parte o sección de la URL que espera un valor en la solicitud; por ejemplo, digamos que se permitirá que los usuarios agreguen un nombre para saludar. La solicitud sería entonces `/hello/$NAME`.

El nuevo **ServeMux** permite especificar parámetros con un nombre envolviéndolos en `{}`. Entonces se puede agregar un parámetro para el nombre haciendo que la ruta sea `/hello/{name}`.

Para poder capturar el parámetro, la solicitud HTTP contiene una función llamada `PathValue`. Esta función acepta el nombre del parámetro a buscar.

Ejemplo:

```go
	mux := http.NewServeMux()

	mux.HandleFunc("GET /hello/{name}", func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")
		w.Write([]byte(fmt.Sprintf("Hello %s!", name)))
 	})
```
No se necesita verificar que `name` esté presente; si se intenta enviar una solicitud sin el parámetro, se verá que devuelve [HTTP 404] Not found.

Puede haber casos de uso en los que sea necesario permitir que se establezcan rutas dinámicas y seguir utilizando parámetros. Para resolver eso, se puede terminar `{}` con `...` (tres puntos) que harán que el patrón coincida con cualquier segmento después del parámetro.

Ejemplo:

```go
	mux.HandleFunc("GET /hello/{name...}", func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")
		w.Write([]byte(fmt.Sprintf("Hello %s!", name)))
	})
```
Esto permitirá pasar una solicitud dinámica con más segmentos al parámetro. Por ejemplo, `/hello/zero/123`

### Hacer coincidir patrones exactos con terminación de slashes

HTTP mux hace coincidir con cualquier ruta que tenga el prefijo correcto. Esto significa que si la ruta es `hello/` entonces cualquier solicitud a rutas que comiencen con `hello/` coincidirá y se considera válida. La clave aquí es `/` al final de la ruta, que siempre le ha dicho a ServeMux que coincida con cualquier prefijo posterior.

¿Qué pasa si solo se quiere permitir coincidencias EXACTAS? Bueno, esto es usando `{$}` al final de la ruta. Esto le indicará al Servemux que solo enrute coincidencias exactas. Esto tiene que estar al final de la ruta.

Ejemplo:

```go
	mux.HandleFunc("GET /hello/{$}", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`Hello`))
	})
```
Esto ahora solo permite enviar solicitudes que sean exactamente `hello/`

### Resolución de ruta y precedencia

Con las nuevas reglas de ServeMux, ahora una solicitud puede coincidir con DOS rutas. Esto se soluciona teniendo siempre ordenada hasta la ruta MÁS ESPECÍFICA. 

Prioridad por detalle de especificación:

```go
  http.HandleFunc("/hello", helloHandler)          // Menos específica
  http.HandleFunc("/hello/{name}", helloHandler)   // Mas específica
```

Por último, sobre parámetros de consulta en la ruta no hay algo que destacar, el uso y funcionamiento siguen igual.

- Referencia: https://go.dev/blog/routing-enhancements