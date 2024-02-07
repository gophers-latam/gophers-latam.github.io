---
title: "CodeLab. Implementemos un Worker Pool"
date: 2024-02-06T08:22:53-06:00
draft: false
author: Andres Reyes El Programador Pobre
year: "2024"
month: "2024/02"
categories:
- Concurrencia
tags:
- golang
- concurrencia
- software
keywords:
- golang
- worker pool
- programación concurrente
disableComments: false
---

{{<postimage "images/pools.png" " Mengniu Dairy production line. Gentileza de  Peter Tittenberger y flickr. https://www.flickr.com/photos/ext504/3639675762/in/photostream/">}}


La concurrencia es una herramienta que nos ayuda a ejecutar tareas pesadas o que bloquean el avance de un proceso, mientras otras tareas se ejecutan, mejorando el rendimiento general.

Pero ¿Podemos hacer uso de la concurrencia sin ponernos un límite?

<!--more-->

Concurrencia es un aspecto integral del desarrollo moderno de software que permite que nuestras aplicaciones ejecuten múltiples tareas simultáneamente y nos permite usar efectivamente los recursos del sistema, especialmente en situaciones donde debemos llevar a cabo mucho computo u operaciones de entrada/salida.

Pero ¿Hay un Límite?

Imaginemos el periódo de matriculas de un colegio en donde se debe registrar el ingreso y asignar curso a cientos de alumnos. Podríamos poner un funcionario encargado para el registro de cada alumno, pero solo podríamos hacerlo hasta completar el máximo número de funcionarios disponibles

¡Además de que todas las demás tareas de esos funcionarios quedarían en pausa hasta terminar el proceso de registro!

---
*Worker pool* es un patrón concurrente cuya idea base es tener un número de gorutinas esperando a que se le asignen trabajos, ejecutándolos a medida que se le van asignando
---

Como eso es poco verosímil, que tal si dejamos solo a 4 funcionarios realizando el proceso de matricula mientras que los demás se reparten las tareas habituales. De esta forma los 4 funcionarios registran alumnos *concurrentemente*.  Junto con ello, esto nos permite que si vemos que se produce un cuello de botella, por ejemplo muchos apoderados llegan a registrar a sus pupilos al mismo tiempo, podemos reforzar con algunos funcionarios extra, y devolverlos a sus tareas habituales cuando se haya procesado el cuello de botella.

Pues bien, con esta analogía hemos descrito el funcionamiento de un *worker pool*, el cual es un patrón para lograr concurrencia, cuya idea base es tener un número de gorutinas, que reciben el nombre de *worker*, esperando a que se le asignen trabajos. Cuando un trabajo se le asigna a un worker, se ejecuta concurrentemente mientras la gorutina principal sigue ejecutando otro código.

---
La idea base de nuestra implementación es gatillar bajo demanda un número fijo de gorutinas que harán las veces de workers e iran recibiendo tareas a ejecutar a través de un canal por el cual las enviaremos
---

Worker pool nos permite *administrar* el nivel de concurrencia de nuestras aplicaciones controlando el uso de recursos de procesamiento.

¡Pero basta de teoría y ensuciemonos las manos que a eso hemos venido!

Implementaremos un worker pool definiendo cada parte que lo constituye, junto con algunas utilidades para obtener métricas.

La idea base de nuestra implementación es gatillar bajo demanda un número fijo de gorutinas que harán las veces de workers e iran recibiendo tareas a ejecutar a través de un canal por el cual las enviaremos.

Decimos que gatillaremos bajo demanda a los workers porque los iremos levantando a medida que vayan llegando tareas y no hayan workers para ejecutarlas, hasta llegar al límite definido de workers. En pocas palabras, implementaremos una lazy inicialization de los workers de nuestro pool.

Dentro de las consideraciones de diseño, haremos un fuerte uso de interfaces pues nos permiten que los elementos que componen el worker pool sean plugables y posibles de reemplazar por otros componentes que implementen la interface.

La belleza de esto radica en que si a Ud. se le ocurre una mejor implementación, o necesita funcionalidades extra que no están contempladas, puede construir su propia implementación de acuerdo a sus gustos o necesidades, y mientras exponga los métodos de la interface definida, su código personalizado trabajará perfectamente con el resto del worker pool.

## Tareas

Dentro del contexto de programación concurrente es usual llamar aquello que se procesa como *tarea*, que son trabajos que pueden ser ejecutados asíncrona y concurrentemente. Así que empecemos por definir la estructura de datos que nuestro worker pool será capaz de procesar.

```go
type Task interface {
	Run()
}
```

Una interface llamada `Task`, exponiendo un método `Run` que será implementada por las tareas concretas que necesitemos procesar.

## Executor y Spawner

Comentamos que los workers deben levantarse a medida que las tareas vayan llegando, y que deben ir ejecutandolas. Podemos abstraer esas dos funcionalides en respectivas interfaces.


```go
type Executor interface {
    // Execute ejecuta una tarea Task para un worker pool Pool
	Execute(Task, Pool)
}
```


La interface `Executor`  tendrá la responsabilidad de ejecutar cada tarea

```go
type Spawner interface {

    // Spawn engendra un nuevo worker para el worker pool
    // recibe como argumento:
    // El canal por donde se recibirán las tareas
    // Una función capaz de ejecutar una tarea
    // Una función que se ejecutará al momento de desplegar el worker
    // Una función que se ejecutará al momento de terminar al worker
	Spawn(chan Task, func(Task), func(), func())
}
```

`Spawner` cuya finalidad será levantar un nuevo worker cuando sea necesario.


## Pool

```go
type Pool interface {
    // Submit Envia una nueva tarea al worker pool
	Submit(Task)

    // WaitAll Espera a que todos los workers terminen de procesar sus tareas asignadas
	WaitAll()

    // Execute Ejecuta las tareas enviadas al worker delegando en la interface [Executor]
	Execute(Task)

    // SpawnWorker Levanta un nuevo worker delegando en la interface [Spawner]
	SpawnWorker()

    // WorkerSpawned Retorna el número de workers levantados hasta el momento
	WorkerSpawned() int32

    // SubmittedTasks Retorna el número de tareas enviadas a los workers
	SubmittedTasks() int32

    // AddReadyTask agrega el deltas indicado como parámetro a la cantidad 
    // de tareas ejecutadas. Se usa en DefaultExecutor por ejemplo
    AddReadyTask(int32)

    // OnExecuteTask Lo usaremos como un hook para inyectar código que se ejecutará cuando el [Executor] ejecute cada tarea
	OnExecuteTask(time.Time)

    // CummulatedWorkTime() time.Duration` Devuelve el tiempo de trabajo hasta el momento de su invocación
	CummlatedWorkTime() time.Duration

    // AVGTime Devuelve el tiempo promedio de ejecución de tareas
	AVGTime() time.Duration
}
```

Definimos la última de nuestras interfaces, la interface `Pool` que representa al worker pool. 


Con la api de nuestro worker pool ya definida, procedemos ahora a construir una implementación concreta.


## Implementando a Executor. DefaultExecutor

```go
type DefaultExecutor struct{}

func (e *DefaultExecutor) Execute(task Task, p Pool) {
	start := time.Now().UTC()
	defer p.OnExecuteTask(start)
    defer p.AddReadyTask(1)
	task.Run()
}
```

Tal como se indicó en la definición de nuestra api, el executor es responsable de gatillar la tarea recibida por el worker. 

En esta implementación registraremos el tiempo que las tareas demoran en ejecutarse, y para invocar al método `OnExecuteTask` del worker pool.


## Implementando a Spawner. DefaultSpawner.

```go
type DefaultSpawner struct{}

func (s *DefaultSpawner) Spawn(
    tasks chan Task, 
    executor func(Task), 
    onStart func(), 
    onEnd func()
) {

    // Antes de levantar propiamente al worker, ejecutamos la función onStart
    // recibida como argumento. Esto nos da la oportunidad
    // de inyectar un hook al momento de levantar los workers
	onStart()

    // Levantamos al worker en su propia gorutina
	go func() {
        // registramos la función onEnd recibidas como argumento
        // para que se ejecute al terminar la gorutina
		defer onEnd()

		for task := range tasks {
            // Dejamos un medio para terminar al worker 
            // recibiendo una tarea con valor nil 
			if task == nil {
				return
			}

            // para cada tarea recibida, invocamos a la 
            // función executor recibida como argumento
            // para que la gatille.
			executor(task)
		}
	}()
}
```


## Implementado Pool. Deadpool

Implementaremos ahora a nuestro Pool concreto, le llamaremos Deadpool por razones obvias.

Cuando definamos al constructor usaremos [funciones argumentales variadicas](https://medium.com/@chess.coach.ar/argumentos-opcionales-en-go-argumento-variadico-funcional-en-constructores-85458a5f07f) pues nos proveen de una gran flexibilidad.



```go

// Definimos los posibles errores que puede gatillar la creación de un nuevo deadpool
var (
	ErrInvalidMaxWorkers = errors.New("invalid max number of workers")
	ErrInvalidCap        = errors.New("invalid capacity for tasks stream")
	ErrInvalidExecutor   = errors.New("expected a valid Executor. Nil received")
	ErrInvalidSpawner    = errors.New("expected a valid Spawner. Nil received")
)


type deadpool struct {
    // maxWorkers indica la cantidad máxima de workers a levantar
	maxWorkers        int32

    // cap es la capacidad de tareas para el worker pool. Se usa como 
    // el segundo parámetro de `make` al construir el canal de tareas
	cap               int8

    // currentWorkersQTY registra la cantidad actual de workers levantados
	currentWorkersQTY int32

    // readyTasksQTY registra la cantidad de tareas ejecutadas
	readyTasksQTY     int32

    // submittedTasksQTY registra la cantidad de tareas enviadas a los workers
	submittedTasksQTY int32

    // registra el tiempo acumulado de proceso para las tareas ejecutadas
	cummulatedTime time.Duration

    // registra el tiempo promedio de ejecución de las tareas
	avgTaskTime    time.Duration

    // executor de tipo [Executor] es un punto de montaje para un 
    // Executor personalizado, en caso de no proveerse uno, se usará
    //[DefaultExecutor]
	executor Executor

    // spawner de tipo [Spawner] es un punto de montaje para un 
    // Spawner personalizado, en caso de no proveerse uno, se usará
    //[DefaultSpawner]
	spawner  Spawner

    // tasksStream es el canal por donde se enviaran las tareas a los workers
	tasksStream chan Task

	wg *sync.WaitGroup
	mu sync.Mutex
}


// New devuelve un puntero a un deadpool inicializado y listo para usar.
func New(opts ...func(*deadpool)) (*deadpool, error) {

    // Instancia de deadpool con defauklts executor y spawner
	d := &deadpool{
		executor: &DefaultExecutor{},
		spawner:  &DefaultSpawner{},
		wg:       &sync.WaitGroup{},
		mu:       sync.Mutex{},
	}

    // procesamos las funciones argumentales variadicas
	for _, f := range opts {
		f(d)
	}

  
	if d.maxWorkers <= 0 {
		return d, ErrInvalidMaxWorkers
	}

	if d.cap < 0 {
		return d, ErrInvalidCap
	}

    // Si por cualquier causa se pasó un executor nil, terminamos con el 
    // error correspondiente
	if d.executor == nil {
		return d, ErrInvalidExecutor
	}

	if d.spawner == nil {
		return d, ErrInvalidSpawner
	}

	// construimos el canal donde dejaremos caer las tareas
    d.tasksStream = make(chan Task, d.cap)

	return d, nil
}


func (d *deadpool) AddReadyTask(qty int32) {
	atomic.AddInt32(&d.readyTasksQTY, qty)
}

// Submit envía una nueva tarea parea ser procesada por algún worker
func (d *deadpool) Submit(task Task) {
    // engendramos un nuevo worker solo si es necesario
	d.SpawnWorker()

    // enviamos la tarea por el canal
	d.tasksStream <- task

    // aumentamos en 1 la cantidad de tareas enviadas usando una operación atómica
	atomic.AddInt32(&d.submittedTasksQTY, 1)
}

// WaitAll espera porque todos los workers levantados terminen sus tareas asignadas
func (d *deadpool) WaitAll() {

	if d.tasksStream != nil {
		close(d.tasksStream)
	}

	d.wg.Wait()
}

// Execute ejecuta la tarea delegando a la implementación de
// [Executor] definida
func (d *deadpool) Execute(task Task) {
	d.executor.Execute(task, d)
}

// SpawnWorker levanta un nuevo worker
func (d *deadpool) SpawnWorker() {
    // Obtiene de una operación atómica la cantidad actual de workers levantados
	currentWorkersQTY := atomic.LoadInt32(&d.currentWorkersQTY)

    // si es menor a la cantidad máxima de workers indicada, procedemos a levantar un nuevo worker
	if currentWorkersQTY < atomic.LoadInt32(&d.maxWorkers) {

        // Para levantar un nuevo worker delegamos a la implementación definida
        // de [Spawner]
		d.spawner.Spawn(
			d.tasksStream,                // canal de tareas
			d.Execute,                    // función ejecutora que al final delega al [Executer]
			func(workerID int32) func() { // función a invocar al iniciar el worker
				return func() {             // en esta implementación lo usamos para
					d.wg.Add(1)             // aumentar en 1 el contador de workers a esperar
				}
			}(currentWorkersQTY),
			func(workerID int32) func() { // función a invocar al terminar el worker
				return func() {             // en esta implementación lo usamos para
					d.wg.Done()             // disminuir en 1 el contador de workers a esperar
				}
			}(currentWorkersQTY),
		)

		atomic.AddInt32(&d.currentWorkersQTY, 1)  // Aumentamos en 1 la cantidad de workers levantados
                                                  // con una operación atómica
	}
}

// OnExecuteTask es un hook que se provee para inyectar código antes de ejecutar una tarea.
func (d *deadpool) OnExecuteTask(start time.Time) {
	d.mu.Lock()
	defer d.mu.Unlock()

	// En esta implementación lo usamos para  guardar el tiempo
    // de ejecución de las tareas
    // para calcular el cummulated execution time y el avg execution time
    ellapsed := time.Since(start)
	d.cummulatedTime += ellapsed
	readies := time.Duration(atomic.LoadInt32(&d.readyTasksQTY))
	d.avgTaskTime = d.cummulatedTime / readies

    // Pero ud. podría usarlo para lo que quiera!
}

func (d *deadpool) WorkerSpawned() int32 {
	return d.currentWorkersQTY
}

func (d *deadpool) SubmittedTasks() int32 {
	return d.submittedTasksQTY
}

func (d *deadpool) AVGTime() time.Duration {
	return d.avgTaskTime
}

func (d *deadpool) CummlatedWorkTime() time.Duration {
	return d.cummulatedTime
}



/// Funciones argumentales variadicas

// WithMax indica el máximo número de workers
func WithMax(max int32) func(*deadpool) {
	return func(d *deadpool) {
		d.maxWorkers = max
	}
}


// WithCap indica la capacidad del canal. Si se omite el canal de tareas no estará buffereado
func WithCap(cap int8) func(*deadpool) {
	return func(d *deadpool) {
		d.cap = cap
	}
}

// WithExecutor permite explicitar el Executor a usar. Si se omite, se usa [DefaultExecutor]
func WithExecutor(exe Executor) func(*deadpool) {
	return func(d *deadpool) {
		d.executor = exe
	}
}

// WithSpawner permite explicitar el [Spawner] a usar. Si se omite, se usa [DefaultSpawner]
func WithSpawner(spn WorkerSpawner) func(*deadpool) {
	return func(d *deadpool) {
		d.spawner = spn
	}
}


```

En nuestra implementación hemos decidido usar el paquete `atomic` que provee primitivas de memoria de bajo nivel. La documentación de Go recomienda preferir el paquete sync o canales para sincronizar memoria, pero como lo que necesitabamos hacer era aumentar en 1 algunas variables nos decantamos por atomic.

Como ninguna implementaciónm está terminada sin sus pruebas, construyamoslas  para probar nuestro invento.


```go

func Test_deadpool_ErrsOnCreate(t *testing.T) {
	_, err := New(WithMax(-1))

	if err == nil {
		t.Log("ErrInvalidMaxWorkers expected")
		t.FailNow()
	}

	_, err = New(WithCap(-1))

	if err == nil {
		t.Log("ErrInvalidCap expected")
		t.FailNow()
	}

	_, err = New(WithExecutor(nil))

	if err == nil {
		t.Log("ErrInvalidExecutor expected")
		t.FailNow()
	}

	_, err = New(WithSpawner(nil))

	if err == nil {
		t.Log("ErrInvalidSpawner expected")
		t.FailNow()
	}
}

```

El test anterior comprueba que los posibles errores al instanciar a nuestro pool se gatillen correctamente.

Ahora implementemos un mock de una tarea para poder probar la infraestructura completa.

```go
type taskTest struct {
	id int
}

func newTaskTest(id int) *taskTest {
	return &taskTest{
		id: id,
	}
}

func (t *taskTest) Run() {
	defer func() {
		if os.Getenv("DEBUG") == "TRUE" {
			fmt.Printf("     stoping task %d\n", t.id)
		}
	}()

	if os.Getenv("DEBUG") == "TRUE" {
		fmt.Printf("     starting task %d\n", t.id)
		time.Sleep(10 * time.Millisecond)
	}
}
```

Simulamos un trabajo en nuestra implementación mock de tarea esperando durante 10 milisegundos.
Además, agregamos unas comprobaciones a la variable de entorno `DEBUG` para poder ver logs del inicio y fin de la ejecución de las tareas mock.


```go

func Test_deadpool_Flow(t *testing.T) {
    
    // Instanciamos un nuevo deadpool con un máximo de 6 workers
	d, err := New(WithMax(6))

	if err != nil {
		t.Log(err)
		t.FailNow()
	}

	start := time.Now().UTC()

    // Enviaremos al worker pool 128 de nuestras tareas mock
	for i := 1; i <= 128; i++ {
		func(i int) {
			d.Submit(newTaskTest(i))
		}(i)
	}

	d.WaitAll()

    // estadisticas
	t.Logf("tiempo acumulado de proceso: %v\n", d.CummlatedWorkTime())
	t.Logf("tiempo promedio por tarea: %v \n", d.AVGTime())
	t.Logf("tiempo total de proceso: %v", time.Since(start))
}



```

Y al ejecutar nuestro test con la variable de entrono `DEBUG` con valor `TRUE` podemos ver el resultado.

```bash
$ DEBUG=TRUE go test -timeout 256s -run ^Test_deadpool_Flow$ github.com/profe-ajedrez/deadpool -v
=== RUN   Test_deadpool_Flow
     starting task 1
     starting task 2
     starting task 3
     starting task 4
     ...
     stoping task 122
     stoping task 125
     stoping task 128
     stoping task 127
    deadpool_test.go:60: tiempo acumulado de proceso: 1.298687182s
    deadpool_test.go:61: tiempo promedio por tarea: 10.145993ms 
    deadpool_test.go:62: tiempo total de proceso: 223.349239ms
--- PASS: Test_deadpool_Flow (0.22s)
```

Donde vemos que el tiempo sumado de la ejecución de todas las tareas fue *1.298687182s*, pero el tiempo total de proceso solo fue de *223.349239ms*, mientras que cada tarea demoro en promedio *10.145993ms* que es una fracción mayor a los 10ms que le indicamos que debía esperar la tarea mock.

Como alternativa al worker pool, según sea nuestro caso podriamos haber implementado un [pipeline](https://medium.com/@chess.coach.ar/concurrencia-en-go-implementando-pipelines-d23a58fa2405), que consiste en una cadena de gorutinas cada una de las cuales realiza una acción sobre un elemento hasta completarlo, y cuya analogía es una línea de producción.

Sea cual sea el patrón concurrente que elijamos, debemos ser cuidadosos de no provocar condiciones de carrera ni [fugas de gorutinas](https://gophers-latam.github.io/posts/2023/12/fuga-de-gorutinas/), por lo que debemos hacer uso exhaustivo del flag `-race` al ejecutar nuestras pruebas.

Hemos implementado un worker pool funcional, pero aun no hemos respondido a la pregunta con que iniciamos este artículo ¿Hay algún límite para la concurrencia? Preferimos dejar la pregunta abierta y esperamos sus respuestas en los comentarios.

Puede hackear el código que hemos construido en este [playground](https://go.dev/play/p/x7R2nwq5um7), y como de costumbre, le proveemos con el [repositorio](https://github.com/profe-ajedrez/deadpool) donde se aloja.

Y bien, con eso llegamos al final de este codelab. Esperamos que haya sido de su agrado y como siempre le recordamos que si le gustó este artículo no dude en compartirlo o en comentarnos si considera que hay algo en lo que podamos mejorar. 