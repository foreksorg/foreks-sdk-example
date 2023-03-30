<template>
  <div v-if="ready">
    <h1>{{ definition.issuerName }}</h1>
    <ul>
      <li v-for="sf in symbolDetailFields" :key="sf.shortCode">
        <span>{{ sf.label }}</span>
        <span>
          <SymbolField
            :definition="definition"
            :field="getFieldByShortCode(sf.shortCode)"
          ></SymbolField>
        </span>
      </li>
    </ul>
    <div id="chart">
      <apexchart
        type="candlestick"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>
<script lang="ts">
import Definition from "foreks-sdk/commons/types/Definition";
import Field from "foreks-sdk/commons/types/Field";
import moment from "moment";
import { Options, Vue } from "vue-class-component";
import SymbolField from "../components/SymbolField.vue";

@Options({
  components: {
    SymbolField,
  },
})
export default class extends Vue {
  ready = false;
  definition: Definition | undefined;
  chartOptions = {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: "CandleStick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };
  series: any[] = [];
  symbolDetailFields: any[] = [
    {
      shortCode: "a",
      label: "Ask",
    },
    {
      shortCode: "b",
      label: "Bid",
    },
    {
      shortCode: "l",
      label: "Last",
    },
    {
      shortCode: "C",
      label: "Change",
    },
    {
      shortCode: "t",
      label: "Time",
    },
  ];

  async created() {
    // get definition id param from route and get definition from definition service
    this.definition = this.$foreksWebSDK.definition.getById(
      this.$route.params.id as string
    );

    if (this.definition) {
      // prepare from and to dates for intraday service
      const from = moment().add(-30, "days").format("YYYYMMDDHHmmss");
      const to = moment().format("YYYYMMDDHHmmss");

      // get intraday data from intraday service
      const intradayResponse = await this.$foreksWebSDK.intraday.getHistorical(
        this.definition,
        "1440", // 1440 = 1 day
        from,
        to
      );

      this.series = [
        {
          data: [],
        },
      ];

      // convert intraday response to chart data
      intradayResponse.forEach((intraday) => {
        this.series[0].data.push([
          moment(intraday.d).valueOf(),
          intraday.o,
          intraday.h,
          intraday.l,
          intraday.c,
        ]);
      });
    }

    this.ready = true;
  }

  getFieldByShortCode(shortCode: string): Field | undefined {
    return this.$foreksWebSDK.field.getByShortCode(shortCode);
  }
}
</script>
