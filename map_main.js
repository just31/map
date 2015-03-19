/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-02-14 by shiryaev */


//Метод асинхронного подключения js файлов, не собирается в базовый билд
var asyncRequire = require.config({});

requirejs(['jquery', 'als'], function ($, als) {
  'use strict';

  var page = {
    blur: $('.blur'),
    images: $('img[data-src],*[data-bg-src]'),
    map: $('.map'),
    'articles': $('.articles'),
    'info_text': $('.info_text'),
    map_main: $('#map_main'),
    map_main1: $('#map_main1'),
    coords_point: $('#coords_point')
  };

  als.modules = {};

  /**
   * Градиентный фон на странице
   * @type {jQuery}
   */
  if (page.blur.length) {
    require([
      'als.blur'
    ], function (Blur) {
      var img = page.blur.find('img'),
          canvas = page.blur.find('canvas'),
          timeout;

      function draw() {
        Blur.stack(img[0], canvas[0], 50, false);
      }

      function resize() {
        canvas.css({
          width: window.innerWidth,
          height: window.innerHeight
        });
        window.clearTimeout(timeout);
        timeout = window.setTimeout(draw,300);
      }

      resize();
      $(window).resize(resize);
    });
  }

  /**
   * Загрузка второстепенных изображений
   * @type {jQuery}
   */
  if (page.images.length) {
    asyncRequire([
      'images'
    ], function (Images) {
      als.modules.images = new Images(page.images);
    });
  }

  /**
   * Карты на странице
   * @type {jQuery}
   */

  if (page.articles.length) {
    require([
      'articles'
    ], function (Articles) {
      als.modules.articles = new Articles(page.articles);
    });
  }


  if (page.info_text.length) {
    require([
      'info_text'
    ], function (Info_text) {
      als.modules.info_text = new Info_text(page.info_text);
    });
  }


if (page.map_main.length) {

console.log('search element');

require([
      'map_main'
    ], function (Map) {
      console.log('udachno zagruzhen map_main.js');

      als.modules.map_main = new Map(page.map_main);

      console.log('init object', als.modules.map_main);
    });
}


if (page.map_main1.length) {

console.log('search element');

require([
      'map_main1'
    ], function (Map) {
      console.log('udachno zagruzhen map_main1.js');

      als.modules.map_main1 = new Map(page.map_main1);

      console.log('init object', als.modules.map_main1);
    });
}


if (page.coords_point.length) {

console.log('search element');

require([
      'coords_point'
    ], function (Map) {
      console.log('udachno zagruzhen coords_point.js');

      als.modules.coords_point = new Map(page.coords_point);

      console.log('init object', als.modules.coords_point);
    });
}
});