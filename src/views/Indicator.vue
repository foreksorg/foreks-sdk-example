<template>
  <div>
    <h1>GARAN.E.BIST</h1>
    <div v-if="!ready">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
      <p>loading indicator data...</p>
    </div>
    <div v-if="ready">
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Son</th>
            <th>Yüksek</th>
            <th>Düşük</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td>{{ indicatorData[1].e.c }}</td>
            <td>{{ indicatorData[1].e.h }}</td>
            <td>{{ indicatorData[1].e.l }}</td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th></th>
            <th>Klasik</th>
            <th>Woodie</th>
            <th>Fibonacci</th>
            <th>Camarilla</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in categoriesInData" :key="index">
            <th>{{ categories[index] }}</th>
            <td>{{ indicatorData[1].r["PVT=classic"][item] || 0.0 }}</td>
            <td>{{ indicatorData[1].r["PVT=woodie"][item] || 0.0 }}</td>
            <td>{{ indicatorData[1].r["PVT=fibonacci"][item] || 0.0 }}</td>
            <td>{{ indicatorData[1].r["PVT=camarilla"][item] || 0.0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { Indicators } from "foreks-sdk/commons/enums";
import IndicatorResponse from "foreks-sdk/commons/types/repo/IndicatorResponse";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  categories = ["R3", "R2", "R1", "P.", "S1", "S2", "S3"];
  categoriesInData = ["r3", "r2", "r1", "pp", "s1", "s2", "s3"];
  ready = false;
  indicatorData!: IndicatorResponse;
  async mounted() {
    await this.initialIndicator();
  }

  async initialIndicator() {
    this.indicatorData = await this.$foreksWebSDK.indicator.getIndicatorLast(
      "GARAN.E.BIST",
      1440,
      2,
      [
        { PVT: "classic" },
        { PVT: "fibonacci" },
        { PVT: "camarilla" },
        { PVT: "woodie" },
      ] as unknown as Record<Indicators, string>[]
    );
    this.ready = true;
  }
}
</script>
