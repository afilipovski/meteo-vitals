const path = require('path');

module.exports = {
  // The entry point file described above
  entry: './firebase_initialize.js',
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'firebase_output.js',
    library: 'firebaseExports',
    libraryTarget: 'window'
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
  watch: true,
  mode: 'development'
};