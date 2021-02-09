/////////////Ajax Requests////////////
$(document).ready(function () {
  // Fetch the initial table
  refreshTable();
  // Fetch the initial Map
  refreshMap();

  // Fetch the initial Chart
  refreshChart();
  // Fetch every 5 second
  setInterval(refreshChart, 5000);

  // Fetch every 1 second
  setInterval(refreshTable, 5000);
  setInterval(refreshMap, 5000);
});

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(refreshChart);

function refreshTable() {
  // var trHTML = '';

  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1xSQAM7_yopXE25Fsblj4me2-frBx9rzoMh8tJAiOgmU/5/public/full?alt=json",
    function (data) {
      var trHTML = "";

      for (var i = 0; i < data.feed.entry.length; ++i) {
        var myData_map, myData_order;

        trHTML +=
          "<tr><td>" +
          data.feed.entry[i].gsx$orderid.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$item.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$priority.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$city.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$orderdispatched.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$ordershipped.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$ordertime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$dispatchtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$shippingtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$timetaken.$t +
          "</td></tr>";
      }

      console.log(trHTML);
      $("#tableContent").html(trHTML);
      var trHTML = "";
    }
  );
}

function refreshMap() {
  var container = L.DomUtil.get("map");

  if (container != null) {
    container._leaflet_id = null;
  }

  var map = L.map("map").setView([20.5937, 78.9629], 4);
  var jsonDataObject = [];

  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1xSQAM7_yopXE25Fsblj4me2-frBx9rzoMh8tJAiOgmU/5/public/full?alt=json",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        var json_data = {
          City: data.feed.entry[i].gsx$city.$t,
          OderID: data.feed.entry[i].gsx$orderid.$t,
          Item: data.feed.entry[i].gsx$item.$t,
          Latitude: parseFloat(data.feed.entry[i].gsx$latitude.$t),
          Longitude: parseFloat(data.feed.entry[i].gsx$longitude.$t),
          Dispatch_status: data.feed.entry[i].gsx$orderdispatched.$t,
          Shipped_status: data.feed.entry[i].gsx$ordershipped.$t,
        };
        jsonDataObject.push(json_data);

        for (var j = 0; j < jsonDataObject.length; j++) {
          var marker = L.marker(
            [
              parseFloat(jsonDataObject[j].Latitude),
              parseFloat(jsonDataObject[j].Longitude),
            ],
            {
              icon: set_marker_color(
                jsonDataObject[j].Dispatch_status,
                jsonDataObject[j].Shipped_status
              ),
            }
          );
          marker.bindPopup(jsonDataObject[j].City, {
            autoClose: false,
          });
          map.addLayer(marker);
          marker.on("click", onClick_Marker);
          // Attach the corresponding JSON data to your marker:
          marker.myJsonData = jsonDataObject[j];
          function set_marker_color(dis_status, ship_status) {
            var redIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-red.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            var greenIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-green.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            var yellowIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-yellow.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            if (dis_status == "YES" && ship_status == "YES") {
              return greenIcon;
            } else if (dis_status == "YES" && ship_status == "NO") {
              return yellowIcon;
            } else {
              return redIcon;
            }
          }
          function onClick_Marker(e) {
            var marker = e.target;
            popup = L.popup()
              .setLatLng(marker.getLatLng())
              .setContent(
                "Order ID: " +
                  marker.myJsonData.OderID +
                  " || Item: " +
                  marker.myJsonData.Item
              )
              .openOn(map);
          }

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);
        }
      }
    }
  );
}

function refreshChart() {
  var jsonDataObject = [];
  var graph_arr = [["Order ID", "Time Taken", { role: "style" }]];
  var bar_color = [];
  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/1xSQAM7_yopXE25Fsblj4me2-frBx9rzoMh8tJAiOgmU/5/public/full?alt=json",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        var json_data = {
          OderID: data.feed.entry[i].gsx$orderid.$t,
          TimeTaken: parseFloat(data.feed.entry[i].gsx$timetaken.$t),
          Priority: data.feed.entry[i].gsx$priority.$t,
        };
        jsonDataObject.push(json_data);
      }
      // Setting color for the coloumns of graph according to priority of items
      for (var j in jsonDataObject) {
        if (jsonDataObject[j].Priority == "HP") {
          var color = "#FF0000";
        } else if (jsonDataObject[j].Priority == "MP") {
          var color = "#FFFF00";
        } else if (jsonDataObject[j].Priority == "LP") {
          var color = "#00FF00";
        }
        bar_color.push(color);
      }

      // Converting Json Object to JavaScript Array
      for (var j in jsonDataObject) {
        graph_arr.push([
          jsonDataObject[j].OderID,
          jsonDataObject[j].TimeTaken,
          bar_color[j],
        ]);
      }
      var graphArray_Final = google.visualization.arrayToDataTable(graph_arr);

      var data = new google.visualization.DataView(graphArray_Final);

      var options = {
        title: "Time Taken for items to be Shipped",
        hAxis: { title: "Order ID" },
        vAxis: { title: "Time Taken (s)" },
        legend: { position: "none" },
      };
      var chart = new google.visualization.ColumnChart(
        document.getElementById("column_chart")
      );
      chart.draw(data, options);
    }
  );
}
