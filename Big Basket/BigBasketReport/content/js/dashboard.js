/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4528301886792453, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Home Page HTTP Request-0"], "isController": false}, {"data": [0.0, 500, 1500, "Home Page HTTP Request-1"], "isController": false}, {"data": [1.0, 500, 1500, "Search Product HTTP Request-0"], "isController": false}, {"data": [0.0, 500, 1500, "Search Product HTTP Request"], "isController": false}, {"data": [1.0, 500, 1500, "Search Product HTTP Request-1"], "isController": false}, {"data": [0.0, 500, 1500, "Search Product HTTP Request-2"], "isController": false}, {"data": [1.0, 500, 1500, "Select Product HTTP Request-0"], "isController": false}, {"data": [0.7, 500, 1500, "Select Product HTTP Request-1"], "isController": false}, {"data": [0.0, 500, 1500, "Select Product HTTP Request-2"], "isController": false}, {"data": [0.1, 500, 1500, "Select Product HTTP Request"], "isController": false}, {"data": [0.0, 500, 1500, "Home Page HTTP Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 53, 0, 0.0, 2104.6037735849063, 36, 5942, 1919.0, 5489.8, 5765.8, 5942.0, 3.8080183934473344, 605.4855897039805, 2.5677741952866793], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Home Page HTTP Request-0", 5, 0, 0.0, 231.2, 170, 459, 175.0, 459.0, 459.0, 459.0, 1.9872813990461047, 0.6540174135532592, 0.22512172098569158], "isController": false}, {"data": ["Home Page HTTP Request-1", 5, 0, 0.0, 4907.4, 3544, 5770, 5361.0, 5770.0, 5770.0, 5770.0, 0.6393044367727911, 313.3248525604143, 0.07741577164045518], "isController": false}, {"data": ["Search Product HTTP Request-0", 5, 0, 0.0, 47.2, 36, 61, 48.0, 61.0, 61.0, 61.0, 1.1566042100393246, 0.39306471200555165, 0.5150503122831367], "isController": false}, {"data": ["Search Product HTTP Request", 5, 0, 0.0, 3556.8, 2560, 5764, 3174.0, 5764.0, 5764.0, 5764.0, 0.7030371203599549, 117.47132377495781, 1.120740034448819], "isController": false}, {"data": ["Search Product HTTP Request-1", 5, 0, 0.0, 308.8, 301, 316, 307.0, 316.0, 316.0, 316.0, 1.086720278200391, 1.0103102586394261, 0.5730751467072376], "isController": false}, {"data": ["Search Product HTTP Request-2", 5, 0, 0.0, 3198.0, 2180, 5419, 2816.0, 5419.0, 5419.0, 5419.0, 0.7388798581350673, 122.52229916321855, 0.4592022868331609], "isController": false}, {"data": ["Select Product HTTP Request-0", 5, 0, 0.0, 47.2, 38, 58, 46.0, 58.0, 58.0, 58.0, 2.6680896478121667, 0.9770836112593383, 1.6983015941835644], "isController": false}, {"data": ["Select Product HTTP Request-1", 5, 0, 0.0, 800.2, 361, 1881, 459.0, 1881.0, 1881.0, 1881.0, 2.2758306781975417, 98.51679847519344, 1.6353088017751478], "isController": false}, {"data": ["Select Product HTTP Request-2", 3, 0, 0.0, 2684.3333333333335, 2304, 3386, 2363.0, 3386.0, 3386.0, 3386.0, 0.8246289169873557, 194.52625712960418, 0.5363309167124793], "isController": false}, {"data": ["Select Product HTTP Request", 5, 0, 0.0, 2460.0, 984, 3902, 2722.0, 3902.0, 3902.0, 3902.0, 1.086720278200391, 201.25168102043034, 1.8966664855466202], "isController": false}, {"data": ["Home Page HTTP Request", 5, 0, 0.0, 5141.4, 4011, 5942, 5537.0, 5942.0, 5942.0, 5942.0, 0.6032818532818532, 295.8686268927968, 0.14139418436293436], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 53, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
