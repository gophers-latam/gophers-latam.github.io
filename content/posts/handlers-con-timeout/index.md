---
title: "Handlers Con Timeout"
date: 2023-03-27T00:21:15-03:00
draft: false
author: Tomas Lingotti
year: "2023"
month: "2023/03"
categories:
- Web
- Seguridad
tags:
- software
- golang
keywords:
- Handlers
- Web servers
disableComments: false
---

{{<postimage "images/go-handlers.jpeg" "go handlers">}}

En algunas oportunidades, vamos a necesitar un comportamiento **muy** determinístico en nuestras APIs, ya sea porque el negocio así lo requiere o los clientes. Tal vez, un comportamiento que se mantenga alejado de cualquier sorpresa, puede ser el máximo de duración que le queremos dejar como ventana para que un respuesta sea entregada, en caso de excederlo, ahora si como el título lo dice, devolvemos un **timeout**... pero, qué es un timeout?

<!--more-->

En principio sabemos que contamos con 2 estados para representarlo, pero no se parecen mucho ya que están en _centenas_ distintas, unos es **408 request timeout** y el otro es **504 Gateway timeout**.
Si leemos un poco las especificaciones, ninguno de los dos _nos calza justo_ para lo que queremos, el 408 nos dice que el cliente "se tardó demasiado para enviar su request", desde la RFC dice lo siguiente:

> The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time.

Y para su contraparte del lado del servidor:

> The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.

Entonces, para la responder la pregunta, concluimos que un timeout es que esperamos demasiado por algo, y no sucedió, ademas, lo consideramos un error.

## Cómo hacemos nuestras funciones de Timeout?
En los lenguajes de programación modernos, encontramos built-in algunas formas de manejar estos casos de uso. En Golang, por ejemplo el paquete `context` tiene _constructores_ para crear uno que expire y se cancele después de cierto tiempo.

Dentro del paquete net/http también nos encontramos con muchos timeouts como por ejemplo en la struct `http.Client` para hacer requests y `http.Server` es otra que tampoco se queda afuera de tener este tipo de configuración.

Por ahora, tenemos: context, http.Client y Server, servidores TCP y UDP, etc. Podemos resumir que siempre que haya una conexión hacia fuera (ya sea cliente o servidor) vamos a poder configurar un timeout.

## Cómo nos sirven en los web handlers?
Antes, debemos aclarar que es un **middleware**, en cualquier lenguaje, ya que es un concepto y no una implementación específica de Golang. 

Entonces, decimos que son funciones con la misma firma que un handler (o controlador web), que recibe los mismos parámetros  para operar como una petición HTTP. Al ser iguales, nos permite ejecutarlo previamente de una forma sencilla y pre-ejecutar operaciones que nos ayuden a nuestro negocio. Un claro ejemplo son validaciones de token JWT, agregar request ID unicos, sumarle datos al contexto (esto si es mas estilo _gopher_).
En nuestro caso, vamos a tener un middleware que se encargue de reemplazar el contexto, por otro que tenga un timeout, para que no tarde mas de tanto tiempo y si no, falla. Nos va a ayudar a garantizar un tiempo de respuesta de máxima, por las buenas _o por las malas_.

## Lo llevamos a código
Como middleware, podemos usar _uno que ya existe_ y está dentro del paquete http, es `http.Timeout` y dentro de su firma, vamos a pasarle un `http.Handler`, **el tiempo de espera que vamos a soportar** y por último (este no me gusta mucho) un mensaje como string, donde nos quita un poco de flexibilidad, a mi entender, `[]byte` nos daría un espectro mas amplio a la hora de retornar los valores.

- Podemos implementarlo como un wrapper general a todo el multiplexer y que todos ejecuten el middleware, este tiene como ventaja que escribimos una sola vez, pero perdemos granularidad.

```go
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		//....
	})
	muxWithMiddleware := http.TimeoutHandler(mux, time.Second*5, "timeout!")

	log.Fatal(http.ListenAndServe(":8080", muxWithMiddleware))
}
```

- Por último, tenemos otro camino, para tener un control espercífico en cada handler que expongamos.

```go
func main() {
	mux := http.NewServeMux()
	helloHandler := http.TimeoutHandler(wrapHandlerFunc(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("hello with timeout!"))
	})), time.Second*5, "timeout")

	mux.Handle("/", helloHandler)
}

func wrapHandlerFunc(handler http.Handler) http.Handler {
	wrapped := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		handler.ServeHTTP(w, r)
	})
	return wrapped
}
```

## Conclusiones
Vemos la flexibilidad que tenemos para exponer funciones en un servior web que tenemos en Golang. Siempre nos da muchas facilidades y opciones, a su vez, puede ser un poco confuso porque no sabemos bien cual usar. Como pequeño consejo, no nos _fritemos_ la cabeza pensando y comparando, tan solo elijamos una con un análisis superficial y despues nos queda el aprendizaje.

Para cerrar el tema técnico, estamos re-utilizando una funcion de la stdlib de Go, por lo que no es necesario que nostros pensemos esa lógica, también, muchos de los Frameworks web como Echo, Gin y Fiber (seguramente entre varios otros) ya traen sus middleware de timeout y es de una implementacion muy similar a la que acabamos de ver.

Espero que les haya gustado la explicación! nos vemos dentro de poco y cualquier tema que quieran que tratemos lo pueden dejar en comentarios.
