const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack() {
    return {
      devtool: "source-map",
    };
  },
});
