<template>
  <div>
    <h1>Economic Calendar</h1>
    <div v-if="!ready">
      <div class="lds-ripple">
        <div></div>
        <div></div>
      </div>
      <p>loading calendar data...</p>
    </div>
    <div v-if="ready">
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Event</th>
            <th>Actual</th>
            <th>Forecast</th>
            <th>Previous</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in calendarData" :key="item.cid">
            <tr class="economic-calender">
              <td :rowspan="(item.subItems?.length || 0) + 1">
                {{ item.country }}
              </td>
              <td>{{ item.event }}</td>
              <td>{{ item.actual }}</td>
              <td>{{ item.forecast }}</td>
              <td>{{ item.previous }}</td>
              <td>{{ new Date(item.date) }}</td>
            </tr>
            <tr
              v-for="subItem in item.subItems || []"
              :key="subItem.cid"
              class="sub-item"
            >
              <td>{{ subItem.event }}</td>
              <td>{{ subItem.actual }}</td>
              <td>{{ subItem.forecast }}</td>
              <td>{{ subItem.previous }}</td>
              <td>{{ new Date(subItem.date) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { CalendarLangs } from "foreks-sdk/commons/enums";
import EconomicCalendarResponse from "foreks-sdk/commons/types/repo/EconomicCalendarResponse";
import { Options, Vue } from "vue-class-component";

@Options({})
export default class extends Vue {
  ready = false;
  calendarData: EconomicCalendarResponse[] = [];

  async mounted() {
    await this.initialCalendar();
  }

  async initialCalendar() {
    this.calendarData =
      await this.$foreksWebSDK.economicCalendar.getCalendarFromToGrouped(
        "20241227020104",
        "20250102020140",
        CalendarLangs.TR
      );
    this.ready = true;
  }
}
</script>
