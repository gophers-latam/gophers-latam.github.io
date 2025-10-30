---
title: "Go interview: Fundamentos testing"
date: 2025-09-01T13:53:44-06:00
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

Buenas prácticas y preguntas frecuentes sobre Testing en Golang.

<!--more-->

## ❓Indice preguntas

**1. ¿Cuáles son algunas de las prácticas recomendadas para escribir pruebas unitarias en Go?**

**2. Explique cómo usar pruebas manejadas por tablas en Go con un ejemplo.**

**3. ¿Qué es la simulación de pruebas (mocking) y cómo se gestiona? Dé un ejemplo.**

**4. ¿Cuál es la diferencia entre mock y stub?**

---

## ✅Respuestas

### 1. ¿Cuáles son algunas de las prácticas recomendadas para escribir pruebas unitarias en Go?

Al seguir las siguientes prácticas, se podrá crear pruebas unitarias más efectivas, fáciles de mantener e integrales en Go:

- ***Convención de nomenclatura***:
	- ***Agrupar pruebas por funcionalidad:*** Organizar los casos de prueba según características o módulos
	- ***Estructurar adecuadamente:*** Incluir un título claro, condiciones previas, pasos y resultados esperados para cada caso de prueba
	- ***Escribir casos de prueba claros y concisos:*** Asegurar que las pruebas tengan pasos sencillos y resultados esperados
	- Ej. Pruebas de funciones básicas:
		```go
		TestParseJSON
		TestCalculateTotal
		TestEncryptPassword
		TestGenerateUUID
		```
	- Ej. Pruebas de escenarios específicos:
		```go
		TestValidateEmail_EmptyString_ShouldFail
		TestValidateEmail_MissingAt_ShouldFail
		TestValidateEmail_Success
		```
	Para más información consultar la documentación oficial de [testing en Go](https://pkg.go.dev/testing)

- ***Utilizar pruebas manejadas por tablas:*** Este enfoque le permite ejecutar la misma lógica de prueba con diferentes entradas y salidas esperadas, lo que hace que las pruebas sean más completas y organizadas.

- ***Usar interfaces y simular dependencias externas:*** Esto ayuda a aislar la unidad de código que se está probando y evitar llamadas API externas o E/S de archivos.

- ***Cubrir casos extremos y condiciones límite:*** Asegurar que las pruebas incluyan varios escenarios, incluidos posibles casos extremos.

- ***Usar el flag -v con go test para aumentar verbosidad:*** Esto proporciona una salida más detallada sobre la ejecución de la prueba.

- ***Paralelizar pruebas cuando sea posible:*** Esto puede mejorar la velocidad de ejecución de las pruebas.

- ***Evitar aserción (afirmación) de mensajes de error directamente:*** Enfocarse en probar el comportamiento observable en lugar de los detalles de implementación.

- ***Usar subpruebas con t.Run():*** Esto permite verificar resultados con varias entradas en una función.

- Utilizar el paquete de pruebas integrado de Go y sus herramientas como go test -cover para el análisis de cobertura.

- Escribir pruebas que no estén demasiado vinculadas al código de producción para evitar interrupciones frecuentes de pruebas durante refactorización extensa.

---

### 2. Explique cómo usar pruebas manejadas por tablas en Go con un ejemplo.

Las pruebas manejadas por tablas en Go son una forma popular y eficiente de escribir pruebas unitarias para funciones con múltiples escenarios de entrada. Cómo usarlas:

1. Definir un slice o map de casos de prueba, cada uno de los cuales contenga parámetros de entrada y resultados esperados.
2. Iterar sobre los casos de prueba, ejecutando la función que se está probando con cada conjunto de entradas.
3. Comparar el resultado real obtenido con el resultado esperado para cada caso.

Aquí un ejemplo de una prueba manejada por tabla para una función `sum` simple:

```go
func TestSum(t *testing.T) {
    tests := []struct {
        name     string
        a        int
        b        int
        expected int
    }{
        {"números positivos", 10, 5, 15},
        {"cero y positivo", 0, 5, 5},
        {"números negativos", -3, -2, -5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := sum(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("sum(%d, %d) = %d; esperado: %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

Este enfoque ofrece varias ventajas:

1. Mejora legibilidad y facilidad de mantenimiento
2. Fácil incorporación de nuevos casos de prueba
3. Reducción de duplicación de código
4. Mejor cobertura de pruebas con múltiples escenarios

_Las pruebas manejadas por tablas son particularmente útiles para funciones con múltiples parámetros de entrada o lógica compleja que requieren varios escenarios de prueba._

---

### 3. ¿Qué es la simulación de pruebas (mocking) y cómo se gestiona? Dar un ejemplo.

La simulación es una técnica utilizada en las pruebas de software para crear objetos simulados que imitan el comportamiento de objetos reales. En Go, la simulación es especialmente útil para aislar unidades de código durante las pruebas y simular dependencias. Para manejar la simulación en Go:

- ***Usar interfaces:*** Definir interfaces flexibles de las dependencias para que sea más fácil simularlas.
- ***Librerías de simulación:*** Herramientas como GoMock pueden automatizar la creación de objetos simulados, reduciendo el código repetitivo.
- ***Usar inyección de constructor:*** Esto hace que sea más fácil inyectar simulaciones durante las pruebas mientras se usan implementaciones reales en producción.
- ***Concentrarse en el comportamiento, no en la implementación:*** Escribir pruebas que verifiquen los resultados esperados en lugar de secuencias de llamadas a métodos específicos.
- ***Utilizar comparadores integrados:*** Aprovechar los comparadores proporcionados por las librerías de simulación para hacer que las pruebas sean más flexibles.
- ***Limpieza después de las pruebas:*** Usar por ejemplo `defer ctrl.Finish()` para garantizar la limpieza adecuada de los objetos simulados.

#### Ejemplo:

Un ejemplo en el que se procede asi:
1. Definir la interface `UserRepository`
2. Crear una simulación de esa interface
3. Configurar las expectativas sobre la simulación
4. Usar la simulación en una prueba para verificar el comportamiento

Al usar simulaciones, se puede probar el `UserService` sin necesidad de una base de datos o API real, lo que hace que las pruebas sean rápidas y aisladas.

1. Primero, definir una interfaz:

```go
// user.go
package user

type UserRepository interface {
    GetUser(id int) (string, error)
}
```

2. Luego crear un servicio que utilice la interface:

```go
// service.go
package user

type UserService struct {
    repo UserRepository
}

func (s *UserService) GetUserName(id int) (string, error) {
    return s.repo.GetUser(id)
}
```

3. Para probar el servicio, crear (manualmente) o generar (con gotools) una simulación:

```bash
go get -u go.uber.org/mock
go install go.uber.org/mock/mockgen@latest
mockgen -source=user/user.go -destination=user/mocks/mock_userRepository.go -package=mocks
```

4. Por último, escribir una prueba usando la simulación generada:

```go
// service_test.go
package user

func TestGetUserName(t *testing.T) {
	for _, tt := range []struct {
		name     string
		id       int
		expected string
		err      error
	}{
		{"usuario obtenido correctamente", 1, "Gornio", nil},
		{"ID no válido debe devolver un error", 2, "", errors.New("usuario no encontrado")},
	} {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			mockRepo := mocks.NewMockUserRepository(ctrl)
			service := &UserService{repo: mockRepo}

			mockRepo.EXPECT().GetUser(tt.id).Return(tt.expected, tt.err)

			name, err := service.GetUserName(tt.id)
			if err != tt.err || name != tt.expected {
				t.Errorf("Esperado %s, obtenido %s con error %v", tt.expected, name, err)
			}
		})
	}
}
```

---

### 4. ¿Cuál es la diferencia entre mock y stub?

Los mocks (simulador de comportamiento) y stubs (simulador de datos) son dobles de prueba, utilizados en pruebas de software, pero tienen propósitos diferentes y tienen características distintivas:

1. Propósito:
   - Los mocks se utilizan para verificar el comportamiento y las interacciones entre objetos.
   - Los stubs se utilizan para proporcionar respuestas predeterminadas a las llamadas a métodos, centrándose en la verificación del estado.

2. Funcionalidad:
   - Los mocks se pueden programar para esperar llamadas a métodos, argumentos y orden de llamadas específicos.
   - Los stubs proporcionan respuestas consistentes y predefinidas a las llamadas de método sin verificar las interacciones.

3. Verificación:
   - Los mocks permiten verificar si se produjeron interacciones específicas durante la prueba.
   - Los stubs se centran en devolver datos predefinidos y no verifican las interacciones.

4. Complejidad:
   - Los mocks son generalmente más complejos y adecuados para probar sistemas intrincados con múltiples dependencias.
   - Los stubs son más simples y a menudo se utilizan para probar unidades aisladas con dependencias mínimas.

5. Uso:
   - Los mocks se utilizan normalmente cuando se desea garantizar interacciones correctas entre objetos.
   - Los stubs se utilizan cuando se necesita controlar la salida de dependencias para crear escenarios de prueba específicos.

6. Enfoque de prueba:
   - Los mocks se centran en la verificación del comportamiento, garantizando que los métodos se llamen correctamente.
   - Los stubs se centran en la verificación del estado, proporcionando resultados consistentes para las pruebas.

7. Flexibilidad:
   - Los mocks ofrecen mayor flexibilidad para especificar el comportamiento y las interacciones esperadas.
   - Los stubs son estáticos y proporcionan respuestas predecibles.

_En resumen, utilizar stubs para pruebas simples centradas en la funcionalidad y el estado, y utilizar mocks para pruebas más complejas que requieran verificación del comportamiento y verificación de la interacción._
