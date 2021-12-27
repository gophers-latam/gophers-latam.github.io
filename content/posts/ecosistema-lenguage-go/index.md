---
title: "Ecosistema lenguage Go"
date: 2021-12-27T11:22:53-06:00
draft: false
author: ZeroIdentidad
year: "2021"
month: "2021/12"
categories:
- Ecosistema
- Experiencias
tags:
- golang
- ecosystem
- software
keywords:
- golang
- ecosystem
- software
disableComments: false
---

{{<postimage "images/golang.png" "json to go">}}

Go, también conocido como Golang, es un lenguaje de programación de tipado estático desarrollado por Robert Griesemer, Rob Pike y Ken Thompson en Google.

<!--more-->

Go es sintácticamente similar a C, pero viene con seguridad de memoria, recolección de basura, tipificación estructural y sincronización al estilo CSP.

Hay dos implementaciones principales:

- El paquete de alojamiento de Google que se dirige a múltiples sistemas operativos, dispositivos móviles y WebAssembly.

- gccgo (un front) y GCC

Go es expresivo, conciso, limpio y eficiente. Los mecanismos simultáneos facilitan la escritura de aplicaciones que aprovechan al máximo las máquinas en red de varios núcleos, mientras que el sistema más nuevo permite crear aplicaciones modulares y flexibles. Compila código máquina con bastante rapidez, pero tiene la conveniencia de la recolección de basura y el poder de reflejar el tiempo de ejecución. - Un lenguaje rápido, bien tipado y bien proporcionado que actúa como un lenguaje interpretado dinámico.

Nada hace que un programador se emocione más que descubrir un nuevo lenguaje de programación. Al examinar el estado actual del software y hardware informático, podemos ver por qué tenemos que cambiar a un nuevo lenguaje como Go. Durante la última década, la potencia de procesamiento en bruto ha aumentado ligeramente y el rendimiento de la frecuencia de la CPU se ha mantenido casi constante durante una década.

Go, se libero cuando los procesadores de varios núcleos ya estaban disponibles. Es por eso que Go se hizo pensando en la coordinación. Sus mecanismos síncronos facilitan la escritura de aplicaciones que utilizan más sistemas multinúcleo y en red. Si bien el nuevo tipo de sistema Go hace posible construir aplicaciones modulares flexibles, en lugar de centrarse en teorías, en métodos del mundo real para construir aplicaciones de próxima generación en la nube, así como computación avanzada y computación distribuidas.

## Histórico

Go es un lenguaje de programación procedimental que se lanzó en 2009 como lenguaje de programación de código abierto. Actualmente se utiliza en varios sistemas operativos de Google. El Go Compiler es compatible con Linux, Mac OS, Windows y una variedad de sistemas operativos BSD como FreeBSD. En términos de arquitectura de procesador, la arquitectura X86, la arquitectura X64, la arquitectura ARM y la arquitectura Power específica de IBM también son compatibles con Go.

## Arquitectura Lingüística

Go tiene muchas herramientas poderosas de análisis estático. Uno de ellos es go fmt, que diseña su código basándose en el estilo Go propuesto. Esto puede eliminar muchos comentarios en un proyecto normal y alentar a su equipo a concentrarse en el código. Lenguaje de programación desarrollado y compilado de forma nativa, que pertenece principalmente a la familia de lenguajes C en términos de sintaxis básica.

Como C y C++, está compilado en código de máquina, por lo que no necesitamos entornos como CLR y JVM para ejecutar programas Go. Esto ayuda especialmente al compilar programas grandes. Lenguaje simple y minimalista con diseño original de Go para en lugar del clásico Thread a goroutines. En Go, el límite de tamaño de pila mínimo se elimina de 4 KB a 8 KB cuando se crea una goroutine.

## Diseño

Go está influenciado por C, pero con un mayor énfasis en la simplicidad y la seguridad. Esto incluye:

- Patrones de adopción de sintaxis y entorno que son más comunes en lenguajes dinámicos: Declaración de variable corta opcional e introducción inicial por inferencia de tipo.

- Edición rápida.

- Administración de paquetes remotos (go download) y documentación de paquetes en línea.

- Enfoques distintivos para problemas específicos.

- Sincronización inicial: procesos de estilo (Gurvin), canales y expresiones selectivas.

- Un sistema de interfaz en lugar de herencia virtual e incrustación de tipo en lugar de la herencia no virtual.

- Un kit de herramientas que, de forma predeterminada, crea binarios de interfaz nativa sin dependencias externas.

- La tendencia a preservar las propiedades del lenguaje es lo suficientemente simple como para mantener en calam la cabeza de un programador, en parte eliminando características que son comunes a lenguajes similares.

## Go es Back o Front?

El código Go se puede ejecutar usando goper.js en el navegador. Pero el hecho es que la mayoría de los desarrolladores recurren a los lenguajes de programación Front y JavaScript para desarrollar su lado del cliente. Go es más preferido como lenguaje de respaldo y ofrece un alto rendimiento para el desarrollo simultáneo de aplicaciones de servidor.

## Algunas aplicaciones populares desarrolladas en Go

Algunos de los proyectos de código abierto en Go son:

- **Caddy**: servidor web HTTP 2 de código abierto con capacidad HTTPS automática

- **CockroachDB**: una base de datos SQL de código abierto, escalable y compatible

- **Docker**: incluye un conjunto de herramientas de implementación de Linux.

- **Ethereum**: implementación de Go-Ethereum, máquina de bloqueo de máquina virtual, Ethereum virtual para criptomoneda Ether

- **Hugo**: un generador de sitios estáticos

- **InfluxDB**: base de datos de código abierto para series de datos de alto acceso con requisitos de alto rendimiento

- **InterPlanetary File System**: un contenido y un protocolo de direccionamiento de medios punto a punto.

- **Juju**: una herramienta de evaluación de servicios de Canonical, paquetes de Ubuntu Linux.

- **Kubernetes**: sistema de gestión de contenedores

- **Lightning Network**: una red de bitcoins para transacciones rápidas de bitcoins.

- **Mattermost**: un sistema de chat en equipo.

- **OpenShift**: una plataforma de computación en la nube proporcionada por Red Hat como servicio.

- **Snappy**: un administrador de paquetes para Ubuntu Touch desarrollado por Canonical.

- **Syncthing**: software de sincronización de archivos cliente/servidor de código abierto.

- **Terraform**: una herramienta de código abierto para la infraestructura multimedia en la nube proporcionada por HashiCorp.

## Empresas y sitios notables que han utilizado GO (generalmente junto con otros lenguajes, no exclusivamente)

- **Cacoo**: para renderizar paneles de usuario y microservicios usando Go y gRPC.

- **Chango**: una empresa de publicidad que utiliza sistemas de precios en tiempo real.

- **Cloud Foundry**: una plataforma como servicio.

- **CloudFlare**: se utiliza para el proxy de codificación Delta Railgun, su servicio de DNS distribuido, así como herramientas para encriptación, registro, procesamiento de flujo y acceso a sitios SPDY.

- **CoreOS**: un sistema operativo basado en Linux que utiliza el repositorio Docker y el repositorio rkt.

- **Dropbox**: que ha migrado algunos de sus componentes vitales de Python a Go.

- **Ethereum**: una moneda digital

- **Google**: se utiliza para muchos proyectos, incluido el servidor de descargas (dl.google.com).

- **Hyperledger Fabric**: un proyecto de código abierto único.

- **MongoDB**: una herramienta para administrar instancias de MongoDB

- **Netflix**: se utiliza para dos partes de la arquitectura de su servidor.

- **Novartis**: para sistema de inventario interno

- **Nutanix**: se utiliza para una variedad de microservicios en su empresa Cloud OS.

- **Plug.dj**: un sitio web interactivo relacionado con la transmisión de música social en línea.

- **SendGrid**: un boulder, servicio de entrega de correo electrónico y servicio de gestión de transacciones.

- **SoundCloud**: se utiliza para "docenas de sistemas".

- **Empalme**: se utiliza para todo el backend (API y analizadores) en su plataforma de colaboración musical en línea.

- **ThoughtWorks**: Algunas herramientas y aplicaciones para entrega continua y mensajería instantánea (CoyIM).

- **Twitch.tv**: para el sistema de chat basado en IRC (migración desde Python).

- **Uber**: para manejar grandes volúmenes de consultas basadas en geovallas

## Go Features

Go compila código como lenguajes de bajo nivel como C++/C. Esto significa que funciona casi tan bien como lenguajes de bajo nivel. También utiliza la recolección de basura para recolectar y eliminar objetos.

![go_graph2](images/go_graph2.png)

El gráfico siguente muestra que Go es casi tan eficiente como C++/C, mientras mantiene la sintaxis simple como Ruby, Python y otros lenguajes. Esta es una situación en la que todos ganan para los humanos y los procesadores! El alto rendimiento como C++/C y Java proporciona una sincronización altamente eficiente para codificar en términos divertidos como Python y Perl. El software optimizado puede ejecutarse en hardware más barato y lento, como los dispositivos IoT, y generalmente tiene un mayor impacto en la experiencia del usuario final. El modelo de memoria Go agrega una nueva regla para enviar y recibir canales de búfer para indicar explícitamente que un canal de búfer puede usarse como un simple spammer.

![go_graph2](images/go_graph.png)

Descripción general de las características principales del lenguaje:

- **Compilación**:

Go genera compilaciones binarias para sus aplicaciones con todas las dependencias. No se requiere instalación de traductor o runtime.

- **Recolección de basura**:

Para recolectar desperdicios de baja latencia, opta por una administración automática de memoria que sea eficiente y sincrónica. La gestión de la memoria es intencionadamente más fácil que C y C++. Los objetos dedicados recolectan basura de forma dinámica.

- **Seguro**:

Go es un lenguaje de tipado estático que admite la seguridad de tipos. El compilador detecta los errores antes de la ejecución.

- **Sintaxis similar a C**:

La sintaxis Go recuerda a la familia C, pero con solo 25 palabras clave simples, es fácil de analizar sin tablas/símbolos de información de tipo y un diseño de notificación similar a Pascal.

- **Varios paradigmas:**

Go admite varios patrones de programación, incluida la programación esencial, orientada a objetos (OOP) y la programación funcional.

- **Librería estándar**:

Go tiene una potente librería estándar de paquetes para respaldar el desarrollo de aplicaciones Go.

- **Documentación sencilla:**

**GoDoc** es una herramienta de análisis de código estático que genera documentos estándar simplificados directamente desde el código.

- **Soporte de pruebas naturalmente**:

Soporte de prueba integrado en la librería estándar. Sin necesidad de dependencia adicional Si tiene un archivo llamado thing.go, escriba sus pruebas en otro archivo llamado thing_test.go y ejecute "go test".

## Go Tools

La distribución principal de Go incluye herramientas para crear, probar y analizar código:

- **go build**: crea un binario usando solo sus archivos fuente.

- **go test**: se utiliza para pruebas unitarias y microbenchmarks.

- **go fmt**: se utiliza para formatear el código.

- **go get**: se utiliza para recuperar e instalar paquetes remotos.

- **go vet**: un analizador estático que busca posibles vulnerabilidades o errores en el código.

- **go run**: un atajo para construir y ejecutar código directamente.

- **go doc**: para mostrar documentos o enviarlos a través de HTTP

- **go rename**: se utiliza para renombrar variables, funciones, etc. en tipo seguro.

- **go generate**: un método estándar para llamar a un generador de código

También incluye soporte de depuración y perfiles, herramientas de medición de tiempo de ejecución. El ecosistema de herramientas de terceros se ha agregado a la distribución estándar, incluido **gocode**, que permite completar automáticamente el código en muchos editores de texto. **goimports** (por un miembro del equipo de Go) que automáticamente elimina o agrega paquetes según sea necesario, y **errcheck**, que detecta errores de código y puede ignorarlos. Hay complementos para agregar soporte de idioma en algunos editores de texto. Hay varios IDE disponibles, incluidos LiteIDE y el "Go IDE multiplataforma" y GoLand.

## Aplicaciones del lenguaje

Go está diseñado específicamente como lenguaje de programación para grandes sistemas distribuidos y servidores de red altamente escalables. En este sentido, reemplaza a C++ y Java en la pila de software de Google. Muchos equipos buscan crear nuevos servidores en Go. Algunos incluso están migrando bases de código existentes. Algunas de las tecnologías de Google que utiliza a diario tienen componentes escritos en Go.

Dado que este es un lenguaje de programación relativamente nuevo, muchos preguntan para qué es adecuado. 

Un vistazo a algunos de sus beneficios:

- Ideal para el desarrollo web

- Excelente para scripts de línea de comandos

- Se puede utilizar para aplicaciones de servidor de red.

- Se puede utilizar para el desarrollo de front-end.

Los desarrolladores disfrutan usando Go porque tiene un entorno de desarrollo completo, y aprender Go es muy fácil, incluso para desarrolladores sin experiencia. Una de las razones de esto se debe al gran ecosistema de herramientas, por lo que es muy útil para proyectos grandes y conjuntos. Esto lo convierte en una excelente opción para programar software propietario. Si se está buscando más beneficios, Go fue creado y es mantenido por Google, que tiene una de las infraestructuras de nube más importantes del mundo y puede ser a gran escala.

### Data Science

Es una ciencia multidisciplinaria que utiliza métodos, procesos, algoritmos y sistemas científicos para extraer conocimientos e ideas de datos estructurados y no estructurados. La ciencia de datos es el concepto de combinar estadísticas, análisis de datos, aprendizaje automático y métodos relacionados para comprender y analizar fenómenos reales con datos. Extrae técnicas y teorías que han surgido de muchos campos de las matemáticas, la estadística, la informática y la ciencia de la información. El ganador del premio Turing, Jim Gray, ve la ciencia de datos como el "cuarto modelo" de la ciencia (experimental, teórico, computacional y ahora basado en datos) y afirma que "todo lo relacionado con la ciencia está cambiando debido al impacto de la tecnología de la información". 

En la actualidad, a menudo se usa indistintamente con conceptos anteriores, como análisis empresarial, inteligencia empresarial, modelado de previsión y estadísticas. Si bien muchos programas académicos ahora tienen un título en ciencia de datos, no existe un consenso sobre la definición del contenido curricular apropiado. Sin embargo, muchos proyectos de ciencia de datos y Big Data no han podido lograr resultados útiles, a menudo debido a la falta de gestión y utilización de recursos.

**«** Go demuestra cada vez pruebas más rápidas, codificación fácil en lenguajes de programación concurrentes altamente eficientes. Por lo general, es la próxima generación de ciencia de datos, aprendizaje automático e inteligencia artificial, porque existe un gran equilibrio entre la productividad y la retención de código. Muchos prototipos de científicos de datos, que luego son transferidos a producción por otra persona, deja que Go haga ambas cosas. **»**