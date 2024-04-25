<template>
  <div v-if="!ready">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
    <p>loading heatmap data...</p>
  </div>
  <div v-if="ready">
    <div id="googleChart"></div>
  </div>
</template>
<script lang="ts">
import HeatMapResponse from "foreks-sdk/commons/types/repo/HeatMapResponse";
import { Options, Vue } from "vue-class-component";
import { GoogleCharts } from "google-charts";

@Options({})
export default class extends Vue {
  ready = false;
  levelCalculatedData = {};
  heatMapData!: HeatMapResponse;
  positiveColor = [
    "rgba(43,160,41,0.2)",
    "rgba(43,160,41,0.4)",
    "rgba(43,160,41,0.6)",
    "rgba(43,160,41,0.8)",
    "rgba(43,160,41,1)",
  ];
  negativeColor = [
    "rgba(219,17,19,1)",
    "rgba(219,17,19,0.8)",
    "rgba(219,17,19,0.6)",
    "rgba(219,17,19,0.4)",
    "rgba(219,17,19,0.2)",
  ];
  zeroColor = ["rgba(69, 69, 69, 0.5)"];
  scaleColors = [
    ...this.negativeColor,
    "rgba(0,0,0,0.1)",
    ...this.positiveColor,
  ];

  async mounted() {
    GoogleCharts.load("current", { packages: ["treemap"] });
    await this.initialHeatMap();
  }

  async initialHeatMap() {
    this.$foreksWebSDK.heatMap.getHeatMap().then((heatMapRes) => {
      this.ready = true;
      this.heatMapData = heatMapRes;
      this.calculateDept(this.heatMapData, "root");
      this.drawGraph();
    });
  }

  calculateLevelsData(levelJson, parentCode) {
    var levelData: any = {};
    var parent: any[] = [];
    var childs: any[] = [];
    var pelem = {};
    pelem["name"] = levelJson.code;
    pelem["parentCode"] = parentCode;
    pelem["label"] = levelJson.labels[0].text;
    pelem["y"] = 100;
    pelem["last"] = levelJson.last;
    pelem["changePercentage"] = levelJson.changePercentage;
    var absMax = Math.abs(levelJson.changePercentage);
    parent.push(pelem);
    levelJson.childs.forEach((item, index) => {
      var celem = {};
      celem["name"] = item.code;
      celem["label"] = item.labels[0].text;
      celem["y"] = (item.calculation / levelJson.calculation) * 100;
      celem["last"] = item.last;
      celem["changePercentage"] = item.changePercentage;
      var abschildMax = Math.abs(item.changePercentage);
      if (absMax < abschildMax) {
        absMax = abschildMax;
      }
      childs.push(celem);
    });
    childs.sort(function (a, b) {
      return b.changePercentage - a.changePercentage;
    });

    levelData["parent"] = parent;
    levelData["childs"] = childs;
    levelData["absMax"] = absMax;
    this.setItemColor(levelData.parent, levelData.absMax);
    this.setItemColor(levelData.childs, levelData.absMax);
    this.levelCalculatedData[levelJson.code] = levelData;
  }

  setItemColor(jsonArray, maxColor) {
    var colorRange = maxColor / 4;
    jsonArray.forEach((item) => {
      var changePercentage = item.changePercentage;
      var absChangePercentage = Math.abs(changePercentage);
      var colorIndex = Math.floor(absChangePercentage / colorRange);
      if (changePercentage === 0) {
        item["color"] = this.zeroColor[0];
      } else if (0 < changePercentage) {
        item["color"] = this.positiveColor[colorIndex];
      } else if (changePercentage < 0) {
        item["color"] = this.negativeColor[colorIndex];
      }
    });
  }

  calculateDept(jsonData, parentCode) {
    if (0 < jsonData.childs.length) {
      this.calculateLevelsData(jsonData, parentCode);
    }
    jsonData.childs.forEach((item, index) => {
      this.calculateDept(item, jsonData.code);
    });
  }

  drawGraph() {
    this.drawChart();
  }

  drawChart() {
    var chartData = this.prepareData();
    chartData.unshift([
      "Code",
      "Parent",
      "Calc",
      "color",
      "changePercentage",
      "last",
      "name",
    ]);

    GoogleCharts.api.setOnLoadCallback(function () {
      var data = GoogleCharts.api.visualization.arrayToDataTable(chartData);
      var view = new GoogleCharts.api.visualization.DataView(data);
      view.setColumns([0, 1, 2]);

      var container = document.getElementById("googleChart");
      var treemap = new GoogleCharts.api.visualization.TreeMap(container);

      function drawIt() {
        treemap.draw(view, {
          headerHeight: 35,
          legend: false,
          fontColor: "black",
          fontSize: 10,
          height: 500,
          width: 500,
        });
        setTimeout(function () {
          addColors();
        });
      }

      function addColors() {
        const elements = Array.from(
          document.getElementsByTagName(
            "rect"
          ) as unknown as HTMLCollectionOf<HTMLElement>
        );

        elements.forEach((element, index) => {
          var textElement = element?.parentNode?.querySelector("text");
          if (textElement?.textContent?.includes("…")) {
            for (var i = 0; i < data.Wf.length; i++) {
              if (
                data.Wf[i].c[0].v.startsWith(
                  textElement?.textContent?.replace("…", "")
                )
              ) {
                textElement!.textContent = data.Wf[i].c[0].v;
                textElement!.setAttribute("style", "writing-mode: tb;");
                break;
              }
            }
          }
          var dataRows = data.getFilteredRows([
            {
              column: 0,
              value: textElement?.textContent,
            },
          ]);
          if (dataRows.length > 0) {
            element.setAttribute("fill", data.getValue(dataRows[0], 3));
          }
        });
      }
      GoogleCharts.api.visualization.events.addListener(
        treemap,
        "onmouseout",
        addColors
      );
      GoogleCharts.api.visualization.events.addListener(
        treemap,
        "onmouseover",
        addColors
      );
      GoogleCharts.api.visualization.events.addListener(
        treemap,
        "ready",
        addColors
      );
      drawIt();
    });
  }
  prepareData() {
    var dataArr: any[] = [];
    var xu100 = this.levelCalculatedData["XU100"];

    dataArr.push([
      xu100.parent[0].label,
      null,
      xu100.parent[0].y,
      xu100.parent[0].color,
      xu100.parent[0].changePercentage,
      xu100.parent[0].last,
      xu100.parent[0].name,
    ]);
    for (var i = 0; i < Object.keys(this.levelCalculatedData).length; i++) {
      var key =
        this.levelCalculatedData[Object.keys(this.levelCalculatedData)[i]];
      var other = 0;
      if (key.childs) {
        key.childs = key.childs.sort(function (a, b) {
          if (a.y > b.y) return -1;
          if (a.y < b.y) return 1;
          return 0;
        });
        for (var j = 0; j < key.childs.length; j++) {
          var child = key.childs[j];
          if (j < 5 || child.label.indexOf("BIST") > -1) {
            dataArr.push([
              child.label,
              key.parent[0].label,
              child.y,
              child.color,
              child.changePercentage,
              child.last,
              child.name,
            ]);
          } else {
            other += child.y;
          }
        }
        if (other !== 0) {
          dataArr.push([
            key.parent[0].name + " DIGER",
            key.parent[0].label,
            other,
            "#bfbfbf",
            0,
            0,
            "",
          ]);
        }
      }
    }
    return dataArr;
  }
}
</script>
