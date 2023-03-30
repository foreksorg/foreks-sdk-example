import moment from "moment";
import accounting from "accounting";
import Definition from "foreks-sdk/commons/types/Definition";

const _keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export default class Utils {
  /**
   * @description show dialogs
   * @returns {void}
   */
  public static showDialogs(): void {
    const dialogs = document.querySelectorAll(".ui-dialog");
    for (const dialog of dialogs) {
      dialog.classList.remove("hidden");
    }
  }
  /**
   * @description hide dialogs
   * @returns {void}
   */
  public static hideDialogs(): void {
    const dialogs = document.querySelectorAll(".ui-dialog");
    for (const dialog of dialogs) {
      dialog.classList.add("hidden");
    }
  }

  /**
   * @description generate id
   * @returns {string} id
   */
  public static generateId(): string {
    return new Date().getTime().toString() + this.randomString(4);
  }

  /**
   * @description get paramter by name
   * @param {string} name
   * @returns {string}
   */
  public static getParameterByName(name: string): string {
    const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.href);
    return (match && decodeURIComponent(match[1].replace(/\+/g, " "))) || "";
  }

  /**
   * @description generate random string
   * @param {number} count : count of string
   * @returns {string} generated string
   */
  public static randomString(count: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split(
      ""
    );
    let str = "";
    for (let i = 0; i < count; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }

  /**
   * @description hide side bar Wrapper
   */
  public static hideSidebarWrapper() {
    const sidebarWrapper = document.querySelector(".sidebar-wrapper");
    if (sidebarWrapper) {
      sidebarWrapper.classList.toggle("closed-sidebar");
    }
  }

  /**
   * @description Only works for native objects, host objects are not
   * @param {any} source : source
   * @param {boolean} deep : deep
   * @returns {any} return source without referance
   */
  public static copy(source: any, deep: boolean): any {
    let o: any;
    let prop: any;
    let type: any;
    if (typeof source !== "object" || source === null) {
      o = source;
      return o;
    }
    o = new source.constructor();
    for (prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        type = typeof source[prop];

        if (deep && type === "object" && source[prop] !== null) {
          o[prop] = this.copy(source[prop], false);
        } else {
          o[prop] = source[prop];
        }
      }
    }
    return o;
  }

  /**
   * @description format number
   * @param {string} value : value
   * @param {number?} precision : precision
   * @returns {string} formatted number
   */
  public static formatNumber(value: number, precision?: number): string {
    return accounting.formatNumber(value, {
      precision: precision,
      thousand: ",",
    });
  }

  /**
   * @description format number
   * @param {number} value : value
   * @param {number?} precision : precision
   * @returns {string} formatted number
   */
  public static formatMoney(value: number, precision?: number): string {
    return accounting.formatMoney(value, {
      symbol: "",
      precision: precision,
      thousand: ".",
      decimal: ",",
    });
  }

  /**
   * @description format percentage
   * @param {number} value : value
   * @param {number?} precision : precision
   * @returns {string} formatted number
   */
  public static formatPercentage(value: number, precision?: number): string {
    return `${accounting.formatMoney(value, "", precision)} %`;
  }

  /**
   * @description convert socket time
   * @param {number} miliseconds : value
   * @returns {number} timestamp
   */
  public static convertSocketTime(miliseconds: number): number {
    const totalSeconds = Math.floor(miliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes + moment().utcOffset());
    newDate.setSeconds(seconds);

    return newDate.getTime();
  }

  /**
   * @description is mobile
   */
  public static isMobileView() {
    const orientation = window.innerHeight > window.innerWidth;
    if (
      "ontouchstart" in document.documentElement &&
      navigator.userAgent.match(/Mobi/) !== null
    ) {
      if (orientation && window.screen.width >= 1024) {
        return false;
      }
      return true;
    }
    if (window.innerWidth <= 1024) {
      return true;
    }
    return false;
  }

  /**
   * @description base64 encode
   * @param {string} input
   * @returns {string}
   */
  public static base64Encode(input: string): string {
    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;

    input = this.utf8Encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        _keyStr.charAt(enc1) +
        _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) +
        _keyStr.charAt(enc4);
    }

    return output;
  }

  /**
   * @description base64 decode
   * @param {string} input
   * @returns {string}
   */
  public static base64Decode(input: string): string {
    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;

    input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, "");

    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = this.utf8Decode(output);

    return output;
  }

  /**
   * @description utf8 encode
   * @param {string} str
   * @returns {string}
   */
  private static utf8Encode(str: string): string {
    str = str.replace(/\r\n/g, "\n");
    let utftext = "";

    for (let n = 0; n < str.length; n++) {
      const c = str.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  /**
   * @description utf8 decode
   * @param {string} utftext
   * @returns {string}
   */
  private static utf8Decode(utftext: string): string {
    let string = "";
    let i = 0;
    let c1;
    let c2;
    let c3;
    let c = (c1 = c2 = 0);

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }

    return string;
  }

  /**
   * @description search with priority
   * @param {string} search
   * @param {Definition[]} defQuery
   * @param {Definition[]} definitions
   * @returns {Definition[]}
   */
  public static searchWithPriority(
    search: string,
    defQuery: Definition[],
    definitions: Definition[]
  ): Definition[] {
    let result: Definition[] = [];
    if (defQuery?.length > 0) {
      for (const element of defQuery) {
        for (const [key, value] of Object.entries(element)) {
          result.push(...definitions.filter((def: any) => def[key] === value));
        }
      }
    } else {
      result = definitions;
    }
    const formattedData: Definition[] = [
      ...new Set([...result, ...definitions]),
    ];
    result = formattedData.filter((f: Definition) => {
      if (f.code.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      if (
        f.localeString &&
        f.localeString().toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
      return false;
    });

    return result;
  }
}
