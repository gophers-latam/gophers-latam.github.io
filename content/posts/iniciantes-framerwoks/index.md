---
title: "Explorando Frameworks en Go: Una Guía para Principiantes"
date: 2024-04-12T19:44:34-03:00
draft: false
author: Thiago Mowszet
year: "2024"
month: "2024/04"
categories:
- Principiantes
- Frameworks
tags:
- frameworks
- golang
- principiantes
keywords:
- frameworks 
- golang
- discord
disableComments: false
---

{{<postimage "images/go-frameworks.png" "go frameworks">}}

Últimamente, en nuestro canal de [discord](https://discord.me/gophers-latam), hemos recibido numerosas preguntas, especialmente de aquellos que están dando sus primeros pasos con Go, sobre qué frameworks deberían considerar al comenzar a desarrollar con este lenguaje. 
En este post, vamos a explorar temas como la biblioteca estándar, los diferentes frameworks disponibles en Go, sus opciones, cuáles son los más rápidos y los más utilizados.


<!--more-->

# ¿Cómo comenzar a escribir aplicaciones web con Go?


No es imprescindible utilizar un framework para comenzar con Go; la biblioteca estándar proporciona todo lo necesario para desarrollar aplicaciones de manera efectiva. 
Todo lo que necesitas hacer es crear una carpeta con tu archivo principal e importar el paquete [net/http](https://pkg.go.dev/net/http) para comenzar a desarrollar.

Las ventajas de utilizar la biblioteca estándar en lugar de un framework son las siguientes:

* ___Simplicidad y Minimalismo___: El paquete “net/http” está desarrollado siguiendo los principios de simplicidad y minimalismo, lo que significa que no hay una sobrecarga de funcionalidades o dependencias innecesarias, lo que puede resultar en código más limpio y fácil de entender.

* ___Rendimiento___: La biblioteca estándar de Go está optimizada para un rendimiento óptimo. 

* ___Flexibilidad___: El paquete “net/http” proporciona una gran flexibilidad para construir servidores web y manejar solicitudes HTTP de manera personalizada. Esto permite adaptar la aplicación a requisitos específicos sin estar limitado por las decisiones de diseño del framework.

* ___Compatibilidad___: Al basarse en la biblioteca estándar, las aplicaciones desarrolladas con el paquete “net/http” son altamente compatibles con otros paquetes y bibliotecas de Go. Esto facilita la integración con otras partes del ecosistema de Go y reduce la posibilidad de conflictos de dependencias.

* ___Control Total___: Al evitar el uso de frameworks, los desarrolladores tienen un control total sobre el flujo de su aplicación. Esto significa que pueden tomar decisiones de diseño más personalizadas y adaptar la aplicación según las necesidades específicas del proyecto.


# ¿Cuál es el mejor framework?
En el mundo Go, no existe un "mejor" framework, ya que existen una variedad de ellos, cada uno con sus propias características y propósitos. La elección del framework ideal depende en gran medida de los requisitos específicos de tu proyecto, así como de tus preferencias personales y el estilo de desarrollo que te resulte más cómodo.

Algunos frameworks populares en la comunidad de Go incluyen Chi, Fiber, Gorilla, Echo y Gin, entre otros. Cada uno de estos frameworks tiene sus puntos fuertes y débiles, y la mejor opción dependerá de factores como la complejidad del proyecto, la escalabilidad requerida, la facilidad de uso y la familiaridad con el framework.

Es importante investigar y probar diferentes frameworks para determinar cuál se adapta mejor a nuestras necesidades y objetivos.

Si tenés dudas sobre cuál elegir, en el siguiente repositorio de GitHub, podrás encontrar una lista con los frameworks de Go más famosos filtrados por las estrellas obtenidas por los usuarios de dicha plataforma, también encontraras las fechas con las últimas actualizaciones y la cantidad de forks hechos:  [Go Web Frameworks por Mingrammer](https://github.com/mingrammer/go-web-framework-stars)

Y si sos un apasionado de los números y las tablas te dejo 3 webs que te van a encantar, en las cuales se hacen los diferentes benchmarks de cada framework:

* [Go Web Framework Benchmark](https://github.com/smallnest/go-web-framework-benchmark) (Actualizado en el 2020, pero en el readme nos explica como podemos ejecutar uno propio)

* [Go Http Routing Benchmark](https://github.com/julienschmidt/go-http-routing-benchmark) (Actualizado en el 2020, pero en el readme nos explica como podemos ejecutar uno propio)

* [Benchmarks](https://www.techempower.com/benchmarks/) (Última actualización reciba: 2023-10-17)

Las ventajas de utilizar un framework son las siguientes: 

* ___Productividad mejorada___: Los frameworks suelen proporcionar herramientas y estructuras predefinidas que facilitan el desarrollo de aplicaciones. Esto puede reducir el tiempo necesario para construir y mantener el código, lo que a su vez aumenta la productividad del equipo de desarrollo.

* ___Abstracciones útiles___: Los frameworks pueden ofrecer abstracciones útiles que simplifican tareas comunes, como el enrutamiento, la autenticación de usuarios, el manejo de sesiones, la validación de datos, entre otros. Esto permite a los desarrolladores centrarse en la lógica de negocio de la aplicación en lugar de reinventar la rueda para cada proyecto.

* ___Mejores prácticas integradas___: Muchos frameworks promueven el uso de mejores prácticas de desarrollo, como el patrón MVC (Modelo-Vista-Controlador) o la inyección de dependencias. Esto puede resultar en un código más organizado, mantenible y escalable a medida que el proyecto crece.

* ___Comunidad activa___: Los frameworks suelen tener una comunidad activa de desarrolladores que contribuyen con bibliotecas, extensiones, tutoriales y soporte en línea. Esto puede ser útil para obtener ayuda, resolver problemas y mantenerse al día con las mejores prácticas y las últimas actualizaciones.

* ___Documentación detallada___: Los frameworks a menudo vienen con una documentación completa y detallada que facilita el aprendizaje y el uso de las características proporcionadas. Esto puede ser especialmente útil para los desarrolladores que son nuevos en un lenguaje o en el desarrollo web en general.


# ¿Cuál es la recomendación de la comunidad?
En cuanto a la recomendación de un framework en particular por parte de la comunidad, no hay una preferencia unánime. Cada desarrollador tiene la libertad de elegir el framework que mejor se adapte a sus necesidades específicas. Sin embargo, es común sugerir que la biblioteca estándar de Go proporciona una base sólida y completa para la mayoría de los proyectos.
