---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
author: Gophers LATAM
year: "{{ dateFormat "2006" .Date }}"
month: "{{ dateFormat "2006/01" .Date }}"
categories:
- Personal
- Experiencias
tags:
- software
- golang
keywords:
- html
disableComments: false
---

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua.

<!--more-->

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat.