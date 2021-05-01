---
title: "Golang: Mantener actualizado el SDK"
date: 2021-04-12T00:12:24-05:00
draft: false
author: ZeroIdentidad
year: "2021"
month: "2021/04"
categories:
- Comunidad
- Tutorial
tags:
- actualizar sdk
- golang
keywords:
- golang
- sdk
disableComments: false
---

{{<postimage "images/update-go.png" "Update Go">}}

Como ocurre con todos los lenguajes de programación, hay actualizaciones periódicas de las herramientas de desarrollo de Go. El SDK Go son binarios nativos que no dependen de un tiempo de ejecución independiente, por lo que no hay que preocuparse de que la actualización del entorno de desarrollo pueda hacer que los programas actualmente implementados fallen. Puede tenerse programas compilados con diferentes versiones de Go ejecutándose simultáneamente en la misma computadora o máquina virtual.

<!--more-->

Desde Go **1.2**, ha habido una nueva versión importante aproximadamente cada seis meses. También hay versiones menores con correcciones de errores y seguridad que se publican según sea necesario. Dados los rápidos ciclos de desarrollo y el compromiso del equipo de Go con la compatibilidad con versiones anteriores, las versiones de Go tienden a ser incrementales en lugar de expansivas. La **[promesa de compatibilidad](https://golang.org/doc/go1compat)** de Go es una descripción detallada de cómo el equipo de Go planea evitar romper el código de Go. Dice que no habrá cambios retrógrados en el lenguaje o la librería estándar para cualquier versión de Go que comience con **1**, a menos que el cambio sea necesario para un error o corrección de seguridad. Sin embargo, puede haber (y ha habido) cambios incompatibles con versiones anteriores en los indicadores o la funcionalidad de los comandos **go**.

A pesar de estas garantías de compatibilidad con versiones anteriores, los errores ocurren, por lo que es natural querer asegurarse de que una nueva versión no rompa los programas personales ya hechos. Una opción es instalar un entorno Go secundario. Por ejemplo, si actualmente se está ejecutando la versión 1.15.2 y se quiere probar la versión 1.16.3, debe usarse los siguientes comandos:

```shell
go get golang.org/dl/go.1.16.3

go1.16.3 download
```

Luego se puede usar el comando **go1.16.3** en lugar del comando **go** para ver si la versión 1.16.3 funciona para los programas ya hechos anteriormente con la nueva versión de Go:

```shell
go1.16.3 build
```

Una vez que se haya validado que el código funciona, puede eliminarse el entorno secundario buscando el **GOROOT**, eliminándolo y luego eliminando el binario del directorio **$GOPATH/bin**. A continuación, las indicaciones de cómo hacerlo en Mac OS, Linux y BSD respectivamente:

```shell
go1.16.3 env GOROOT
/Users/gobook/sdk/go1.16.3

rm -rf $(go1.16.3 env GOROOT)

rm $(go env GOPATH)/bin/go1.16.3
```

Cuando se está listo para actualizar las herramientas de desarrollo de Go instaladas en la computadora, los usuarios de Mac y Windows tienen la ruta más fácil. Aquellos que instalaron con **brew** o **chocolatey** pueden usar esas herramientas para actualizar. Aquellos que usaron los instaladores en **[golang.org/dl]()** pueden descargar el último instalador, que elimina la versión anterior cuando se instala la nueva.

Los usuarios de Linux y BSD en general deben descargar la última versión, mover la versión anterior a un directorio de respaldo, expandir la nueva versión y luego eliminar la versión anterior, algo así:

```shell
mv /usr/local/go /usr/local/old-go

tar -C /usr/local -xzf go1.16.3.linux-amd64.tar.gz

rm -rf /usr/local/old-go
```

Como nota final, igual en cada versión que sale en el canal del Discord **#📰fuente-noticias** se comparte automáticamente del canal de Twitter oficial como obtener la nueva versión. 