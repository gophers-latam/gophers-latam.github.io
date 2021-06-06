---
title: "GoKey"
draft: false
image: ./images/gokey.png
alt_text: "GoKey"
summary: "Primer proyecto OSS en comunidad sobre cache en memoria. - **En desarrollo**"
tech_used:
- Golang
keywords:
- go
repo: https://github.com/gophers-latam/GoKey
---

GoKey es un cache en memoria. El principal aspecto es guardar, leer y borrar entradas dentro del ciclo de vida de la goroutine main. Es decir, si deja de correr, los datos se pierden.

**Estatus**: `ETAPA 1` - *libreria cliente*