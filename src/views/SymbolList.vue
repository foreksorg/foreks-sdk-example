<template>
  <div>
    <select
      v-model="selectedDefinitionQuery"
      @change="changeListQuery(selectedDefinitionQuery.query)"
    >
      <option
        v-for="definitionQuery in definitionQueries"
        :key="definitionQuery.label"
        :value="definitionQuery"
      >
        {{ definitionQuery.label }}
      </option>
    </select>
    <table class="table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Ask</th>
          <th>Bid</th>
          <th>Last</th>
          <th>Close</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="definition in definitions"
          :key="definition._id"
          class="pointer"
          @click="goToSymbolDetail(definition)"
        >
          <td>
            <div class="d-flex tal">
              <SymbolField
                :definition="definition"
                :field="getFieldByShortCode('d')"
                :is-direction="true"
              ></SymbolField>
              {{ definition.code }}
            </div>
          </td>
          <td>
            <SymbolField
              :definition="definition"
              :field="getFieldByShortCode('a')"
            ></SymbolField>
          </td>
          <td>
            <SymbolField
              :definition="definition"
              :field="getFieldByShortCode('b')"
            ></SymbolField>
          </td>
          <td>
            <SymbolField
              :definition="definition"
              :field="getFieldByShortCode('l')"
            ></SymbolField>
          </td>
          <td>
            <SymbolField
              :definition="definition"
              :field="getFieldByShortCode('c')"
            ></SymbolField>
          </td>
          <td>
            <SymbolField
              :definition="definition"
              :field="getFieldByShortCode('t')"
            ></SymbolField>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import Definition from "foreks-sdk/commons/types/Definition";
import Field from "foreks-sdk/commons/types/Field";
import { Options, Vue } from "vue-class-component";
import SymbolField from "../components/SymbolField.vue";

@Options({
  components: {
    SymbolField,
  },
})
export default class extends Vue {
  ready = false;
  definitions: Definition[] = [];
  selectedDefinitionQuery: any | undefined;
  definitionQueries: any[] = [
    {
      label: "BIST 30",
      query: [
        {
          domain: "BIST",
          securityType: "Stock",
          security: "E",
          index: "XU030",
        },
      ],
    },
    {
      label: "FX",
      query: [
        {
          domain: "FX", // only fx domain definitions
          exchange: "SPOT", // only spot exchange definitions
          securityType: "Cross", // only cross security type definitions
          currency: "TRY", // only try currency definitions
        },
      ],
    },
    {
      label: "SPOT",
      query: [
        {
          domain: "FX", // only fx domain definitions
          exchange: "SPOT", // only spot exchange definitions
        },
      ],
    },
  ];

  mounted() {
    // initial use first query
    this.changeListQuery(this.definitionQueries[0].query);
  }

  changeListQuery(query: any) {
    // get definition from foreks-web-sdk (you must initial first see main.ts)
    this.definitions =
      this.$foreksWebSDK.definition.getDefinitionByQuery(query);

    // order definitions by code
    this.definitions = this.definitions.sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }

  getFieldByShortCode(shortCode: string): Field | undefined {
    return this.$foreksWebSDK.field.getByShortCode(shortCode);
  }

  goToSymbolDetail(definition: Definition) {
    this.$router.push({
      name: "symbol-detail",
      params: {
        id: definition._id,
      },
    });
  }
}
</script>
