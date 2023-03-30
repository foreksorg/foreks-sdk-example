import numeral from "numeral";
import accounting from "accounting";
import moment from "moment";
import PubsubData from "foreks-sdk/commons/types/PubsubData";
import Utils from "./Utils";
import Definition from "foreks-sdk/commons/types/Definition";

/**
 * @description pubsub data service
 */
export default class PubsubDataController {
  /**
   * @description send data to dom object
   * @param {any} data data
   */
  static async sendData(data: PubsubData): Promise<void> {
    if (data && data._i && data._i.includes("o5:")) {
      return;
    }
    Object.keys(data).forEach((d) => {
      if (d === "_id" || d === "_i") {
        return;
      }
      const dom = document.querySelectorAll(`[data-field=${data._i}_${d}]`);
      const bgDom = document.querySelectorAll(`[bg-field=${data._i}_${d}]`);
      if (dom.length) {
        PubsubDataController.mountData(data, dom, bgDom, d);
      }
    });
  }

  /**
   * @description mount data
   * @param {any} socket data
   * @param {Element} dom
   * @param {Element} bgDom
   * @param {string} d
   */
  static mountData(
    data: PubsubData,
    dom: NodeListOf<Element>,
    bgDom: NodeListOf<Element>,
    d: string
  ): void {
    for (const element of dom) {
      const el: HTMLElement = element as HTMLElement;
      const type = el.getAttribute("data-type") || "STRING";
      const format = el.getAttribute("data-format") || undefined;
      const noflash: boolean = el.getAttribute("data-noflash") === "true";
      let formattedData = this.formatData(data[d], type, data._i);
      if (format) {
        formattedData = this.customFormatData(data[d], format);
      }
      let flashClass = this.getFlashClass(formattedData, el.textContent, type);

      // : set attributes
      switch (d) {
        case "dd":
        case "d":
        case "LD":
        case "BD":
        case "PD":
          flashClass = this.getDirectionClass(formattedData);
          el.classList.remove("direction-def");
          el.classList.remove("direction-up");
          el.classList.remove("direction-down");
          el.classList.remove("direction-equal");
          el.classList.add(flashClass);
          break;
        case "c": // : Daily Change
          this.flashChangeDom(formattedData, el, false);
          break;
        case "yp":
        case "mp":
        case "wp":
        case "C":
          this.flashChangeDom(formattedData, el, true);
          break;
        case "f1": // : Signal
          this.signalClass(formattedData, el);
          break;
        case "t": // Ask
          this.flashDom(formattedData, el, false, flashClass);
          break;
        default:
          this.flashDom(formattedData, el, noflash, flashClass);
      }

      // if flash bg
      if (el.getAttribute("data-flashme")) {
        const attr = el.getAttribute("data-flashme") || ".grid-item";
        const fdom = el.closest(attr);

        fdom?.classList.add("flashme-bg");
        setTimeout(() => {
          fdom?.classList.remove("flashme-bg");
        }, 400);
      }
    }

    bgDom.forEach((node: Node) => {
      const bgDomEl: HTMLElement = node as HTMLElement;
      const type = bgDomEl.getAttribute("data-type") || "STRING";
      const formattedData = this.formatData(data[d], type, data._i);
      // if bg
      if (bgDom.length) {
        bgDomEl.classList.remove("bg-flash-up");
        bgDomEl.classList.remove("bg-flash-down");
        bgDomEl.classList.remove("bg-flash-equal");
        if (parseFloat(formattedData) > 0) {
          bgDomEl.classList.add("bg-flash-up");
        } else if (parseFloat(formattedData) === 0) {
          bgDomEl.classList.add("bg-flash-equal");
        } else {
          bgDomEl.classList.add("bg-flash-down");
        }
      }
    });
  }

  /**
   * @description flash dom
   * @param {any} data : formatted data
   * @param {any} dom : dom object
   * @param {boolean} noflash : is flashable
   * @param {string} flashClass : flash className
   */
  static flashDom(
    data: any,
    dom: any,
    noflash: boolean,
    flashClass: string
  ): void {
    const oldEl = dom;
    const newEl = oldEl.cloneNode(false);
    newEl.innerHTML = data;
    // : if flashable
    if (!noflash) {
      newEl.classList.add(flashClass);
      setTimeout(() => {
        newEl.classList.remove(flashClass);
      }, 400);
    }
    oldEl.parentNode.replaceChild(newEl, oldEl);
  }

  /**
   * @description sigal class
   * @param {any} data : formatted data
   * @param {any} dom : dom object
   */
  static signalClass(data: any, dom: any): void {
    const oldEl = dom;
    const newEl = oldEl.cloneNode(false);
    newEl.innerHTML = parseFloat(data);
    oldEl.parentNode.classList.remove("hyphen");
    if (parseFloat(data) > 0) {
      newEl.classList.add("fixed-up", "up-box");
    } else if (parseFloat(data) === 0) {
      newEl.classList.add("fixed-equal", "equal-box");
    } else {
      newEl.classList.add("fixed-down", "down-box");
    }
    oldEl.parentNode.replaceChild(newEl, oldEl);
  }

  /**
   * @description flash dom
   * @param {any} data : formatted data
   * @param {any} dom : dom object
   */
  static flashChangeDom(data: any, dom: any, percent: boolean): void {
    const oldEl = dom;
    const newEl = oldEl.cloneNode(false);

    if (typeof data === "string") {
      data = data.replace(",", ".");
    }

    if (percent) {
      newEl.innerHTML = `${data}<span>%</span>`;
    } else {
      newEl.innerHTML = data;
    }
    if (parseFloat(data) > 0) {
      newEl.classList.add("fixed-up");
    } else if (parseFloat(data) === 0) {
      newEl.classList.add("fixed-equal");
    } else {
      newEl.classList.add("fixed-down");
    }
    oldEl.parentNode.replaceChild(newEl, oldEl);
  }

  /**
   * @description get direction class
   * @param {any} data : socket data
   * @returns {string} direction class
   */
  static getDirectionClass(data: any): string {
    if (data > 0) {
      return "direction-up";
    } else if (data < 0) {
      return "direction-down";
    } else if (data === 0) {
      return "direction-equal";
    } else {
      return "direction-equal";
    }
  }

  /**
   * @description get flash class
   * @param {any} newData : new data
   * @param {any} oldData : old data
   * @param {string} type : type of data
   * @returns {string} flash class
   */
  static getFlashClass(newData: any, oldData: any, type: string): string {
    switch (type) {
      case "NUMBER":
      case "LONG":
      case "INT": {
        oldData = Number.parseFloat(oldData);
        newData = Number.parseFloat(newData);
        if (isNaN(oldData)) {
          return "flash-equal";
        }
        if (oldData < newData) {
          return "flash-up";
        } else if (oldData === newData) {
          return "flash-equal";
        } else {
          return "flash-down";
        }
      }
      default: {
        return "flash-no";
      }
    }
  }

  /**
   * @description format data
   * @param {any} data : data
   * @param {string} type : type of data
   * @param {any} id : definition id
   * @returns {string} formatted data
   */
  static formatData(data: any, type: string, id: any): string {
    switch (type) {
      case "STRING": {
        return data;
      }
      case "NUMBER": {
        const definition = global.$foreksWebSDK.definition.getById(id);
        if (definition && definition.precision <= 2) {
          const formatOptions: any = {
            symbol: "",
            decimal: ",",
            thousand: ".",
            precision: definition.precision,
            format: "%s%v",
          };
          return definition
            ? accounting.formatMoney(data, formatOptions)
            : data;
        }
        const formatOptions: any = {
          symbol: "",
          decimal: ",",
          thousand: ".",
          precision: 2,
          format: "%s%v",
        };
        return accounting.formatMoney(data, formatOptions);
      }
      case "TIME": {
        return moment(Utils.convertSocketTime(data)).format("HH:mm:ss");
      }
      case "LONG": {
        return data;
      }
      case "INT": {
        return data;
      }
      case "DATE": {
        return moment(data).format("DD/MM/YYYY HH:mm:ss");
      }
      default: {
        return data;
      }
    }
  }

  /**
   * @description get precision
   * @param {Definition} definition
   * @param {any} val
   * @returns {number} precision
   */
  static getPrecision(definition: Definition, val: any): number {
    let precision = definition.precision;
    if (definition.pttRow && definition.exchange === "ATHEX") {
      const ptts = definition.pttRow.split(":");
      ptts.forEach((pt: any) => {
        const down = pt.split("|")[0];
        const up = pt.split("|")[1];
        const per = pt.split("|")[2];

        if (
          val < parseFloat(up) &&
          Math.abs(val) >= parseFloat(down) &&
          per.includes(".")
        ) {
          precision = per.replace(".", "").length;
          return precision;
        }
      });
    } else {
      return definition.precision;
    }
    return precision;
  }

  /**
   * @description custom format data
   * @param {any} data : data
   * @param {string} type : type of data
   * @returns {string} formatted data
   */
  static customFormatData(data: any, format: string): string {
    const formatType = format.split("|");
    switch (formatType[0]) {
      case "MONEY": {
        return numeral(data).format(formatType[1]);
      }
      case "QAT": {
        return numeral(data).format(formatType[1]);
      }
      case "NO": {
        return numeral(data).format(formatType[1]);
      }
      case "DATE": {
        return moment(data).format(formatType[1]);
      }
      default: {
        return data;
      }
    }
  }
}
