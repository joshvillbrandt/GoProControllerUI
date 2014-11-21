exports.config = {
  conventions: {
    assets: /(^app\/assets|\/assets|bootstrap\/dist)/,
    ignored: /^(.*?\/)?[_]\w*/
  },
  modules: {
    definition: false,
    wrapper: false
  },
  paths: {
    "public": '_public'
  },
  files: {
    javascripts: {
      joinTo: {
        'js/app.js': /^app/,
        'js/vendor.js': /^bower_components/
      }
    },
    stylesheets: {
      joinTo: {
        'css/app.css': /^(app|bower_components)/
      },
      order: {
        before: ['app/styles/app.less']
      }
    },
    templates: {
      joinTo: {
        'js/templates.js': /^app/
      },
      order: {
        before: ['app/scripts/app.js']
      }
    }
  },
  // Enable or disable minifying of result js / css files.
  plugins: {
    // minify: true
    // afterBrunch: [
    // ]
  }
};
