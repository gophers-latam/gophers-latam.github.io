---
title: "Go interview: Conceptos básicos"
date: 2025-09-01T13:52:58-06:00
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

Preguntas y respuestas de conceptos básicos de programación en Golang.

<!--more-->

## ❓Indice preguntas

**1. ¿Qué es Go y para qué tipos de proyectos es más adecuado?**

**2. Explique el sistema de tipos de Go y en qué se diferencia de otros lenguajes populares.**

**3. Explique la semántica de paso por valor y cómo funcionan los tipos de referencia en Go.**

**4. ¿Qué son las interfaces de Go y por qué son importantes?**

**5. ¿Cómo se implementa el polimorfismo en Go?**

**6. ¿Cuál es la diferencia entre las interfaces `nil` y las interfaces vacías en Go, cómo se gestionan las aserciones de tipo de forma segura?**

**7. ¿Qué son las funciones variádicas en Go y cuándo deben usarse?**

**8. ¿Qué es la palabra clave `iota` y cómo se usa en Go?**

**9. Explique comparando slices con arrays**

---

## ✅Respuestas

### 1. ¿Qué es Go y para qué tipos de proyectos es más adecuado?

**Go**, también conocido como **Golang**, es un lenguaje compilado y de tipado estático, diseñado para ofrecer simplicidad, rendimiento y un sólido soporte de concurrencia. Destaca en escenarios que requieren eficiencia y escalabilidad. Algunas de las áreas clave donde Go destaca son:

- ***Servidores web, microservicios, y APIs web:*** La librería estándar de Go proporciona herramientas potentes para crear servidores y clientes HTTP, lo que la hace ideal para el desarrollo backend.

- ***Sistemas distribuidos y nativos de la nube:*** Su diseño liviano y escalabilidad hacen que Go sea una opción natural para crear aplicaciones en contenedores e implementarlas en entornos de nube.

- ***Herramientas e infraestructura de DevOps:*** Herramientas como Docker y Kubernetes están escritas en Go debido a su velocidad, portabilidad y facilidad de implementación.

---

### 2. Explique el sistema de tipos de Go y en qué se diferencia de otros lenguajes populares.

Go cuenta con un sistema de tipado estático, lo que significa que los tipos de variables se determinan en tiempo de compilación. Esto garantiza previsibilidad y reduce el riesgo de errores en tiempo de ejecución, lo que lo distingue de los lenguajes de tipado dinámico. Las principales diferencias incluyen:

- ***Sin herencia basada en clases:*** En lugar de programación orientada a objetos tradicional con clases, Go se basa en interfaces y composición para estructurar el código. Este enfoque es más simple y promueve la flexibilidad.

- ***Tipificación fuerte:*** Go aplica reglas de tipado estrictas, lo que requiere conversiones explícitas entre tipos, a diferencia de lenguajes como JavaScript, donde la conversión de tipos implícita es común. Si bien Go no soporta características de tipado avanzadas como los tipos `sum` (uniones algebracias), introdujo genéricos en la versión 1.18 para mejorar la seguridad y la flexibilidad de los tipos.

---

### 3. Explique la semántica de paso por valor y cómo funcionan los tipos de referencia en Go.

En Go, todas las variables se `pasan por valor`. Esto significa que, al pasar una variable a una función, Go crea una copia de dicha variable. Sin embargo, el comportamiento difiere entre los **tipos por valor** [ej: ints, structs] y los **tipos por referencia** [ej: slices, maps, channels] debido a cómo almacenan los datos. Para los **Tipos por Valor**: int, float, bool, string, structs y arrays, se crea una copia completa de los datos.

#### Tipos por Referencia: slices, maps, channels

Los tipos por referencia contienen internamente un **puntero a una estructura de datos subyacente o por debajo**. Al pasarlos a una función:

- Se copia el **encabezado** (header), por ejemplo: la longitud/capacidad del slice y puntero del map
- Los **datos subyacentes** se comparten.
- **Slices**: El encabezado (longitud/capacidad y puntero al array por debajo) es copiado, pero ambos encabezados apuntan al mismo array.
- **Maps**: El encabezado (puntero a la tabla hash) se copia, pero ambos apuntan a los mismos datos.

| Operación | ¿Afecta al original? | Por qué |
| :-- | :-- | :-- |
| Modificar elementos | Si | Datos subyacentes compartidos (array, tabla hash, etc.) |
| Reasignar variable | No | Sólo modifica la copia local del encabezado |
| Añadir/cambiar tamaño | "No" | Crea nuevos datos para la copia local (a menos que se devuelvan y reasignen) |

#### Cuándo utilizar punteros

Usar punteros explícitamente para:

1. Modificar el encabezado (ej: longitud/capacidad del slice):

```go
func growSlice(s *[]int) {
    *s = append(*s, 100)
}
```

2. Evitar copiar estructuras grandes:

```go
func processBigStruct(b *BigStruct) { ... }
```

#### **Conclusiones clave**
- Go **siempre** pasa copias de variables.
- Los tipos por referencia (slices, maps, channels) comparten datos subyacentes pero tienen encabezados aislados.
- Para modificar los encabezados (ej: longitud de slice), retornar el valor modificado o utilizar punteros.
- Los cambios en los **elementos** son visibles globalmente; los cambios en los **encabezados** son locales.

_Este diseño equilibra eficiencia (sin copia profunda) con seguridad (sin efectos secundarios no deseados por cambios de encabezado)._

---

### 4. ¿Qué son las interfaces de Go y por qué son importantes?

Las interfaces de Go proporcionan una forma única de abstracción de tipos, distinta a la de lenguajes como Java. En Go, las interfaces se implementan ***implícitamente***, lo que significa que un tipo satisface una interface simplemente implementando sus métodos, sin necesidad de declarar explícitamente que la implementa. Go adopta la filosofía del "duck typing": ***si grazna como un pato, entonces es un pato***. Si un tipo proporciona todos los métodos definidos por una interfaz, se considera que la implementa. Este enfoque permite un código altamente dinámico y adaptable.

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type MyReader struct{}

func (m MyReader) Read(p []byte) (n int, err error) {
    // implementación ...
}
```
En este ejemplo, el tipo `MyReader` implementa implícitamente la interfaz `Reader` porque define el método `Read`. No se requiere una declaración explícita.

Las interfaces de Go en este sentido son conjuntos de firmas de métodos que definen un conjunto de comportamientos para los tipos. Son importantes por varias razones:

- ***Implementación implícita:*** Este diseño hace que las interfaces de Go sean livianas y altamente flexibles, fomentando el acoplamiento flexible y simplificando el mantenimiento del código.

- ***Polimorfismo:*** Las interfaces permiten un comportamiento polimórfico, permitiendo que se utilicen diferentes tipos de manera intercambiable siempre que implementen los métodos requeridos.

- ***Desacoplamiento:*** Las interfaces ayudan a reducir las dependencias entre diferentes partes del código base, lo que promueve diseños más modulares y flexibles.

- ***Reutilización de código:*** Al usar interfaces, los desarrolladores pueden escribir código más genérico que funcione con cualquier tipo que implemente la interfaz, lo que reduce la duplicación de código.

- ***Pruebas:*** Las interfaces facilitan la creación de objetos simulados para pruebas unitarias, lo que mejora la capacidad de pruebas del código.

- ***Composición sobre herencia:*** Las interfaces en Go fomentan la `composición` en lugar de la herencia jerárquica, lo que genera estructuras de código más flexibles y fáciles de mantener.

- ***Abstracción tardía:*** El diseño de la interface de Go permite definir abstracciones a medida que se hacen evidentes, en lugar de forzar decisiones tempranas sobre jerarquías de tipos.

- ***Reflexión y afirmaciones de tipo:*** Las interfaces permiten la inspección y manipulación de tipos en tiempo de ejecución a través de la reflexión y las afirmaciones de tipo.

_Las interfaces en Go proporcionan una herramienta para crear código limpio, modular y extensible al definir contratos de comportamiento que los tipos pueden cumplir sin declaraciones explícitas._

---

### 5. ¿Cómo se implementa el polimorfismo en Go?

Go implementa el polimorfismo principalmente mediante interfaces, sin usar genéricos. Este enfoque se conoce como polimorfismo en tiempo de ejecución. Estas son las claves para lograrlo:

- ***Polimorfismo basado en interfaces***: Definir interfaces que especifiquen un conjunto de métodos y luego implementarlas en diferentes tipos. Esto permite un código flexible que puede funcionar con cualquier tipo que cumpla con el contrato de interface.

- ***Afirmaciones de tipo [type assertion] y cambios de tipo [type switch]***: Estos mecanismos permiten la verificación de tipos en tiempo de ejecución y la ramificación en función de tipos concretos, lo que habilita un comportamiento polimórfico.

- ***Interfaz vacía (interface{})***: Se puede usar para aceptar cualquier tipo, lo que proporciona una forma de polimorfismo a costa de la seguridad del tipo.

- ***Valores función y closures***: Se pueden usar para crear un comportamiento polimórfico al pasar funciones como argumentos o devolverlas desde otras funciones.

- ***Incrustación***: La incrustación de structs (embedding) permite una forma de composición que puede lograr algunos comportamientos polimórficos.

_Estas técnicas permiten que Go admita polimorfismo sin la necesidad de genéricos, manteniendo el enfoque del lenguaje en la simplicidad y la seguridad de tipos en tiempo de compilación._

---

### 6. ¿Cuál es la diferencia entre la interface `nil` (nula) y la interface vacía en Go, cómo se gestionan las aserciones de tipo de forma segura?

La diferencia entre la interface `nil` (nula) y la interface vacía en Go es sutil pero importante:

#### Interface nil (nula)
- Una interface nil tiene tanto su tipo como su valor establecidos en nil.
- Es el valor cero por defecto de un tipo de interface.
- La comprobación directa de nulo (ej: `if x == nil`) funciona como se espera.

#### Interface vacía
- Una interface vacía (`interface{}`) puede contener valores de cualquier tipo.
- Puede contener un valor nil de un tipo concreto, pero la interface en sí no es nil.
- La comprobación directa de nulo puede ser engañosa.

#### Para manejar afirmaciones de tipo de forma segura:

- Usar la forma de par de valores de la afirmación de tipo:

   ```go
   value, ok := x.(Type)
   if ok {
       // afirmación de tipo exitosa
   } else {
       // afirmación de tipo fallida
   }
   ```

- Manejar cambios de tipo para múltiples tipos posibles de valor:

   ```go
   switch v := x.(type) {
   case string:
       // v es string
   case int:
       // v es int
   default:
       // type desconocido
   }
   ```

- Para realizar comprobaciones nulas en interfaces, con reflexión:

   ```go
   func IsNil(value interface{}) bool {
       return reflect.ValueOf(value).IsNil()
   }
   ```

_Estos métodos ayudan a prevenir `panics` y proporcionan conversiones de tipos más seguras cuando se trabaja con interfaces._

---

### 7. ¿Qué son las funciones variádicas en Go y cuándo deben usarse?

Las funciones variádicas en Go son funciones que aceptan un número variable de argumentos del mismo tipo. Se definen mediante puntos suspensivos (**...**) antes del tipo del último parámetro en la firma de la función.

Características clave de las funciones variádicas:

- Permiten pasar un número arbitrario de argumentos, incluido cero argumentos.
- El parámetro variádico debe ser el último en la definición de la función.
- Internamente, Go trata los argumentos variádicos como un slice del tipo especificado.

Cuándo utilizar funciones variádicas:

- Para aceptar un número arbitrario de argumentos sin crear un slice temporal.
- Cuando se desconoce el número de parámetros de entrada en momento de compilación.
- Para mejorar la legibilidad del código y crear API más flexible.
- Para simular argumentos opcionales en llamadas de función.

Ejemplos de funciones variádicas en Go incluyen `fmt.Println()` en la **stdlib** y funciones personalizadas como:

```go
func sum(nums ...int) int {
    total := 0
    for _, num := range nums {
        total += num
    }

    return total
}
```

Esta función se puede llamar con cualquier número de argumentos **int**:

```go
sum(1, 2, 3)
sum(10, 20)
sum()
```

_Las funciones variádicas proporcionan una forma limpia y elegante de manejar funciones con un número variable de argumentos._

---

### 8. ¿Qué es la palabra clave `iota` y cómo se usa en Go?

The `iota` keyword in Go is a special identifier used in constant declarations to create a sequence of related constants with incrementing values. Here are the key points about `iota`:

La palabra clave `iota` en Go es un identificador especial que se utiliza en las declaraciones de constantes para crear una secuencia de constantes relacionadas con valores incrementales. Puntos clave sobre `iota`:

1. Genera constantes de enteros comenzando desde 0 y aumentando en 1 para cada constante subsiguiente dentro de un bloque `const`.
2. `iota` se restablece a 0 siempre que la palabra clave `const` aparece en el código fuente.
3. Se utiliza comúnmente para crear enumeraciones (`enums`) o conjuntos de constantes relacionadas.
4. `iota` se puede utilizar en expresiones, lo que permite definiciones de constantes más complejas.

Ejemplo de uso:

```go
const (
    Monday = iota    // 0
    Tuesday          // 1
    Wednesday        // 2
    Thursday         // 3
    Friday           // 4
)
```

`iota` en expresiones complejas:

```go
const (
    KB = 1 << (10 * iota)  // 1 << (10 * 0) = 1
    MB                     // 1 << (10 * 1) = 1024
    GB                     // 1 << (10 * 2) = 1048576
)
```

_El uso de `iota` simplifica la creación de constantes relacionadas, lo que hace que el código sea más fácil de mantener y menos propenso a errores al definir secuencias de valores como estandar._

---

### 9. Explique comparar slices con arrays

Los slices en Go son una forma flexible y dinámica de trabajar con colecciones de elementos. Son mucho más comunes en el código de aplicaciones que los arrays debido a su versatilidad y dinamismo. A continuación, se explica cómo los slices se diferencian de los arrays:

#### Tamaño dinámico

A diferencia de los arrays, los slices pueden crecer o decrecer dinámicamente. Actúan como referencias a un array subyacente (por debajo), lo que permite operaciones como el cambio de tamaño sin necesidad de definir un tamaño fijo de antemano. Esto hace que los slices sean más adaptables a escenarios donde el número de elementos se desconoce.

```go
arr := [5]int{1, 2, 3, 4, 5} // Array - tamaño fijo
slc := arr[:3]               // Slice - referencia de los primeros 3 elementos
```

#### Array subyacente

Los slices no almacenan datos por sí mismos, sino que apuntan a un array subyacente (por debajo). Este diseño las hace eficientes para transferir grandes conjuntos de datos entre funciones sin copiar todo el conjunto de datos.

Ejemplo:

```go
func modify(s []int) {
    s[0] = 99 // Modificar array subyacente compartido
}

arr := [5]int{1, 2, 3, 4, 5}
slc := arr[:]
modify(slc)
fmt.Println(arr) // Salida: [99 2 3 4 5]
```

_Los slices son livianos y poderosos en Go, permiten operaciones dinámicas y al mismo tiempo mantienen la eficiencia a través de la memoria compartida con sus arrays de respaldo (subyacentes)._