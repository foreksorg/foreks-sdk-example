<template>
  <div v-if="ready">
    <ul>
      <li v-for="definition in definitions" :key="definition._id">
        {{ definition.securityDesc }} - <b>{{ definition.code }}</b>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import Definition from "foreks-sdk/commons/types/Definition";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  ready = false;
  definitions: Definition[] = [];

  async mounted() {
    await this.initialComponent();
  }

  async initialComponent() {
    // get definition from foreks-web-sdk (you must initial first see main.ts)
    this.definitions = this.$foreksWebSDK.definition.getDefinitionByQuery([
      {
        domain: "BIST", // only bist domain definitions
        marketSector: "Equity", // only equity market sector definitions
        securityType: "Stock", // only stock security type definitions
      },
    ]);

    this.ready = true;
  }
}
</script>
