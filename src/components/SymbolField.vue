<template>
  <div class="field d-flex">
    <div
      v-if="
        (field && field.shortCode === 'LD') ||
        (field && field.shortCode === 'd')
      "
    >
      <div
        v-if="isDirection"
        class="direction direction-def direction-ld"
        :data-field="definition._id + '_d'"
      />
    </div>
    <div
      :data-type="getDataType(field)"
      :data-field-code="this.field.shortCode"
      :data-field="this.definition._id + '_' + this.field.shortCode"
    />
  </div>
</template>
<script lang="ts">
import Definition from "foreks-sdk/commons/types/Definition";
import Field from "foreks-sdk/commons/types/Field";
import { Options, Vue, prop } from "vue-class-component";

class Props {
  definition: Definition = prop({
    required: true,
  });
  field: Field = prop({
    required: true,
  });
  isDirection: boolean | undefined = prop({
    required: false,
  });
}

@Options({})
export default class extends Vue.with(Props) {
  subscribeId: number[] = [];

  /**
   * @description mounted lifecyle
   */
  mounted() {
    this.subscribe();
  }

  /**
   * @description Subscribe all definitions pubsub
   */
  subscribe(): void {
    if (this.$foreksWebSDK.socket)
      this.subscribeId.push(
        this.$foreksWebSDK.socket.subscribe(
          [this.definition._id],
          [this.field.shortCode]
        )
      );
  }

  /**
   * @description get data type
   * @param {Field} field
   * @returns {string} data-type
   */
  getDataType(field: Field): string {
    if (field.shortCode === "D") {
      return "DATE";
    }
    if (field.shortCode === "dt") {
      return "DATETIME";
    }
    return field.type; // all fields has type but sometimes we want to change type
  }

  /**
   * @description unsubscribe before unmount
   */
  beforeUnmount(): void {
    for (let id of this.subscribeId)
      if (id) this.$foreksWebSDK?.socket?.unSubscribe(id);
  }
}
</script>
