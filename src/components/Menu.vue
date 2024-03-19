<template>
  <ul class="nav">
    <li class="nav-item">
      <router-link to="/live-socket-test">Live Socket Test</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/economic-calendar">Economic Calendar</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/news">News</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/symbol-list">Symbol List</router-link>
    </li>
    <li class="nav-item">
      <router-link to="/indicator">Indicator</router-link>
    </li>
  </ul>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {}
</script>
