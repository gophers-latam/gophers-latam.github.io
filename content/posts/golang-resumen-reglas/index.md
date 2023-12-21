---
title: "Golang: Resumen reglas"
date: 2021-04-10T20:21:07-05:00
draft: false
author: ZeroIdentidad
year: "2021"
month: "2021/04"
categories:
- Comunidad
- Estandar
tags:
- reglas
- golang
keywords:
- golang
---

{{<postimage "images/go-police.png" "Go Police">}}

El lenguaje de programación Go fue creado para hacer el trabajo fácilmente.

Go tiene conceptos similares a los lenguajes imperativos y el tipado estático. <!--more--> También es rápido en la compilación, rápido de ejecutar e implementar. Grande y complejo.

**En este post, se explican conceptos básicos de Go tratando algunos conceptos o reglas importantes.**

Los principales temas tratados son los siguientes:

- **Escribir comentarios.**
- **Librerías e importación.**
- **Funciones.**
- **Tipos de datos.**
- **Valores de retorno con nombre.**
- **Variables y memoria.**
- **Control de sentencias.**
- **Generar funciones.**
- **Ejecución diferida.**
- **Interfaces.**
- **Múltiples entradas.**
- **Manejo de errores.**
- **Ejecución simultánea.**

# Escribir comentarios:

Para escribir un comentario de una línea

```shell
// comentario de una sola línea
```

Escribir un comentario con más de una línea

```shell
/* comentario
de multi-línea */
```

# Librerías e importación:

Cada archivo de código fuente comienza con la palabra clave **package**. La palabra clave **main** se utiliza para identificar el archivo como un archivo operativo, no como una librería.

```go
package main
```

Para importar un paquete de la librería estándar, terceros o personal al archivo, usamos la instrucción **import** de la siguiente manera:

```go
import (
    "fmt" // paquete en la librería estándar
    "io/ioutil" // se aplican funciones de E/S
    m "math" // usando la letra m para acortar o hacer alias del nombre de la librería de funciones matemáticas
    "net/http" // web server
    "os" // funciones a nivel del sistema operativo, como el manejo de archivos
    "strconv" // conversiones de texto
)
```

# Funciones:

Las funciones se definen mediante la palabra **func** seguida del nombre de la función.

La función main es privada y es la entrada al archivo ejecutable del programa (Go usa llaves ornamentadas **{}** para definir partes / bloques).

```go
func main() {
    // salida de texto en la unidad main en stdout (salida estandar) con Println de fmt (stdlib pkg)
    fmt.Println ("Hello world!")
    // llamar a una función del paquete actual
    beyondHello()
}
```

Las funciones necesitan paréntesis que reciben parámetros, e incluso en ausencia de parámetros, se requieren paréntesis.

```go
func beyondHello() {
    // declaración de variable (la variable debe declararse antes de usarse)
    var x int
    // dar valor a la variable
    x = 3
    // definición corta usando := incluye definición de variable, especificando su tipo y dándole valor
    y := 4
    // una función que devuelve dos valores separados
    sum, prod := learnMultiple (x, y)
    // imprimir salida de forma sencilla y directa
    fmt.Println ("sum:", sum, "prod:", prod)
    learnTypes()
}
```

La definición de función puede tener múltiples coeficientes y valores de retorno. Por ejemplo, **learnMultiple** toma los coeficientes **x**, **y** ... y devuelve dos valores de **sum** y **prod** de tipo Int.

```go
func learnMultiple (x, y int) (sum, prod int) {
// separar los valores devueltos con una coma regular
return x + y, x * y
}
```

# Tipos de datos:

```go
func learnTypes() {
    // las declaraciones cortas generalmente cumplen el propósito deseado
    // definir una variable de texto usando comillas dobles
    str := "Learn Go!"
    // definir una variable de texto con comillas simples
    s2 := `A "raw" string literal can include line breaks.`
    // definir variable tipo runa que es otro nombre para el tipo int32 que contiene unicode
    g := 'Σ'
    // float
    f := 3.14195
    // definición de número complejo (Complex)
    c := 3 + 4i
    // definir variables usando var
    var u uint = 7 // número natural (entero positivo)
    var pi float32 = 22. / 7 // un decimal de 32 bits
    // definición corta byte (es otro nombre para uint8)
    n := byte ('\n')
    // arrays tienen un tamaño fijo, y son fijos en momento de compilación
    // definir un array int de 4 elementos con un valor inicial de cero
    var a4 [4] int
    // definir un array de 3 elementos con valores 3, 1 y 5
    a3 := [...] int {3, 1, 5}
```

Go ofrece un tipo de datos llamado Slices. Los Slices entendibles como "rebanadas", "porciones", "segmentos" tienen un tamaño dinámico. Las matrices (**array**) y los segmentos (**slice**) tienen ventajas, pero los casos de uso de los segmentos son más comunes. La siguiente instrucción define un segmento de tipo int

```go
    // observar la diferencia entre el array y la declaración del slice, donde cuando
    // el slice está definido no hay un número que determine su tamaño
    s3: = [] int {4, 5, 9}
    // definir un tipo int con cuatro elementos con valores cero
    s4: = make ([] int, 4)
    // solo definir, y no hay selección
    var d2 [] [] float64
    // método para convertir el tipo de texto en slice
    bs: = [] byte ("a slice")
```

Por la naturaleza de los slice dinámicos, es posible agregar nuevos elementos usando la función **append** incorporada. Primero se pasa el slice al que queremos agregar y luego los elementos que queremos agregar.

```go
    s := [] int {1, 2, 3}
    s = append (s, 4, 5, 6)
    // se imprimirá un slice con el siguiente contenido [1 2 3 4 5 6]
    fmt.Println (s)
```

Para agregar un slice a otro slice, pasamos los dos slices en la función en lugar de pasar elementos individuales, y siguiendo el segundo slice con tres puntos.

```go
    s = append (s, [] int {7, 8, 9} ...)
    // se imprimirá un slice con el siguiente contenido [1 2 3 4 5 6 7 8 9]
    fmt.Println (s)
```

La siguiente instrucción define las variables **p** y **q** como punteros en dos variables de tipo int que contienen dos valores devueltos por la función learnMemory:

```go
    p, q := learnMemory()
    // tema de reglas por ver
```

Cuando un asterisco precede a un cursor, significa el valor de la variable a la que se refiere el cursor, como en el siguiente ejemplo los valores de las dos variables devueltas por la función learnMemory:

```go
    fmt.Println (*p, *q)
```

Los mapas (**maps**) en Go son arrays dinámicos y modificables que son similares al tipo de diccionario o hash en otros lenguajes.

```go
    // aquí un mapa cuya clave es tipo texto y los valores de los elementos numéricos.
    m: = map [string] int {"three": 3, "four": 4}
    m ["one"] = 1
```

Las variables no utilizadas son errores. El subrayado, guion bajo, operador blanco o **Blank Identifier** de la siguiente manera hace usar la variable pero ignora valores al mismo tiempo:

```go
    _, _, _, _, _, _, _, _, _, _ = str, s2, g, f, u, pi, n, a3, s4, bs
```

# Valores de retorno con nombre:

A diferencia de otros lenguajes, las funciones pueden tener valores de retorno con nombre. Donde el nombre se devuelve al valor de la función en la línea de la definición de la función, esta característica permite regresar fácilmente desde cualquier punto de la función además del uso de la palabra **return** solo sin mencionar nada después:

```go
func learnNamedReturns (x, y int) (z int) {
    z = x * y
    // aquí implícitamente significa devolver el valor de la variable z
    return
}
```

**Nota:** El lenguaje Go se basa en gran medida en la recolección de basura. Go tiene indicadores pero no cálculos (puede confundir un cursor vacío, pero no puede aumentar el cursor). Tener cuidado con valores de retorno de nil pointer reference.

# Variables y memoria:

Las variables **p** y **q** a continuación son indicadores del tipo int y representan valores de retorno en la función. Cuando se define, los cursores están vacíos; sin embargo, el uso de la función incorporada **new** hace que el valor de la variable numérica **p** se refiera a cero, y por lo tanto ocupa espacio en la memoria; es decir, **p** ya no está vacío.

```go
func learnMemory() (p, q* int) {
    p = new(int)
    // definir un slice de 20 elementos como una sola unidad en la memoria.
    s := make([] int, 20)
    // dar valor a un elemento
    s[3] = 7
    // definir una nueva variable local a nivel de función
    r := -2
    // devolver dos valores de la función, que son direcciones de memoria 
    // para las variables s y r, respectivamente.
    return &s[3], &r
}

func expensiveComputation() float64 {
    return m.Exp (10)
}
```

# Control de sentencias

Las sentencias condicionales requieren corchetes ornamentados y no requieren paréntesis.

```go
func learnFlowControl() {
    if true {fmt.Println ("told ya" )
}

if false {
    // Rusters.
} else {
    // Gophers.
}
```

Usar la instrucción **switch** si se necesita escribir más de una secuencia condicional.

```go
x := 42.0
switch x {
    case 0:
    case 1:
    case 42:
    case 43:
    default:
}
```

Como sentencia condicional, la cláusula **for** no toma paréntesis. Las variables definidas en la cláusula for son visibles a nivel de la sentencia.

```go
for x: = 0; x <3; x ++ {
    fmt.Println ("iteration", x)
}
```

La instrucción for es la única instrucción de iteración en el lenguaje Go y tiene otra formas, de la siguiente manera:

```go
// repetición infinita
for {
    // break para detener la repetición
    break
    // continue para ir a la siguiente iteración
    continue
}
```

Se puede utilizar el **range** para pasar elementos de array, slice, text string, map, channel.

El **range** de canal (**channel**) devuelve un valor, y dos valores cuando se usa en slice, array, text string, o map.

```go
// ejemplo:
for key, value := range map [string] int {"one": 1, "two": 2, "three": 3} {
    // imprimir el valor de cada elemento del mapa
    fmt.Printf ("key =% s, value =% d \n", key, value)
}
```

Usar el guión bajo (**_**) contra valor de retorno en la clave si solo se desea el valor, de la siguiente manera:

```go
for _, name: = range [] string {"Bob", "Bill", "Joe"} {
    fmt.Printf ("Hello,% s \n", name)
}
```

Se puede usar la declaración corta con la sentencia condicional para que se defina una variable y luego se verifique en la sentencia de condición.

Por ejemplo se define una variable **y**, se le da un valor y luego se coloca la condición de la sentencia para que estén separadas por un punto y coma.

```go
if y := expensiveComputation(); y > x {
    x = y
}
```

Se puede definir funciones anónimas falsas directamente en el código.

```go
    xBig := func() bool {
        // x:= 42 que fue declarada antes donde de menciona la sentencia switch
        return x > 10000
    }
    x = 99999
    // la función xBig ahora devuelve el valor verdadero
    fmt.Println ("xBig:", xBig())
    x = 1.3e3
    // Después de modificar el valor de x a 1.3e3 que es igual a 1300 (es decir, mayor que 1000)
    // la función xBig devuelve falso
    fmt.Println ("xBig:", xBig())
```

Además de lo anterior, es posible definir función **fantasma** y llamarla en la misma línea y pasarla a otra función siempre que se llame directamente y el tipo de resultado sea consistente con lo esperado en el parámetro de la función.

```go
    fmt.Println ("Add + double two numbers:",
    func (a, b int) int {
        return (a + b) * 2
    } (10, 2))
    goto love
    love:
    learnFunctionFactory() // Una función que devuelve una función
    learnDefer() // Dormir
    learnInterfaces() // Trabajar con interfaces
}
```

# Generar funciones

Se puede tratar las funciones como objetos separados. Por ejemplo, crear una función y el valor de retorno es otra.

```go
func learnFunctionFactory() {
```

Los dos métodos siguientes para imprimir la oración son iguales, pero el segundo método es más claro, más legible y común.

```go
    fmt.Println(sentenceFactory ("summer") ("A beautiful", "day!"))

    d: = sentenceFactory ("summer")
    fmt.Println(d ("A beautiful", "day!"))
    fmt.Println(d ("A lazy", "afternoon!"))
}
```

Los decoradores se encuentran en algunos lenguajes de programación y en el mismo concepto en Go para que poder pasar datos a funciones.

```go
func sentenceFactory(mystring string) func(before, after string) string {
    return func(before, after string) string {
        return fmt.Sprintf ("%s %s %s", before, mystring, after)
    }
}
```

# Ejecución diferida

Se puede usar la función **defer** en funciones para realizar una acción antes de devolver el valor o resolver la funcion, y si se escribe más de una, el orden en ejecución de estas acciones es la contraria, como en learnDefer:

```go
func learnDefer() (ok bool) {
    // instrucciones diferidas se ejecutan antes de que la función devuelva el resultado.
    defer fmt.Println ("deferred statements execute in reverse (LIFO) order.")
    defer fmt.Println ("\nThis line is being printed first because")
    // defer se utiliza normalmente para cerrar un archivo después de abrirlo.
    return true
}
```

# Interfaces

Como ejemplo se define una función llamada **Stringer** que contiene una función llamada **String**; luego se define una estructura de dos dígitos de tipo int nombrados **x** y **y**.

```go
type Stringer interface {
    String() string
}

type pair struct {
    x, y int
}
```

Aquí se define la función **String** como un **pair**, convirtiéndose en un **pair** para la implementación de la interfaz **Stringer**. La variable **p** a continuación se llama receptor (**receiver**). Observar cómo se accede a los campos de estructura de **pair** utilizando el nombre de la estructura seguido de un punto y luego el nombre del campo.

```go
func(p pair) String() string {
    return fmt.Sprintf ("(%d, %d)", p.x, p.y)
}
```

Los puntos y comas se utilizan para crear un elemento de estructura (**struct**). Se usa la definición corta en el siguiente ejemplo para crear una variable llamada **p** y especificar su tipo en la estructura de **pair**.

```go
func learnInterfaces() {
    p := pair{3, 4}
    // llamar función String de pair
    fmt.Println(p.String())
    // definir una variable como i del tipo Stringer interface previamente definida 
    var i Stringer
    // esta igualdad es correcta, porque se aplica pair de Stringer
    i = p
    // se llama función String de la variable i de tipo Stringer y se obtiene
    // el mismo resultado que antes
    fmt.Println(i.String())
    // al pasar las variables anteriores directamente a las funciones de impresión y salida fmt,
    // estas funciones llaman a la función String para imprimir la representación de la variable. */
    // Las siguientes dos líneas dan el mismo resultado de impresión
    fmt.Println(p)
    fmt.Println(i)
    learnVariadicParams ("great", "learning", "here!")
}
```

# Múltiples entradas

Es posible pasar variedad de variables a funciones sin un número definido de parámetros.

```go
func learnVariadicParams (myStrings... interface{}) {
    // la siguiente iteración recorre los elementos de entrada de datos de la función.
    for _, param: = range myStrings {
        fmt.Println("param:", param)
    }
    // se pasa la entrada de la función variadica como parámetro de otra función (para Sprintln)
    fmt.Println ("params:", fmt.Sprintln(myStrings...))
    learnErrorHandling()
}
```

# Manejo de errores

La palabra clave **"ok"** se utiliza para determinar si una sentencia es correcta. Si ocurre un error, se puede usar una variable **err** para conocer más detalles sobre el error.

```go
func learnErrorHandling() {
    m := map [int] string{3: "three", 4: "four"}
    if x, ok := m[1]; !ok {
        // ok aquí será falso porque el número 1 no está en el mapa m
        fmt.Println("no one there")
    } else {
        // x será el valor en el mapa
        fmt.Print(x)
    }
    // aqui se intenta convertir valor de texto a número que resultará en un error, 
    // se imprimen los detalles del error si err no es nil */
    if _, err := strconv.Atoi("non-int"); err != nil {
        fmt.Println(err)
    }

    learnConcurrency()
}
```

# Ejecución simultánea

Usando una función anterior para hacer una suma numérica a algunos números en conjunto. Se usa **make** para crear una variable sin especificar un valor para ella.

```go
func learnConcurrency() {
    // se crea una variable de tipo canal llamada c
    c := make(chan int)
    // creando tres funciones Go concurrentes. Los números se incrementarán simultáneamente 
    // (en paralelo si el dispositivo está configurado para hacerlo).
    // todas las transmisiones irán al mismo canal
    // "go" aquí significa iniciar una nueva función
    go inc(0, c)
    go inc(10, c)
    go inc(-805, c)
    // luego hacer tres lecturas desde el mismo canal e imprimir los resultados.
    // no hay un orden de acceso de lectura desde el canal, y 
    // también cuando el canal aparece a la derecha de la operación 
    // <- significa que esta leyendo y recibiendo del canal
    fmt.Println(<-c, <-c, <-c)
    // nuevo canal con texto
    cs := make(chan string)
    // canal contiene canales de texto
    ccs := make(chan chan string) 
    // enviar valor 84 al canal c
    go func() {c <- 84}()
    // enviar palabra al canal cs
    go func() {cs <- "wordy"}()
    // instrucción select es similar a la instrucción switch, 
    // pero en cada caso contiene un proceso para un canal que 
    // está listo para comunicarse.
    select {
        // valor recibido del canal se puede guardar en una variable
        case i := <-c:
        fmt.Printf("it's a %T", i)
        case <-cs:
        fmt.Println("it's a string")
        // canal vacío pero listo para comunicarse
        case <-ccs:
        fmt.Println("didn't happen.")
    }

}
```
