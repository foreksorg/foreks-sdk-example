<template>
  <div class="home">
    <div>
      <h1>Live Socket Data</h1>
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
    </div>
    <EconomicCalendar />
    <hr />
    <News />
    <hr />
    <SymbolDetail />
    <hr />
    <SymbolList />
  </div>
</template>

<script lang="ts">
import EconomicCalendar from "@/components/EconomicCalendar.vue";
import News from "@/components/News.vue";
import SymbolDetail from "@/components/SymbolDetail.vue";
import SymbolList from "@/components/SymbolList.vue";
import { Options, Vue } from "vue-class-component";

@Options({
  components: { EconomicCalendar, News, SymbolDetail, SymbolList },
})
export default class Home extends Vue {
  eurUsdAsk = 0;
  eurUsdBid = 0;
  eurTryAsk = 0;
  eurTryBid = 0;

  mounted() {
    // you can use definiton service or just definition id
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
