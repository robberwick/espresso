'use strict'
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        espruino: {
            espresso: {
                boardSerial: '1c002400-13513430-36363435',//'33ffd305-41573033-25550843',
                file: 'main.js',
                save: false,
                watch: true
            }
        },
    });

    grunt.loadNpmTasks('grunt-espruino');

    grunt.registerTask('default', ['espruino']);
}
