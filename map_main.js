/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-08-18 by dryzhov (Ryzhov Dmitry) */

define('map_main', ['jquery', 'als'], function ($, als) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var toolbar = document.getElementById('toolbar'),
        iframe = toolbar && toolbar.firstElementChild;
    if (iframe && /beeline/.test(iframe.getAttribute('src'))) {
        toolbar.parentNode.removeChild(toolbar);
    }
  });
  setTimeout(function() {
    var script = document.querySelector('script[name=ets-anchor]');
    if (script) {
        script.parentNode.removeChild(script);
    }
  }, 0);

  /**
   * Yandex map with placemarks
   * by default being positioned at the center of Moscow
   *
   * @param {Object} options
   * @param {jQuery} options.root
   * @param {Array} [options.coords]
   * @param {Array} [options.map_center]
   * @param {Array} [options.placemarks]
   * @constructor
   */
  function Map (root) {  // !!!!
    var defaults = {
      coords: [{ lat: 55.752078, lng:37.621147 }],
      map_center: [37.621147, 55.752198],
      placemarks: []
    };

    $.extend(this, defaults, {}); // !!!!
    this.root = root;  // !!!!

    this.loadMap(
      $.proxy(this.createMap, this),
      $.proxy(this.init, this)
    );
  }

  /**
   * Загрузка карты.
   */
  Map.prototype.loadMap = function () {
    var yMaps = $.Deferred();
    window.yandexMapsLoaded = function () {
      yMaps.resolve();
    };
    yMaps.done(arguments);
    require(['//api-maps.yandex.ru/2.0.39/?load=package.full&lang=ru-RU&onload=yandexMapsLoaded']);
    require(['//yandex.st/jquery/2.1.1/jquery.min.js']);
    require(['http://intranet.russiancarbon.org/f/min/drag-scroll-behavior.js']);
    require(['http://webmap-blog.ru/examples/add-users-ymapsapi2/js/bootstrap.min.js']);
    // Сделаем броузеры ES5 friendly текущему.
    require(['http://intranet.russiancarbon.org/f/min/es5-shim.js']);
    // Файлы для множественного геокодирования координат в адреса. Нужны для геокодирования массивов с точками автомаршрута, первого вида маршрутизации.
    require(['http://intranet.russiancarbon.org/f/min/multi-geocoder.js']);
    require(['http://dimik.github.io/ymaps/examples/multi-geocoder/list-collection.js']);
  };

  Map.prototype.createMap = function () {

    var route, icon, distance, myGeoObject, placemark, myBalloonContentBodyLayout, type_fuel, type_travel, type_route, way_m, way_m_upd, visibleObjects, mGeocoder, geoObjects_coll, firstGeoObject_1, ballon_aero, result, ch = 1;
    var markers = [];
    var markers_1 = [];
	var point = [];
    var geo_points = [];
    var point_geo = [];
    var distance_aero = [];
    var point_aero = [];
    var way_m_paths = [];
    var myCollection;
    // делаем переменную myCollection, глобальной, чтобы можно было ее значение передавать из ajaх запроса. При получении списка аэропортов из aero1.csv.
    window.globalvar = myCollection;
    // создаем глобальную переменную для GeoQueryResult, со списком аэропортов.
    var arPlacemarksRez;
    window.globalvar = arPlacemarksRez;
    var i,
      el = this.root.get(0);

    this.yMap = new ymaps.Map(
      el,
      {
        center: this.coords,
        zoom: 8,
        type: 'yandex#map'
      }
    ),
    button1 = $('#delete'),
        // DOM-контейнер карты. Начало функционала перетаскивания картинок из тулбара, на карту. Продолжение функционала перетаскивания, начинается ниже в коде со строки: ymaps.behavior.storage.add('dragScroll', DragScrollBehavior);
    // После определения myMap и добавления геоколлекции аэропортов на карту.
    $mapContainer = $(this.yMap.container.getElement());

    // Сохраняем значение this.yMap в переменнную myMap. Чтобы передать ее значение в функции скрипта.
    // Иначе this.yMap, не будет доступен внутри них.
    myMap = this.yMap;



    // Продолжение функционала перетаскивания картинок из тулбара, на карту
    // Добавляем поведение в хранилище.
    ymaps.behavior.storage.add('dragScroll', DragScrollBehavior);
    // Включаем скролл карты при перетаскивании.
    this.yMap.behaviors.enable('dragScroll');

    /**
    * Добавим свойство dataTransfer в объект-событие,
    * чтобы не доставать его каждый раз из e.originalEvent.
    */
    $.event.props.push('dataTransfer');

    $('.icon').on('dragstart', function (e) {
                    // Будем перетаскивать в режиме копирования (броузер добавит "+" при перетаскивании)
                    e.dataTransfer.effectAllowed = 'copy';
                    // Кладем в данные идентификатор метки.
                    e.dataTransfer.setData('TEXT', this.id);
                    // Перетаскиваем за хвостик иконки
                    // и сделаем ее прозрачной если это не FF.
                    if(typeof e.dataTransfer.setDragImage === 'function') {
                        var dragIcon = $.browser.mozilla || $.browser.opera ? this :
                            $(this).clone().css('opacity', '0.3').get(0);

                        e.dataTransfer.setDragImage(dragIcon, this.width / 2, this.height);
                    }
    });

    // Создаем метку.
                function createPlacemark(coordinates, options) {

                   myBalloonContentBodyLayout = ymaps.templateLayoutFactory.createClass('$[properties.balloonContentBody]', {
                    build: function () {
                        this.constructor.superclass.build.apply(this, arguments);

                        // Получаем ссылку на геообъект из данных
                        this._geoObject = this.getData().geoObject;
                        // Находим нужный элемент в контексте родителя балуна
                        this._btn = $(this.getParentElement()).find('.btn');
                        // Указываем обработчику события в качестве контекста наш макет.
                        this._onClick = $.proxy(this._onClick, this);

                        this._attachHandlers();
                    },
                    _attachHandlers: function () {
                        this._btn.on('click', this._onClick);
                    },
                    _detachHandlers: function () {
                        this._btn.off('click', this._onClick);
                    },
                    _onClick: function (e) {
                        e.preventDefault();

                        this._geoObject.setParent(null);
                    },
                    clear: function () {
                        this._detachHandlers();
                        this.constructor.superclass.clear.apply(this, arguments);
                    }
                    }),
                    placemark = new ymaps.Placemark(coordinates);

                    placemark.options.set(options);
                    // Геокодируем координаты метки.
                    geocodePlacemark(placemark);

                    placemark.events
                        // По окончании перетаскивания геокодируем координаты метки.
                        .add('dragend', function (e) {
                            geocodePlacemark(placemark);
                        })
                        // При открытии балуна выключаем перетаскивание.
                        .add('balloonopen', function (e) {
                            placemark.options.set('draggable', false);
                        });

                    return placemark;
    }

        $mapContainer.on('dragover', function (e) {
                        // Эта инструкция разрешает перетаскивание.
                        e.preventDefault();
                        // dropEffect должен совпадать с effectAllowed.
                        e.dataTransfer.dropEffect = 'copy';
                    })
                    .on('drop', function (e) {
                        // не работает в FF = поэтому делаем return false вконце
                        // e.stopPropagation();

                        // Находим DOM-элемент иконки по идентификатору из данных.
                        icon = $('#' + e.dataTransfer.getData('TEXT')),
                            // Размеры иконки.
                            width = icon.width(), height = icon.height(),
                            // Геокоординаты метки.
                            coordinates = pageToGeo([e.originalEvent.pageX, e.originalEvent.pageY]),
                            // Объект опций метки.
                            options = {
                                iconImageHref: icon.attr('src'),
                                iconImageSize: [width, height],
                                iconImageOffset: [-(width / 2), -height],
                                draggable: true,
                                'visible': true,
                                balloonContentBodyLayout: myBalloonContentBodyLayout
                            };

                        // Создаем метку и добавляем ее на карту.
                        if(markers.length < 100)
			            {
                         // добавляем основную метку на карту
                         myMap.geoObjects.add(createPlacemark(coordinates, options));
                         // делаем ее невидимой, чтобьы передать вывод меток маршрутизатору.
                         placemark.options.set('visible', true);

                         // если выбран значок самолета, подгружаем список аэропортов

                         // завершение работы по списку аэропортов

                         // добавляем новые метки по всем маршрутам в массив markers.
                         markers.push(placemark);
                         // Выключаем скролл карты при перетаскивании.
                         ymaps.behavior.storage.remove('dragScroll', DragScrollBehavior);
                         myMap.behaviors.disable('dragScroll');

                         // НАЧИНАЕМ МАРШРУТЫ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА
                         for(var i = 0, l = markers.length; i < l; i++) {
			             point[i] = markers[i].geometry.getCoordinates();
			             }

                         console.log('init object', markers.length);
                         // перед построением нового маршрута проверяем, были ли уже проложены старые и удаляем их, если да.
                         if(route) myMap.geoObjects.remove(route);

                         // Если не выбран тип топлива, добавляем в блок справа от карты предупреждающий текст.
                         if((typeof type_fuel == "undefined"))
                         {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                         // Или, если не выбран тип поездки, добавляем в блок справа от карты предупреждающий текст.
                         else if((typeof type_travel == "undefined"))
                         {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                         // Или, если не выбран тип маршрута, добавляем в блок справа от карты предупреждающий текст.
                         else if((typeof type_route == "undefined"))
                         {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                         // Если все селекторы выбраны, то начинаем строить маршрут, по двум первым, отмеченным точкам.
                         else
                         {
                         ymaps.route(point, {
                            // Опции маршрутизатора
                            avoidTrafficJams: true, // строить маршрут с учетом пробок
                            mapStateAutoApply: true // автоматически позиционировать карту
                         }).then(function (router) {

                         $(".route-length1").empty();

                         route = router;
                         route.options.set({ strokeStyle: 'solid'});

                         // длина маршрута в м
                         var way_m = route.getLength();
                         // округленная длина маршрута, без цифр, после запятой
                         var way_m_1 = way_m.toFixed(0);

                         var way_m_car = (way_m_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
                         var way_m_car_1 = way_m_car.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                         var way_m_home = (way_m_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
                         var way_m_home_1 = way_m_home.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                         //Сортировка маршрутов по выбранным картинкам(самолет, машинка, дом)

                         // НАЧИНАЕМ ПРОКЛАДЫВАТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА
                         //если выбраны картинки: машинки или домика
                         //прокладываем обычный маршрут по дорогам
                         if (placemark.options.get('iconImageHref') == '/f/min/images/car.png'){
                         // добавляем маршрут на карту
                         myMap.geoObjects.add(route);

                         // Включаем редактор маршрута.
                         route.editor.start({
                         addWayPoints: true,
                         removeWayPoints: true,
                         editWayPoints: true
                         });

                         // С помощью метода getWayPoints() получаем массив точек маршрута
                         var points = route.getWayPoints();
                         // Делаем метки маршрута невидимыми. Если сделать видимыми, то тогда необходимо сделать placemark's, добавленные ранее невидимыми - placemark.options.set('visible', true);. Выше в коде, где добавляется новая метка.
                         points.options.set('visible', true);
                         points.options.set({
                         //'preset', 'twirl#carIcon'
                         // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                         'iconLayout': 'default#image',
                         'iconImageHref': '/f/min/images/car.png',
                         iconImageSize: [width, height],
                         iconImageOffset: [-(width / 2), -height]
                         });
                         //points.properties.set('balloonContentBodyLayout', myBalloonContentBodyLayout);

                        // ПОЛУЧАЕМ ПЕРВОНАЧАЛЬНЫЕ ДАННЫЕ ПО НОВОМУ МАРШРУТУ. ОБРАБАТЫВАЕМ И ВЫВОДИМ ИХ.
                        // длина маршрута в м
                        var way_m_first = route.getLength();
                        // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой или маршрут туда и обратно.
                        var way_m_first_1;
                        if(type_route == "Сonversely"){
                        way_m_first_1 = way_m_first.toFixed(0) * 2;
                        }
                        else
                        {
                           way_m_first_1 = way_m_first.toFixed(0);
                        }

                        // $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + way_m_first_1 + ' км</strong></h3>');

                        var way_m_car1 = (way_m_first_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
                        var way_m_car_11 = way_m_car1.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                        var way_m_home1 = (way_m_first_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
                        var way_m_home_11 = way_m_home1.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                        //формула вычисления углеродного следа, при поездке на машине
                        var k;
                        var p;

                        if(type_fuel == "Gazoline"){
                          k = 0.002664; //количество тонн со2 на 1 л бензина
                        }
                        else
                        {
                          k = 0.002322; //количество тонн со2 на 1 л дизельного топлива
                        }

                        if(type_fuel == "Gazoline"){
                          p = 0.71; //плотность бензина
                        }
                        else
                        {
                          p = 0.84; //плотность дизельного топлива
                        }

                        /*
                        //формула вычисления углеродного следа, при поездке на машине
                        var k_diesel1 = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
                        var k_gasoline1 = 0.002664; //количество тонн со2 на 1 кг газового топлива

                        var p_diesel1 = 0.84; //плотность дизельного топлива
                        var p_gasoline1 = 0.71; //плотность газового топлива
                         */

                        var a1 = 10,
                        b1 = way_m_first_1;

                        var m = (b1/100*a1)*p; //масса топлива
                        //var m_diesel1 = (b1/100*a1)*p_diesel1; //масса дизельного топлива
                        //var m_gasoline1 = (b1/100*a1)*p_gasoline1; //масса газового топлива

                        //углеродный след
                        var co_auto = m*k;
                        // округляем значение до одного знака после запятой
                        var co_auto_1 = co_auto.toFixed(1);
                        /*
                        var co_auto_diesel1 = m_diesel1*k_diesel1; //углеродный след, дизельное топливо
                        // округляем значение до одного знака после запятой
                        var co_auto_1_diesel1 = co_auto_diesel1.toFixed(1);

                        var co_auto_gasoline1 = m_gasoline1*k_gasoline1; //углеродный след, газовое топливо
                        // округляем значение до одного знака после запятой
                        var co_auto_1_gasoline1 = co_auto_gasoline1.toFixed(1);
                        */

                        $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			            $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
                        $(".route-length1").append('<h3>Углеродный след: <strong>' + co_auto_1 + ' кгСО2/л.</strong></h3>');

                        // Выводим значение пробега, в зависимости от типа поездки: на работу или на дачу.
                        if(type_travel == "Work"){
                          $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_11 + ' км</strong></h3>');
                        }
                        else
                        {
                          $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_home_11 + ' км</strong></h3>');
                        }
                         }
                         // ЗАКАНЧИВАЕМ ПРОКЛАДЫВАТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА



                // ОТСЛЕЖИВАЕМ СОБЫТИЕ ОБНОВЛЕНИЯ МАРШРУТА. ПРИ ДОБАВЛЕНИИ НОВЫХ ПУТЕВЫХ ТОЧЕК. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА.
                route.events.add("update",function () {
                 // очищаем блок с данными построенного маршрута, до события обновления маршрута. Т.к. здесь будут добавляться свои данные, в зависимости от события маршрута.
                 $(".route-length1").empty();
                 // очищаем блок с данными о всех точках маршрута.
                 // $(".route-length2").empty();

                 var wayPoints = route.getWayPoints();
                 wayPoints.get(wayPoints.getLength() - 1).options.set({
                 // делаем новую путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                 'iconLayout': 'default#image',
                 'iconImageHref': '/f/min/images/car.png',
                 iconImageSize: [width, height],
                 iconImageOffset: [-(width / 2), -height]
                 //'preset': 'twirl#carIcon'
                 });
                 //wayPoints.properties.set('balloonContentBodyLayout', myBalloonContentBodyLayout);

                 // длина обновленнного маршрута в м
                 way_m = route.getLength();
                 // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой или маршрут туда и обратно.
                 var way_m_1;
                 if(type_route == "Сonversely"){
                   way_m_1 = way_m.toFixed(0) * 2;
                 }
                 else
                 {
                   way_m_1 = way_m.toFixed(0);
                 }

                 var way_m_car = (way_m_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
                 var way_m_car_1 = way_m_car.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                 var way_m_home = (way_m_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
                 var way_m_home_1 = way_m_home.toFixed(0); // округление пробега, до 0 цифр после запяфтой.


                //формула вычисления углеродного следа, при поездке на машине
                var k1;
                var p1;

                if(type_fuel == "Gazoline"){
                  k1 = 0.002664; //количество тонн со2 на 1 л бензина
                }
                else
                {
                  k1 = 0.002322; //количество тонн со2 на 1 л дизельного топлива
                }

                if(type_fuel == "Gazoline"){
                  p1 = 0.71; //плотность бензина
                }
                else
                {
                   p1 = 0.84; //плотность дизельного топлива
                }

                /*
                //формула вычисления углеродного следа, при поездке на машине
                var k_diesel1 = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
                var k_gasoline1 = 0.002664; //количество тонн со2 на 1 кг газового топлива

                var p_diesel1 = 0.84; //плотность дизельного топлива
                var p_gasoline1 = 0.71; //плотность газового топлива
                */

                var a = 10,
                b = way_m_1;

                var m1 = (b/100*a)*p1; //масса топлива
                //var m_diesel1 = (b1/100*a1)*p_diesel1; //масса дизельного топлива
                //var m_gasoline1 = (b1/100*a1)*p_gasoline1; //масса газового топлива

                //углеродный след
                var co_auto1 = m1*k1;
                // округляем значение до одного знака после запятой
                var co_auto_11 = co_auto1.toFixed(1);
                /*
                var co_auto_diesel1 = m_diesel1*k_diesel1; //углеродный след, дизельное топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_diesel1 = co_auto_diesel1.toFixed(1);

                var co_auto_gasoline1 = m_gasoline1*k_gasoline1; //углеродный след, газовое топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_gasoline1 = co_auto_gasoline1.toFixed(1);
                */

                $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			    $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
                $(".route-length1").append('<h3>Углеродный след: <strong>' + co_auto_11 + ' кгСО2/л.</strong></h3>');

                // Выводим значение пробега, в зависимости от типа поездки: на работу или на дачу.
                if(type_travel == "Work"){
                  $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong></h3>');
                }
                else
                {
                  $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong></h3>');
                }

                // $(".route-length1").append('Если указанный маршрут используется для поездок на дачу, то в дачный сезон вы проедете примерно: <strong>' + way_m_home_1 + ' км</strong><br /><br />');
                //$(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');

                // ОТСЛЕЖИВАЕМ 4 СОБЫТИЯ СВЯЗАННЫХ С ПУТЕВЫМИ ТОЧКАМИ: ДОБАВЛЕНИЕ/УДАЛЕНИЕ/ПЕРЕТАСКИВАНИЕ. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА. ПО КАЖДОМУ ИЗ НИХ ОЧИЩАЕМ БЛОК С ДАННЫМИ.
                  route.editor.events.add('waypointadd', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointremove', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointdragstart', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointdragend', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                });
                // ЗАВЕРШЕНИЕ ОТСЛЕЖИВАНИЯ СОБЫТИЯ ОБНОВЛЕНИЯ МАРШРУТА.

                         }, function (error) {
                              alert("Возникла ошибка: " + error.message);
                         }, this);
                         }
                         }
                         else
			             {
			               alert("Вы задали максимальное количество точек");
			             }

                         return false;

    });

    // Геокодирование координат метки.
                function geocodePlacemark(placemark) {
                    ymaps.geocode(placemark.geometry.getCoordinates(), { results: 1 })
                        .then(function (res) {
                            var first = res.geoObjects.get(0),
                                text = first.properties.get('text');

                                // если выбран не авиамаршрут, собираем информацию о всех точках автомаршрута, добавленного по картинкам из тулбара.
                                if (placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                                // добавляем текстовую информацию(text.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
                                geo_points.push(text);
                                // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                                for(var i = 0, l = geo_points.length; i < l; i++) {
			                    point_geo[i] = '<br />&bull; ' + geo_points[i];
                                //console.log('init object', point_geo);
                                }
                                }
                            // Выставляем содержимое балуна метки.
                            //placemark.properties.set('balloonContentBody', text);

                            // в балуне первой метки, отмеченной на карте, выводим html-форму, с тремя списками select, с данными маршрута(типп: топлива, поездки, маршрута).
                            placemark.properties.set("balloonContentBody",
'<div id="menu">Прежде чем начать строить автомаршрут, выберите необходимые данные по нему. И после, перетащите следующую точку на карте.<br /><br /> <small style="color: #1D3B3B;">Выберите тип поездки по указанному маршруту:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" style="height: 20px" /></span><select name="travel_select" id="travel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Work">В рабочие дни, до работы</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Dacha">В выходные дни, до дачи</option></select></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип маршрута:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Сonversely">Туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Выберите тип топлива вашего автомобиля:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" style="height: 20px" /></span><select name="fuel_select" id="fuel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Gazoline">Бензин</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Diesel">Дизель</option></select></div><div id="menu">');

                            console.log('init object', markers.length);
                            if(markers.length == 1 && !route)
                            {
                              // Если отмечена первая метка, открываем балун с выбором данных по маршруту.
                              placemark.balloon.open();

                              // При выборе опции select по типу поездки, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
                              $('#travel_select').change(function(){
                              // Предварительно очищаем блок для вывода данных по типу поездки, чтобы в нем ничего не было, после произведения выбора.
                              $(".route-length_travel").empty();
                              // Присваиваем переменной 'type_travel', выбранное значение из списка.
                              type_travel = $('select[name=travel_select] option:selected').val();

                              if(type_travel == "Work")
                              {
                                $(".route-length_travel").append('<h3>Выбрана поездка: <strong>До работы</strong></h3>');
                              }
                              else if(type_travel == "Dacha")
                              {
                                $(".route-length_travel").append('<h3>Выбрана поездка: <strong>До дачи</strong></h3>');
                              }
                              else
                              {
                                $(".route-length_travel").append('<h3>Выберите пожалуйста тип поездки.</h3>');
                              }
                              });

                              // При выборе опции select по типу маршрута, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
                              $('#route_select').change(function(){
                              // Предварительно очищаем блок для вывода данных по типу маршрута, чтобы в нем ничего не было, после произведения выбора.
                              $(".route-length_route").empty();
                              // Присваиваем переменной 'type_route', выбранное значение из списка.
                              type_route = $('select[name=route_select] option:selected').val();

                              if(type_route == "Сonversely")
                              {
                                $(".route-length_route").append('<h3>Тип маршрута: <strong>Туда и обратно</strong></h3>');
                              }
                              else if(type_route == "Forwards")
                              {
                                $(".route-length_route").append('<h3>Тип маршрута: <strong>Только в одну сторону</strong></h3>');
                              }
                              else
                              {
                                $(".route-length_route").append('<h3>Выберите пожалуйста тип маршрута.</h3>');
                              }
                              });

                              // При выборе опции select по типу топлива, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
                              $('#fuel_select').change(function(){
                              // Предварительно очищаем блок для вывода данных по типу топлива, чтобы в нем ничего не было, после произведения выбора.
                              $(".route-length_fuel").empty();
                              // Присваиваем переменной 'type_fuel', выбранное значение из списка.
                              type_fuel = $('select[name=fuel_select] option:selected').val();

                              if(type_fuel == "Gazoline")
                              {
                                $(".route-length_fuel").append('<h3>Выбран тип топлива: <strong>Бензин</strong></h3>');
                              }
                              else if(type_fuel == "Diesel")
                              {
                                $(".route-length_fuel").append('<h3>Выбран тип топлива: <strong>Дизель</strong></h3>');
                              }
                              else
                              {
                                $(".route-length_fuel").append('<h3>Выберите пожалуйста тип топлива.</h3>');
                              }
                              });

                              }
                              else
                              {
                              // Если выбранная метка не первая на карте и открыт ее балун. Добавляем в него информацию об адресе метки и кнопку "Удалить метку".
                              if(myMap.balloon.open){
                                 placemark.properties.set('balloonContentBody', text + '<br /><button type="submit" class="btn btn-warning" name="del_place" style="text-align: center; margin-top: 10px;">Удалить метку</button>');
                                 //var markers_new_lenght = [];
                                 //markers_new_lenght = [markers.length - 1];
                                 // Если нажата кнопка "Удалить массив", уменьшаем массив markers на одно значение.
                                 $('button[name=del_place]').click(function () {
                                    // Уменьшаем массив markers на одно значение.
                                    markers.slice(0, markers.pop());
                                    //console.log('init object', markers.length);
                                 });
                              }

                              // Если отмечена вторая метка на карте или произведен выбор по всем трем спискам данных по маршруту, скрываем балун с выбором данных.
                              if(markers.length != 1 || (typeof type_fuel != "undefined") && (typeof type_travel != "undefined") && (typeof type_route != "undefined")){
                                 myMap.balloon.close();
                              }
                              }

                       });
                }
                // Преобразуем пиксельные координаты позиции иконки на странице в геокоординаты.
                function pageToGeo(coords) {
                    var projection = myMap.options.get('projection');

                    return projection.fromGlobalPixels(
                        myMap.converter.pageToGlobal(coords), myMap.getZoom()
                    );
    }
    // Завершение функционала перетаскивания картинок на карту.




    //Определяем элемент управления поиск адреса по карте
	var SearchControl = new ymaps.control.SearchControl({
    noPlacemark:true,
    data: {},
    options: {
        maxWidth: ['small'],
        float: "right"
    }
    });

    //Добавляем элементы управления
   	this.yMap.controls.add("zoomControl").add("typeSelector").add(SearchControl, { left: '150px', top: '5px' });
    //Отключаем функции: изменения масштаба карты колесиком мышки. И масштабирования карты при выделении области правой кнопкой мыши.
    this.yMap.behaviors.disable(['scrollZoom', 'rightMouseButtonMagnifier']);


    //вывод в цикле меток на карту
    for (i = 0; i < this.coords.length; i++) {
      this.createPlacemark(this.coords[i]);
    }

    //Устанавливаем границы карты, охватывающие все геообъекты на ней.
    this.yMap.setBounds(this.yMap.geoObjects.getBounds());

    // предельный zoom(приближение).
    if (this.yMap.getZoom() >= 8) {
      this.yMap.setZoom(8);
    }

	//Отслеживаем событие клика по карте
		this.yMap.events.add('click', function (e) {
            var position = e.get('coordPosition');
			if(markers.length < 100)
			{
              myBalloonContentBodyLayout = ymaps.templateLayoutFactory.createClass('$[properties.balloonContentBody]', {
                    build: function () {
                        this.constructor.superclass.build.apply(this, arguments);

                        // Получаем ссылку на геообъект из данных
                        this._geoObject = this.getData().geoObject;
                        // Находим нужный элемент в контексте родителя балуна
                        this._btn = $(this.getParentElement()).find('.btn');
                        // Указываем обработчику события в качестве контекста наш макет.
                        this._onClick = $.proxy(this._onClick, this);

                        this._attachHandlers();
                    },
                    _attachHandlers: function () {
                        this._btn.on('click', this._onClick);
                    },
                    _detachHandlers: function () {
                        this._btn.off('click', this._onClick);
                    },
                    _onClick: function (e) {
                        e.preventDefault();

                        this._geoObject.setParent(null);
                    },
                    clear: function () {
                        this._detachHandlers();
                        this.constructor.superclass.clear.apply(this, arguments);
                    }
                }),
                myPlacemark = new ymaps.Placemark([position[0].toPrecision(6), position[1].toPrecision(6)], {
                    // Свойства
                    // Текст метки
                    //balloonContentBody: '<a href="#" class="btn btn-warning">удалить метку</a>',
                    iconContent: ch
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    //preset: 'twirl#carIcon',
                    // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                    'iconLayout': 'default#image',
                    'iconImageHref': '/f/min/images/car.png',
                    'iconImageSize': [35, 34],
                    'iconImageOffset': [-(35 / 2), -34],
                    // Метку можно перемещать.
                    draggable: true,
                    balloonContentBodyLayout: myBalloonContentBodyLayout
                });

			 markers.push(myPlacemark);
			 this.yMap.geoObjects.add(myPlacemark);
			 ch++;
			 }
			 else
			 {
			 alert("Вы задали максимальное количество точек");
			 }

             // Отправим запрос на геокодирование добавленной метки. Геокодирование координат полученной метки, в полный адрес. Его вывод в балуне метки.
             ymaps.geocode(position).then(function (res) {
             var firstGeoObject = res.geoObjects.get(0);
             var firstGeoObject_text = firstGeoObject.properties.get('text');
             // собираем информацию о всех точках автомаршрута, добавленного несколькими кликами по карте.
             // добавляем текстовую информацию(firstGeoObject_text.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
             geo_points.push(firstGeoObject_text);
             // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
             for(var i = 0, l = geo_points.length; i < l; i++) {
			 point_geo[i] = '<br /> &bull; ' + geo_points[i];
             //console.log('init object', point_geo);
			 }
             //myPlacemark.properties.set('balloonContentBody', firstGeoObject_text + '<br /><a href="#" class="btn btn-warning">удалить метку</a>');
             // в балуне первой метки, отмеченной на карте, выводим html-форму, с тремя списками select, с данными маршрута(типп: топлива, поездки, маршрута).
             myPlacemark.properties.set("balloonContentBody",
             '<div id="menu">Прежде чем начать строить автомаршрут, выберите необходимые данные по нему. И после, установите следующую точку на карте.<br /><br /> <small style="color: #1D3B3B;">Выберите тип поездки по указанному маршруту:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" style="height: 20px" /></span><select name="travel_select" id="travel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Work">В рабочие дни, до работы</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Dacha">В выходные дни, до дачи</option></select></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип маршрута:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Сonversely">Туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Выберите тип топлива вашего автомобиля:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" style="height: 20px" /></span><select name="fuel_select" id="fuel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Gazoline">Бензин</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Diesel">Дизель</option></select></div><div id="menu">');

             if(markers.length == 1)
             {
              // Если отмечена первая метка, открываем балун с выбором данных по маршруту.
              myPlacemark.balloon.open();

              // При выборе опции select по типу поездки, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
              $('#travel_select').change(function(){
              // Предварительно очищаем блок для вывода данных по типу поездки, чтобы в нем ничего не было, после произведения выбора.
              $(".route-length_travel").empty();
              // Присваиваем переменной 'type_travel', выбранное значение из списка.
              type_travel = $('select[name=travel_select] option:selected').val();

              if(type_travel == "Work")
              {
                $(".route-length_travel").append('<h3>Выбрана поездка: <strong>До работы</strong></h3>');
              }
              else if(type_travel == "Dacha")
              {
                $(".route-length_travel").append('<h3>Выбрана поездка: <strong>До дачи</strong></h3>');
              }
              else
              {
                $(".route-length_travel").append('<h3>Выберите пожалуйста тип поездки.</h3>');
              }
              });

              // При выборе опции select по типу маршрута, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
              $('#route_select').change(function(){
              // Предварительно очищаем блок для вывода данных по типу маршрута, чтобы в нем ничего не было, после произведения выбора.
              $(".route-length_route").empty();
              // Присваиваем переменной 'type_route', выбранное значение из списка.
              type_route = $('select[name=route_select] option:selected').val();

              if(type_route == "Сonversely")
              {
                $(".route-length_route").append('<h3>Тип маршрута: <strong>Туда и обратно</strong></h3>');
              }
              else if(type_route == "Forwards")
              {
                $(".route-length_route").append('<h3>Тип маршрута: <strong>Только в одну сторону</strong></h3>');
              }
              else
              {
                $(".route-length_route").append('<h3>Выберите пожалуйста тип маршрута.</h3>');
              }
              });

              // При выборе опции select по типу топлива, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
              $('#fuel_select').change(function(){
              // Предварительно очищаем блок для вывода данных по типу топлива, чтобы в нем ничего не было, после произведения выбора.
              $(".route-length_fuel").empty();
              // Присваиваем переменной 'type_fuel', выбранное значение из списка.
              type_fuel = $('select[name=fuel_select] option:selected').val();

              if(type_fuel == "Gazoline")
              {
                $(".route-length_fuel").append('<h3>Выбран тип топлива: <strong>Бензин</strong></h3>');
              }
              else if(type_fuel == "Diesel")
              {
                $(".route-length_fuel").append('<h3>Выбран тип топлива: <strong>Дизель</strong></h3>');
              }
              else
              {
                $(".route-length_fuel").append('<h3>Выберите пожалуйста тип топлива.</h3>');
              }
              });

             }
             else
             {
              // Если выбранная метка не первая на карте и открыт ее балун. Добавляем в него информацию об адресе метки и кнопку "Удалить метку".
              if(myMap.balloon.open){
                 myPlacemark.properties.set('balloonContentBody', firstGeoObject_text + '<br /><a href="#" class="btn btn-warning">удалить метку</a>');
              }

              // Если отмечена вторая метка на карте или произведен выбор по всем трем спискам данных по маршруту, скрываем балун с выбором данных.
              if(markers.length != 1 || (typeof type_fuel != "undefined") && (typeof type_travel != "undefined") && (typeof type_route != "undefined")){
                 myMap.balloon.close();
              }
             }
             });

             for(var i = 0, l = markers.length; i < l; i++) {
			   point[i] = markers[i].geometry.getCoordinates();
			 }

             // перед построением нового маршрута проверяем, были ли уже проложены старые и удаляем их, если да.
             if(route) myMap.geoObjects.remove(route);

             console.log('init object', type_fuel);

             // Если не выбран тип топлива, добавляем в блок справа от карты предупреждающий текст.
             if((typeof type_fuel == "undefined"))
             {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
             // Или, если не выбран тип поездки, добавляем в блок справа от карты предупреждающий текст.
             else if((typeof type_travel == "undefined"))
             {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
             // Или, если не выбран тип маршрута, добавляем в блок справа от карты предупреждающий текст.
             else if((typeof type_route == "undefined"))
             {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
             // Если все селекторы выбраны, то начинаем строить маршрут, по двум первым, отмеченным точкам.
             else
             {
             ymaps.route(point, {
                // Опции маршрутизатора
                avoidTrafficJams: true, // строить маршрут с учетом пробок
                mapStateAutoApply: true // автоматически позиционировать карту
            }).then(function (router) {

                route = router;
                myMap.geoObjects.add(route);
                //myMap.geoObjects.add(route.getPaths());

                var way_m_paths = route.getPaths();
                //console.log('init object', way_m_paths);

                // Включаем редактор маршрута.
                route.editor.start({
                  addWayPoints: true,
                  removeWayPoints: true,
                  editWayPoints: true
                });

                // С помощью метода getWayPoints() получаем массив точек маршрута
                var points = route.getWayPoints();
                points.options.set('visible', true);
                points.options.set({
                //'preset': 'twirl#carIcon'
                // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                'iconLayout': 'default#image',
                'iconImageHref': '/f/min/images/car.png',
                'iconImageSize': [35, 34],
                'iconImageOffset': [-(35 / 2), -34]
                });
                //points.properties.set('balloonContentBodyLayout', myBalloonContentBodyLayout);

                // ПОЛУЧАЕМ ПЕРВОНАЧАЛЬНЫЕ ДАННЫЕ ПО НОВОМУ МАРШРУТУ. ОБРАБАТЫВАЕМ И ВЫВОДИМ ИХ.
                // длина маршрута в м
                var way_m_first = route.getLength();
                // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой или маршрут туда и обратно.
                var way_m_first_1;
                if(type_route == "Сonversely"){
                  way_m_first_1 = way_m_first.toFixed(0) * 2;
                }
                else
                {
                  way_m_first_1 = way_m_first.toFixed(0);
                }

                // $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + way_m_first_1 + ' км</strong></h3>');

                var way_m_car1 = (way_m_first_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
                var way_m_car_11 = way_m_car1.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                var way_m_home1 = (way_m_first_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
                var way_m_home_11 = way_m_home1.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                //формула вычисления углеродного следа, при поездке на машине
                var k;
                var p;

                if(type_fuel == "Gazoline"){
                  k = 0.002664; //количество тонн со2 на 1 л бензина
                }
                else
                {
                  k = 0.002322; //количество тонн со2 на 1 л дизельного топлива
                }

                if(type_fuel == "Gazoline"){
                  p = 0.71; //плотность бензина
                }
                else
                {
                   p = 0.84; //плотность дизельного топлива
                }

                /*
                //формула вычисления углеродного следа, при поездке на машине
                var k_diesel1 = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
                var k_gasoline1 = 0.002664; //количество тонн со2 на 1 кг газового топлива

                var p_diesel1 = 0.84; //плотность дизельного топлива
                var p_gasoline1 = 0.71; //плотность газового топлива
                */

                var a1 = 10,
                b1 = way_m_first_1;

                var m = (b1/100*a1)*p; //масса топлива
                //var m_diesel1 = (b1/100*a1)*p_diesel1; //масса дизельного топлива
                //var m_gasoline1 = (b1/100*a1)*p_gasoline1; //масса газового топлива

                //углеродный след
                var co_auto = m*k;
                // округляем значение до одного знака после запятой
                var co_auto_1 = co_auto.toFixed(1);
                /*
                var co_auto_diesel1 = m_diesel1*k_diesel1; //углеродный след, дизельное топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_diesel1 = co_auto_diesel1.toFixed(1);

                var co_auto_gasoline1 = m_gasoline1*k_gasoline1; //углеродный след, газовое топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_gasoline1 = co_auto_gasoline1.toFixed(1);
                */

                $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			    $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
                $(".route-length1").append('<h3>Углеродный след: <strong>' + co_auto_1 + ' кгСО2/л.</strong></h3>');

                // Выводим значение пробега, в зависимости от типа поездки: на работу или на дачу.
                if(type_travel == "Work"){
                  $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_11 + ' км</strong></h3>');
                }
                else
                {
                  $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_home_11 + ' км</strong></h3>');
                }

                //$(".route-length1").append('Если указанный маршрут используется для поездок на дачу, то в дачный сезон вы проедете примерно: <strong>' + way_m_home_11 + ' км</strong><br /><br />');
                //$(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');
                // ЗАВЕРШЕНИЕ ОБРАБОТКИ И ВЫВОДА ДАННЫХ ПО НОВОМУ МАРШРУТУ:

                // ОТСЛЕЖИВАЕМ СОБЫТИЕ ОБНОВЛЕНИЯ МАРШРУТА. ПРИ ДОБАВЛЕНИИ НОВЫХ ПУТЕВЫХ ТОЧЕК. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА.
                route.events.add("update",function () {
                 // очищаем блок с данными построенного маршрута, до события обновления маршрута. Т.к. здесь будут добавляться свои данные, в зависимости от события маршрута.
                 $(".route-length1").empty();
                 // очищаем блок с данными о всех точках маршрута.
                 // $(".route-length2").empty();

                 // С помощью метода getWayPoints() получаем массив точек маршрута. После событий обновления маршрута, добавления новых точек.
                 var wayPoints = route.getWayPoints();
                 wayPoints.get(wayPoints.getLength() - 1).options.set({
                 // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                 'iconLayout': 'default#image',
                 'iconImageHref': '/f/min/images/car.png',
                 'iconImageSize': [35, 34],
                 'iconImageOffset': [-(35 / 2), -34]
                 //iconImageSize: [width, height],
                 //iconImageOffset: [-(width / 2), -height]
                 //'preset': 'twirl#carIcon'
                 });
                 //wayPoints.properties.set('balloonContentBodyLayout', myBalloonContentBodyLayout);

                 // длина обновленнного маршрута в м
                 way_m = route.getLength();
                 // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой или маршрут туда и обратно.
                 var way_m_1;
                 if(type_route == "Сonversely"){
                   way_m_1 = way_m.toFixed(0) * 2;
                 }
                 else
                 {
                   way_m_1 = way_m.toFixed(0);
                 }

                 var way_m_car = (way_m_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
                 var way_m_car_1 = way_m_car.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

                 var way_m_home = (way_m_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
                 var way_m_home_1 = way_m_home.toFixed(0); // округление пробега, до 0 цифр после запяфтой.


                //формула вычисления углеродного следа, при поездке на машине
                var k1;
                var p1;

                if(type_fuel == "Gazoline"){
                  k1 = 0.002664; //количество тонн со2 на 1 л бензина
                }
                else
                {
                  k1 = 0.002322; //количество тонн со2 на 1 л дизельного топлива
                }

                if(type_fuel == "Gazoline"){
                  p1 = 0.71; //плотность бензина
                }
                else
                {
                   p1 = 0.84; //плотность дизельного топлива
                }

                /*
                //формула вычисления углеродного следа, при поездке на машине
                var k_diesel1 = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
                var k_gasoline1 = 0.002664; //количество тонн со2 на 1 кг газового топлива

                var p_diesel1 = 0.84; //плотность дизельного топлива
                var p_gasoline1 = 0.71; //плотность газового топлива
                */

                var a = 10,
                b = way_m_1;

                var m1 = (b/100*a)*p1; //масса топлива
                //var m_diesel1 = (b1/100*a1)*p_diesel1; //масса дизельного топлива
                //var m_gasoline1 = (b1/100*a1)*p_gasoline1; //масса газового топлива

                //углеродный след
                var co_auto1 = m1*k1;
                // округляем значение до одного знака после запятой
                var co_auto_11 = co_auto1.toFixed(1);
                /*
                var co_auto_diesel1 = m_diesel1*k_diesel1; //углеродный след, дизельное топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_diesel1 = co_auto_diesel1.toFixed(1);

                var co_auto_gasoline1 = m_gasoline1*k_gasoline1; //углеродный след, газовое топливо
                // округляем значение до одного знака после запятой
                var co_auto_1_gasoline1 = co_auto_gasoline1.toFixed(1);
                */

                $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			    $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
                $(".route-length1").append('<h3>Углеродный след: <strong>' + co_auto_11 + ' кгСО2/л.</strong></h3>');

                // Выводим значение пробега, в зависимости от типа поездки: на работу или на дачу.
                if(type_travel == "Work"){
                  $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong></h3>');
                }
                else
                {
                  $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong></h3>');
                }

                // $(".route-length1").append('Если указанный маршрут используется для поездок на дачу, то в дачный сезон вы проедете примерно: <strong>' + way_m_home_1 + ' км</strong><br /><br />');
                //$(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');

                // ОТСЛЕЖИВАЕМ 4 СОБЫТИЯ СВЯЗАННЫХ С ПУТЕВЫМИ ТОЧКАМИ: ДОБАВЛЕНИЕ/УДАЛЕНИЕ/ПЕРЕТАСКИВАНИЕ. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА. ПО КАЖДОМУ ИЗ НИХ ОЧИЩАЕМ БЛОК С ДАННЫМИ.
                  route.editor.events.add('waypointadd', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointremove', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointdragstart', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                  route.editor.events.add('waypointdragend', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // очищаем блок с данными о всех точках маршрута.
                  // $(".route-length2").empty();
                  });

                });
                // ЗАВЕРШЕНИЕ ОТСЛЕЖИВАНИЯ СОБЫТИЯ ОБНОВЛЕНИЯ МАРШРУТА.

                });
                }

    }, this);

       //Удаление маршрута, геокодированной коллекции координат и добавленных меток, с карты и очистка данных.
        button1.click(function () {
        // Выключаем редактор маршрута.
        route.editor.stop();

         route && myMap.geoObjects.remove(route);
		 for(var i = 0, l = markers.length; i < l; i++) {
		     myMap.geoObjects.remove(markers[i]);
		 }
         // обнуляем переменную счетчик меток и массивы.
		 markers = [];
		 point = [];
         geo_points = [];
         point_geo = [];
		 ch = 1;
         // очищаем блок с данными построенного маршрута.
         $(".route-length1").empty();
         // очищаем блок с данными о всех точках перелета, по авиамаршруту.
         $(".route-length2").empty();
         // очищаем данные о типе топлива, типе поездки и типе маршрута.
         $(".route-length_fuel").empty();
         $(".route-length_travel").empty();
         $(".route-length_route").empty();
         type_fuel = "undefined";
         type_travel = "undefined";
         type_route = "undefined";
         //console.log('init object', mGeocoder);

         // Создаем механизм удаления геокодированной выше, коллекции координат автомаршрута.
         // создаем новую коллекцию ymaps.GeoObjectCollection, добавляем ее на карту.
         var collection = new ymaps.GeoObjectCollection();
         myMap.geoObjects.add(collection);
         // заполняем ее метками из геокодированной коллекции geoObjects_coll.
         collection.add(geoObjects_coll);
         //делаем этой коллекции removeAll(). Т.е. удаляем все объекты с карты, при клике по кнопке "Очистить маршрут по картинкам".
         collection.removeAll();

         // устанавливаем после удаления маршрута, новый центр и zoom карты
         myMap.setCenter([55.752078, 37.621147], 8);
   });

// Добавляем выпадающий список, на карту. С возможностью выбора города.
// Создадим собственный макет выпадающего списка.
        ListBoxLayout = ymaps.templateLayoutFactory.createClass(
            "<button id='my-listbox-header' class='btn btn-success dropdown-toggle' data-toggle='dropdown'>" +
                "{{data.title}} <span class='caret'></span>" +
            "</button>" +
            // Этот элемент будет служить контейнером для элементов списка.
            // В зависимости от того, свернут или развернут список, этот контейнер будет
            // скрываться или показываться вместе с дочерними элементами.
            "<ul id='my-listbox'" +
                " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
                " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>", {

            build: function() {
                // Вызываем метод build родительского класса перед выполнением
                // дополнительных действий.
                ListBoxLayout.superclass.build.call(this);

                this.childContainerElement = $('#my-listbox').get(0);
                // Генерируем специальное событие, оповещающее элемент управления
                // о смене контейнера дочерних элементов.
                this.events.fire('childcontainerchange', {
                    newChildContainerElement: this.childContainerElement,
                    oldChildContainerElement: null
                });
            },

            // Переопределяем интерфейсный метод, возвращающий ссылку на
            // контейнер дочерних элементов.
            getChildContainerElement: function () {
                return this.childContainerElement;
            },

            clear: function () {
                // Заставим элемент управления перед очисткой макета
                // откреплять дочерние элементы от родительского.
                // Это защитит нас от неожиданных ошибок,
                // связанных с уничтожением dom-элементов в ранних версиях ie.
                this.events.fire('childcontainerchange', {
                    newChildContainerElement: null,
                    oldChildContainerElement: this.childContainerElement
                });
                this.childContainerElement = null;
                // Вызываем метод clear родительского класса после выполнения
                // дополнительных действий.
                ListBoxLayout.superclass.clear.call(this);
            }
        }),

        // Также создадим макет для отдельного элемента списка.
        ListBoxItemLayout = ymaps.templateLayoutFactory.createClass(
            "<li><a>{{data.content}}</a></li>"
        ),

        // Создадим 2 пункта выпадающего списка
        listBoxItems = [
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'Москва',
                    center: [55.752078, 37.621147],
                    zoom: 10
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'Санкт-Петербург',
                    center: [59.918153, 30.305578],
                    zoom: 10
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'Омск',
                    center: [54.990215, 73.365535],
                    zoom: 10
                }
            })
        ],

        // Теперь создадим список, содержащий 2 пунтка.
        listBox = new ymaps.control.ListBox({
                items: listBoxItems,
                data: {
                    title: 'Выбрать пункт:'
                },
                options: {
                    // С помощью опций можно задать как макет непосредственно для списка,
                    layout: ListBoxLayout,
                    // так и макет для дочерних элементов списка. Для задания опций дочерних
                    // элементов через родительский элемент необходимо добавлять префикс
                    // 'item' к названиям опций.
                    itemLayout: ListBoxItemLayout
                }
            });

        listBox.events.add('click', function (e) {
            // Получаем ссылку на объект, по которому кликнули.
            // События элементов списка пропагируются
            // и их можно слушать на родительском элементе.
            var item = e.get('target');
            // Клик на заголовке выпадающего списка обрабатывать не надо.
            if (item != listBox) {
                myMap.setCenter(
                    item.data.get('center'),
                    item.data.get('zoom')
                );
            }
        });

    myMap.controls.add(listBox, {float: 'left'});

  };

  //Создание новой метки на карте
    Map.prototype.createPlacemark = function (coords) {
    var placemark;

    placemark = new ymaps.Placemark([coords.lat, coords.lng], {
      iconContent: "H"}, {
      draggable: true,
      visible: false
    });

    //Добавляем метки на карту
    this.placemarks.push(placemark);
    this.yMap.geoObjects.add(placemark);
  };

  // При инициализации карты, создаем новый класс 'ymap-ready' и добавляем его к странице
  Map.prototype.init = function () {
    this.root.addClass('ymap-ready');
  };

  //возвращаем результат функции 'Map' в билд проекта, в файл main.build.js.
  als.Map = Map;
  return Map;
});