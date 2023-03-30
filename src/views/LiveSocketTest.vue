<template>
  <div class="d-flex">
    <div class="m-5">
      <h2>USD/TRY</h2>
      <div>
        <div>
          <span>Ask : </span>
          <span>{{ eurUsdAsk }}</span>
        </div>
        <div>
          <span>Bid : </span>
          <span>{{ eurUsdBid }}</span>
        </div>
      </div>
    </div>
    <div>
      <h2>EUR/TRY</h2>
      <div>
        <div>
          <span>Ask : </span>
          <span>{{ eurTryAsk }}</span>
        </div>
        <div>
          <span>Bid : </span>
          <span>{{ eurTryBid }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Menu from "@/components/Menu.vue";
import { Options, Vue } from "vue-class-component";

@Options({
  components: { Menu },
})
export default class Home extends Vue {
  eurUsdAsk = 0;
  eurUsdBid = 0;
  eurTryAsk = 0;
  eurTryBid = 0;

  mounted() {
    // you can use definiton service or just definition id
    // in this example we use socket subscribe callback to get data
    // you can use <SymbolField> component to get data easily but sometimes you need to use socket callback
    const usdTry = this.$foreksWebSDK.definition.getByCode("USDTRY");
    if (usdTry) {
      this.$foreksWebSDK.socket.subscribe(
        [usdTry._id, "o11"],
        ["a", "b"],
        (data) => {
          if (data._i == usdTry._id) {
            if (data.a) {
              this.eurUsdAsk = data.a;
            }
            if (data.b) {
              this.eurUsdBid = data.b;
            }
          }
          if (data._i == "o11") {
            if (data.a) {
              this.eurTryAsk = data.a;
            }
            if (data.b) {
              this.eurTryBid = data.b;
            }
          }
        }
      );
    }
  }
}
</script>
