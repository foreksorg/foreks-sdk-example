<template>
  <div>
    <h1>Foreks News</h1>
    <div v-if="!ready">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
      <p>loading news data...</p>
    </div>
    <div v-if="ready">
      <table>
        <thead>
          <tr>
            <th>Header</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in newsData" :key="item._id">
            <td>{{ item.header }}</td>
            <td>{{ new Date(item.publishDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { NewsLocale, NewsSources } from "foreks-sdk/commons/enums";
import NewsResponse from "foreks-sdk/commons/types/repo/NewsResponse";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  ready = false;
  newsData: NewsResponse[] = [];

  async mounted() {
    await this.initialCalendar();
  }

  async initialCalendar() {
    this.newsData = await this.$foreksWebSDK.news.getNews(
      NewsSources.FRKS,
      10,
      NewsLocale.TR
    );
    this.ready = true;
  }
}
</script>
