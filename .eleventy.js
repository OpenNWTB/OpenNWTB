const pluginSEO = require("eleventy-plugin-seo");
const seo = require("./src/seo.json");
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");


module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    // Templates:
    "html",
    "njk",
    "md",
    // Static Assets:
    "css",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "woff",
    "woff2"
  ]);

  // Add passthroughs
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  
  // Markdown-It options
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };

  let markdownLib = markdownIt(options).use(markdownItAttrs);
  eleventyConfig.setLibrary("md", markdownLib);

  // Add SEO plugin
  eleventyConfig.addPlugin(pluginSEO, seo);

  // Disable Browsersync ghost mode
  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });

  // Enable eleventy-navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Add shortcode "software_version" to display the software version (stored here as variable "version")
  eleventyConfig.addShortcode("footerVersion", async function() {
    var footerVersionText = "OpenNWTB 15";
    return footerVersionText;
  });

  // Create collection of posts tagged "bookmark"
  eleventyConfig.addCollection("bookmark", function(collection) {
    return collection.getFilteredByTag("bookmark");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "build"
    }
  };
};