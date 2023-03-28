<template>
  <div v-if="ready">
    <h1>{{ definition.securityDesc }} Sembol Detail</h1>
    <ul>
      <li>Code: {{ definition.code }}</li>
      <li>ISIN: {{ definition.ISIN }}</li>
      <li>Ask Price: {{ askPrice }}</li>
      <li>Bid Price: {{ bidPrice }}</li>
    </ul>
  </div>
</template>
<script lang="ts">
import Definition from "foreks-sdk/commons/types/Definition";
import PubsubData from "foreks-sdk/commons/types/PubsubData";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  ready = false;
  definition: Definition | undefined;
  askPrice = 0;
  bidPrice = 0;

  async mounted() {
    await this.initialComponent();
  }

  async initialComponent() {
    // get definition from foreks-web-sdk (you must initial first see main.ts)
    this.definition = this.$foreksWebSDK.definition.getByCode("GARAN");

    // --> Example 1
    // subscribe to ask and bid get data from pubsub
    // with this way you can get data in real time & you can collect symbol snapshot data
    // you can access socket snapshot data example: this.$foreksWebSDK.socket.getFieldSnapShotValue("GARAN", "a")
    if (this.definition) {
      this.$foreksWebSDK.socket.subscribe(
        [this.definition?._id],
        ["a", "b"],
        (data: PubsubData) => {
          if (data.a) this.askPrice = data.a;
          if (data.b) this.bidPrice = data.b;
        }
      );
    }

    // --> Example 2
    // or use snapshot service to get ask and bid
    if (this.definition) {
      const snapshot = await this.$foreksWebSDK.snapshot.getMultiSnapshot(
        this.definition?.legacyCode, // definition legacy code
        ["ask", "bid"] // field name
      );
      this.askPrice = snapshot[0].ask;
      this.bidPrice = snapshot[0].bid;
    }

    this.ready = true;
  }
}
</script>
