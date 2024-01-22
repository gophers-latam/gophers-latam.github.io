---
title: "Concatenando strings. Construyendo SQL eficientemente"
date: 2024-01-21T12:33:31-03:00
draft: false
author: Andrés Reyes. El Programador Pobre
year: "2024"
month: "2024/01"
categories:
- Comunidad
- Aprendizaje
tags:
- golang
- sql
- strings
keywords:
- sql
- string
- Aprender
disableComments: false
---

{{<postimage "images/builders.jpg" "string builder">}}


Los strings son un tipo de dato peculiar.  A simple vista parecieran no esconder nada raro, pero si los comparamos con tipos de dato numéricos encontramos diferencias interesantes.

Un string compuesto de solo un caracter, por ejemplo *"A"*, ocupa un byte completo para almacenarse.  En un byte el número entero sin signo mas pequeño que podemos guardar es 0, siendo 255 el mas grande posible de almacenarse. O sea, **un solo caracter** como *"A"* ocupa la misma cantidad de memoria que un valor del tipo `uint8`.

Entonces ¿Cuanta memoria podemos usar al concatenar una enorme cantidad de caracteres en strings de gran tamaño? Investiguémoslo con uno de los usos mas frecuentes de construcción dinámica de strings; la creación de consultas SQL.

Terminaremos además con una bonita técnica para disminuir aun mas los direccionamientos al guardar los parámetros para la consulta SQL en un slice.

---
Nosotros no le creemos nada a nadie, todo lo comprobamos por nosotros mismos. Por eso acompañamos cada ejemplo con su respectivo benchmark. ¡Ud. debería hacer lo mismo ya que proveemos los benchmarks para este experimento!
---

Construiremos una consulta sql de varias formas distintas y mediremos su eficiencia con benchmarks.

Usaremos el siguiente struct para proveer los datos para construir el filtro:

```go
type Filter struct {
    ID       int64   // provee el id a buscar
    Name     string  // provee el nombre a buscar
    Lastname string
    Search   string  // provee un valor por cual buscar usando LIKE a nombres o apellidos
    Limit    int64
    Offset   int64
}
```

Usaremos la siguiente constante como base para la consulta que construiremos:

```go
const qb = `SELECT id, name, last_name FROM clientes WHERE 1=1 %ATTRS% %ID%  %FIRST_NAME% %LAST_NAME%  %LIMIT% %OFFSET%`
```

Y la función que construye la consulta con dicho filtro, la cual se basa en la técnica de colocar patrones en el texto y reemplazarlos al ir construyendo la consulta concatenando strings sucesivos:

```go
func QueryBuilderEvil(f Filter) (string, []any) {
    sql := qb
    var params []any

    if strings.TrimSpace(f.Search) != "" {
        sql = strings.ReplaceAll(sql, "%ATTRS%", " AND ( name LIKE ? OR last_name LIKE ?)")
        params = append(params, "%"+f.Search+"%", "%"+f.Search+"%")
    } else {
        sql = strings.ReplaceAll(sql, "%ATTRS%", "")
    }

    if f.ID > 0 {
        sql = strings.ReplaceAll(sql, "%ID%", " AND id = ?")
        params = append(params, f.ID)
    } else {
        sql = strings.ReplaceAll(sql, "%ID%", "")
    }

    if strings.TrimSpace(f.Name) != "" {
        sql = strings.ReplaceAll(sql, "%FIRST_NAME%", " AND name = ?")
        params = append(params, f.Name)
    } else {
        sql = strings.ReplaceAll(sql, "%FIRST_NAME%", "")
    }

    if strings.TrimSpace(f.Lastname) != "" {
        sql = strings.ReplaceAll(sql, "%LAST_NAME%", " AND last_name = ?")
        params = append(params, f.Lastname)
    } else {
        sql = strings.ReplaceAll(sql, "%LAST_NAME%", "")
    }

    if f.Limit > 0 {
        sql = strings.ReplaceAll(sql, "%LIMIT%", " LIMIT ?")
        params = append(params, f.Limit)
    } else {
        sql = strings.ReplaceAll(sql, "%LIMIT%", "")
    }

    if f.Offset > 0 {
        sql = strings.ReplaceAll(sql, "%OFFSET%", " OFFSET ?")
        params = append(params, f.Offset)
    } else {
        sql = strings.ReplaceAll(sql, "%OFFSET%", "")
    }

    return sql, params
}

```


Antes de analizar, veamos el resultado del benchmark de esta función. En mi máquina arroja estos resultados:


```go
func BenchmarkEvil(b *testing.B) {
	f := Filter{
		Name:     "a",
		Lastname: "b",
		Search:   "",
		Limit:    10,
	}

	b.ResetTimer()

	for i := 0; i <= b.N; i++ {
		_, _ = QueryBuilderEvil(f)
	}
}
```

```bash
BenchmarkEvil-16    	 1655064	       705.8 ns/op	     720 B/op	      11 allocs/op
```

El benchmark nos dice que se ejecutó la función 18720764 veces, durando  764 ns cada iteración, direccionado 784 bytes cada iteración, realizando 11 localizaciones al heap.

¿Parece rápido? ¿Que puede tener esto de malo?  Observe los bytes direccionados, 784. Esto, mas o menos significa que se guardaron en memoria el equivalente a 784 letras "A".


Reunamos mas información. Usemos el flag  `-gcflags="-m"` para descubrir donde se producen los direccionamientos en el heap.


```bash
./main_test.go:21:15: q escapes to heap
./main.go:89:39: "%" + f.Search + "%" escapes to heap
./main.go:89:39: "%" + f.Search + "%" escapes to heap
./main.go:89:57: "%" + f.Search + "%" escapes to heap
./main.go:89:57: "%" + f.Search + "%" escapes to heap
```

¡Observe además que cada concatenación con + escapa al heap! Cada una genera un direccionamiento nuevo, Lo que si leyó un [artículo anterior](https://gophers-latam.github.io/posts/2023/12/manejo-de-memoria-101.-memoria-virtual-stack-y-heap/), entenderá que puede ser susceptible de mejorar.

Pero ¿Que alternativas hay?

## Construyendo strings de forma eficiente con `strings.Builder`

Tratemos de mejorar nuestra implementación. Usando el mismo struct para el filtro, cambiemos la constante  base de sql.

```go
const q = `SELECT id, name, last_name FROM clientes WHERE 1=1`
```

Y revisemos esta función alternativa para construir la consulta:

```go
	b := strings.Builder{}
    // le indicamos una capacidad al slice que contendrá los parámetros de la query
    // iguala la cantidad máxima de elementos posibles de agregar al filtro
	params := make([]any, 0, 7) 

	b.WriteString(q)

	if f.ID > 0 {
		b.WriteString(" AND id = ?") // Agregamos el segmento del filtro sql y el parámetro posicional
		params = append(params, f.ID)
	}

	if strings.TrimSpace(f.Name) != "" {
		//             Nótese el espacio extra antes del sql
		b.WriteString(" AND name = ?")
		params = append(params, f.Name)
	}

	if strings.TrimSpace(f.Lastname) != "" {
		b.WriteString(" AND last_name = ?")
		params = append(params, f.Lastname)
	}

	if strings.TrimSpace(f.Search) != "" {
		b.WriteString(" AND ( name LIKE ? OR last_name LIKE ?)")
		params = append(params, fmt.Sprintf("%%%s%%",f.Search), fmt.Sprintf("%%%s%%",f.Search))
	}

	if f.Limit > 0 {
		b.WriteString(" LIMIT ?")
		params = append(params, f.Limit)
	}

	if f.Offset > 0 {
		b.WriteString(" OFFSET ?")
		params = append(params, f.Offset)
	}

	return b, params
```

Revisemos el resultado del benchmark:

```go
func BenchmarkOK(b *testing.B) {
	f := Filter{
		Name:     "a",
		Lastname: "b",
		Search:   "",
		Limit:    10,
	}

	b.ResetTimer()

	for i := 0; i <= b.N; i++ {
		_, _ = QueryBuilderOK(f)
	}
}

```

```bash
BenchmarkOK-16    	 6253722	       234.3 ns/op	     336 B/op	       5 allocs/op
```

¡Vaya! hemos pasado de 705.8 ns a 234.3 ns, y de un consumo de memoria de 720 bytes disminuimos a 336 bytes ¡Bastante bien no! 

---
Gracias al uso eficiente de strings.Builder podemos evitar concatenaciones costosas.
---

Estas mejoras se explican porque este nuevo constructor de la consulta delega el manejo de la construcción del string a [`strings.Builder`](https://pkg.go.dev/strings#Builder), cuya documentación nos explica que es un tipo de dato que permite construir strings minimizando las copias de memoria que como Ud. ya está imaginando es donde se produce la demora en ejecución y el costo. 

Gracias al uso eficiente de `strings.Builder` podemos dejar de usar la técnica de búsqueda y reemplazo en el string que estamos construyendo y podemos  evitar concatenaciones costosas.


## Llevando esto al extremo

¿Hasta que punto deberíamos llegar al pensar en evitar concatenaciones y reemplazarlas por `strings.Builder`?

Depende de lo que estemos tratando de hacer. Por ejemplo, en nuestra función `QueryBuilderOK` Ud. podría decir que en donde se construyen los likes se esta usando `fmt.Sprintf`, y si acaso no sería mejor usar un builder.

¡Comprobemoslo!  Construyamos una tercera función para generar nuestra consulta sql.

```go

func QueryBuilderOKAlter(f Filter) (strings.Builder, []any) {
	b := strings.Builder{}
	params := make([]any, 0, 7) // 7 es la cantidad máxima de elementos que se pueden agregar al filtro

	b.WriteString(q)

	if f.ID > 0 {
		b.WriteString(" AND id = ?") // Agregamos el segmento del filtro sql y el parámetro posicional
		params = append(params, f.ID)
	}

	if strings.TrimSpace(f.Name) != "" {
		//             Nótese el espacio extra antes del sql
		b.WriteString(" AND name = ?")
		params = append(params, f.Name)
	}

	if strings.TrimSpace(f.Lastname) != "" {
		b.WriteString(" AND last_name = ?")
		params = append(params, f.Lastname)
	}

	if strings.TrimSpace(f.Search) != "" {
		b.WriteString(" AND ( name LIKE ? OR last_name LIKE ?)")
		b2 := strings.Builder{}
		b2.WriteString("%")
		b2.WriteString(f.Search)
		b2.WriteString("%")
		params = append(params, b2.String())
		b2.Reset()
		b2.WriteString("%")
		b2.WriteString(f.Search)
		b2.WriteString("%")
		params = append(params, b2.String())
	}

	if f.Limit > 0 {
		b.WriteString(" LIMIT ?")
		params = append(params, f.Limit)
	}

	if f.Offset > 0 {
		b.WriteString(" OFFSET ?")
		params = append(params, f.Offset)
	}

	return b, params
}

```

Con su benchmark respectivo

```go
func BenchmarkOKAlter(b *testing.B) {
	f := Filter{
		Name:     "a",
		Lastname: "b",
		Search:   "",
		Limit:    10,
	}

	b.ResetTimer()

	for i := 0; i <= b.N; i++ {
		_, _ = QueryBuilderOKAlter(f)
	}
}
```

Y ejecutemos varias veces los benchmarks para considerar pequeñas variaciones.

```bash
# Usamos el flag -count para indicar el número de ejecuciones 
# de nuestros benchmarks
# y el flag -benchtime para indicar el tiempo mínimo que debería durar cada bench
go test -benchmem -count=16 -benchtime=2s -bench . 

goos: linux
goarch: amd64
pkg: aa
cpu: Intel(R) Core(TM) i7-10700 CPU @ 2.90GHz
BenchmarkEvil-16         3066897               744.7 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3498865               727.4 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3386638               718.1 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3180061               728.8 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3392404               741.4 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3488655               732.3 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3306530               736.1 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3028632               718.3 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3517440               710.5 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3404026               704.9 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3467962               756.4 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3440934               738.0 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3392062               711.4 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3522846               735.8 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3203848               701.6 ns/op           720 B/op         11 allocs/op
BenchmarkEvil-16         3502076               732.7 ns/op           720 B/op         11 allocs/op
BenchmarkOK-16          11799339               228.8 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          11871458               228.2 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          11488488               264.0 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          12074823               236.2 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16           9447732               229.9 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          10044681               204.5 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          12510486               232.0 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          10445984               256.5 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          11243646               250.3 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          11259970               251.3 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16           9696850               247.5 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          11768199               285.7 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          10200710               235.4 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16           9136749               232.4 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16           9717814               242.0 ns/op           336 B/op          5 allocs/op
BenchmarkOK-16          10739455               240.3 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16     10271550               246.1 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8569068               237.5 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8484096               277.7 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8993108               265.8 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8013882               286.9 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8815909               240.2 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      9611652               261.0 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8601260               234.4 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      9384111               256.7 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      7744686               268.7 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8082067               289.4 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16     11854416               213.5 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16     10229622               286.3 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16     10405981               219.1 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16      8921347               242.1 ns/op           336 B/op          5 allocs/op
BenchmarkOKAlter-16     11861126               261.1 ns/op           336 B/op          5 allocs/op
PASS
ok      aa      144.342s
```

Si tomamos los resultados y los ordenamos desde el más rápido hasta el mas lento, vemos que no hay una gran diferencia entre las funciones OK, y que incluso `QueryBuilderOK`  es un poco mas veloz que `QueryBuilderOKAlter`. 

En el apartado de memoria ambas gastaron la misma cantidad y realizaron el mismo número de direccionamientos.

![Alt text](images/bench-chart.png)

¿Esto significa que cuando necesitemos hacer pocas concatenaciones, o cuando lo tengamos que hacer sobre strings muy pequeños no deberíamos usar `strings.Builder`?

¡No lo se! Dependerá de que tan *pocas concatenaciones* y que *tan pequeños* sean los strings de su caso. Lo único que puedo recomendarle es construir su programa de forma tal que pueda realizar los benchmarks correspondientes y tomar la decisión con base a los números presentados por estos en cada situación. 


## Aplicando la técnica de máscaras de parámetros

Ahora bien, En el caso de nuestro ejemplo hay formas de optimizar aun mas a nuestro builder que ya no pasan directamente por el manejo del string. Podemos usar la técnica de usar una **máscara** para determinar el tamaño exacto de los parámetros a agregar a la consulta y direccionar previamente la memoria con ese número para evitar realizar `appends` mientras se va construyendo la consulta, de la misma forma que evitamos concatenar gracias a `strings.Builder`.

```go
func QueryBuilderOKMask(f Filter) (strings.Builder, []any) {
	b := strings.Builder{}

    // tenemos una instancia de un struct con un campo booleano para
    // cada elemento del filtro
	mask := struct {
		ID       bool
		Name     bool
		Lastname bool
		Search   bool
		Limit    bool
		Offset   bool
	}{}

	b.WriteString(q)

    // Usaremos a size para indicar cuantos elementos tendrá finalmente el slice de parámetros de la consulta
	size := 0

	if f.ID > 0 {
		b.WriteString(" AND id = ?") // Agregamos el segmento del filtro sql y el parámetro posicional
        // Si el elemento del filtro se agrega, se establece su máscara a verdadero
		mask.ID = true
        // y se aumenta en 1 el tamaño esperado para el slice de parámetros
		size++
	}

	if strings.TrimSpace(f.Name) != "" {
		b.WriteString(" AND name = ?")
		mask.Name = true
		size++
	}

	if strings.TrimSpace(f.Lastname) != "" {
		b.WriteString(" AND last_name = ?")
		mask.Lastname = true
		size++
	}

	if strings.TrimSpace(f.Search) != "" {
		b.WriteString(" AND ( name LIKE ? OR last_name LIKE ?)")
		mask.Search = true
		size += 2
	}

	if f.Limit > 0 {
		b.WriteString(" LIMIT ?")
		mask.Limit = true
		size++
	}

	if f.Offset > 0 {
		b.WriteString(" OFFSET ?")
		mask.Offset = true
		size++
	}

    // direccionamos el slice de parámetros con la memoria exacta que necesitamos
	p := make([]any, size)
	i := 0

    // y solo agregamos al slice los elementos del filtro que tengan su respectiva máscara activada
	if mask.ID {
		p[i] = f.ID
		i++
	}

	if mask.Name {
		p[i] = f.Name
		i++
	}

	if mask.Lastname {
		p[i] = f.Lastname
		i++
	}

	if mask.Search {
		p[i] = fmt.Sprintf("%%%s%%", f.Search)
		i++
		p[i] = fmt.Sprintf("%%%s%%", f.Search)
		i++
	}

	if mask.Limit {
		p[i] = f.Limit
		i++
	}

	if mask.Offset {
		p[i] = f.Offset
	}

	return b, p
}

```


El respectivo benchmark


```go
func BenchmarkOKMask(b *testing.B) {
	f := Filter{
		Name:     "a",
		Lastname: "b",
		Search:   "",
		Limit:    10,
	}

	b.ResetTimer()

	for i := 0; i <= b.N; i++ {
		_, _ = QueryBuilderOKMask(f)
	}
}
```


El cual al ejecutarse nos arroja los siguientes resultados.

```bash
BenchmarkOKMask-16      10261683               213.8 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      12145034               230.7 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16       9883455               213.3 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      10661880               212.3 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      12725306               211.5 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16       9966832               225.5 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16       9271009               216.3 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16       8934564               236.4 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      12176293               249.7 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      11495956               236.9 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      10586841               224.2 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      12398922               213.3 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16       9481837               247.0 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      10852344               226.4 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      12089485               216.7 ns/op           272 B/op          5 allocs/op
BenchmarkOKMask-16      10944657               201.9 ns/op           272 B/op          5 allocs/op
```


!Vemos una mejora en el consumo de memoria y en la velocidad de ejecución!


Concluyendo, no le crea a nada ni a nadie, compruebelo todo con benchmarks por si mismo en un ambiente lo mas parecido a sus máquinas de producción si le es posible. Detecte los cuellos de botella en su programa y aplique las medidas que su experiencia y conocimiento provean.

Dejamos a su disposición el código provisto en este artículo en [este](https://github.com/profe-ajedrez/building_string_ex) repositorio.

Y con esto despedimos este artículo, no olvide comentar si precisa hacer algún alcance y compartirlo si es que le gustó.

