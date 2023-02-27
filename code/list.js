var list_query = function (filter, x0, x1) {
  return "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
PREFIX : <http://127.0.0.1:3333/>\
SELECT ?label ?rank (GROUP_CONCAT(DISTINCT ?label_artist; SEPARATOR=';') AS ?label_artists) (SAMPLE(?genre) AS ?genres) ?year WHERE{\
  ?album a :Album;\
  rdfs:label ?label;\
  :hasReview ?review;\
  :hasGenre ?genre;\
  :wasReleasedIn ?year;\
  :wasMadeBy ?artist.\
  ?artist rdfs:label ?label_artist.\
  ?review :hasRank ?rank.\
  FILTER(" + (filter ? "false" : "true") + " ||  ?year >=" + x0 + "&& ?year <= " + x1 + ")\
}\
GROUP BY ?label ?rank ?year ORDER BY ASC(?rank) "}


var load_list = function (x0, x1) {
  document.getElementById("list").replaceChildren();

  sparql(endpointURL, x0 === undefined ? list_query(false, 0, 0) : list_query(true, x0, x1)).then(function (data) {
    data.forEach(element => {

      const node = document.createElement("div");
      node.classList.add("item")

      let label_artists = ""
      element.label_artists.split(";").forEach((l) => label_artists += `<a onclick="load_details('${l.replace("'", "\'")}','${element.label.replace("'", "\'")}')" href='#'> ${l} </a>, `)
      label_artists = label_artists.slice(0, -2)

      node.innerHTML = '<div class="title"><b>' + element.label + '</b></div><div class="artists">' + label_artists + '</div><div class="date">' + element.year + '</div><div class="genre">' + element.genres + '</div>'
      document.getElementById("list").appendChild(node);
    });
  })

}
