---
title: "Fuga de gorutinas"
date: 2023-12-20T15:33:31-03:00
draft: false
author: Andrés Reyes, el Programador Pobre
year: "2023"
month: "2023/12"
categories:
- golang
- programación
tags:
- gorutinas
- aprendizaje
- concurrencia
keywords:
- leak
- fuga
- gorutina
disableComments: false
---

{{<postimage "images/plumbing-pipe-wrench-plumber.jpg" "Fugas. imagen de dominio público gentileza pxfuel. https://www.pxfuel.com/en/free-photo-ojgpw">}}


Sabemos que las gorutinas son una de las mas importantes primitivas que Go pone a nuestra disposición para el manejo de concurrencia. Por eso se hace necesaria una forma de prevenir *fugas de gorutinas*.

<!--more-->

Una *fuga* o *leak* de gorutinas es cuando nuestra aplicación crea gorutinas sin tener el cuidado de terminarlas *correctamente*.

Observemos el siguiente ejemplo.

```go

package main

import (
	"fmt"
	"math/rand"
	"runtime"
	"time"
)

func send() int {
	n := rand.Intn(1000)
	time.Sleep(200 * time.Millisecond)
	return n
}

func submit() int {
	ch := make(chan int)

	go func() { ch <- send() }()
	go func() { ch <- send() }()
	go func() { ch <- send() }()
	go func() { ch <- send() }()

	return <-ch
}

func submitAll() {
	for i := 0; i < 5; i++ {
		submit()
	}
}

func main() {
	submitAll()
	fmt.Printf("número de gorutinas: %d\n", runtime.NumGoroutine())
}

```

Si ejecutamos este programa veremos lo siguiente:

```bash
$ go run  main.go 
número de gorutinas: 16
```

Imprime `número de gorutinas: 16` ¿Por que razón? Porque el contenido dle loop se itera 4 veces y en cada iteración engendra 4 gorutinas en la función `submit`. Ingenuamente podriamos estar esperando que al salir del ámbito de la función submit las gorutinas se hubiesen cerrado ¡Pero no es así! ¡Siguen corriendo al final de su proceso como lo demuestra la impresión!

Ahora bien, si nuestra aplicación terminará en este punto, no habría problema alguno, pues al terminar la ejecución del programa ya es responsabilidad del sistema operativo ejecutar las labores de limpieza. Pero, muchas veces usamos Go para construir aplicaciones qeu se ejecutan continuamente sin parar y que se espera que no se detengan, como servicios, apis, etc. En este tipo de aplicaciones, un escenario como el presentado en el ejemplo es insostenible.

Go reserva una cantidad de memoria específica para que las gorutinas usen como su [stack](https://go.dev/doc/faq#stack_or_heap)
