---
title: "{{ replace .Name "-" " " | title }}"
draft: false
image: //via.placeholder.com/640x150
alt_text: "{{ replace .Name "-" " " | title }} screenshot"
summary: "Resumen del proyecto {{ replace .Name "-" " " | title }}"
tech_used:
- JavaScript
- CSS
- HTML
keywords:
- html
repo: https://github.com/gophers-latam/{{ replace .Name | title }}
---

Descripción del proyecto {{ replace .Name "-" " " | title }} ...