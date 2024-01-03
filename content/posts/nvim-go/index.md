---
title: "Desarrollo con Go en Neovim"
date: 2024-01-03T12:19:35-03:00
draft: false
author: Thiago Mowszet
year: "2024"
month: "2024/01"
categories:
- Aprendizaje
- IDE
tags:
- software
- golang
- neovim
keywords:
- Go
- Neovim
disableComments: false
---

{{<postimage "images/nvim-go.png" "Go con Neovim">}}

En este post vamos a ver cómo configurar desde cero Neovim y específicamente cómo personalizarlo para que nuestro desarrollo con Go sea altamente productivo.

<!--more-->

## Instalación

Lo primero que debemos de hacer es instalar Neovim.

Si estamos en Windows, lo podemos hacer de la siguiente manera: 

```shell
winget install Neovim.Neovim
```

o también se puede realizar mediante gestores de paquetes externos como: Chocolatey o Scoop:
```shell
# scoop
scoop bucket add main
scoop install neovim

# chocolatey
choco install neovim # (Podes usar `-y` para saltear automaticamente la confirmacion de mensajes). 
```

Y si estás en Linux, lo podés hacer de la siguiente manera, dependiendo de tu gestor de paquetes:

```shell
# Arch 
sudo pacman -S neovim

# Debian
sudo apt-get install neovim

# Fedora
sudo dnf install -y neovim python3-neovim
```
Para las demás distribuciones de Linux o para instalarlo de manera local, les dejo la [documentación](https://github.com/neovim/neovim/blob/master/INSTALL.md) correspondiente.

Tener en cuenta que, dependiendo la distribución que se elija, será diferente la versión. Es decir, si descargamos Neovim en Ubuntu, vendrá con la versión 0.6 mientras que si se descarga en Manjaro, vendrán con la última versión estable (esto por la gestión de paquetes de cada distro).

Es por esto que es siempre mejor descargar la última versión estable desde el código fuente, ya que nos aseguramos que nuestra versión sea la última y compatible con las últimas novedades de Neovim.


## Gestión de carpetas

Una vez instalado Neovim, vamos a generar nuestras carpetas. 

En Linux, haremos lo siguiente en: ~/.config/nvim. Si nuestra carpeta no existe, la creamos.

En Windows, sera en: Local Disk (C:)/Users/tu-usuario/AppData/Local/nvim. Si nuestra carpeta no existe, la creamos.

```md
nvim/
├── after/
│   └── plugin/
│       ├── tokyonight.lua
│       └── telescope.lua
├── lua/
│   └── tu-nombre/
│       ├── init.lua
│       ├── packer.lua
│       ├── remap.lua
│       └── set.lua
├── plugin/
│   └── packer_compiled.lua
└── init.lua
```

A continuación se explica para qué sirve cada carpeta.

- after/plugin: Dentro de esta, creamos los .lua con el nombre del plugin que descarguemos para configurar como queramos nuestros plugins. En el arbol de referencia se ve los archivos tokyonight.lua y telescope.lua que nos sirven como ejemplo.

- lua/tu-nombre: Aquí, cambiaremos {tu-nombre} por tu nombre, en mi caso thiago, y dentro tendremos los archivos que nos servirán para descargar y setear nuestros atajos y configuraciones de Nvim.

- plugin: Esta carpeta debemos de generarla, pero su archivo (packer_compiled.lua) se genera automáticamente, en el ira toda nuestra configuración de Neovim. Es importante saber que no debemos de tocar este archivo. 

- init.lua: En este archivo, haremos el llamado de la carpeta "tu-nombre", para que al iniciar se carguen automáticamente nuestras configuraciones.

Si bien entraremos en detalle más adelante de cada archivo y configuración, está bueno saber el set up de nuestro editor de texto.

## Packer (Gestor de plugins)

Ya con nuestras carpetas generadas, vamos a instalar [Packer](https://github.com/wbthomason/packer.nvim) que será nuestro gestor de plugins para Neovim.

Es cierto que este repositorio no se mantiene desde Agosto de 2023, y que muchos usuarios de Neovim están migrando a [Lazy](https://github.com/folke/lazy.nvim) o [Pckr](https://github.com/lewis6991/pckr.nvim) (el sucesor de packer), pero para este post usaremos Packer, ya que sentara las bases de nuestro conocimiento para Neovim y luego podremos realizar otro post sobre la migración a Lazy (esto debido a que quien escribe, actualmente, no migro su gestor a otro 😅).


Para instalar packer, debemos de hacerlo de la siguiente manera:

Instalación en Unix, Linux.
```shell
git clone --depth 1 https://github.com/wbthomason/packer.nvim\
 ~/.local/share/nvim/site/pack/packer/start/packer.nvim
```

Instalación en Windows PowerShell.
```shell
git clone https://github.com/wbthomason/packer.nvim "$env:LOCALAPPDATA\nvim-data\site\pack\packer\start\packer.nvim"
```

Una vez instalado, iremos al siguiente path: .config/nvim/lua/tu-nombre/ e ingresaremos al archivo packer.lua en donde ingresaremos el siguiente código:

```lua
return require('packer').startup(function(use)
    use 'wbthomason/packer.nvim'
end)
```

Una vez hecho los cambios, haremos el siguiente comando en el modo normal: `:so` y enter. Y luego de esto haremos: `:PackerInstall` para instalar el nuevo paquete que agregamos.

Y ya que estamos realizando modificaciones, iremos a  nvim/lua/tu-nombre/ y agregaremos los siguientes cambios en:

- nvim/lua/tu-nombre/init.lua

```lua
require("tu-nombre.set")
require("tu-nombre.remap")
```

- y en nuestro init.lua de nvim/init.lua: 

```lua
require("tu-nombre")
```

## Personalización

ya con nuestra configuración básica, vamos a poner bonito nuestro editor de texto, ya que por default viene vacío.

En: lua/tu-nombre/set.lua, vamos a setear lo básico de nuestro editor de texto:

```lua
vim.opt.nu = true -- Muestra el número de línea actual.
vim.opt.smartindent = true -- Habilita el autoindentado inteligente.
vim.opt.cursorline = true -- Resalta la línea en la que se encuentra el cursor.
vim.opt.clipboard:append("unnamedplus") -- Configura el portapapeles para usar el registro "unnamedplus" (clipboard).
vim.opt.termguicolors = true -- Habilita los colores de la terminal si es posible.
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
```

Y en lua/tu-nombre/remap.lua, vamos a realizar nuestros mapeos.

Para ejecutar un plugin que instalamos se hace de la siguiente manera: `:Plugin-a-Ejecutar`

Pero esto es tedioso, por lo que en este archivo .lua, podemos configurarlo para que con ciertas combinaciones se ejecute el plugin que queramos.

```lua

local keymap = vim.keymap -- Creamos esta variable para no estar constantemente escribiendo vim.keymap.set({})
local opts = { noremap = true, silent = true } -- Esto se hace para que nuestro atajo sea silencioso y no afecte tu vista.

vim.g.mapleader = " " -- Seteamos la tecla espacio como lider. Esto nos servira mas adelante para mapear nuestros atajos.

--  Usaremos este mapeo como ejemplo

keymap.set("n", "<leader>q", ":q<CR>") 
-- Como bien sabemos, para salir de Nvim, se hace con :q. Entonces este mapeo, lo que nos permite es salir de nvim utilizando la combinacion de teclas: <leader> + q.
-- <leader> lo seteamos mas arriba (vim.g.mapleader = " "), puede ser cualquier tecla y <CR> es un enter.
-- Es lo mismo que hacer :q + enter, nada mas que lo asignamos a un mapeo y ejecutaremos esta funcion de forma facil y rapida.
-- Ahora salir de Nvim no sera un problema.

```

Para poder trabajar con temas de colores, lo haremos de la siguiente manera en: nvim/lua/tu-nombre/packer.lua

```lua
return require('packer').startup(function(use)
    use 'wbthomason/packer.nvim' -- Gestor de paquetes.
	use 'folke/tokyonight.nvim' -- Esquema de colores.
    use("nvim-treesitter/nvim-treesitter", { run = ":TSUpdate" }) -- Nos provee un resaltado de colores en nuestro codigo. 
    use({
		"nvim-lualine/lualine.nvim", -- Barra de estado.
		requires = { "kyazdani42/nvim-web-devicons", opt = true },
	})
    use({
		"nvim-tree/nvim-tree.lua", -- Arbol de archivos.
		requires = {
			"nvim-tree/nvim-web-devicons",
		},
	})
    use("fatih/vim-go") -- Para el desarrollo con Go.
end)
```

Una vez que tengamos los plugins que necesitemos, haremos lo que hicimos en pasos previos 

`:so` y `enter` y luego `:PackerInstall` para poder instarlos.

Una vez instalados, debemos de ir a nvim/after/plugin/ y crear los archivos .lua para cada plugin que descargamos. Por ejemplo.

- nvim/after/plugin/lualine.nvim

```lua
require('lualine').setup({
    options = {
        theme = "auto"
    }
})
```

- nvim/after/plugin/nvim-treesitter.nvim

```lua
require('nvim-treesitter.configs').setup({
    ensure_installed = {"javascript", "lua", "json", "html", "css", "typescript", "markdown", "go", "python"},
    sync_install = false,
    auto_install = true,
    highlight = {enable = true}
})
```

Para que no se haga muy largo este post, haremos un video en el [canal de YouTube](https://www.youtube.com/@gophers-latam) de la comunidad para que sea más fácil y visual el uso de Nvim.

Espero que este posts les sea de utilidad para aprender. Tambien les dejo mi [configuración de Nvim](https://github.com/ThiagoMowszet/Neovim-LuaSetUp) en donde explico qué es, porque lo uso y todos los plugins que utilizo en mi día a día.
