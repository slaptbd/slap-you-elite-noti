//var searchResultFormat = '<tr><td>$machine</td><td>$line</td><td><a href="$link" target="_blank">YouTube</a></td></tr>';
// var searchResultFormat = '<tr><td><a href="$link" target="_blank">$machine</a></td><td align="left">$line</td></tr>'
var searchResultFormat = '<tr><td><a href="$id" target="_blank">$category</a></td><td align="left">$name</td> <td align="left">$size</td></tr>';
var linkTemplate = 'https://youtube.com/watch?v=$video&t=$time';
var linkTemplateAcademy = 'https://academy.hackthebox.eu/module/details/$course';
var totalLimit = 500;
var replaceStrings = ['HackTheBox - ', 'VulnHub - ', 'UHC - '];

const print = console.log

var currCategory = ""

function onSelect(id) {

    currCategory = id.replace("cat_", "")

    document.getElementById(id).checked = true
}


function updateCate(id) {

    currCategory = id

}


const categorySel = `<input type="radio" name="radAnswer" id="cat_$CNAME" onclick="updateCate('$CNAME')"/>
    <label for="cat_$CNAME">
        <a onclick="onSelect('cat_$CNAME')" >
            $CNAME
        </a>
    </label>`



const category = ['Tutorials.json.gz', 'Games.json.gz', 'Movies.json.gz', 'Sports.json.gz', 'Anime.json.gz', 'Bangla.json.gz', 'Documentaries.json.gz', 'Cartoons.json.gz', 'Music.json.gz', 'E-books.json.gz', 'Other.json.gz', 'Apps.json.gz', 'TV.json.gz']

var categoryEle = document.getElementById("category")


window.dataset = {}

category.forEach((e, i) => {

    e = e.split(".")[0]
    var c = categorySel.replaceAll("$CNAME", e)

    if (i != category.length - 1) {
        c += "|"
    }
    categoryEle.innerHTML += c

    window.dataset[e] = []

})


function reqNProc() {
    category.forEach((e, i) => {
        c = e.split(".")[0]
        e = "./data/" + e
        fetch(e)
            .then(res => res.blob())
            .then(res => {
                try {
                    res.arrayBuffer().
                        then(res => {
                            try {
                                ungz = pako.ungzip(res, { to: 'string' })
                                window.data = ungz

                                data = JSON.parse(ungz);
                                window.dataset[e.split(".")[1].split("/")[2]] = data;
                                console.log(e.split(".")[1].split("/")[2])
                                // currentSet = window.dataset;
                                // window.controls.updateResults(resultsTable, window.dataset);
                                // doSearch({ type: 'none' });
                            }catch (err) {
                                print(err)
                            }
                        })
                } catch (err) {
                    print(err)
                }
            })
    })
}

reqNProc()

var controls = {
    oldColor: '',
    displayResults: function() {
        if (results.style) {
            results.style.display = '';
        }
        resultsTableHideable.classList.remove('hide');
    },
    hideResults: function() {
        if (results.style) {
            results.style.display = 'none';
        }
        resultsTableHideable.classList.add('hide');
    },
    doSearch: function(match, dataset) {

        results = [];

        words = match.toLowerCase();
        words = words.split(' ');
        regex = '';
        posmatch = [];
        negmatch= [];
        // Lazy way to create regex (?=.*word1)(?=.*word2) this matches all words.
        for (i = 0; i < words.length; i++) {
            if (words[i][0] != '-') {
                posmatch.push(words[i]);
                regex += '(?=.*' + words[i] + ')';
            } else {
                negmatch.push(words[i].substring(1));
                //regex += '(^((?!' + words[i].substring(1) + ').)*$)';
            }
        }
        if (negmatch.length > 0 ) {
          regex += '(^((?!('; // + words[i].substring(1) + ').)*$)';
          for (i= 0; i < negmatch.length; i++) {
            regex += negmatch[i];
            if (i != negmatch.length -1) {
              regex += '|';
            }
          }
        regex += ')).)*$)';
        }

        dataset.forEach(e => {
            // for (i = 0; i < replaceStrings.length; i++) {
            //     e.machine = e.machine.replace(replaceStrings[i], '');
            // }

            if ( (e.name + e.category).toLowerCase().match(regex) ) results.push(e);

            // if ( (e.line + e.machine + e.tag).toLowerCase().match(regex) ) results.push(e);
            // if ( (e.line + e.machine + e.tag).toLowerCase().match(regex) ) results.push(e);
            //if (e.line.toLowerCase().match(regex) || e.machine.toLowerCase().match(regex) || e.tag.toLowerCase().match(regex)) results.push(e);
        });
        print(results)
        return results;
    },
    updateResults: function(loc, results) {
        if (results.length == 0) {
            noResults.style.display = '';
            noResults.textContent = 'No Results Found';

            resultsTableHideable.classList.add('hide');
        } else if (results.length > totalLimit) {
            noResults.style.display = '';
            resultsTableHideable.classList.add('hide');
            noResults.textContent = 'Error: ' + results.length + ' results were found, try being more specific';
            this.setColor(colorUpdate, 'too-many-results');
        } else {
            var tableRows = loc.getElementsByTagName('tr');
            for (var x = tableRows.length - 1; x >= 0; x--) {
                loc.removeChild(tableRows[x]);
            }

            noResults.style.display = 'none';
            resultsTableHideable.classList.remove('hide');

            results.forEach(r => {
                //Not the fastest but it makes for easier to read code :>

            el = searchResultFormat
			    .replace('$name', r.name)
			    .replace('$category', r.category)
			    .replace('$id', r.tid)
			    .replace('$size', r.size)

                var wrapper = document.createElement('table');
                wrapper.innerHTML = el;
                var div = wrapper.querySelector('tr');

                loc.appendChild(div);
            });
        }
    },
    setColor: function(loc, indicator) {
        if (this.oldColor == indicator) return;
        var colorTestRegex = /^color-/i;

        loc.classList.forEach(cls => {
            //we cant use class so we use cls instead :>
            if (cls.match(colorTestRegex)) loc.classList.remove(cls);
        });
        loc.classList.add('color-' + indicator);
        this.oldColor = indicator;
    }
};
window.controls = controls;

document.addEventListener('DOMContentLoaded', function() {
    results = document.querySelector('div.results');
    searchValue = document.querySelector('input.search');
    form = document.querySelector('form.searchForm');
    resultsTableHideable = document.getElementsByClassName('results-table').item(0);
    resultsTable = document.querySelector('tbody.results');
    resultsTable = document.querySelector('tbody.results');
    noResults = document.querySelector('div.noResults');
    colorUpdate = document.body;

    // Preventing initial fade
    document.body.classList.add('fade');

    var currentSet = [];
    var oldSearchValue = '';

    function doSearch(event) {
        var val = searchValue.value;

        if (currCategory == ""){
            print(currCategory)
            alert("Please Select A Category Before Searching")
        }

        if (val != '') {
            controls.displayResults();
            currentSet = window.dataset[currCategory];
            oldSearchValue = val;

            currentSet = window.controls.doSearch(val, currentSet);
            if (currentSet.length < totalLimit) window.controls.setColor(colorUpdate, currentSet.length == 0 ? 'no-results' : 'results-found');

            window.controls.updateResults(resultsTable, currentSet);
        } else {
            controls.hideResults();
            window.controls.setColor(colorUpdate, 'no-search');
            noResults.style.display = 'none';
            currentSet = window.dataset[currCategory];
        }

        if (event.type == 'submit') event.preventDefault();

    }




//     fetch('./all_data.json.gz')
//         .then(res => res.blob())
//         .then(res => {
//             try {
//                 res.arrayBuffer().
//                     then(res => {
//                         ungz = pako.ungzip(res, { to: 'string' })
//                         window.data = ungz
//                         try {
//                             data = JSON.parse(ungz);
//                             window.dataset = data;
//                             currentSet = window.dataset;
//                             window.controls.updateResults(resultsTable, window.dataset);
//                             doSearch({ type: 'none' });
//                         }catch (err) {
//                             print(err)
//                         }
//                     })
//             } catch (err) {
//                 print(err)
//             }
//         })

    form.submit(doSearch);

    searchValue.addEventListener('input', doSearch);
});
