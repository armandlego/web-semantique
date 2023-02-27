var details_query = function (artist, album) {
    return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX : <http://127.0.0.1:3333/>
SELECT ?image (GROUP_CONCAT(DISTINCT ?genre; SEPARATOR='<br>') AS ?genres) WHERE {
  ?album a :Album;
    rdfs:label "${album}"@en;
  :wasMadeBy ?artist.
  ?artist rdfs:label "${artist}"@en.
  SERVICE <https://query.wikidata.org/sparql> {
  	?sub wdt:P31 wd:Q482994;
        wdt:P175 ?f_artist.
    ?f_artist rdfs:label|skos:altLabel "${artist}"@en;
        wdt:P18 ?image.
    OPTIONAL {
        ?f_artist wdt:P136 ?f_genre.
        ?f_genre rdfs:label ?genre.
FILTER(lang(?genre) = 'en').
            }    
        }
    } 
    GROUP BY ?image`}

var load_details = function (artist, album) {

    sparql(endpointURL, details_query(artist, album)).then((data) => {

        if (data.length > 0) {
            document.querySelector("#details img").src = data[0].image
            document.getElementById("name").innerText = artist
            if (data[0].genres !== undefined)
                document.getElementById("genres").innerHTML = "<b>" + data[0].genres + "</b>"
            else
                document.getElementById("genres").innerHTML = ""
        }
        else {
            document.querySelector("#details img").src = ""
            document.getElementById("name").innerText = "❌ Could not find the artist on Wikidata"
            document.getElementById("genres").innerHTML = ""
        }
    });

}