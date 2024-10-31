<template>
  <div @click="goBack()">BACK</div>
  <div @click="toggleShowGraph()">Graph</div>
  <div v-if="!ready">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
    <p>loading heatmap data...</p>
  </div>
  <div v-if="ready">
    <div v-show="graphShow" id="googleChart"></div>
    <div v-show="!graphShow">
      <div>{{ tableData.parent[0].label }}</div>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>last</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in tableData.childs"
            @click="tableClick(item)"
            :key="index"
          >
            <td>{{ item.label }}</td>
            <td>{{ item.last }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import HeatMapResponse from "foreks-sdk/commons/types/repo/HeatMapResponse";
import { Options, Vue } from "vue-class-component";
import { GoogleCharts } from "google-charts";
import { reactive } from "vue";

interface NodeData {
  code: string;
  label: string;
  last: number;
  changePercentage: number;
  calculation: number;
  childs: NodeData[]; // Recursive structure for nested children
}

@Options({})
export default class extends Vue {
  /* eslint-disable */
  ready = false;
  container;
  chartData;
  tableData = reactive({
    parent: [] as NodeData[],  // Parent için NodeData tipinde bir dizi
    childs: [] as NodeData[]
  });
  data;
  graphShow = true;
  parentInfo;
  parentCode;
  scaleMax;
  lastSelection;
  treemap;
  selectedlevel = "XU100";
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
    "rgba(219,17,19,0.2)",
    "rgba(219,17,19,0.4)",
    "rgba(219,17,19,0.6)",
    "rgba(219,17,19,0.8)",
    "rgba(219,17,19,1)",
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
      this.drawTable(this.selectedlevel,null);
    });
  }

  goBack() {
    // var parent = this.findParent(item.label);
    // console.log(parent,item.name)
    // this.drawTable(parent,null);
    this.treemap.goUpAndDraw();
    this.addColors();
  }

  toggleShowGraph() {

    this.graphShow = !this.graphShow;
  }

  tableClick(item){
    var dataRows = this.data.getFilteredRows([
        {
          column: 0,
          value: item.label,
        },
      ]);
      this.treemap.setSelection([{column:null,row:dataRows[0]}])
      this.lastSelection = dataRows[0];
      this.drawTable(item.name,null);
      this.addColors();
      var parent = this.findParent(item.label);
  }

  findParent(nodeCode) {

    const filteredRows = this.data.getFilteredRows([{ column: 0, value: nodeCode }]);
    if (filteredRows.length > 0) {
        const rowIndex = filteredRows[0]; 
        const parentCode = this.data.getValue(rowIndex, 1); 
        return parentCode; 
    } else {
        console.warn("Parent bulunamadı.");
        return null;
    }
}


  handleSelection(){

    var selectedNode = this.treemap.getSelection()[0].row;
    this.drawTable(this.data.getValue(selectedNode,6),null);
    this.data.getValue(selectedNode,0).includes("DIGER") ? this.treemap.setSelection([{column:null,row:this.lastSelection}]) : this.lastSelection = selectedNode

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

  drawTable(code, obj) {
        if (code) {
          if (this.levelCalculatedData.hasOwnProperty(code)) {
            this.selectedlevel = code;
          } else {
            if (obj) {
              if (obj.show) {
                obj.show = false;
              } else {
                obj.show = true;
              }
            }
          }
        }
        this.tableData = this.levelCalculatedData[this.selectedlevel];
        this.parentInfo = this.tableData.parent[0];
        this.parentInfo.changePercentageFormatted = this.parentInfo.changePercentage;
        this.scaleRefresh();
      };
      scaleRefresh() {
        this.scaleMax = this.levelCalculatedData[this.selectedlevel].absMax;
        this.parentCode = this.levelCalculatedData[this.selectedlevel].parent[0].parentCode;
      };
  drawChart() {
    this.chartData = this.prepareData();
    this.chartData.unshift([
      "Code",
      "Parent",
      "Calc",
      "color",
      "changePercentage",
      "last",
      "name",
    ]);

    GoogleCharts.api.setOnLoadCallback(() => {
      this.data = GoogleCharts.api.visualization.arrayToDataTable(this.chartData);
      var view = new GoogleCharts.api.visualization.DataView(this.data);
      view.setColumns([0, 1, 2]);

      this.container = document.getElementById("googleChart");
      this.treemap = new GoogleCharts.api.visualization.TreeMap(this.container);

      const drawIt = () => {
        this.treemap.draw(view, {
          headerHeight: 35,
          legend: false,
          fontColor: "black",
          fontSize: 10,
          height: 500,
          width: 500,
          eventsConfig: {
            highlight: [],
          }
        },);
        setTimeout(() => {
          this.addColors();
        });
      }

      GoogleCharts.api.visualization.events.addListener(
        this.treemap,
        "onmouseout",
        this.addColors
      );
      GoogleCharts.api.visualization.events.addListener(
        this.treemap,
        "onmouseover",
        this.addColors
      );
      GoogleCharts.api.visualization.events.addListener(
        this.treemap,
        "ready",
        this.addColors
      );
      GoogleCharts.api.visualization.events.addListener(this.treemap, 'select', this.handleSelection);
      drawIt();
    });
  }

  addColors() {
    const elements = Array.from(
      document.getElementsByTagName(
        "rect"
      ) as unknown as HTMLCollectionOf<HTMLElement>
    );

    elements.forEach((element, index) => {
      var textElement = element?.parentNode?.querySelector("text");


      for (var i = 0; i < this.data.Wf.length; i++) {
        var parentX = textElement?.getAttribute("x");
        var isVertical = false;
        if (textElement?.textContent?.includes("…")) {
          isVertical = true;
          textElement!.setAttribute("style", "writing-mode: tb;");
        }
        if (
          this.data.Wf[i].c[0].v.startsWith(
            textElement?.textContent?.replace("…", "")
          )
        ) {
          let roundedNum = this.data.Wf[i].c[4].v && typeof this.data.Wf[i].c[4].v === "number" ? Math.round(this.data.Wf[i].c[4].v * 1000) / 1000 : "0";
          if (textElement) {
            textElement!.innerHTML = isVertical ? `<tspan x="${parentX}" dx="5">${this.data.Wf[i].c[0].v}</tspan>
              <tspan x="${parentX}" y="${textElement?.getAttribute("y")}" dx="-5">% ${roundedNum}</tspan>` : `<tspan x="${parentX}" dy="-5">${this.data.Wf[i].c[0].v}</tspan>
              <tspan x="${parentX}" dy="10">% ${roundedNum}</tspan>`;;
          }
          var textLength = textElement?.getBBox().width;
          var svgLength = textElement?.parentElement?.getBoundingClientRect().width;
          if (textLength && svgLength) {
            textLength >= svgLength &&
              textElement!.setAttribute("font-size", "8");
          }
          break;
        }
      }
      var dataRows = this.data.getFilteredRows([
        {
          column: 0,
          value: textElement?.textContent?.split(" % ")[0].trim(),
        },
      ]);
      if (dataRows.length > 0) {
        element.setAttribute("fill", this.data.getValue(dataRows[0], 3));
      }
    });
  }
  
  prepareData() {
    var dataArr: any[] = [];
    var excludedArray: any[] = [];
    var xu100 = this.levelCalculatedData[this.selectedlevel];
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
      var totalChange = 0;
      if (key.childs) {
        key.childs = key.childs.sort(function (a, b) {
          if (a.y > b.y) return -1;
          if (a.y < b.y) return 1;
          return 0;
        });
        for (var j = 0; j < key.childs.length; j++) {
          var child = key.childs[j];

          if (j < 5) {
            if (!excludedArray.includes(key.parent[0].label)) {
              dataArr.push([
                child.label,
                key.parent[0].label,
                child.y,
                child.color,
                child.changePercentage,
                child.last,
                child.name,
              ]);
            }
          } else {
            other += child.y;
            totalChange += child.changePercentage;
            excludedArray.push(child.label);
          }
        }
        if (other !== 0) {
          if (!excludedArray.includes(key.parent[0].label)) {
            dataArr.push([
              key.parent[0].name + " DIGER",
              key.parent[0].label,
              other,
              "#bfbfbf",
              totalChange,
              0,
              "",
            ]);
          }
        }
      }
    }
    return dataArr;
  }
}
</script>