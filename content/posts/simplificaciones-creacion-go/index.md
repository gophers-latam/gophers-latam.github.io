---
title: "Simplificaciones en creación de Go"
date: 2024-05-05T19:15:14-06:00
draft: false
author: zeroidentidad
year: "2024"
month: "2024/05"
categories:
- Comunidad
- Experiencias
- Creadores
tags:
- basis
- golang
keywords:
- creators
disableComments: false
---

{{<postimage "images/gophers.jpg" " The Go Gopher https://go.dev/blog/gopher/header.jpg">}}

Para apostar todo por la expresividad del lenguaje entiéndase como hacer más fácil o comprensiva la lectura y escritura, en la creación de Go se establecieron simplificaciones fundamentales bajo la premisa "Less can be more".

<!--more-->

- Nota: en el transcurso de los años alguno que otro punto puede variar o haber derivado en otros cambios.

1. **Regular syntax (don't need a symbol table to parse):** [Sintaxis regular (no necesita una tabla de símbolos para analizar)] Se refiere a una sintaxis de lenguaje de programación que es predecible y coherente, lo que facilita el análisis del código sin necesidad de una tabla de símbolos compleja.

2. **Garbage collection (only):** [Recolección de basura (solamente)] Es un proceso automático en el que el sistema de ejecución de un lenguaje de programación gestiona automáticamente la memoria liberando objetos que ya no son necesarios.

3. **No header files:** [No hay archivos de encabezado] En algunos lenguajes de programación, como C y C++, los archivos de encabezado (.h) se utilizan para declarar funciones, tipos y variables que se comparten entre varios archivos fuente (.c o .cpp). En Go, no se utilizan archivos de encabezado.

4. **Explicit dependencies:** [Dependencias explícitas] Se refiere a tener que especificar claramente las dependencias que un módulo de software tiene con otros módulos, en lugar de depender de importaciones implícitas o automáticas.

5. **No circular dependencies:** [No hay dependencias circulares] Se refiere a una restricción en la cual dos o más módulos dependen uno del otro de manera circular, lo cual puede causar problemas de compilación y diseño de software.

6. **Constants are just numbers:** [Las constantes son solo números] En Go, las constantes pueden ser cualquier tipo de valor constante, no solo números, pero aquí se hace referencia específicamente a que las constantes pueden ser valores numéricos.

7. **Int and int32 are distinct types:** [Int y int32 son tipos distintos] En Go, int y int32 son tipos de datos distintos. Aunque int es una palabra clave para un tipo de entero de tamaño variable en función de la arquitectura, int32 es específicamente un tipo de entero de 32 bits.

8. **Letter case sets visibility:** [El caso definido de las letras establece la visibilidad] En Go, los nombres de variables, funciones y tipos que comienzan con una letra mayúscula son visibles fuera de su paquete (exportados), mientras que los nombres que comienzan con una letra minúscula son privados y solo visibles dentro del paquete.

9. **Methods for any type (no classes):** [Métodos para cualquier tipo (no clases)] En Go, puedes definir métodos en cualquier tipo de datos, no solo en clases o estructuras. Esto se hace utilizando receptores.

10. **No subtype inheritance (no subclasses):** [No hay herencia de subtipo (no hay subclases)] En Go, no hay concepto de clases ni herencia de subclases como en lenguajes orientados a objetos tradicionales. En su lugar, se utilizan interfaces para lograr polimorfismo.

11. **Package-level initialization and well-defined order of initialization:** [Inicialización a nivel de paquete y orden de inicialización bien definido] En Go, las variables globales en un paquete pueden ser inicializadas con valores constantes o mediante funciones de inicialización definidas en el mismo paquete. La inicialización se realiza en un orden específico.

12. **Files compiled together in a package:** [Archivos compilados juntos en un paquete] En Go, todos los archivos fuente de un paquete se compilan juntos en un solo paquete. No hay archivos de encabezado ni una separación física entre la declaración y la definición de las funciones y tipos.

13. **Package-level globals presented in any order:** [Variables globales a nivel de paquete presentadas en cualquier orden] Las variables globales en un paquete de Go pueden ser declaradas y definidas en cualquier orden dentro del archivo fuente del paquete.

14. **No arithmetic conversions (constants help):** [No hay conversiones aritméticas (las constantes ayudan)] En Go, las conversiones automáticas entre tipos numéricos no se realizan implícitamente, lo que ayuda a evitar errores y promueve una mayor precisión.

15. **Interfaces are implicit (no "implements" declaration):** [Las interfaces son implícitas (no hay declaración de "implements")] En Go, no necesitas declarar explícitamente que una estructura o tipo implementa una interfaz. Si una estructura implementa todos los métodos de una interfaz, se considera que implementa automáticamente esa interfaz.

16. **Embedding (no promotion to superclass):** [Incorporación (sin promoción a superclase)] En Go, puedes embeber un tipo de estructura dentro de otro, lo que permite la composición de objetos. Sin embargo, no hay promoción automática de métodos como en algunos otros lenguajes orientados a objetos.

17. **Methods are declared as functions (no special location):** [Los métodos se declaran como funciones (sin ubicación especial)] En Go, los métodos se declaran dentro del cuerpo del paquete, junto con otras funciones.

18. **Methods are just functions:** [Los métodos son solo funciones] En Go, los métodos son simplemente funciones que toman un receptor como su primer argumento.

18. **Interfaces are just methods (no data):** [Las interfaces son solo métodos (no datos)] En Go, las interfaces se componen solo de una lista de métodos que los tipos que las implementan deben proporcionar.

19. **Methods match by name only (not by type):** [Los métodos coinciden solo por nombre (no por tipo)] En Go, dos métodos diferentes en dos tipos diferentes pueden tener el mismo nombre sin conflicto, siempre y cuando se apliquen a tipos diferentes.

20. **No constructors or destructors:** [No hay constructores ni destructores] En Go, no hay métodos especiales para la inicialización o destrucción de objetos, como en algunos lenguajes orientados a objetos. En su lugar, se utilizan funciones de inicialización y limpieza según sea necesario.

21. **Postincrement and postdecrement are statements, not expressions:** [El postincremento y el postdecremento son declaraciones, no expresiones] En Go, los operadores de postincremento (i++) y postdecremento (i--) se consideran declaraciones independientes y no pueden usarse como parte de expresiones más grandes.

22. **No preincrement or predecrement:** [No hay preincremento ni predecremento] En Go, los operadores de preincremento (++i) y predecremento (--i) no están disponibles.

23. **Assignment is not an expression:** [La asignación no es una expresión] En Go, la asignación de variables no devuelve un valor, por lo que no se puede utilizar como parte de una expresión más grande. Por ejemplo, x = y no devuelve ningún valor.

24. **Evaluation order defined in assignment, function call (no "sequence point"):** [Orden de evaluación definido en la asignación, llamada de función (sin "punto de secuencia")] Se refiere al hecho de que en Go, el orden en el que se evalúan las expresiones dentro de una asignación o llamada de función está bien definido y no hay un "punto de secuencia" como en otros lenguajes donde el comportamiento puede ser ambiguo.

25. **No pointer arithmetic:** [No hay aritmética de punteros] En Go, no se permite realizar operaciones aritméticas directamente en punteros, como en lenguajes como C o C++.

26. **Memory is always zeroed:** [La memoria siempre está inicializada a cero] En Go, la memoria asignada se inicializa siempre con cero, lo que significa que las variables y estructuras de datos se inicializan automáticamente a sus valores cero por defecto.

27. **Legal to take address of local variable:** [Legal tomar la dirección de una variable local] En Go, es perfectamente válido tomar la dirección de una variable local y pasarla a funciones o devolverla como un valor, sin preocuparse por el tiempo de vida de la variable.

28. **No "this" in methods:** [No hay "this" en métodos] A diferencia de otros lenguajes orientados a objetos, en Go no hay una palabra clave "this" para referirse al receptor en los métodos. En su lugar, se utiliza el nombre del receptor como el primer parámetro de los métodos.

29. **Segmented stacks:** [Pilas segmentadas] Go utiliza pilas segmentadas para manejar la memoria de forma eficiente, lo que permite una mejor gestión del espacio de la pila en situaciones de concurrencia y recursión profunda.

30. **No const or other type annotations:** [No hay "const" u otras anotaciones de tipo] En Go, no hay una palabra clave "const" que sea como en otros lenguajes de programación. Además, las anotaciones de tipo no son necesarias ya que el compilador puede inferir el tipo de manera automática.

31. **No templates:** [No hay plantillas] A diferencia de algunos lenguajes como C++ que tienen plantillas, Go no proporciona un mecanismo de plantillas para la generación de código genérico.

32. **No exceptions:** [No hay excepciones] Go no utiliza excepciones como mecanismo para manejar errores excepcionales. En su lugar, se prefieren los valores de retorno de error explícitos.

33. **Builtin string, slice, map:** [String, slice y map incorporados] En Go, los tipos string, slice y map son tipos de datos incorporados en el lenguaje y proporcionan funcionalidad para manejar cadenas, listas dinámicas y mapas respectivamente.

35. **Array bounds checking:** [Comprobación de límites de array] En Go, se realizan comprobaciones de límites de array en tiempo de ejecución para asegurar que no se acceda a índices fuera del rango válido del array, lo que ayuda a prevenir errores de segmentación y otros problemas relacionados con el acceso fuera de los límites del array.


- Fuente de referencia: https://commandcenter.blogspot.com/2012/06/less-is-exponentially-more.html