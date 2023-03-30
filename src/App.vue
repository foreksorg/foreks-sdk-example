<template>
  <div class="container">
    <Menu></Menu>
    <router-view />
  </div>
</template>
<script lang="ts">
import Menu from "@/components/Menu.vue";
import { Options, Vue } from "vue-class-component";

@Options({
  components: { Menu },
})
export default class Home extends Vue {}
</script>
