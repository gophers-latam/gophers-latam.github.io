---
title: "Codelab. Implementemos una api REST con Go 2"
date: 2024-02-10T08:33:31-03:00
draft: false
author: Andrés Reyes, el Programador Pobre
year: "2024"
month: "2024/02"
categories:
- golang
- REST
- api
tags:
- api
- REST
- aprendizaje
- Codelab
keywords:
- api rest
disableComments: false
---


{{<postimage "images/resting_iguana.png" "Resting iguana. Gentileza Eric Kilby https://flic.kr/p/2cwgj8o under the terms of the cc-by-sa-2.0">}}

¡Bienvenidos al segundo codelab construyendo una api REST con Go! En este artículo de la serie veremos cómo construir tests para nuestros handlers.

¡Manos a la obra!
<!--more-->

---

Esta serie se compone de los siguientes artículos que se irán publicando progresivamente.

* [Codelab 1](/posts/2024/02/codelab.-implementemos-una-api-rest-con-go/). Configuración de la aplicación, router, repositorio para acceder a datos y primer endpoint.
* Codelab 2. Testeando enpoints. Simulando una petición http.
* Codelab 3. Implementando endpoint con filtrado.
* Codelab 4. Implementando endpoint para actualizar una entidad.
* Codelab 5. Refactorizando. Reemplazando nuestro router por una librería.

En el primer codelab hemos construido una base para api REST consistente, componible y extensible. En este, discutiremos cómo construir tests para nuestros handlers haciendo extensivo uso del poder de las interfaces.

Para poder hacer uso de nuestra api, nuestros usuarios deberán usar algún tipo de *cliente* que permita conectarse a su servicio. En efecto, aplicaciones cómo curl, postman, o incluso un navegador web pueden hacer las veces de cliente. Con ellos pueden hacer **peticiones** que apuntan a los endpoints registrados en nuestra api. Por lo tanto, si queremos testear nuestro handler, es conveniente hacerlo *simulando* las peticiones que puede manejar, y es exactamente eso lo que implementaremos a continuación.

Hablamos de *simular peticiones* porque nuestra aplicación no necesitará estar ejecutándose cuando ejecutemos los tests, recordemos que estos deben ser [aislados, independientes y auto validantes](https://github.com/tekguard/Principles-of-Unit-Testing), y no depender de elementos ambientales. 

Entonces, tal cómo los usuarios de nuestra api necesitan un cliente para acceder a sus servicios, empezaremos por simular un cliente HTTP y configuraremos nuestros tests para usar ese cliente simulado. De esta forma cada test puede *declarar* la respuesta simulada correcta para cada uno de ellos y usarla para comprobar el funcionamiento del handler que estamos probando.

## Para eso necesitamos una interface

Una [interface](https://www.linkedin.com/pulse/go-interfaces-es-lo-que-hace-dice-andr%2525C3%2525A9s-reyes%3FtrackingId=n8US5wBiLtZIxA18N4cXHg%253D%253D/?trackingId=n8US5wBiLtZIxA18N4cXHg%3D%3D) no es más que un grupo de métodos al que le damos un nombre. Cualquier *struct* que posea los métodos que declaramos en la interface se dice que la *implementa*.

## Construyendo el cliente HTTP mock

Observe el siguiente código.

```go
import (
	"net/http"
)

type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}
```

Definimos una interface que expone el método `Do`, el cual recibe cómo argumento un request y devuelve una respuesta y el posible error ocurrido durante el procesamiento de la petición.


```go
type MockClient struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockClient) Do(req *http.Request) (*http.Response, error) {
	return m.DoFunc(req)
}
```

Construimos un struct que *implementa* dicha interface. En este struct definimos una variable de tipo función que será invocada cuando se llame al método expuesto en el struct. Así podemos cargar la funcionalidad que necesitemos en cada test, pues cada uno  probará un handler diferente.


## Iniciando los tests en modo simulación

Cómo al ejecutarse los tests, no ejecutaremos el binario de la aplicación, no se cargarán ni procesarán los flags modificadores de la línea de comando, por lo que no podemos confiar en ellos para construir las configuraciones de la aplicación, pero eso no nos preocupa pues los valores por defecto de éstas son suficientes para probar nuestros handlers, con excepción de la configuración del modo de simulación. 

Para poder establecer que usaremos el modo simulación en los test, agreguemos en el archivo *config/config.go* el siguiente código.

```go
// config/config.go

func Mock() bool {
	return cfg.Mock
}

func SetMockingOn() {   // nueva función
	cfg.Mock = true
}

func SetMockingOff() {  // nueva función
	cfg.Mock = false
}
```

Las funciones `SetMockingOn` y `SetMockingOff` nos permiten activar y desactivar el modo de simulación de acceso a base de datos ¡Justo lo que necesitamos para nuestros tests!

Cree el archivo *api/v1/handler/actor_test.go* y escriba en el siguiente función que usaremos para crear una instancia del cliente mock preparada para ser usada con `ActorHandler`


```Go
// newActorClient retorna una instancia que implementa la interface [mocks.HTTPClient] preparada para usar contra [ActorHandler]
func newActorClient() mocks.HTTPClient {

    // Construimos una instancia de *mocks.MockClient
	client := &mocks.MockClient{
        // En su campo DoFunc cargamos la función que se ejecutará al invocar al método 
        // mocks.MockClient.Do
		DoFunc: func(r *http.Request) (*http.Response, error) {

            // Preparamos un writer para escribir en algún buffer la respuesta de nuestro handler
			w := httptest.NewRecorder()

            // instanciamos nuestro handler
			actorHandler := ActorHandler{}

            // invocamos al método que queremos probar
			actorHandler.GetActorByID(w, r)

            // Tomamos desde el writer la respuesta escrita por nuestro handler en el buffer
			resp := w.Result()

            // y la devolvemos para que sea usada en nuestro test
			return resp, nil
		},
	}

    // finalmente devolvemos nuestro cliente mock
	return client
}
```


Con esto ya podemos escribir el test en el mismo archivo. Primero construimos un slice con casos de prueba. Para este ejemplo nos basta con uno.

```go

// actorRequestCases contiene los casos de prueba para nuestro handler
var actorRequestCases = []struct {
    // url es path del endpoint a testear
	url          string
    // expectedData es la respuesta esperada
	expectedData ActorResponse
}{
	{
		url: "/actor/10",        
		expectedResponse: ActorResponse{
			Status: "ok",
			Code:   200,

            // usamos una función anónima autoejecutable para obtener el model.Actor a guardar en
            // el nodo data de la respuesta esperada debido a que el modelo retorna una tupla 
            // con el valor del posible error de la obtención del actor
			Data: func() model.Actor {
				a, _ := (model.MockActorCrud{}).Get(db.DB(), 1)
				return a
			}(),
		},
	},
}
```


Y luego escribimos la función test propiamente dicha.

```go

func TestActorGetByID(t *testing.T) {

    // Inicializamos el modo de configuración
	config.SetMockingOn()

    // instanciamos nuestro cliente HTTP mock
	client := newActorClient()

	for _, tesCase := range actorRequestCases {

        // Preparamos la simulación de la petición
		req, err := http.NewRequest("GET", tesCase.url, nil)

		if err != nil {
			t.Log(err)
			t.FailNow()
		}

        // Ejecutamos la petición
		resp, err := client.Do(req)

		if err != nil {
			t.Log(err)
			t.FailNow()
		}

		defer resp.Body.Close()

        // y terminamos haciendo las comprobaciones para saber si nuestro handler funcionó correctamente
		if resp.StatusCode != tesCase.expectedResponse.Code {
			t.Logf("Expected status code %d, got %d", tesCase.expectedResponse.Code, resp.StatusCode)
			t.FailNow()
		}

		var dataMap map[string]interface{}

		err = json.NewDecoder(resp.Body).Decode(&dataMap)

		if err != nil {
			t.Logf("expected error to be nil while reading body response. got %v", err)
			t.FailNow()
		}

		actor, ok := dataMap["data"].(map[string]interface{})

		if !ok {
			t.Log("couldn't extract actor info from response")
			t.FailNow()
		}

        // Debemos convertir a model.Actor debido a que el nodo Data es de tipo interface{}
		expectedActor := tesCase.expectedResponse.Data.(model.Actor)

		if actor["firstName"] != expectedActor.FirstName {
			t.Logf("Expected actor name to be %s, got, got %s", expectedActor.FirstName, actor["firstName"])
			t.FailNow()
		}

		if actor["lastName"] != expectedActor.LastName {
			t.Logf("Expected actor name to be %v, got %s", expectedActor.LastName, actor["lastName"])
			t.FailNow()
		}

		if actor["lastUpdate"] != expectedActor.LastUpdate.Format("2006-01-02T15:04:05Z07:00") {
			t.Logf("Expected actor name to be %v, got %s", expectedActor.LastUpdate, actor["lastUpdate"])
			t.FailNow()
		}

	}
}

```

Al ejecutar nuestro test, sin levantar la api, podremos ver algo parecido a:

```bash
$ go test -timeout 256s -run ^TestActorGetByID$ restexample/api/v1/handler

ok  	restexample/api/v1/handler	0.001s
```


Otra gran ventaja de esta aproximación es que podemos construir benchmarks que reflejen el costo de nuestro código **sin tener en cuenta el de la conexión a base de datos**  ¡Claro, si podemos ejecutarlos en modo simulación!

```go


func BenchmarkActorGetByID(b *testing.B) {
	config.SetMockingOn()

	client := newActorClient()

	testCase := actorRequestCases[0]
	req, _ := http.NewRequest("GET", testCase.url, nil)

	b.ResetTimer()

	for i := 0; i <= b.N; i++ {
		_, _ = client.Do(req)
	}

}

```

El cual al ser ejecutado nos muestra:

```bash
go test -benchmem -run=^$ -bench ^BenchmarkActorGetByID$ restexample/api/v1/handler

goos: linux
goarch: amd64
pkg: restexample/api/v1/handler
cpu: Intel(R) Core(TM) i7-10700 CPU @ 2.90GHz
BenchmarkActorGetByID-16    	  651514	      1873 ns/op	    1068 B/op	      19 allocs/op
PASS
ok  	restexample/api/v1/handler	1.242s
```

Cómo habíamos construido también un benchmark para `MockActorCrud` podemos ejecutarlo y tener una idea del costo verdadero de nuestro flujo.

```bash
go test -benchmem -run=^$ -bench ^BenchmarkActorGetMock$ restexample/db/model

goos: linux
goarch: amd64
pkg: restexample/db/model
cpu: Intel(R) Core(TM) i7-10700 CPU @ 2.90GHz
BenchmarkActorGetMock-16    	 3281428	       368.1 ns/op	     163 B/op	       4 allocs/op
PASS
ok  	restexample/db/model	1.581s
```


Por lo tanto, podemos decir que de los *1873 ns/op* que tarda en ejecutarse el flujo del handler que estamos probando, al menos *368.1 ns/op* son debido a `MockActorCrud.Get`. Lo mismo podemos inferir del consumo de memoria y de la cantidad de direccionamientos.


Y con esto llegamos al final del segundo codelab. Le agradecemos por haber llegado hasta aquí. Como siempre le proveemos el código escrito en [este](https://github.com/profe-ajedrez/codelab_api_rest/tree/codelab_2) repositorio.

Si le gustó este artículo no olvide compartirlo, y si después de seguirlo le quedan dudas o preguntas le esperamos en los comentarios.
