<template>
  <div>DENEME</div>
</template>
<script lang="ts">
import HeatMapResponse from "foreks-sdk/commons/types/repo/HeatMapResponse";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  ready = false;
  indicatorData!: IndicatorResponse;
  async mounted() {
    await this.initialHeatMap();
  }

  async initialHeatMap() {
    this.$foreksWebSDK.indicator
      .getIndicatorLast("GARAN.E.BIST", 1440, 2, [
        { PVT: "classic" },
        { PVT: "fibonacci" },
        { PVT: "camarilla" },
        { PVT: "woodie" },
      ] as unknown as Record<Indicators, string>[])
      .then((indicatorRes) => {
        this.indicatorData = indicatorRes;
        this.ready = true;
      });
  }
}
</script>
