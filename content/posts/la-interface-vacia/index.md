---
title: "Golang: La interfaz vacía"
date: 2021-04-22T23:06:22-05:00
draft: false
author: ZeroIdentidad
year: "2021"
month: "2021/04"
categories:
- Fundamentos
- Estandar
tags:
- fundamentos
- golang
keywords:
- fundamentos
disableComments: false
---

{{<postimage "images/interface-type.png" "Interface type">}}

Explicación breve sobre el tipo interfaz vacia y nula.

Se define una interfaz vacía como **interface{}**, y puede contener un valor de cualquier tipo:

<!--more-->

```go
var i interface{}
i = "hola gophers"
fmt.Println(i)
```

Si se necesita probar si una interfaz es de cierto tipo, se usa una aserción de tipo:

```go
var i interface{}
i = "hola gophers"
s, ok := i.(string)
if !ok {
    fmt.Println("s is not type string")
}
fmt.Println(s)
```

En el ejemplo anterior, **i** es un tipo string, por lo que el segundo valor de retorno de la aserción de tipo es verdadero (*ok*) y **s** contiene el valor por debajo de este. Si hubiera sido de otro tipo, como un **int**, entonces el **ok** habría sido falso y **s** habría sido el valor cero del tipo que se estaba tratando de afirmar, es decir, 0.

### Interfaz nula

Una interfaz en Go es esencialmente una tupla que contiene el tipo y el valor subyacentes. Para que una interfaz se considere nula, tanto el tipo como el valor deben ser nulos (**nil**). Ejemplo:

```go
package main

import (
    "fmt"
)

func main() {
    var i interface{}
    fmt.Println(i == nil)
    fmt.Printf("%T, %v\n", i, i)

    var s *string
    fmt.Println("s == nil:", s == nil)

    i = s
    fmt.Println("i == nil:", i == nil)
    fmt.Printf("%T, %v\n", i, i)
```

Salida:

```shell
true
<nil>, <nil>
s == nil: true
i == nil: false
*string, <nil>
```

Observar que la variable **s** es **nil**, pero cuando se establece la interfaz **i** en **s**, se verifica si **i** es **nil**, **i** no se considera **nil**. Esto se debe a que la interfaz tiene un tipo concreto por debajo establecido y las interfaces solo son nulas cuando tanto el tipo concreto como el valor son nulos.