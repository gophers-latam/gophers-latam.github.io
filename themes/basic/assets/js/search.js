'use strict'

window.SearchApp = {
    searchField: document.getElementById("searchField"),
    searchButton: document.getElementById("searchButton"),
    allwords: document.getElementById("allwords"),
    output: document.getElementById("output"),
    searchData: {},
    searchIndex: {}
};

axios
.get('/search/index.json')
.then(response => {
    SearchApp.searchData = response.data;
    SearchApp.searchIndex = lunr(function() {
        this.pipeline.remove(lunr.stemmer);
        this.searchPipeline.remove(lunr.stemmer);        
        this.ref('href');
        this.field('title');
        this.field('body');
        response.data.results.forEach(e => {
            this.add(e);
        });
    });
});

SearchApp.searchButton.addEventListener('click', search);

function search() {
    let searchText = SearchApp.searchField.value;

    if (searchText){
        searchText = searchText
        .split(" ")
        .map(word => { return word + "*" })
        .join(" ");
        if (SearchApp.allwords.checked) {
            searchText = searchText
            .split(" ")
            .map(word => { return "+" + word })
            .join(" ");
        }      
        
        let resultList = SearchApp.searchIndex.search(searchText);
        let list = [];
        let results = resultList.map(entry => {
            SearchApp.searchData.results.filter(d => {
                if (entry.ref == d.href) {
                    list.push(d);
                }
            })
        });
        display(list);        
    } else {
        SearchApp.output.innerHTML = "Ingrese un valor de búsqueda";
    }
}

function display(list) {
    SearchApp.output.innerText = '' ;
    if (list.length > 0) {
        const ul = document.createElement("ul");
        list.forEach(el => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = el.href;
            a.text = el.title;
            li.appendChild(a);
            ul.appendChild(li);
        });
        SearchApp.output.appendChild(ul);
    } else {
        SearchApp.output.innerHTML = "Nada encontrado <br/>";
    }
};