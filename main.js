var data = undefined;
// taille de la marge en haut
var margin = {top: 20, right: 40, bottom: 30, left: 40};

// définiton de la legende
function legend(element, keys, z) {
    // taille du carré de la légende
    var legendRectSize = 15;
    // taille de la partie où sera la légende
    var svg = d3.select('#'+element).append('svg')
        // taille en hauteur
        .attr('width', 400)
        // taille en largeur
        .attr('height', 30);

//
    var legend = svg.selectAll('.legend')
        // analyse de la datakeys
        .data(keys)
        .enter()
        .append('g')
        .attr('class', 'legend')
        // espacement entre les carrés
        .attr('transform', function (d, i) {
            var horz = 0 + i * 110 + 10;
            var vert = 0;
            return 'translate(' + horz + ',' + vert + ')';
        });
// place des carrés
    legend.append('rect')
        // taille du carré en largeur
        .attr('width', legendRectSize)
        // taille du carré en largeur
        .attr('height', legendRectSize)
        .style('fill', function (d) {
            return z(d)
        })
        .style('stroke', function (d) {
            return z(d)
        });

// place du texte par rapport aux carrés
    legend.append('text')
        //espace entre le carré et le texte en largeur
        .attr('x', legendRectSize + 5)
        // espace entre le carré et le texte en hauteur
        .attr('y', 15)
        // texte de la légende
        .text(function (d) {
            return d;
        });
}

//définition fonction treemap
function treemap(element,propertya, propertyb) {
// recherche de la donnée pour la treemap
    $("#treemap_" + element).html("");
    // recherche de la légende pour la treemap
    $("#legend_" + element).html("");
    // espace pour la treemap
    var svg = d3.select("#treemap_" + element).append("svg").attr("width", 1200).attr("height", 600);
    //espacement entre les deux treemap
    var width = +svg.attr("width") - margin.left - margin.right;
    // espace pour ne pas le cacher derrière la footer
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Condition si la data est pas défini
    if (data === undefined) {
        // l'ignorer
        return;
    }

//couleur de la treemap
    var color = d3.scaleOrdinal(['#21DADD','#7CAD2E','#FF9F1C','#B2190E','#7C1354']);

//calcul pour la taille des carrés
    var nested_data = d3.nest()
        .key(function (d) {
            return d[propertya];
        })
        .key(function (d) {
            return d[propertyb];
        })
        .rollup(function (d) {
            return d.length;
        })
        .entries(data);

    console.log("TREEMAP DATA");
    console.log(nested_data);

    keys = nested_data.map(function (d) {
        return d.key;
    });
// couleur pour la légende
    color.domain(keys);
    legend("legend_" + element, keys, color);
// taille de la treemap selon les données
    var treemap = d3.treemap()
        .size([width, height])
        .padding(1)
        .round(true);

    var root = d3.hierarchy({values: nested_data}, function (d) {
        return d.values;
    })
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    treemap(root);

    var nodes = g.selectAll(".tm")
        .data(root.leaves())
        .enter().append("g")
        .attr('transform', function (d) {
            return 'translate(' + [d.x0, d.y0] + ')'
        })
        .attr("class", "tm");

    nodes.append("rect")
        .attr("width", function (d) {
            return d.x1 - d.x0;
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("fill", function (d) {
            return color(d.parent.data.key);
        });
// texte dans les différentes cases
    nodes.append("text")
        .attr("class", "tm_text")
        // espace par rapport au côté de la case
        .attr('dx', 4)
        // espace par rapport au haut de la case
        .attr('dy', 14)
        .text(function (d) {
            return d.data.key + " " + d.data.value;
        });

}
// definition de la fonction bar_chart
function bar_chart(element, property) {
    $("#" + element).html("");
    // espace pour lebarchart
    var svg = d3.select("#" + element).append("svg").attr("width", 600).attr("height", 600);
    // emplacement du barchart par rapport au côté de la zone
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var nested_data = d3.nest()
        .key(function (d) {
            return d[property];
        })
        .rollup(function (d) {
            return {
                size: d.length, total_time: d3.sum(d, function (d) {
                    return d.time;
                })
            };
        })
        .entries(data);

    nested_data = nested_data.sort(function (a, b) {
        return d3.ascending(a.key, b.key)
    });


    console.log("BARCHART DATA");
    console.log(nested_data);

    if (property ==="time"){
    var x = d3.scaleLinear()
        .rangeRound([0, width]);}

    else{
        x = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);
    }

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

// couleur du barchart
    var z = d3.scaleOrdinal(['#7C1354','#B2190E','#FF9F1C','#7CAD2E','#21DADD']);

    if (property === "time") {
        x.domain([0, d3.max(nested_data.map(function (d) {
            return +d.key;
        })) + 1]);
    } else {
        x.domain(nested_data.map(function (d) {
            return d.key;
        }));

    }

    y.domain([0, d3.max(nested_data, function (d) {
        return d.value.size;
    })]);
    z.domain(nested_data.map(function (d) {
        return d.key;
    }));

    g.selectAll(".bar")
        .data(nested_data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.key)
        })
        .attr("y", function (d) {
            return y(d.value.size)
        })
        .attr("height", function (d) {
            return height - y(d.value.size);
        })
        .attr("width", function (d) {
            if (property ==="time"){
                return(10);
            }
            else{
                return x.bandwidth();
            }
            return (1000);
        })
        .style("fill", function (d) {
            return z(d.key)

        });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
}

$(function () {
    console.log("READY");
// adresse des données
    var URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfeT9lPtJ5ia2XsopWVdvl98Oy7Bu6xL9SVQBEh32OXC8Qk4MKYxr2TcGSSTkAs7kAMfjF83IEGhQ-";
    URL += "/pub?single=true&output=csv";


    d3.csv(URL, function (d) {
        data = d;
        data.forEach(function (d) {
            d.time = +d.time;
        });
        //pour la barchart id bcs, trier par status,
        bar_chart("bcs", "status");
        //pour la barchart id bcw, trier par who
        bar_chart("bcw", "who");
        //pour la barchart id bcp, trier par priority
        bar_chart("bcp", "priority");
        //pour la barchart id bct, trier par time
        bar_chart("bct", "time");
        //pour la treemap, trier par who
        treemap("status","status", "who");
        //pour la treemap, trier par priority
        treemap("who","who","priority");

    });

});