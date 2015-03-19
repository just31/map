/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-08-18 by dryzhov (Ryzhov Dmitry) */

define('map_main', ['jquery', 'als'], function ($, als) {
  'use strict';

  // Делаем div класса 'span12', невидимым перед загрузкой карты.
  //$(".span12").hide();

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
   * Загрузка карты
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

    var i, ii, route, icon, distance, myGeoObject, placemark, myBalloonContentBodyLayout, type_route, type_fuel, type_travel, type_aero, type_rad, firstGeoObject_text, firstGeoObject_text_route_first,
    firstGeoObject_text_route, firstGeoObject_text_avio_first, num, rad, aero_num_people, route_point_1, way_m, visibleObjects, firstGeoObject_1, ballon_aero, text, distance_aero_length, car, geolocation, coords_location,
       ch = 1, el = this.root.get(0);
    var markers = [];
	var point = [];
    var geo_points = [];
    var point_geo = [];
    var distance_aero = [];
    var point_aero = [];
    var way_m_paths = [];
    var model_point = [];
    var model_point_coord = [];
    var markers_route = [];
    var co2 = [];
    var myCollection;
    // делаем переменную myCollection, глобальной, чтобы можно было ее значение передавать из ajaх запроса. При получении списка аэропортов из aero1.csv.
    window.globalvar = myCollection;
    // создаем глобальную переменную для GeoQueryResult, со списком аэропортов.
    var arPlacemarksRez;
    window.globalvar = arPlacemarksRez;

    // Данные о местоположении, определённом по IP.
    geolocation = ymaps.geolocation;
    // Координаты местопложения пользователя. По ним будем открывать центр карты.
    coords_location = [geolocation.latitude, geolocation.longitude];
    // Результат смотрим в консоли
    console.log(geolocation.country, geolocation.city, geolocation.region, coords_location);

    this.yMap = new ymaps.Map(
      'map_main',
      {
        center: coords_location,
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

    // Добавляем в центр карты метку, по координатам пользователся. В ее балуне, информацию по построению нового маршрута. Делаем ее невидимой.
    //myMap.geoObjects.add(
    placemark_new = new ymaps.Placemark(
            coords_location,
            {
                // В балуне: страна, город, регион.
                //balloonContentHeader: geolocation.country,
                //balloonContent: geolocation.city,
                //balloonContentFooter: geolocation.region
                balloonContentHeader: "<i style='color: #99490E;'>Для вычисления углеродного следа:</i>",
                balloonContent: "Перетяните метку машинки или самолетика на карту. В то место откуда хотите начать маршрут(авто или авиа).",
                //hintContent: "Нажмите чтобы начать строить маршрут."
            },
            {
               'iconLayout': 'default#image',
               'iconImageHref': '/f/min/images/car.png',
               'iconImageSize': [75, 74],
               'iconImageOffset': [-(75 / 2.7), -80],
               visible: true,
               // Включаем кнопку закрытия балуна.
               balloonCloseButton: true
            }
        );
    //);
    // Добавляем метку на карту.
    myMap.geoObjects.add(placemark_new);

    // Устанавливаем опции и свойства новой метки.
    // Шаблон вывода хинта метки
    placemark_new.options.set('hintContentLayout', ymaps.templateLayoutFactory.createClass("<span style='color: #99490E;'>$[properties.hintContent]</span>"));
    placemark_new.properties.set('hintContent', "Нажмите, чтобы построить маршрут");
    //placemark_new.properties.set({'balloonContentFooter': '<a href="#" class="btn btn-warning" id="switch_close">Скрыть пояснение</a>  <div class="span12"><img class="icon" id="icon01" src="/f/min/images/car.png" draggable="true"/><img class="icon" id="icon02" src="/f/min/images/airplane.png" draggable="true"/></div>'});
    // Добавляем значки машинки и самолетика, в футер балуна метки.
    placemark_new.properties.set({'balloonContentFooter': '<div><img class="icon" id="icon01" src="/f/min/images/car.png" draggable="true" /><img class="icon_1" id="icon02" src="/f/min/images/airplane.png" draggable="true" /></div>'});
    // Добавляем опции, если открыт балун метку не скрываем и устанавливаем ей минимальный приоритет. Чтобы балун был поверх нее.
    //placemark_new.options.set({hideIconOnBalloonOpen: false, zIndexActive: 0});
    // Открываем балун с информацией по построению маршрута, на карте, после ее загрузки.
    //placemark_new.balloon.open();

    // При клике по метке, бегающую за курсором машинку, делаем видимой.
    placemark_new.events.add('click', function (e) {
       $(".pointerImg").css({'opacity' : '0'});
       // Скрываем метку.
       placemark_new.options.set('visible', false);
       // Устанавливаем блоку, с тянущейся за курсором картинкой, смещение сверху в 30px.
       //$(".pointerImg").offset({top: 30px});
    });

    /*
    // Механизм движения за курсором, значка машинки. Через свойство перемещания курсора мышки 'onmousemove', в любом направлении экрана.
    document.onmousemove = function (e) {
       var x = (e = e || event).clientX;
       var y = e.clientY;
       var obj = this.getElementById('mouseImg');
       if (obj && (obj = obj.style)) {
         // Делаем отступ в 5px, слева, у картинки тянущейся за курсором.
         obj.left = x + 5 + 'px';
         //console.log('Положение по оси x', obj.left);
         // Делаем отступ в 5px, сверху, у картинки тянущейся за курсором.
         obj.top = y + 5 + 'px';
       }
       //self.e.cancelBubble=true;
    };
    */

    // Добавляем геоколллекцию меток аэропортов на карту
    // Создание пустой геоколллекции myCollection, для добавления в нее списка аэропортов из файла aero3.csv.
    myCollection = new ymaps.GeoObjectCollection();

    // список аэропортов Мира
    var path = 'http://intranet.russiancarbon.org/f/min/map/aero3.csv';
    // Запрос cvs файла со списком аэропортов
     $.ajax({
	    url:path,
        async: false,
	    success: function(data){
        var rows = data.split("\n");
		for(var j in rows){
		  var colls=rows[j].split(";");//или другой символ разделитель
          // Проверяем первое значение массива colls: colls[0]. Если оно не пустое выводим его в балуне(русское название аэропорта). Если нет, выводим второе значение colls[1], с английским названием.
          if((colls[0] === ''))
          {
           ballon_aero = colls[1];
          }
          else
          {
           ballon_aero = colls[0];
          }
          // Устанавливаем координаты и содержимое балуна
          // если список аэропортов России, координаты:
          //var myPlacemark_1 = new ymaps.Placemark([colls[3], colls[4]],
          // если список аэропортов Мира, координаты:
          myPlacemark_1 = new ymaps.Placemark([colls[4], colls[5]], {
          // Свойства
          "balloonContent": 'Аэропорт - '+ ballon_aero
          }, {
          // Опции
          preset: 'twirl#airplaneIcon',
          visible: false,
          // Отключаем кнопку закрытия балуна.
          //balloonCloseButton: false,
          // Балун будем открывать и закрывать кликом по иконке метки.
          //hideIconOnBalloonOpen: false
          });
          myCollection.add(myPlacemark_1);
        }
        }
	 });

     // создание GeoQueryResult, со списком аэропортов. Для нахождения ближайшего к выбранной точке.
     arPlacemarksRez = ymaps.geoQuery(myCollection);
     // Найдем объекты(аэропорты), попадающие в видимую область карты.
     arPlacemarksRez.searchInside(myMap)
     // И затем добавим найденные объекты на карту. Делаем их невидимыми.
     .addToMap(myMap).setOptions('visible', false);

     myMap.events.add('boundschange', function () {
       // После каждого сдвига карты будем смотреть, какие объекты попадают в видимую область. Делаем их невидимыми.
       visibleObjects = arPlacemarksRez.searchInside(myMap).addToMap(myMap).setOptions('visible', false);
       // Оставшиеся объекты будем удалять с карты.
       arPlacemarksRez.remove(visibleObjects).removeFromMap(myMap);
     });

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
                    placemark = new ymaps.Placemark(coordinates, {id: ch});

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
                            placemark.options.set('draggable', true);
                        });

                    return placemark;
    }

        $mapContainer.on('dragover', function (e) {
                        // Эта инструкция разрешает перетаскивание.
                        e.preventDefault();
                        // dropEffect должен совпадать с effectAllowed.
                        e.dataTransfer.dropEffect = 'copy';
                        // Закрываем балун с информацией по построению маршрута. После начала перетягивания метки машинки или самолетика, из балуна.
                        if((typeof placemark != "undefined")){
                           // Если метка placemark, перетянута из блока сверху над картой. То ничего не делаем.
                        }
                        else{
                           // Иначе закрываем балун. Если метка тянется из балуна с первичной информацией.
                           myMap.balloon.close();
                           // Скрываем бегающий за мышкой значок машинки. При скрытии балуна и большой метки с карты.
                           $(".pointerImg").css({'opacity' : '0'});
                        }
                        // Удаляем метку с пояснениями с карты.
                        myMap.geoObjects.remove(placemark_new);
                        //console.log('Id элемента', e.dataTransfer.setData('TEXT', e.target.getAttribute('id')));
                        if(e.dataTransfer.getData('TEXT') == 'http://intranet.russiancarbon.org/f/min/images/airplane.png'){
                          myMap.setZoom(5);
                        }
                    })
                    .on('drop', function (e) {
                        // не работает в FF = поэтому делаем return false вконце
                        e.stopPropagation();

                        // Обходим механизм получения id значка. Т.к. в функции $('.icon').on('dragstart', function (e) { }), он не работает. Из-за того, что изначально на карте, балун с данными по картинкам, закрыт.
                        var pict_id;
                        /*
                        var img_route = $(".icon").attr("id");
                        var img_route_1 = $(".icon_1").attr("id");

                        if((typeof img_route != "undefined"))
                        {
                          pict_id = img_route;
                        }
                        if((typeof img_route_1 != "undefined"))
                        {
                          pict_id = img_route_1;
                        }
                        */
                        // Если перетянута из балуна картинка машинки, присваиваем ее id, переменной pict_id.
                        if(e.dataTransfer.getData('TEXT') == 'http://intranet.russiancarbon.org/f/min/images/car.png')
                        {
                          console.log('Перетянут значок машинки');
                          pict_id = 'icon01';
                        }
                        // Если перетянута из балуна картинка самолетика, присваиваем ее id, переменной pict_id.
                        if(e.dataTransfer.getData('TEXT') == 'http://intranet.russiancarbon.org/f/min/images/airplane.png')
                        {
                          console.log('Перетянут значок самолетика');
                          pict_id = 'icon02';
                        }

                        // Если перетягивание метки, происходило из балуна с информацией, проверяем значение переменной 'pict_id'.
                        // Если переменная 'pict_id' не пустая, находим DOM-элемент иконки по идентификатору 'pict_id'.
                        if((typeof pict_id != "undefined"))
                        {
                            icon = $('#' + pict_id),
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
                                preset: 'twirl#airplaneIcon',
                                balloonContentBodyLayout: myBalloonContentBodyLayout
                            };
                        }
                        // Иначе получаем значение id картинки, механизмом по умолчанию $('#' + e.dataTransfer.getData('TEXT')). Из e.dataTransfer.getData('TEXT')), установленной выше.
                        else
                        {
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
                                preset: 'twirl#airplaneIcon',
                                balloonContentBodyLayout: myBalloonContentBodyLayout
                            };
                        }
                        // Завершаем механизм обхода, получения 'id', перетянутого значка на карту. В зависимости от того, как он был перетянут, из балуна первичной метки или из блока слева, вверху над картой.

                        // Создаем метку и добавляем ее на карту.
                        if(markers.length < 100)
			            {
                         // добавляем основную метку на карту
                         myMap.geoObjects.add(createPlacemark(coordinates, options));
                         // делаем ее видимой, передаем далее в скрипте, вывод меток маршрута, механизму маршрутизатизации route().
                         placemark.options.set('visible', true);

                         // После добавления первой метки нового маршрута, делаем видимыми значки машинки и самолетика, в блоке '.span12' вверху над картой.
                         $(".span12").css({'opacity' : '1'});
                         // Скрываем бегающий за мышкой значок машинки. При установлении новой точки к маршруту. Перетягиванием.
                         $(".pointerImg").css({'opacity' : '0'});
                         // Изменяем ширину картинок(машинки, самолетика) класса .span12. Увеличиваем ее, при появлении значков над картой.
                         //$(".span12 img").css({'width' : '45px'});
                         //$(".span12".css("opacity", "1"));

                         // Если строится автомаршрут, перетягиванием метки из тулбара, то добавляем его точки в массив markers.
                         if (placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                           markers.push(placemark);
                           // Увеличиваем значение счетчика 'ch', при добавлении каждой новой точки автомаршрута. Перетянутой из тулбара.
                           ch++;
                           // Добавляем опции, если открыт балун метку не скрываем и устанавливаем ей минимальный приоритет. Чтобы балун был поверх нее.
                           placemark.options.set({hideIconOnBalloonOpen: false, zIndexActive: 0});
                         }

                         // НАЧИНАЕМ СТРОИТЬ АВИАМАРШРУТ
                         // если выбран значок самолета, подгружаем список аэропортов
                         if (placemark.options.get('iconImageHref') == '/f/min/images/airplane.png'){

                         // находим ближайший объект(аэропорт) из геоколлекции myCollection. К выбранной точке.
                         var closestObject = arPlacemarksRez.getClosestTo(coordinates);
                         //открываем балун с названием ближайшего к выбранной точке, аэропорта.
                         var closestObject_1 = arPlacemarksRez.getClosestTo(coordinates).balloon.open();

                         // получаем координаты ближ. аэропорта. Записываем их в массив coord_aero.
                         var coord_aero = 0;
                         coord_aero = closestObject.geometry.getCoordinates();
                         // получаем отд. строковые значения широты и долготы точки аэропорта и приводим их к числовому значению.
                         var coord_aero_lat = coord_aero[0] - 0;
                         // альтернативный вариант преобразования строки в число. Таким же образом можно преобразовать и значение долготы точки coord_aero_lon.
                         //var coord_aero_lat = Number(coord_aero[0]);
                         var coord_aero_lon = coord_aero[1] - 0;
                         // помещаем оба значения в массив coord_aero_main, для использования его в геокодировании найденной точки аэропорта.
                         var coord_aero_main = [coord_aero_lat, coord_aero_lon];

                         // Удаляем основную метку, созданную и добавленную выше myMap.geoObjects.add(createPlacemark(coordinates, options));. Чтобы заменить ее новой по координатам найденного аэропорта.
                         myMap.geoObjects.remove(placemark);

                         // устанавливаем приближение карты, равное 5.
                         myMap.setZoom(5);
                         // добавляем новую метку на карту, с координатами ближайшего аэропорта.
                         myMap.geoObjects.add(createPlacemark(coord_aero_main, options));
                         // делаем ее невидимой. Чтобы метка была заменена на значок вершины ломаной авиамаршрута.
                         placemark.options.set('visible', false);
                         // добавляем выбранные точки в массив distance_aero
                         distance_aero.push(placemark);
                         // Фильтрация данных массива 'distance_aero' с точками маршрута. Убираем из него undefined и null.
                         distance_aero = distance_aero.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });
                         for(var i = 0, l = distance_aero.length; i < l; i++) {
                            // получаем их координаты, для дальнейшего использования в построении ломаной авиамаршрута
			            	point_aero[i] = distance_aero[i].geometry.getCoordinates();
			             }
                         // Фильтрация данных массива 'point_aero' с гео координатами точек маршрута. Убираем из него undefined и null.
                         point_aero = point_aero.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });

                         // Логика по балуну первой метки авиамаршрута.
                         // Через проверку длины массива 'distance_aero', определяем первую точку и в ней открываем балун. Обрабатываем данные от html-формы из балуна.
                         if(distance_aero.length == 1)
                         {
                           // Получаем название аэропорта из ближ. объекта closestObject_1, к выбранной точке - closestObject_1.getData().properties.get('balloonContent'). Для вывода его в балуне первой метки авиамаршрута.
                           //console.log('aeroport', closestObject_1.getData().properties.get('balloonContent'));
                           // Вначале создаем сам балун - placemark.properties.set("balloonContentBody", ...
                           placemark.properties.set("balloonContentBody",
'<div id="menu"><h3 style="font-size: 14px;">Начальная точка авиамаршрута: <i style="color: #999966;">' + closestObject_1.getData().properties.get('balloonContent') + '</i></h3>Прежде чем продолжить строить авиамаршрут, выберите ниже в форме необходимые данные по нему. И после, перетащите следующую метку самолетика на карту. Форма и балун будут скрыты, после выбора всех значений.<br /><br /> Точки авиамаршрута редактируются, добавляются/удаляются через редактор метки. Редактор открывается кликом по любой из меток авиамаршрута.<br /><br /><small style="color: #1D3B3B;">Укажите кол-во пассажиров:</small><br /> <input type="text" class="input-medium" id="col_text" name="col_text" style="width: 145px !important;" /><br /></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип полета:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 200px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" value="Сonversely">Перелет туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Количество радиации в атмосфере:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/qKhPY0P5zQRTChD09SLAfjK__yQ.png" style="height: 20px" /></span><select name="rad_select" id="rad_select" class="span2" style="width: 200px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="middle">Среднее</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="small">Небольшое</option></select></div><div id="menu">');

                           // Открываем балун с выбором данных по маршруту, на карте.
                           placemark.balloon.open();

                           // Если происходит ввод данных в текстовое поле, создаем обработчик события изменения в текстовом поле.
                           $('#col_text').change(function(){
                           // Получаем и выводим кол-во пассажиров на борту самолета.
                           aero_num_people = $('input[name=col_text]').val();
                           $(".route-length_travel").empty();
                           $(".route-length_travel").append('<h3>Кол-во пассажирова на борту: <strong>' + aero_num_people + '</strong></h3>');
                           });

                           // При выборе опции select по типу полета, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
                           $('#route_select').change(function(){
                           // Предварительно очищаем блок для вывода данных по типу маршрута, чтобы в нем ничего не было, после произведения выбора.
                           $(".route-length_route").empty();
                           // Присваиваем переменной 'type_route', выбранное значение из списка.
                           type_aero = $('select[name=route_select] option:selected').val();

                           if(type_aero == "Сonversely")
                           {
                             $(".route-length_route").append('<h3>Выбран перелет: <strong>туда и обратно</strong></h3>');
                             num = 2.7;
                           }
                           else if(type_aero == "Forwards")
                           {
                             $(".route-length_route").append('<h3>Выбран перелет: <strong>только в одну сторону</strong></h3>');
                             num = 1.0;
                           }
                           else
                           {
                             $(".route-length_route").append('<h3>Выберите пожалуйста тип полета.</h3>');
                           }
                           });

                           // При выборе опции select по типу радиации, проверяем выбранное значение и выводим его в блоке справа от карты. Если значение не выбрано, добавляем предупреждающий текст.
                           $('#rad_select').change(function(){
                           // Предварительно очищаем блок для вывода данных по типу радиации, чтобы в нем ничего не было, после произведения выбора.
                           $(".route-length_fuel").empty();
                           // Присваиваем переменной 'type_rad', выбранное значение из списка.
                           type_rad = $('select[name=rad_select] option:selected').val();

                           if(type_rad == "middle")
                           {
                             $(".route-length_fuel").append('<h3>Радиация в атмосфере: <strong>средняя</strong></h3>');
                             rad = 2.0;
                           }
                           else if(type_rad == "small")
                           {
                             $(".route-length_fuel").append('<h3>Радиация в атмосфере: <strong>небольшая</strong></h3>');
                             rad = 1.0;
                           }
                           else
                           {
                             $(".route-length_fuel").append('<h3>Выберите пожалуйста тип радиации.</h3>');
                           }

                           // Если выбрано последнее значение в крайнем списке 'select', по типу радиации, в форме с выбором данных маршрута. Скрываем большой балун первой метки, с формой и вводным текстом, с карты.
                           // Получаем значение свойства: название аэропорта, для выбранной первой точки и выводим его в балуне. Вместо большого. Саму метку скрываем, чтобы их не было две, при передачи вывода меток редактору ломаной.
                           myMap.balloon.close();
                           placemark.properties.set({"balloonContentBody": closestObject_1.getData().properties.get('balloonContent')});
                           placemark.options.set('visible', false);
                           placemark.balloon.open();
                           });

                         }
                         // Иначе, если точка не первая, открываем балун с названием аэропорта
                         else
                         {
                           var closestObject_2 = arPlacemarksRez.getClosestTo(coordinates).balloon.open();
                         }

                         // производим геокодирование установленной на карте, метки
                         ymaps.geocode(coord_aero_main).then(function (res) {
                           firstGeoObject_1 = res.geoObjects.get(0);
                           var firstGeoObject_text_1 = firstGeoObject_1.properties.get('text');
                           // собираем информацию о точках авиамаршрута, добавленного по картинкам из тулбара.
                           // добавляем текстовую информацию(firstGeoObject_1.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
                           geo_points.push(firstGeoObject_text_1);
                           // Фильтрация массива 'geo_points' с текстовой информацией о местах маршрута. Убираем из него undefined и null.
                           geo_points = geo_points.filter(function(x) { return x !== "<br />&bull; undefined" && x !== undefined && x !== null; });
                           // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                           for(var i = 0, l = geo_points.length; i < l; i++) {
                             // два варианта нахождения последнего символа, в строке описания каждой точки маршрута
                             // var point_geo_l = geo_points[i].slice(0, -1);
                             // var point_geo_l = geo_points[i].substring(0, geo_points[i].length - 1);
     			             point_geo[i] = '<br />&bull; ' + geo_points[i];
			               }
                           // Фильтрация данных массива 'point_geo' с точками о местах маршрута. Убираем из него undefined и null.
                           point_geo = point_geo.filter(function(x) { return x !== "<br />&bull; undefined" && x !== undefined && x !== null; });

                           placemark.properties
                           .set({
                             balloonContent: firstGeoObject_text_1
                           });
                           if(point_geo.length > 1){
                            // Если не указано кол-во пассажиров, добавляем в блок справа от карты предупреждающий текст.
                            if((typeof aero_num_people == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                            {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                            // Или, если не выбран тип полета, добавляем в блок справа от карты предупреждающий текст.
                            else if((typeof type_aero == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                            {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                            // Или, если не выбрано кол-во радиации в атмосфере, добавляем в блок справа от карты предупреждающий текст.
                            else if((typeof type_rad == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                            {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                            // Если все селекторы выбраны, то выводим информацию о всех точках маршрута
                            else {
                              $(".route-length2").empty();
                              $(".route-length2").append('<h3>Все точки авиамаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');
                            }
                           }
                         });
                         // Перед построением ломаной авиамаршрута проверяем, были ли уже проложены старые и удаляем их, если да.
                         if(myGeoObject) myMap.geoObjects.remove(myGeoObject);

                         // Очищаем блок данных, для вывода информации по авиамаршрута. При перетягивании следующей метки из тулбара.
                         $(".route-length1").empty();
                         // Очищаем блок с данными по углеродному следу. Вверху над картой.
                         $(".result-co2").empty();

                         // Если не указано кол-во пассажиров, добавляем в блок справа от карты предупреждающий текст.
                         if((typeof aero_num_people == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                         {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                         // Или, если не выбран тип полета, добавляем в блок справа от карты предупреждающий текст.
                         else if((typeof type_aero == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                         {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                         // Или, если не выбрано кол-во радиации в атмосфере, добавляем в блок справа от карты предупреждающий текст.
                         else if((typeof type_rad == "undefined") && placemark.options.get('iconImageHref') == '/f/min/images/airplane.png')
                         {$(".route-length_fuel").append('<h3>Укажите пожалуйста все данные</h3>');}
                         // Если все селекторы выбраны, то начинаем прокладывать авиамаршрут, по двум первым, отмеченным точкам.
                         else{
                         // Создаем ломаную(прямую), используя класс геометрии 'GeoObject'. Для графического отображения линии авиамаршрута на карте. По полученным ранее координатам point_aero, при перетаскивании меток самолетика на карту.
                         myGeoObject = new ymaps.GeoObject({
                         // Описываем геометрию геообъекта.
                         geometry: {
                         // Тип геометрии - "Ломаная линия".
                         type: "LineString",
                         // Указываем координаты вершин ломаной.
                         coordinates: point_aero
                         },
                         // Описываем свойства геообъекта.
                         properties:{
                           // Содержимое балуна.
                           balloonContent: 'Продолжаем перелет'
                         }
                         }, {
                         // Задаем опции геообъекта.
                         // Цвет с прозрачностью.
                         strokeColor: "#336699",
                         // Ширину линии.
                         strokeWidth: 5,
                         // Cоздадим собственный макет для вершин ломаной.
                         editorVertexLayout: ymaps.templateLayoutFactory.createClass('<div style="height:34px;width:35px;background: url(/f/min/images/airplane.png);margin: 0px 0px 0px -17px;"></div>'),
                         // Cоздадим собственный макет для промежуточных точек ломаной.
                         //editorEdgeLayout: ymaps.templateLayoutFactory.createClass('<div style="height:34px;width:35px;background: url(/f/min/images/airplane.png);margin: 0px 0px 0px -17px;"></div>')
                         });
                         }

                         // Добавляем линию авиамаршрута на карту.
                         myMap.geoObjects.add(myGeoObject);

                         // Включаем режим редактирования ломаной.
                         myGeoObject.editor.startEditing();
                         // Включаем режим добавления новых вершин в ломаную линию.
                         //myGeoObject.editor.startDrawing();

                         /*
                         // Получаем значение поля 'drawing' редактора. Для передачи его в отслеживающий монитор 'stateMonitor'.
                         myGeoObject.editor.state.get('drawing');
                         */

                         // Редактируем контекстное меню, вершин ломаной. Получаем значения 'id' стандартных пунктов меню.
                         myGeoObject.editor.options.set({
                          menuManager:function(editorItems, model){
                            // Механизм получения координат вершины ломаной по которой кликнули. И добавление нового балуна по ним.
                            // Скрываем, если был открыт балун до этого на карте.
                            myMap.balloon.close();
                            // Получаем координаты вершины
                            var coords_vertex = model.geometry.getCoordinates();

                            // Производим геокодирование первой путевой точки
                            ymaps.geocode(coords_vertex).then(function (res) {
                              var firstGeoObject_avio = res.geoObjects.get(0);
                              firstGeoObject_text_avio_first = firstGeoObject_avio.properties.get('text');
                              //console.log('Местонахождение новой точки авиамаршрута: ', firstGeoObject_text_avio_first);
                              myMap.balloon.open(coords_vertex, {contentBody: "<b style='color: #ddb505; font-size: 14px;'>Местонахождение:</b><br /> <i style='font-size: 12px;'>" + firstGeoObject_text_avio_first + '</i>'});
                           });
                            //console.log('Местонахождение новой точки авиамаршрута: ', firstGeoObject_text_avio_first);

                            // Открываем  новый балун по ним
                            //console.log(model.geometry.getCoordinates());

                            //console.log(model);
                            for(var i=0; i<editorItems.length; i++){
                            //console.log(editorItems[i].id);
                            //if(editorItems[i].id==='removeVertex') editorItems[i].title='Удалить вершину';
                            if(editorItems[i].id==='startDrawing') editorItems[i].title='Продолжить маршрут';
                            if(editorItems[i].id==='stopDrawing') editorItems[i].title='Завершить маршрут';
                            if(editorItems[i].id==='addInterior') editorItems.splice(i, 1);
                            }
                            // Если выбран пункт "Удалить", заменяем его 'title', на "Удалить метку". Переопределяем функцию обработчик, по событию 'onClick'. Делаем перерасчет длины ломаной авиамаршрута.
                            if(editorItems[0].id==='removeVertex'){
                              editorItems[0].title='Удалить метку';

                              editorItems[0].onClick = function() {
                              // Очищаем блок данных маршрута, справа от карты. Для обновления информации в нем, по каждому клику "Удалить вершину".
                              $(".route-length1").empty();
                              // Очищаем блок с данными по углеродному следу. Вверху над картой.
                              $(".result-co2").empty();
                              // закрываем открытые балуны на карте
                              myMap.balloon.close();

                              // Определяем индекс удаляемой вершины
                              var vertexIndex = model.getIndex();

                              // Удаляем вершину по полученному индексу.
                              myGeoObject.geometry.remove(vertexIndex);

                              // узнаем тип системы координат
                              var coordSystem_1 = myMap.options.get('projection').getCoordSystem(),
                              distance_aero_length_1 = 0;
                              // получаем массив пиксельных данных модели ломаной, из объекта-обещания
                              model_point = myGeoObject.editor.getModel().getPixels();
                              // получаем из глобальных пикс. координат, гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                              for(var w = 0, d = model_point.length; w < d; w++) {
                                model_point_coord[w] = myMap.options.get('projection').fromGlobalPixels(model_point[w], myMap.getZoom());
			                  }

                              // Удаление из массива с глобальными пиксельными координатами 'model_point', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete model_point[vertexIndex];
                              // Пересчет длины массива 'model_point', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              model_point.slice(0, model_point.length-1);
                              // Удаление из массива с глобальными пиксельными координатами 'model_point1'(заполняется при продолжении маршрута, через редактор ломаной), удаленной с карты точки, с индексом 'vertexIndex'.
                              delete model_point1[vertexIndex];
                              // Пересчет длины массива 'model_point1', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              model_point1.slice(0, model_point1.length-1);
                              // Удаление из массива с гео координатами при редактировании маршрута 'model_point_coord', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete model_point_coord[vertexIndex];
                              // Пересчет длины массива 'model_point_coord', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              model_point_coord.slice(0, model_point_coord.length-1);

                              // Удаление из массива с точками для построения ломаной 'distance_aero', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete distance_aero[vertexIndex];
                              // Пересчет длины массива 'distance_aero', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              distance_aero.slice(0, distance_aero.length-1);
                              // Удаление из массива с гео координатами для построения ломаной 'point_aero', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete point_aero[vertexIndex];
                              // Пересчет длины массива 'point_aero', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              point_aero.slice(0, point_aero.length-1);

                              // Удаление из массивов 'geo_points' и 'point_geo', содержащих информацию о точках маршрута, метки маршрута по ее индексу. Удаленной с карты по кнопке "Удалить", в контекстном меню выршины.
                              // Удаление из массива 'geo_points', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete geo_points[vertexIndex];
                              // Пересчет длины массива 'geo_points', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              geo_points.slice(0, geo_points.length-1);
                              // Удаление из массива 'point_geo', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete point_geo[vertexIndex];
                              // Пересчет длины массива 'point_geo', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              point_geo.slice(0, point_geo.length-1);

                              // Вывод обновленных значений массива 'point_geo', в блоке справа от карты.
                              $(".route-length2").empty();
                              $(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');

                              // вычисляем общую длину ломаной, через кол-во ее точек
                              for (var f = 0, n = myGeoObject.geometry.getLength() - 1; f < n; f++) {
                                distance_aero_length_1 += Math.round(coordSystem_1.getDistance(model_point_coord[f], model_point_coord[f + 1]))/1000;
                              }
                              // округленное, общее расстояние ломаной авиамаршрута
                              var distance_aero_main_1 = Math.ceil(distance_aero_length_1);

                              // Получение координат точек, для формулы вычисления углеродного следа
                              // получаем координаты первой точки авиамаршрута.
                              var point_first = model_point_coord[0];
                              // получаем значения широты и долготоы первой точки.
                              var point_first_lat = model_point_coord[0][0];
                              var point_first_lon = model_point_coord[0][1];

                              // получаем координаты второй точки авиамаршрута.
                              var point_two = model_point_coord[1];
                              // получаем значения широты и долготоы второй точки.
                              var point_two_lat = model_point_coord[1][0];
                              var point_two_lon = model_point_coord[1][1];

                              // перевести координаты в радианы
                              var lat1 = point_first_lat * Math.PI / 180;
                              var lat2 = point_two_lat * Math.PI / 180;
                              var long1 = point_first_lon * Math.PI / 180;
                              var long2 = point_two_lon * Math.PI / 180;

                              // косинусы и синусы широт и разницы долгот
                              var cl1 = Math.cos(lat1);
                              var cl2 = Math.cos(lat2);
                              var sl1 = Math.sin(lat1);
                              var sl2 = Math.sin(lat2);
                              var delta = long2 - long1;
                              var cdelta = Math.cos(delta);
                              var sdelta = Math.sin(delta);

                              //формула вычисления длины большого круга
                              var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
                              var x = sl1 * sl2 + cl1 * cl2 * cdelta;

                              // получение длин отрезков ломаной
                              var points_aero_num = myGeoObject.geometry.getLength();

                              var ad = Math.atan2(y, x) * points_aero_num;

                              // формула получения расстояния перелета, через вычисление длины большого круга, между двумя выбранными точками на карте. Для авиамаршрута.
                              // расстояние перелета в км,
                              var dist = (ad * 6372795)/1000;
                              var dist_1 = dist.toFixed(0);
                              // расстояние перелета в м, необходимо для вычисления длины углеродного следа.
                              var dist_co = (ad * 6372795);
                              var distance_main_co = (ad * 6372795);

                              //формула вычисления углеродного следа, при полете на самолете. Данные:
                              var massa = 22.5; //Удельный вес на пасажира
                              if (dist < 550) {
                                massa = 46.0;
                              } else if (dist < 1500) {
                                massa = 38.2;
                              } else if (dist < 5500) {
                                massa = 23,7;
                              }

                              var num_people = aero_num_people;

                              // Основная формула вычисления углеродного следа:
                              var co = (((distance_main_co/1000) * massa * 3.157) / 1000000)*num*rad*num_people;
                              // округляем значение до одной цифры, после запятой.
                              var co_1 = co.toFixed(1);

                              //формула перевода часов и десятичных долей часа, в часы, минуты и секунды
                              var nTime = (distance_aero_main_1/840)+0.5;
                              nTime=Number(nTime);
	                          nTime+=1/7200000;  //коррекция на половинку тысячной секунды

	                          var h= Math.floor(nTime);
	                          var mT=(nTime-h)*60;
	                          var m=Math.floor(mT);
	                          var s=((mT-m)*60);

                              // Вывод выделенного, большого результата по углеродному следу, над картой.
                              $(".result-co2").append('<p>Углеродный след: <strong>' + co_1 + ' <small><small>кгСО<sub>2</sub></small></small></strong></p>');

                              // Вывод данных по авиамаршруту в блоке справа от карты. Пока скрыты.
                              $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main_1 + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main_1 +' км.</small>');
                              $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                              $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main_1 + ' км.</small>');

                              console.log('init add', point_aero);
                              console.log('init add', distance_aero);
                            };
                            }
                            //Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную всего маршрута.
                            editorItems.push({
                              id: "routedelete",
                              title: "Удалить маршрут",
                              onClick: function () {
                              // Скрываем, открытые балуны на карте.
                              myMap.balloon.close();
                              // Очищаем блоки данных, с информацией по авиамаршруту. При нажатии на кнопку "Удалить маршрут". В контекстном меню метки.
                              $(".route-length1").empty();
                              $(".route-length2").empty();
                              $(".route-length_fuel").empty();
                              $(".route-length_travel").empty();
                              $(".route-length_route").empty();

                              // Очищаем блок с данными по углеродному следу. Вверху над картой.
                              $(".result-co2").empty();

                              myMap.geoObjects.remove(myGeoObject);
                              // Удаление всех точек авиамаршрута, добавленных в массив distance_aero.
                              for(var j = 0, h = distance_aero.length; j < h; j++) {
		                      myMap.geoObjects.remove(distance_aero[j]);
		                      }
                              // очищаем массивы геокодированных точек маршрута и массивы самих точек маршрута.
                              geo_points = [];
                              point_geo = [];
                              distance_aero = [];
                              point_aero = [];
                              // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                              // Данные о местоположении, определённом по IP.
                              var geolocation = ymaps.geolocation;
                              // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                              var coords_location = [geolocation.latitude, geolocation.longitude];
                              myMap.setCenter(coords_location, 8);
                            }
                            });
                          return editorItems;
                          },

                         });

                         // Отслеживаем события добавления новой вершины ломаной и событие завершения перетасивания вершины. Через редактор контекстного меню.
                         myGeoObject.editor.events.add(["vertexadd", "vertexdragend"], function () {
                           $(".route-length1").empty();
                           // Очищаем блок с данными по углеродному следу. Вверху над картой.
                           $(".result-co2").empty();

                           // узнаем тип системы координат
                           var coordSystem_2 = myMap.options.get('projection').getCoordSystem(),
                           distance_aero_length_2 = 0;
                           // получаем массив пиксельных координат, моделей вершин ломаной
                           model_point1 = myGeoObject.editor.getModel().getPixels();
                           // Фильтрация данных массива 'model_point1' с точками о местах маршрута. Убираем из него undefined и null.
                           model_point1 = model_point1.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });
                           // переводим глобальные пикс. координаты, в гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                           for(var i = 0, l = model_point1.length; i < l; i++) {
                             model_point_coord[i] = myMap.options.get('projection').fromGlobalPixels(model_point1[i], myMap.getZoom());
			               }
                           // Фильтрация данных массива 'model_point_coord' с точками о местах маршрута. Убираем из него undefined и null.
                           model_point_coord = model_point_coord.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });

                           //СОЗДАЕМ МЕХАНИЗМ ОПРЕДЕЛЕНИЯ БЛИЖ. АЭРОПОРТА К ДОБАВЛЕННОЙ ВЕРШИНЕ ЛОМАНОЙ. И ГЕОКОДИРОВАНИЯ ПОЛУЧЕННЫХ ТОЧЕК ВЕРШИН. В РЕЖИМЕ РЕДАКТИРОВАНИЯ ЛОМАНОЙ ПО СОБЫТИЮ 'VERTEXADD'.
                           // Узнаем крайнюю добавленную вершину ломаной
                           var lastItem = model_point_coord[model_point_coord.length-1];
                           // Находим ближайший объект(аэропорт) из геоколлекции myCollection. К добавленной вершине.
                           var closestObject = arPlacemarksRez.getClosestTo(lastItem);
                           //Открываем балун с названием ближайшего к выбранной вершине, аэропорта.
                           var closestObject_1 = arPlacemarksRez.getClosestTo(lastItem).balloon.open();

                           // получаем координаты ближ. аэропорта. Записываем их в массив coord_aero.
                           var coord_aero = 0;
                           coord_aero = closestObject.geometry.getCoordinates();
                           // получаем отд. строковые значения широты и долготы точки аэропорта и приводим их к числовому значению.
                           var coord_aero_lat = coord_aero[0] - 0;
                           // альтернативный вариант преобразования строки в число. Таким же образом можно преобразовать и значение долготы точки coord_aero_lon.
                           //var coord_aero_lat = Number(coord_aero[0]);
                           var coord_aero_lon = coord_aero[1] - 0;
                           // помещаем оба значения в массив coord_aero_main, для использования его в геокодировании найденной точки аэропорта.
                           var coord_aero_main = [coord_aero_lat, coord_aero_lon];

                           // производим геокодирование установленной на карте, новой вершины ломаной
                           ymaps.geocode(coord_aero_main).then(function (res) {
                           firstGeoObject_1 = res.geoObjects.get(0);
                           var firstGeoObject_text_1 = firstGeoObject_1.properties.get('text');
                           // собираем информацию о всех вершинах авиамаршрута, добавленных при редактировании вершин.
                           // добавляем текстовую информацию(firstGeoObject_1.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
                           geo_points.push(firstGeoObject_text_1);
                           // фильтрация массива 'geo_points' с текстовой информацией о местах маршрута. Убираем из него undefined и null.
                           geo_points = geo_points.filter(function(x) { return x !== "<br />&bull; undefined" && x !== undefined && x !== null; });
                           // перебираем информацию по каждой отдельной точке и присваиваем ее, индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                           for(var i = 0, l = geo_points.length; i < l; i++) {
				             point_geo[i] = '<br />&bull; ' + geo_points[i];
			                }

                            // Фильтрация данных массива 'point_geo' с точками о местах маршрута. Убираем из него 'undefined' и 'null'.
                            point_geo = point_geo.filter(function(x) { return x !== "<br />&bull; undefined" && x !== null; });
                            // Вывод обновленных значений массива 'point_geo', в блоке справа от карты.
                            $(".route-length2").empty();
                            $(".route-length2").append('<h3>Все точки авиамаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');
                            });

                           // устанавливаем приближение карты, равное 5.
                           myMap.setZoom(5);
                           // добавляем новую метку на карту, с координатами ближайшего аэропорта.
                           myMap.geoObjects.add(createPlacemark(coord_aero_main, options));
                           // делаем ее невидимой. Чтобы метка была заменена на значок вершины ломаной авиамаршрута.
                           placemark.options.set('visible', false);
                           // добавляем выбранные точки в массив distance_aero
                           distance_aero.push(placemark);
                           // Фильтрация данных массива 'distance_aero' с точками маршрута. Убираем из него undefined и null.
                           distance_aero = distance_aero.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });
                           for(var q = 0, a = distance_aero.length; q < a; q++) {
                              // получаем их координаты, для дальнейшего использования в построении ломаной авиамаршрута
			            	  point_aero[q] = distance_aero[q].geometry.getCoordinates();
			               }
                           // Фильтрация данных массива 'point_aero' с гео координатами точек маршрута. Убираем из него undefined и null.
                           point_aero = point_aero.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });
                           //ЗАВЕРШЕНИЕ МЕХАНИЗМА ОПРЕДЕЛЕНИЯ БЛИЖ. АЭРОПОРТА К ДОБАВЛЕННОЙ ВЕРШИНЕ ЛОМАНОЙ. И ГЕОКОДИРОВАНИЯ ПОЛУЧЕННЫХ ТОЧЕК ВЕРШИН. В РЕЖИМЕ РЕДАКТИРОВАНИЯ ЛОМАНОЙ ПО СОБЫТИЯМ 'VERTEXADD' И 'VERTEXDRAGEND'.


                           // Вычисляем общую длину ломаной, через кол-во ее точек
                           for (var w = 0, d = myGeoObject.geometry.getLength() - 1; w < d; w++) {
                             distance_aero_length_2 += Math.round(coordSystem_2.getDistance(model_point_coord[w], model_point_coord[w + 1]))/1000;
                           }
                           // округленное, общее расстояние ломаной авиамаршрута
                           var distance_aero_main_2 = Math.ceil(distance_aero_length_2);

                           // Получение координат точек, для формулы вычисления углеродного следа
                           // получаем координаты первой точки авиамаршрута.
                           var point_first = model_point_coord[0];
                           // получаем значения широты и долготоы первой точки.
                           var point_first_lat = model_point_coord[0][0];
                           var point_first_lon = model_point_coord[0][1];

                           // получаем координаты второй точки авиамаршрута.
                           var point_two = model_point_coord[1];
                           // получаем значения широты и долготоы второй точки.
                           var point_two_lat = model_point_coord[1][0];
                           var point_two_lon = model_point_coord[1][1];

                           // перевести координаты в радианы
                           var lat1 = point_first_lat * Math.PI / 180;
                           var lat2 = point_two_lat * Math.PI / 180;
                           var long1 = point_first_lon * Math.PI / 180;
                           var long2 = point_two_lon * Math.PI / 180;

                           // косинусы и синусы широт и разницы долгот
                           var cl1 = Math.cos(lat1);
                           var cl2 = Math.cos(lat2);
                           var sl1 = Math.sin(lat1);
                           var sl2 = Math.sin(lat2);
                           var delta = long2 - long1;
                           var cdelta = Math.cos(delta);
                           var sdelta = Math.sin(delta);

                           //формула вычисления длины большого круга
                           var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
                           var x = sl1 * sl2 + cl1 * cl2 * cdelta;

                           // получение длин отрезков ломаной
                           var points_aero_num = myGeoObject.geometry.getLength();

                           var ad = Math.atan2(y, x) * points_aero_num;

                           // формула получения расстояния перелета, через вычисление длины большого круга, между двумя выбранными точками на карте. Для авиамаршрута.
                           // расстояние перелета в км,
                           var dist = (ad * 6372795)/1000;
                           var dist_1 = dist.toFixed(0);
                           // расстояние перелета в м, необходимо для вычисления длины углеродного следа.
                           var dist_co = (ad * 6372795);
                           var distance_main_co = (ad * 6372795);

                           //формула вычисления углеродного следа, при полете на самолете. Данные:
                           var massa = 22.5; //Удельный вес на пасажира
                           if (dist < 550) {
                             massa = 46.0;
                           } else if (dist < 1500) {
                             massa = 38.2;
                           } else if (dist < 5500) {
                             massa = 23,7;
                           }

                           var num_people = aero_num_people;

                          // Основная формула вычисления углеродного следа:
                          var co = (((distance_main_co/1000) * massa * 3.157) / 1000000)*num*rad*num_people;
                          // округляем значение до одной цифры, после запятой.
                          var co_1 = co.toFixed(1);

                          //формула перевода часов и десятичных долей часа, в часы, минуты и секунды
                          var nTime = (distance_aero_main_2/840)+0.5;
                          nTime=Number(nTime);
	                      nTime+=1/7200000;  //коррекция на половинку тысячной секунды

	                      var h= Math.floor(nTime);
	                      var mT=(nTime-h)*60;
	                      var m=Math.floor(mT);
	                      var s=((mT-m)*60);

                          // Вывод выделенного, большого результата по углеродному следу, над картой.
                          $(".result-co2").append('<p>Углеродный след: <strong>' + co_1 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                          // Вывод данных по авиамаршруту в блоке справа от карты. Пока скрыты.
                          $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main_2 + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main_2 +' км.</small>');
                          $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                          $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main_2 + ' км.</small>');
                          //console.log('init add', point_aero);
                         });

                         if(point_aero.length > 1){
                          // Устанавливаем центр и масштаб карты так, чтобы отобразить всю прямую авиамаршрута целиком. Устанавливаем на карте границы линии авиамаршрута.
                          myMap.setBounds(myGeoObject.geometry.getBounds());
                         }

                         // создаем механизм получения длины всей ломаной маршрута
                         // узнаем тип системы координат
                         var coordSystem = myMap.options.get('projection').getCoordSystem(),
                         distance_aero_length = 0;

                         // получаем массив пиксельных координат, моделей вершин ломаной
                         model_point1 = myGeoObject.editor.getModel().getPixels();

                         for(var j = 0, k = model_point1.length; j < k; j++) {
                             model_point_coord[j] = myMap.options.get('projection').fromGlobalPixels(model_point1[j], myMap.getZoom());
                             point_aero[j] = myMap.options.get('projection').fromGlobalPixels(model_point1[j], myMap.getZoom());
			             }
                         // вычисляем общую длину ломаной, через кол-во ее точек
                         for (var w = 0, d = myGeoObject.geometry.getLength() - 1; w < d; w++) {
                             distance_aero_length += Math.round(coordSystem.getDistance(model_point_coord[w], model_point_coord[w + 1]))/1000;
                         }

                         // округленное, общее расстояние ломаной авиамаршрута
                         distance_aero_main = Math.ceil(distance_aero_length);

                        // Получение координат точек, для формулы вычисления углеродного следа
                        // получаем координаты первой точки авиамаршрута.
                        var point_first = point_aero[0];
                        // получаем значения широты и долготоы первой точки.
                        var point_first_lat = point_aero[0][0];
                        var point_first_lon = point_aero[0][1];

                        // получаем координаты второй точки авиамаршрута.
                        var point_two = point_aero[1];
                        // получаем значения широты и долготоы второй точки.
                        var point_two_lat = point_aero[1][0];
                        var point_two_lon = point_aero[1][1];

                        // перевести координаты в радианы
                        var lat1 = point_first_lat * Math.PI / 180;
                        var lat2 = point_two_lat * Math.PI / 180;
                        var long1 = point_first_lon * Math.PI / 180;
                        var long2 = point_two_lon * Math.PI / 180;

                        // косинусы и синусы широт и разницы долгот
                        var cl1 = Math.cos(lat1);
                        var cl2 = Math.cos(lat2);
                        var sl1 = Math.sin(lat1);
                        var sl2 = Math.sin(lat2);
                        var delta = long2 - long1;
                        var cdelta = Math.cos(delta);
                        var sdelta = Math.sin(delta);

                        //формула вычисления длины большого круга
                        var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
                        var x = sl1 * sl2 + cl1 * cl2 * cdelta;

                        // получение длин отрезков ломаной
                        var points_aero_num = myGeoObject.geometry.getLength();

                        var ad = Math.atan2(y, x) * points_aero_num;

                        // формула получения расстояния перелета, через вычисление длины большого круга, между двумя выбранными точками на карте. Для авиамаршрута.
                        // расстояние перелета в км,
                        var dist = (ad * 6372795)/1000;
                        var dist_1 = dist.toFixed(0);
                        // расстояние перелета в м, необходимо для вычисления длины углеродного следа.
                        var dist_co = (ad * 6372795);
                        var distance_main_co = (ad * 6372795);

                        //формула вычисления углеродного следа, при полете на самолете. Данные:
                        var massa = 22.5; //Удельный вес на пасажира
                        if (dist < 550) {
                          massa = 46.0;
                        } else if (dist < 1500) {
                          massa = 38.2;
                        } else if (dist < 5500) {
                          massa = 23,7;
                        }

                        var num_people = aero_num_people;

                        // Основная формула вычисления углеродного следа:
                        var co = (((distance_main_co/1000) * massa * 3.157) / 1000000)*num*rad*num_people;
                        // округляем значение до одной цифры, после запятой.
                        var co_1 = co.toFixed(1);

                        //формула перевода часов и десятичных долей часа, в часы, минуты и секунды
                        var nTime = (distance_aero_main/840)+0.5;
                        nTime=Number(nTime);
	                    nTime+=1/7200000;  //коррекция на половинку тысячной секунды

	                    var h= Math.floor(nTime);
	                    var mT=(nTime-h)*60;
	                    var m=Math.floor(mT);
	                    var s=((mT-m)*60);

                        //Если выбрано более одной точки, и начался строится маршрут, выводим информацию по нему.
                        if((point_aero.length > 1)){
                          // Проверяем события: изменения состояния редактора ломаной и изменения в опциях геообъекта. На основе его изменяем информацию в блоке справа от карты.
                          // Очищаем данные после каждого совершения событий.
                          $(".route-length1").empty();
                          // Очищаем блок с данными по углеродному следу. Вверху над картой.
                          $(".result-co2").empty();

                          // Вывод выделенного, большого результата по углеродному следу, над картой.
                          $(".result-co2").append('<p>Углеродный след: <strong>' + co_1 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                          // Вывод данных по авиамаршруту в блоке справа от карты. Пока скрыты.
                          $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main +' км.</small>');
                          $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                          $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main + ' км.</small>');
                        }
                       }
                       // завершение работы по списку аэропортов
                       // ЗАВЕРШЕНИЕ ПОСТРОЕНИЯ АВИАМАРШРТУА

                         // Выключаем скролл карты при перетаскивании.
                         ymaps.behavior.storage.remove('dragScroll', DragScrollBehavior);
                         myMap.behaviors.disable('dragScroll');

                         // НАЧИНАЕМ СТРОИТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА
                         for(var ii = 0, ll = markers.length; ii < ll; ii++) {
			             point[ii] = markers[ii].geometry.getCoordinates();
			             }

                         // Перед построением нового маршрута проверяем, были ли уже проложены старые и удаляем их, если да.
                         if(route) myMap.geoObjects.remove(route);

                         if(car){
                          myMap.geoObjects.remove(car);
                           for(var a = 0, b = markers_route.length; a < b; a++) {
		                    myMap.geoObjects.remove(markers_route[a]);
		                   }
                          markers_route = [];
                         }

                           // Перед построением маршрута, если в тулбаре выбран значок не 'самолетика', а 'машинки', проверяем выбраны ли все значения из выпадающего списка.
                           // Если не выбран тип топлива, добавляем в блок справа от карты предупреждающий текст.
                           if((typeof type_fuel == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
                           // Или, если не выбран тип поездки, добавляем в блок справа от карты предупреждающий текст.
                           else if((typeof type_travel == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
                           // Или, если не выбран тип маршрута, добавляем в блок справа от карты предупреждающий текст.
                           else if((typeof type_route == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
                           // Если все селекторы выбраны, то начинаем строить автомаршрут, по двум первым, отмеченным точкам.
                         // Если все значения выбраны, начинаем исходя из них, строить автомаршрут.
                         else
                         {
                         // Добавляем новый объект на карту("машинку"), класса car.
                         $.getScript('../f/min/map/car1.js', function () {
                           car = new Car();
                           /*
                           car = new Car({
                             iconLayout: ymaps.templateLayoutFactory.createClass(
                             '<div class="b-car b-car_blue b-car-direction-$[properties.direction]"></div>'
                             )
                           });
                           */
                         ymaps.route(point, {
                            // Опции маршрутизатора
                            avoidTrafficJams: true, // строить маршрут с учетом пробок
                            mapStateAutoApply: true // автоматически позиционировать карту
                         }).then(function (router) {

                         // Если выбран значок не 'самолетика', а машинки, очищаем блок для вывода данных.
                         if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                          $(".route-length1").empty();
                          // Очищаем блок с данными по углеродному следу. Вверху над картой.
                          $(".result-co2").empty();
                         }

                         // Создаем замыкание геобъекта маршрут.
                         route = router;
                         route.options.set({ strokeStyle: 'solid'});

                         // НАЧИНАЕМ ПРОКЛАДЫВАТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА
                         //если выбрана картинка: машинки
                         //прокладываем обычный маршрут по дорогам
                         if (placemark.options.get('iconImageHref') == '/f/min/images/car.png'){
                         // добавляем маршрут на карту
                         myMap.geoObjects.add(route);

                         console.log('Число сегментов маршрута: ', route.getPaths().get(0).getSegments());

                         // И "машинку" туда же
                         myMap.geoObjects.add(car);

                         // Добавляем также объект 'car' в массив 'markers_route'. Если машинок добавлено сразу несколько на карту.
                         markers_route.push(car);

                         // Включаем редактор маршрута. Разрешающий добавлять, удалять, перетаскивать его точки.
                         route.editor.start({
                         addWayPoints: true,
                         removeWayPoints: true,
                         editWayPoints: true
                         });

                         // Скрываем первоначальные метки перетянутые на карту. Чтобы передать их добавление маршрутизатору.
                         placemark.options.set('visible', false);

                         // С помощью метода getWayPoints() получаем массив точек маршрута
                         var points = route.getWayPoints();
                         points.options.set({
                         //'preset', 'twirl#carIcon'
                         // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                         'iconLayout': 'default#image',
                         'iconImageHref': '/f/min/images/car.png',
                         iconImageSize: [width, height],
                         iconImageOffset: [-(width / 2), -height]
                         });

                         // Делаем полученные точки маршрута видимыми.
                         points.options.set('visible', true);

                         // Находим первую точку маршрута
                         var lastPoint_first =  route.getWayPoints().get(1);
                         // Определяем ее координаты.
                         var lastPoint_coord_first = lastPoint_first.geometry.getCoordinates();
                         console.log('Координаты новой точки: ', lastPoint_coord_first);

                         // Производим геокодирование первой путевой точки
                         ymaps.geocode(lastPoint_coord_first).then(function (res) {
                           var firstGeoObject_route = res.geoObjects.get(0);
                           firstGeoObject_text_route_first = firstGeoObject_route.properties.get('text');
                         });
                         //console.log('Местонахождение новой точки: ', firstGeoObject_text_route_first);

                         // Находим крайнюю, добавленную точку к маршруту.
                         var lastPoint = points.get(points.getLength() - 1);
                         // Определяем ее координаты.
                         var lastPoint_coord = lastPoint.geometry.getCoordinates();

                         // Производим геокодирование последующих после первой, путевых точек
                         ymaps.geocode(lastPoint_coord).then(function (res) {
                           var firstGeoObject_route = res.geoObjects.get(0);
                           firstGeoObject_text_route = firstGeoObject_route.properties.get('text');
                         });

                         //Если геокодировали путевые точки маршрута, выводим их в балуне меток. Если нет, выводим геокодированую пред. точку.
                         var text_route;
                         if((typeof firstGeoObject_text_route != "undefined")) {
                           text_route = firstGeoObject_text_route;
                         }
                         else {
                           text_route = text;
                         }

                         // При клике на любую из путевых точек маршрута, добавляем балун с кнопками удаления - "Удалить маршрут", "Удалить метку".
                         points.events.add('click', function (e) {
                           // если 'e' не событие, то берем window.event
                           e = e || event;

                           // получаем координаты точки маршрута, по которой кликнули
                           var coords_route_point = e.get('coordPosition');

                           console.log('Координаты точки по которой щелкнули: ', coords_route_point);

                           // определяем ее индекс
                           var index_point = points.indexOf(target);

                           // получаем метку по которой кликнули
                           var target = e.get('target');

                           // Производим геокодирование точки маршрута, по которой кликнули.
                           ymaps.geocode(coords_route_point).then(function (res) {
                             var route_point = res.geoObjects.get(0);
                             route_point_1 = route_point.properties.get('text');
                             myMap.balloon.open(coords_route_point, {contentBody: route_point_1 + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button></div>'});

                          // Механизм удаления всего маршрута, по кнопке "Удалить маршрут".
                          $('#menu_delete button[id=delete_route]').click(function () {
                          // Создаем механизм удаления всего маршрута, по кнопке "Удалить маршрут". Через открытый балун, крайней метки маршрута.
                          //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                          // Удаляем маршрут и метки.
                          route && myMap.geoObjects.remove(route);
                          for(var i = 0, l = markers.length; i < l; i++) {
		                   myMap.geoObjects.remove(markers[i]);
                           route.getWayPoints().get(i);
		                  }

                          // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                          myMap.geoObjects.remove(car);
                          for(var j = 0, k = markers_route.length; j < k; j++) {
		                   myMap.geoObjects.remove(markers_route[j]);
		                  }
                          markers_route = [];

                          // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                          markers = [];
        	              point = [];
                          // Счетчик id меток, выставляем равным 1.
                          ch = 1;

                          // очищаем данные о типе топлива, типе поездки и типе маршрута.
                          $(".route-length_fuel").empty();
                          $(".route-length_travel").empty();
                          $(".route-length_route").empty();

                          // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                          // Данные о местоположении, определённом по IP.
                          var geolocation = ymaps.geolocation;
                          // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                          var coords_location = [geolocation.latitude, geolocation.longitude];
                          myMap.setCenter(coords_location, 8);

                          // Очищаем все данные маршрута, в блоке справа от карты
                          $(".route-length1").empty();
                          // Очищаем блок с данными по углеродному следу. Вверху над картой.
                          $(".result-co2").empty();
                          // Убираем открытый балун с карты
                          myMap.balloon.close();
                          // Завершаем удаление всего маршрута, по кнопке "Удалить маршрут".
                          });
                           });

                           // Выводим ее свойства в консоли
                           //console.log(target.properties.getAll());

                          // Открываем балун с кнопками удаления над объектом, по которому кликнули
                          //myMap.balloon.open(coords_route_point, {contentBody: text_route + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button> &nbsp; <button type="submit" class="btn btn-warning" id="delete_point">Удалить метку</button></div>'});
                          /*
                          // Механизм удаления выбранной точки маршрута, по кнопке "Удалить метку".
                          $('#menu_delete button[id=delete_point]').bind('click', function () {

                          // Удаляем картинку атобуса, с карты.
                          myMap.geoObjects.remove(car);
                          for(var j = 0, k = markers_route.length; j < k; j++) {
		                    myMap.geoObjects.remove(markers_route[j]);
		                  }

                          // Удаление точки маршрута по которой кликнули, с карты и из коллекции GeoObjectArray, с точками маршрута.
                          points.remove(target);

                          // Закрываем открытый балун метки, с кнопками "Удалить метку", "Удалить маршрут".
                          myMap.balloon.close();

                          // Проверяем кол-во точек маршрута, после удаления выбранной точки
                          //console.log(wayPoints.getLength());

                          // Перебираем все оставшиеся точки, присваиваем их координаты массиву point
                          points.each(function (el, i) {
                            point[i] = el.geometry.getCoordinates();
                          });

                          // Бросаем на маршрут через его редактор, событие обновления routeupdate.
                          route.editor.events.fire('routeupdate', e.originalEvent);

                          // При удалении выбранной метки из группы GeoObjectArray, с точками маршрута. Удаляем предыдущий маршрут и добавляем новый. Включаем редактор маршрута, добавляем к нему опции.
                          points.events.add(["remove"], function () {
                          if(route) myMap.geoObjects.remove(route);
                          myMap.geoObjects.add(route);

                          // Включаем редактор маршрута.
                          route.editor.start({
                           addWayPoints: true,
                           removeWayPoints: true,
                           editWayPoints: true
                          });
                          });

                          // Удаляем все добавленные метки на карту. Чтобы не оставалась первая метка, после удаления всего маршрута по кнопке "Удалить маршрут".
                          for(var i = 0, l = markers.length; i < l; i++) {
		                    myMap.geoObjects.remove(markers[i]);
                            route.getWayPoints().get(i);
		                  }

                          // После каждого пересчета точек после удаления метки, обнуляем массивы с пред. кол-вом точек.
                          markers = [];
                          point = [];
                          });
                          */
                        });

                        // ПОЛУЧАЕМ ПЕРВОНАЧАЛЬНЫЕ ДАННЫЕ ПО НОВОМУ МАРШРУТУ. ОБРАБАТЫВАЕМ И ВЫВОДИМ ИХ.
                        // длина маршрута в м
                        var way_m_first = route.getLength();
                        // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой маршрут или маршрут туда и обратно.
                        var way_m_first_1;
                        if(type_route == "Сonversely"){
                        way_m_first_1 = way_m_first.toFixed(0) * 2;
                        }
                        else
                        {
                           way_m_first_1 = way_m_first.toFixed(0);
                        }

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

                        var a1 = 10,
                        b1 = way_m_first_1;

                        var m = (b1/100*a1)*p; //масса топлива

                        //углеродный след
                        var co_auto = m*k;
                        // округляем значение до одного знака после запятой
                        var co_auto_1 = co_auto.toFixed(1);

                        co2.push(co_auto_1);
                        console.log('Массив co2: ', co2);
                        /*
                        // Закрываем балун первой метки
                        // myMap.balloon.close();

                        // получаем координаты добавленной метки
                        var myPlacemark_coord = placemark.geometry.getCoordinates();

                        // Добавляем балун на карту, по координатам метки. С данными о точке и ссылкой "Удалить маршрут".
                        myMap.balloon.open(myPlacemark_coord, {
                        content: link_route
                        }, {
                        closeButton: true
                        });
                        */

                        // Вывод выделенного, большого результата по углеродному следу, над картой.
                        $(".result-co2").append('<p>Углеродный след на дистанцию <strong>' + route.getHumanLength() + '</strong>, составит: <strong>' + co_auto_1 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                        // Вывод данных по маршруту в блоке справа от карты. Пока скрыты.
                        $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			            $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
                        $(".route-length1").append('<h3>Углеродный след на дистанцию <strong>' + route.getHumanLength() + ', составит: ' + co_auto_1 + ' <small>кгСО<sub>2</sub></small></strong></h3>');
                        // Выводим значение пробега, в зависимости от типа поездки: на работу или на дачу.
                        if(type_travel == "Work"){
                          $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_11 + ' км</strong></h3>');
                        }
                        else
                        {
                          $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_home_11 + ' км</strong></h3>');
                        }
                        }

                // ОТСЛЕЖИВАЕМ СОБЫТИЕ ОБНОВЛЕНИЯ МАРШРУТА. ПРИ ДОБАВЛЕНИИ НОВЫХ ПУТЕВЫХ ТОЧЕК. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА.
                route.events.add("update",function () {
                 // очищаем блок с данными построенного маршрута, до события обновления маршрута. Т.к. здесь будут добавляться свои данные, в зависимости от события маршрута.
                 $(".route-length1").empty();
                 // Очищаем блок с данными по углеродному следу. Вверху над картой.
                 $(".result-co2").empty();

                 // Получаем массив путевых точек маршрута, после его обновления.
                 var wayPoints = route.getWayPoints();
                 wayPoints.get(wayPoints.getLength() - 1).options.set({
                 //'preset': 'twirl#carIcon',
                 // Делаем новую путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                 'iconLayout': 'default#image',
                 'iconImageHref': '/f/min/images/car.png',
                 iconImageSize: [width, height],
                 iconImageOffset: [-(width / 2), -height]
                 });

                 // Делаем путевые точки маршрута, в режиме редактирования, видимыми.
                 wayPoints.options.set('visible', true);

                 // Находим первую точку маршрута
                 var lastPoint_first =  route.getWayPoints().get(1);
                 // Определяем ее координаты.
                 var lastPoint_coord_first = lastPoint_first.geometry.getCoordinates();
                 console.log('Координаты новой точки - ', lastPoint_coord_first);

                 // Производим геокодирование первой путевой точки
                 ymaps.geocode(lastPoint_coord_first).then(function (res) {
                    var firstGeoObject_route = res.geoObjects.get(0);
                    firstGeoObject_text_route_first = firstGeoObject_route.properties.get('text');
                 });
                 console.log('Местонахождение новой точки: ', firstGeoObject_text_route_first);

                 // Находим крайнюю, добавленную точку к маршруту.
                 var lastPoint = wayPoints.get(wayPoints.getLength() - 1);
                 // Определяем ее координаты.
                 var lastPoint_coord = lastPoint.geometry.getCoordinates();

                 // Производим геокодирование последующих после первой, путевых точек
                 ymaps.geocode(lastPoint_coord).then(function (res) {
                    var firstGeoObject_route = res.geoObjects.get(0);
                    firstGeoObject_text_route = firstGeoObject_route.properties.get('text');
                 });

                 //Если геокодировали путевые точки маршрута, выводим их в балуне меток. Если нет, выводим геокодированую пред. точку.
                 var text_route;
                 if((typeof firstGeoObject_text_route != "undefined")) {
                    text_route = firstGeoObject_text_route;
                 }
                 else {
                    text_route = text;
                 }


                 /*
                 // Закрываем открытый балун, второй метки маршрута
                 myMap.balloon.close();

                 var link_route = '<a href="#" class="btn btn-warning" id="switch_1">Удалить маршрут</a>';

                 // Добавляем новый балун на карту, по координатам новой точки. С данными о точке и ссылкой "Удалить маршрут".
                 myMap.balloon.open(lastPoint_coord, {
                 content: text_route + '<br />' + link_route
                 }, {
                 closeButton: true
                 });

                 // Создаем механизм удаления всего маршрута, по ссылке "Удалить маршрут".
                 //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                 var p = document.getElementById('switch_1');
                 //Вешаем на него событие onclick. По нему удаляем весь маршрут с карты.
                 p.onclick = function() {
                 // Удаляем маршрут и метки.
                 route && myMap.geoObjects.remove(route);
                 for(var i = 0, l = markers.length; i < l; i++) {
		           myMap.geoObjects.remove(markers[i]);
		         }

                 // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                 myMap.geoObjects.remove(car);
                 for(var j = 0, k = markers_route.length; j < k; j++) {
		           myMap.geoObjects.remove(markers_route[j]);
		         }
                 markers_route = [];

                 // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                 markers = [];
        	     point = [];
                 // Счетчик id меток, выставляем равным 1.
                 ch = 1;

                 // очищаем данные о типе топлива, типе поездки и типе маршрута.
                 $(".route-length_fuel").empty();
                 $(".route-length_travel").empty();
                 $(".route-length_route").empty();

                 // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                 // Данные о местоположении, определённом по IP.
                 var geolocation = ymaps.geolocation;
                 // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                 var coords_location = [geolocation.latitude, geolocation.longitude];
                 myMap.setCenter(coords_location, 8);

                 // Очищаем все данные маршрута, в блоке справа от карты
                 $(".route-length1").empty();
                 // Очищаем блок с данными по углеродному следу. Вверху над картой.
                 $(".result-co2").empty();
                 // Убираем открытый балун с карты
                 myMap.balloon.close();
                 };
                 // Завершаем удаление всего маршрута, по ссылке "Удалить маршрут".
                 */

                 // При клике на любую из путевых точек маршрута, добавляем балун с кнопками удаления - "Удалить маршрут", "Удалить метку".
                 wayPoints.events.add('click', function (e) {
                     // если 'e' не событие, то берем window.event
                     e = e || event;

                     // получаем координаты точки маршрута, по которой кликнули
                     var coords_route_point = e.get('coordPosition');

                     // получаем метку по которой кликнули
                     var target = e.get('target');

                     // Выводим ее свойства в консоли
                     //console.log(target.properties.getAll());

                     // Открываем балун с кнопками удаления над объектом, по которому кликнули
                     //myMap.balloon.open(coords_route_point, {contentBody: text_route + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button> &nbsp; <button type="submit" class="btn btn-warning" id="delete_point">Удалить метку</button></div>'});
                     myMap.balloon.open(coords_route_point, {contentBody: text_route + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button></div>'});

                     /*
                     // Механизм удаления выбранной точки маршрута, по кнопке "Удалить метку".
                     $('#menu_delete button[id=delete_point]').bind('click', function () {

                        // Удаляем картинку атобуса, с карты.
                        myMap.geoObjects.remove(car);
                          for(var j = 0, k = markers_route.length; j < k; j++) {
		                  myMap.geoObjects.remove(markers_route[j]);
		                }

                        // Удаление точки маршрута по которой кликнули, с карты и из коллекции GeoObjectArray, с точками маршрута.
                        wayPoints.remove(target);

                        // Проверяем кол-во точек маршрута, после удаления выбранной точки
                        //console.log(wayPoints.getLength());

                        // Перебираем все оставшиеся точки, присваиваем их координаты массиву wayPoints
                        wayPoints.each(function (el, i) {
                         point[i] = el.geometry.getCoordinates();
                        });

                        // Бросаем на маршрут через его редактор, событие обновления routeupdate.
                        route.editor.events.fire('routeupdate', e.originalEvent);

                        // При удалении выбранной метки из группы GeoObjectArray, с точками маршрута. Удаляем предыдущий маршрут и добавляем новый. Включаем редактор маршрута, добавляем к нему опции.
                        wayPoints.events.add(["remove"], function () {
                        if(route) myMap.geoObjects.remove(route);
                        myMap.geoObjects.add(route);

                        // Включаем редактор маршрута.
                        route.editor.start({
                        addWayPoints: true,
                        removeWayPoints: true,
                        editWayPoints: true
                        });
                        });

                         // Закрываем открытый балун метки, с кнопками "Удалить метку", "Удалить маршрут".
                         myMap.balloon.close();

                         // Удаляем все добавленные метки на карту. Чтобы не оставалась первая метка, после удаления всего маршрута по кнопке "Удалить маршрут".
                         for(var i = 0, l = markers.length; i < l; i++) {
		                   myMap.geoObjects.remove(markers[i]);
                           route.getWayPoints().get(i);
		                 }

                         // После каждого пересчета точек после удаления метки, обнуляем массивы с пред. кол-вом точек.
                         markers = [];
                         point = [];
                     });
                     */

                     // Механизм удаления всего маршрута, по кнопке "Удалить маршрут".
                     $('#menu_delete button[id=delete_route]').click(function () {
                       // Создаем механизм удаления всего маршрута, по кнопке "Удалить маршрут". Через открытый балун, крайней метки маршрута.
                       //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                       // Удаляем маршрут и метки.
                       route && myMap.geoObjects.remove(route);
                       for(var i = 0, l = markers.length; i < l; i++) {
		                 myMap.geoObjects.remove(markers[i]);
                         route.getWayPoints().get(i);
		               }

                       // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                       myMap.geoObjects.remove(car);
                       for(var j = 0, k = markers_route.length; j < k; j++) {
		                 myMap.geoObjects.remove(markers_route[j]);
		               }
                       markers_route = [];

                       // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                       markers = [];
        	           point = [];
                       // Счетчик id меток, выставляем равным 1.
                       ch = 1;

                       // очищаем данные о типе топлива, типе поездки и типе маршрута.
                       $(".route-length_fuel").empty();
                       $(".route-length_travel").empty();
                       $(".route-length_route").empty();

                       // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                       // Данные о местоположении, определённом по IP.
                       var geolocation = ymaps.geolocation;
                       // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                       var coords_location = [geolocation.latitude, geolocation.longitude];
                       myMap.setCenter(coords_location, 8);

                       // Очищаем все данные маршрута, в блоке справа от карты
                       $(".route-length1").empty();
                       // Очищаем блок с данными по углеродному следу. Вверху над картой.
                       $(".result-co2").empty();
                       // Убираем открытый балун с карты
                       myMap.balloon.close();
                       // Завершаем удаление всего маршрута, по кнопке "Удалить маршрут".
                     });

                 });

                 /*
                 // Если выбрана вторая точка маршрута, после события обновления маршрута, добавляем к ней ссылку "Удалить метку".
                 if(markers.length == 2)
                 {
                    placemark.properties.set({'balloonContentBody': text + '<br /><a href="#" class="btn btn-warning" id="switch">Удалить метку</a>'});
                 }
                 */

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

                var a = 10,
                b = way_m_1;

                var m1 = (b/100*a)*p1; //масса топлива

                //углеродный след
                var co_auto1 = m1*k1;
                // округляем значение до одного знака после запятой
                var co_auto_11 = co_auto1.toFixed(1);

                // Вывод выделенного, большого результата по углеродному следу, над картой.
                $(".result-co2").append('<p>Углеродный след: <strong>' + co_auto_11 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                // Вывод данных по маршруту в блоке справа от карты. Пока скрыты.
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

                // ОТСЛЕЖИВАЕМ 4 СОБЫТИЯ СВЯЗАННЫХ С ПУТЕВЫМИ ТОЧКАМИ МАРШРУТА: ДОБАВЛЕНИЕ/УДАЛЕНИЕ/ПЕРЕТАСКИВАНИЕ. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА. ПО КАЖДОМУ ИЗ НИХ ОЧИЩАЕМ БЛОК С ДАННЫМИ.
                  route.editor.events.add('waypointadd', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointremove', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointdragstart', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointdragend', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                });
                // ЗАВЕРШЕНИЕ ОТСЛЕЖИВАНИЯ СОБЫТИЯ ОБНОВЛЕНИЯ МАРШРУТА.

                // Отправляем машинку по полученному маршруту более простым способом, с указанием скорости движения.
                car.moveTo(route.getPaths().get(0).getSegments(), {
                   speed: 70,
                   directions: 8
                });
                /*
                // или чуть усложненным: с указанием скорости и свойств,
                car.moveTo(route.getPaths().get(0).getSegments(), {
                   speed: 50,
                   directions: 8
                }, function (geoObject, coords, direction) { // тик движения
                   // перемещаем машинку
                   geoObject.geometry.setCoordinates(coords);
                   // ставим машинке правильное направление - в данном случае меняем ей текст
                   geoObject.properties.set('direction', direction.t);

                }, function (geoObject) { // приехали
                geoObject.properties.set('balloonContent', "Приехали!");
                geoObject.balloon.open();
                });
                */
                // ЗАКАНЧИВАЕМ ПРОКЛАДЫВАТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА

                }, function (error) {
                              alert("Возникла ошибка: " + error.message);
                         }, this);
                         });
                         }
                         }
                         else
			             {
			               alert("Вы задали максимальное количество точек");
			             }

                         return false;

    });

    // Геокодирование координат метки перенесенной из тулбара.
                function geocodePlacemark(placemark) {
                    ymaps.geocode(placemark.geometry.getCoordinates(), { results: 1 })
                        .then(function (res) {
                            var first = res.geoObjects.get(0);
                                text = first.properties.get('text');

                                // если выбран не авиамаршрут, собираем информацию о всех точках автомаршрута, добавленного по картинкам из тулбара.
                                if (placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                                // добавляем текстовую информацию(text.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
                                geo_points.push(text);
                                // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                                for(var i = 0, l = geo_points.length; i < l; i++) {
			                    point_geo[i] = '<br />&bull; ' + geo_points[i];
                                }
                                }
                               // Добавляем балун к меткам после редактирования автомаршрута, с возможностью удалить их.
                               if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png') {
                                 placemark.properties.set({'balloonContentBody': text + '<br /><a href="#" class="btn btn-warning" id="switch">Удалить метку</a>'});
                               }
                               // Если выбран значок не 'самолетик', а 'машинка', обрабатываем данные из формы балуна первой точки, по автомаршрутизации.
                               if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){

                               if(markers.length == 1)
                               {
                               //Если метка первая, выводим html-форму, с тремя списками select, с данными маршрута(тип: топлива, поездки, маршрута.
                               placemark.properties.set("balloonContentBody",
'<div id="menu"><p style="font-size: 14px; margin-bottom: 5px;"><b style="color: #454545;">Начальная точка маршрута: <i style="color: #999966;">' + text + '</i></b></p><small style="color: #1D3B3B;">Выберите тип поездки по указанному маршруту:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" style="height: 20px" /></span><select name="travel_select" id="travel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Work">В рабочие дни, до работы</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Dacha">В выходные дни, до дачи</option></select></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип маршрута:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Сonversely">Туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Выберите тип топлива вашего автомобиля:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" style="height: 20px" /></span><select name="fuel_select" id="fuel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Gazoline">Бензин</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Diesel">Дизель</option></select><br /></div><div id="menu">');

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

                               // Если выбрано последнее значение в крайнем списке 'select', по типу топлива, в форме с выбором данных маршрута. Скрываем большой балун первой метки, с формой и вводным текстом, с карты.
                               // Получаем значение свойства: название места, для выбранной первой точки и выводим его в балуне, вместе с кнопкой удаления метки.
                               myMap.balloon.close();
                               // Указываем в качестве контекста балуна макет 'myBalloonContentBodyLayout', первой метке маршрута.
                               placemark.options.set({balloonContentBodyLayout: myBalloonContentBodyLayout});
                               placemark.properties.set({'balloonContentBody': '<small><i style="color: #999966; font-size: 14px;">Продолжите маршрут, перетащив<br /> следующую метку машинки на карту.</i></small>'});
                               placemark.balloon.open();

                               /*
                               // Создаем механизм удаления первой метки с карты, по ссылке "Удалить метку".
                               // получаем координаты добавленной метки
                               var myPlacemark_coord = placemark.geometry.getCoordinates();

                               // Получаем значение 'id', удаляемой точки, по ссылке "удалить метку!".
                               var id = placemark.properties.get('id');
                               console.log('id точки :', id);

                               //Получаем идентификатор 'switch', ссылки "Удалить метку".
                               var c = document.getElementById('switch_2');
                               //Вешаем на него событие onclick. По нему удаляем первую точку с карты и из массива 'markers'.
                               c.onclick = function() {
                               //alert('Пример 1 сработал');
                               delete markers[id - id];
                               // Пересчет длины массива 'markers', и смещение его индексов, после удаления метки с карты.
                               markers.slice(0, markers.length-1);
                               // Фильтрация данных массива 'markers'. Убираем из него undefined и null.
                               markers = markers.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });
                               console.log('длина массива markers равна :', markers.length);

                               // После удаления точки, убираем данные в блоке справа от карты. По типам: поездки, маршрута, топлива.
                               $(".route-length_fuel").empty();
                               $(".route-length_travel").empty();
                               $(".route-length_route").empty();
                               // Обнуляем соотвествующие переменные
                               type_fuel = "undefined";
                               type_travel = "undefined";
                               type_route = "undefined";

                               // Если перетянутая метка 'машинки' первая, принудительно скрываем ее балун и саму метку.
                               myMap.balloon.close();
                               placemark.options.set('visible', false);

                              };
                              */

                              });

                              }
                              else
                              {
                              myMap.balloon.close();
                              //var link_route = '<b style="color: #5F5F5F; font-size: 15px;">Углеродный след на дистанцию ' + route.getHumanLength() + ', составит: ' + co2 + ' кгСО2/л</b><br /><small><i style="color: #999966; font-size: 14px;">Чтобы удалить маршрут, щелкните по любой из меток</i></small>';
                              var link_route = '<small><i style="color: #999966; font-size: 14px;">Чтобы удалить маршрут, щелкните по любой из меток</i></small>';

                              placemark.properties.set({"balloonContentBody": link_route});
                              placemark.options.set('visible', false);
                              placemark.balloon.open();
                              // Если балун точки, после закрытия, был снова открыт. Добавляем в него информацию с данными о точке и ссылкой "Удалить маршрут". Открываем балун.
                              /*
                              if (placemark.balloon.isOpen()) {
                                myMap.balloon.open(myPlacemark_coord, {
                                  content: firstGeoObject_text + '<br />' + link_route
                                  }, {
                                  closeButton: true
                                });
                                console.log('Балун точки :', placemark.balloon.open());
                               }
                              */

                              /*
                              // Создаем механизм удаления всего маршрута, по ссылке "Удалить маршрут".
                              //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                              var b = document.getElementById('switch_1');
                              //Вешаем на него событие onclick. По нему удаляем весь маршрут с карты.
                              b.onclick = function() {
                              // Удаляем маршрут и метки.
                              route && myMap.geoObjects.remove(route);
                              for(var i = 0, l = markers.length; i < l; i++) {
		                       myMap.geoObjects.remove(markers[i]);
		                      }

                              // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                              myMap.geoObjects.remove(car);
                              for(var j = 0, k = markers_route.length; j < k; j++) {
		                        myMap.geoObjects.remove(markers_route[j]);
		                      }
                              markers_route = [];

                              // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                              markers = [];
        	                  point = [];
                              // Счетчик id меток, выставляем равным 1.
                              ch = 1;

                              // очищаем данные о типе топлива, типе поездки и типе маршрута.
                              $(".route-length_fuel").empty();
                              $(".route-length_travel").empty();
                              $(".route-length_route").empty();

                              // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                              // Данные о местоположении, определённом по IP.
                              var geolocation = ymaps.geolocation;
                              // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                              var coords_location = [geolocation.latitude, geolocation.longitude];
                              myMap.setCenter(coords_location, 8);

                              // Очищаем все данные маршрута, в блоке справа от карты
                              $(".route-length1").empty();
                              // Очищаем блок с данными по углеродному следу. Вверху над картой.
                              $(".result-co2").empty();
                              // Убираем открытый балун с карты
                              myMap.balloon.close();
                              };
                              */

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
    //this.yMap.controls.add("zoomControl").add("typeSelector").add(SearchControl, { left: '0px', top: '5px' });
    this.yMap.controls.add("zoomControl").add("typeSelector");
    //Отключаем функции: изменения масштаба карты колесиком мышки. И масштабирования карты при выделении области правой кнопкой мыши.
    this.yMap.behaviors.disable(['scrollZoom', 'rightMouseButtonMagnifier']);


    /*
    //Создание в цикле новых меток.
    for (i = 0; i < this.coords.length; i++) {
      this.createPlacemark(this.coords[i]);
    }
    */

    //Устанавливаем границы карты, охватывающие все геообъекты на ней.
    //this.yMap.setBounds(this.yMap.geoObjects.getBounds());

    //Устанавливаем предельный zoom(приближение).
    if (this.yMap.getZoom() >= 8) {
      this.yMap.setZoom(8);
    }

    // ПОСТРОЕНИЕ АВТОМАРШРУТА ПО КЛИКАМ, ПО КАРТЕ
	//Отслеживаем событие клика по карте
		this.yMap.events.add('click', function (e) {
            var position = e.get('coordPosition');
			if(markers.length < 100)
			{
              // Создаем свой макет балуна к меткам маршрута. С кнопками "Удалить метку", "Удалить маршрут".
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
                    // Добавляем к каждой новой точке свой id.
                    id: ch
                }, {
                    // Опции
                    //preset: 'twirl#carIcon',
                    // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                    'iconLayout': 'default#image',
                    'iconImageHref': '/f/min/images/car.png',
                    'iconImageSize': [35, 34],
                    'iconImageOffset': [-(35 / 2), -34],
                    // Метку можно перемещать.
                    draggable: true,
                    // Метка остается на карте, при открытом над ней балуне.
                    hideIconOnBalloonOpen: false,
                    // Устанавливаем ее приоритет равным 0, чтобы она оставалась на карте, под открытым балуном.
                    zIndexActive: 0,
                    balloonContentBodyLayout: myBalloonContentBodyLayout
                });

             // Добавляем новые метки, в массив 'markers' и на карту.
			 markers.push(myPlacemark);
			 this.yMap.geoObjects.add(myPlacemark);

             // Значки самолетика и машинки, делаем видимыми над картой. После установления новой точки, кликом по карте.
             $(".span12").css({'opacity' : '1'});
             // Скрываем бегающий за мышкой значок машинки. При установлении новой точки к маршруту.
             $(".pointerImg").css({'opacity' : '0'});
             // Удаляем первоначальную метку с пояснениями к маршруту, с карты.
             myMap.geoObjects.remove(placemark_new);

             ch++;
			 }
			 else
			 {
			 alert("Вы задали максимальное количество точек");
			 }

             // Отправим запрос на геокодирование новой, добавленной метки. Выполним геокодирование координат полученной метки, в полный адрес. Добавим его вывод в балун метки.
             ymaps.geocode(position).then(function (res) {
             var firstGeoObject = res.geoObjects.get(0);
             firstGeoObject_text = firstGeoObject.properties.get('text');
             // собираем информацию о всех точках автомаршрута, добавленного несколькими кликами по карте.
             // добавляем текстовую информацию(firstGeoObject_text.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
             geo_points.push(firstGeoObject_text);
             // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке справа от карты "Все точки авиамаршрута:".
             for(var i = 0, l = geo_points.length; i < l; i++) {
			   point_geo[i] = '<br /> &bull; ' + geo_points[i];
			 }
             if(markers.length == 1)
             {
             // в балуне первой метки, отмеченной на карте, выводим html-форму, с тремя списками select, с данными маршрута(тип: топлива, поездки, маршрута).
             myPlacemark.properties.set("balloonContentBody",
'<div id="menu"><p style="font-size: 14px;"><b>Начальная точка маршрута: <i style="color: #999966;">' + firstGeoObject_text + '</i></b></p><br />Прежде чем продолжить строить автомаршрут, выберите ниже в форме необходимые данные по нему. И после, установите следующую точку на карте.<br /><br /> Точки маршрута удаляются по кнопке "Удалить метку", при клике на любую из точек. При этом маршрут исчезает но его точки, кроме удаленной, остаются. Можно удалить еще точки с карты. При последующем клике по карте, маршрут перестраивается по новым точкам.<br /><br /><small style="color: #1D3B3B;">Выберите тип поездки по указанному маршруту:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" style="height: 20px" /></span><select name="travel_select" id="travel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Work">В рабочие дни, до работы</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Dacha">В выходные дни, до дачи</option></select></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип маршрута:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Сonversely">Туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Выберите тип топлива вашего автомобиля:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" style="height: 20px" /></span><select name="fuel_select" id="fuel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Gazoline">Бензин</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Diesel">Дизель</option></select></div><div id="menu">');

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

              // Если выбрано последнее значение в крайнем списке 'select', по типу топлива, в форме с выбором данных маршрута. Скрываем большой балун первой метки, с формой и вводным текстом, с карты.
              // Получаем значение свойства: название места, для выбранной первой точки и выводим его в балуне, вместе с кнопкой удаления метки.
              myMap.balloon.close();
              myPlacemark.properties.set({'balloonContentBody': firstGeoObject_text + '<br /><a href="#" class="btn btn-warning" id="switch">Удалить метку</a>'});
              myPlacemark.balloon.open();

              // Получаем координаты добавленной метки
              var myPlacemark_coord = myPlacemark.geometry.getCoordinates();

              // Получаем значение 'id', удаляемой точки, по ссылке "удалить метку!".
              var id = myPlacemark.properties.get('id');
              //console.log('id точки :', id);

              // Создаем механизм удаления с карты первой метки, по ссылке "Удалить метку".
              //Получаем идентификатор 'switch', ссылки "Удалить метку".
              var a = document.getElementById('switch');
              //Вешаем на него событие onclick. По нему удаляем первую точку с карты и из массива 'markers'.
              a.onclick = function() {
                //alert('Метка удалена.');
                delete markers[id - id];
                // Пересчет длины массива 'markers', и смещение его индексов, после удаления метки с карты.
                markers.slice(0, markers.length-1);
                // Фильтрация данных массива 'markers'. Убираем из него undefined и null.
                markers = markers.filter(function(x) { return x !== "undefined" && x !== undefined && x !== null; });

                // После удаления точки, убираем данные в блоке справа от карты. По типам: поездки, маршрута, топлива.
                $(".route-length_fuel").empty();
                $(".route-length_travel").empty();
                $(".route-length_route").empty();
                // Обнуляем соответствующие переменные:
                type_fuel = "undefined";
                type_travel = "undefined";
                type_route = "undefined";

              };
              });
             }
             // Если метка не первая на карте.
             else
             {
               var link_route = '<a href="#" class="btn btn-warning" id="switch_1">Удалить маршрут</a>';
               // Закрываем балун первой метки
               myMap.balloon.close();

               // Получаем координаты новой, добавленной метки
               var myPlacemark_coord = myPlacemark.geometry.getCoordinates();

               // Добавляем новый балун на карту, по полученным координатам метки. С данными о точке и ссылкой "Удалить маршрут".
               myMap.balloon.open(myPlacemark_coord, {
               content: firstGeoObject_text + '<br />' + link_route
               }, {
               closeButton: true
               });

               // Если балун точки, после закрытия, был снова открыт. Добавляем в него информацию с данными о точке и ссылкой "Удалить маршрут".
               if (myPlacemark.balloon.isOpen()) {
                 myMap.balloon.open(myPlacemark_coord, {
                 content: firstGeoObject_text + '<br />' + link_route
                 }, {
                 closeButton: true
                 });
                 //console.log('Балун точки :', myPlacemark.balloon.open());
                }

               // Создаем механизм удаления всего маршрута, по ссылке "Удалить маршрут".
               //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
               var b = document.getElementById('switch_1');
               //Вешаем на него событие onclick. По нему удаляем весь маршрут с карты.
               b.onclick = function() {
               // Удаляем маршрут и метки.
               route && myMap.geoObjects.remove(route);
               for(var i = 0, l = markers.length; i < l; i++) {
		         myMap.geoObjects.remove(markers[i]);
		       }

               // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
               myMap.geoObjects.remove(car);
               for(var j = 0, k = markers_route.length; j < k; j++) {
		         myMap.geoObjects.remove(markers_route[j]);
		       }
               markers_route = [];

               // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
               markers = [];
        	   point = [];
               // Счетчик id меток, выставляем равным 1.
               ch = 1;

               // очищаем данные о типе топлива, типе поездки и типе маршрута.
               $(".route-length_fuel").empty();
               $(".route-length_travel").empty();
               $(".route-length_route").empty();

               // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
               // Данные о местоположении, определённом по IP.
               var geolocation = ymaps.geolocation;
               // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
               var coords_location = [geolocation.latitude, geolocation.longitude];
               myMap.setCenter(coords_location, 8);

               // Очищаем все данные маршрута, в блоке справа от карты
               $(".route-length1").empty();
               // Очищаем блок с данными по углеродному следу. Вверху над картой.
               $(".result-co2").empty();
               // Убираем открытый балун с карты
               myMap.balloon.close();

              };
             }
             });

             for(var i = 0, l = markers.length; i < l; i++) {
			   point[i] = markers[i].geometry.getCoordinates();
			 }

             // перед построением нового маршрута проверяем, были ли уже проложены старые и удаляем их, если да.
             if(route) myMap.geoObjects.remove(route);
             $(".route-length1").empty();
             // Очищаем блок с данными по углеродному следу. Вверху над картой.
             $(".result-co2").empty();

             // Если не выбран тип топлива, добавляем в блок справа от карты предупреждающий текст.
             if((typeof type_fuel == "undefined"))
             {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
             // Или, если не выбран тип поездки, добавляем в блок справа от карты предупреждающий текст.
             else if((typeof type_travel == "undefined"))
             {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
             // Или, если не выбран тип маршрута, добавляем в блок справа от карты предупреждающий текст.
             else if((typeof type_route == "undefined"))
             {$(".route-length_fuel").append('<h3>Выберите пожалуйста все данные</h3>');}
             // Если все селекторы выбраны, то начинаем строить маршрут, по двум первым, отмеченным точкам.
             else
             {

              $.getScript('../f/min/map/car.js', function () {
                car = new Car({
                iconLayout: ymaps.templateLayoutFactory.createClass(
                '<div class="b-car b-car_blue b-car-direction-$[properties.direction]"></div>'
                )
              });

              ymaps.route(point, {
                // Опции маршрутизатора
                avoidTrafficJams: true, // строить маршрут с учетом пробок
                mapStateAutoApply: true // автоматически позиционировать карту
              }).then(function (router) {

                // Создаем замыкание геообъекта маршрут.
                route = router;

                // Добавляем маршрут на карту.
                myMap.geoObjects.add(route);

                // И "машинку" туда же
                myMap.geoObjects.add(car);

                // Добавляем также объект 'car' в массив 'markers_route'. Если машинок добавлено сразу несколько на карту.
                markers_route.push(car);

                // Получаем отдельные пути маршрута
                var way_m_paths = route.getPaths();

                // Включаем редактор маршрута. С возможностью добавлять, удалять, перемещать путевые точки маршрута.
                route.editor.start({
                  addWayPoints: true,
                  removeWayPoints: true,
                  editWayPoints: true
                });

                // Скрываем первоначальные метки по кликам по карте. Чтобы передать их добавление маршрутизатору.
                myPlacemark.options.set('visible', false);

                // С помощью метода getWayPoints() получаем массив точек маршрута.
                var points = route.getWayPoints();
                points.options.set({
                //'preset': 'twirl#carIcon'
                // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                'iconLayout': 'default#image',
                'iconImageHref': '/f/min/images/car.png',
                'iconImageSize': [35, 34],
                'iconImageOffset': [-(35 / 2), -34]
                });
                // Делаем основные путевые точки маршрута, невидимыми. Чтобы передать их вывод на карту, режиму редактирования маршрута.
                points.options.set('visible', true);

                // Находим первую, путевую точку маршрута
                var lastPoint_first =  route.getWayPoints().get(1);
                // Определяем ее координаты.
                var lastPoint_coord_first = lastPoint_first.geometry.getCoordinates();

                // Производим геокодирование первой путевой точки
                ymaps.geocode(lastPoint_coord_first).then(function (res) {
                  var firstGeoObject_route = res.geoObjects.get(0);
                  firstGeoObject_text_route_first = firstGeoObject_route.properties.get('text');
                });

                // Находим крайнюю, добавленную точку к маршруту.
                var lastPoint = points.get(points.getLength() - 1);
                // Определяем ее координаты.
                var lastPoint_coord = lastPoint.geometry.getCoordinates();

                // Производим геокодирование последующих путевых точек
                ymaps.geocode(lastPoint_coord).then(function (res) {
                  var firstGeoObject_route = res.geoObjects.get(0);
                  firstGeoObject_text_route = firstGeoObject_route.properties.get('text');
                });

                //Если геокодировали путевые точки маршрута, выводим их в балуне меток. Если нет, выводим геокодированую пред. точку.
                var text_route;
                if((typeof firstGeoObject_text_route != "undefined")) {
                  text_route = firstGeoObject_text_route;
                }
                else {
                  text_route = firstGeoObject_text;
                }

                // При клике на любую из путевых точек маршрута, добавляем балун с кнопками удаления - "Удалить маршрут", "Удалить метку".
                points.events.add('click', function (e) {
                     // если 'e' не событие, то берем window.event
                     e = e || event;

                     // получаем координаты точки маршрута, по которой кликнули
                     var coords_route_point = e.get('coordPosition');

                     // получаем метку по которой кликнули
                     var target = e.get('target');

                     // Выводим ее свойства в консоли
                     //console.log(target.properties.getAll());

                     // Открываем балун с кнопками удаления над объектом, по которому кликнули
                     myMap.balloon.open(coords_route_point, {contentBody: text_route + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button> &nbsp; <button type="submit" class="btn btn-warning" id="delete_point">Удалить метку</button></div>'});

                     // Механизм удаления выбранной точки маршрута, по кнопке "Удалить метку".
                     $('#menu_delete button[id=delete_point]').bind('click', function () {

                        // Удаляем картинку атобуса, с карты.
                        myMap.geoObjects.remove(car);
                        for(var j = 0, k = markers_route.length; j < k; j++) {
		                  myMap.geoObjects.remove(markers_route[j]);
		                }

                        // Удаление точки маршрута по которой кликнули, с карты и из коллекции GeoObjectArray, с точками маршрута.
                        points.remove(target);

                        // определяем ее индекс
                        var index_point = points.indexOf(target);

                        // Закрываем открытый балун метки, с кнопками "Удалить метку", "Удалить маршрут".
                        myMap.balloon.close();

                        // Проверяем кол-во точек маршрута, после удаления выбранной точки
                        //console.log(wayPoints.getLength());

                        // Перебираем все оставшиеся точки, присваиваем их координаты массиву point
                        points.each(function (el, i) {
                          point[i] = el.geometry.getCoordinates();
                        });

                        // Бросаем на маршрут через его редактор, событие обновления routeupdate.
                        route.editor.events.fire('routeupdate', e.originalEvent);

                        // При удалении выбранной метки из группы GeoObjectArray, с точками маршрута. Удаляем предыдущий маршрут и добавляем новый. Включаем редактор маршрута, добавляем к нему опции.
                        points.events.add(["remove"], function () {
                        if(route) myMap.geoObjects.remove(route);
                        myMap.geoObjects.add(route);

                        // Включаем редактор маршрута.
                        route.editor.start({
                        addWayPoints: true,
                        removeWayPoints: true,
                        editWayPoints: true
                        });
                        });

                        // Удаляем все добавленные метки на карту. Чтобы не оставалась первая метка, после удаления всего маршрута по кнопке "Удалить маршрут".
                         for(var i = 0, l = markers.length; i < l; i++) {
		                   myMap.geoObjects.remove(markers[i]);
                           route.getWayPoints().get(i);
		                 }

                         // После каждого пересчета точек после удаления метки, обнуляем массивы с пред. кол-вом точек.
                         markers = [];
                         point = [];
                     });

                     // Механизм удаления всего маршрута, по кнопке "Удалить маршрут".
                     $('#menu_delete button[id=delete_route]').click(function () {
                       // Создаем механизм удаления всего маршрута, по кнопке "Удалить маршрут". Через открытый балун, крайней метки маршрута.
                       //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                       // Удаляем маршрут и метки.
                       route && myMap.geoObjects.remove(route);
                       for(var i = 0, l = markers.length; i < l; i++) {
		                 myMap.geoObjects.remove(markers[i]);
                         route.getWayPoints().get(i);
		               }

                       // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                       myMap.geoObjects.remove(car);
                       for(var j = 0, k = markers_route.length; j < k; j++) {
		                 myMap.geoObjects.remove(markers_route[j]);
		               }
                       markers_route = [];

                       // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                       markers = [];
        	           point = [];
                       // Счетчик id меток, выставляем равным 1.
                       ch = 1;

                       // очищаем данные о типе топлива, типе поездки и типе маршрута.
                       $(".route-length_fuel").empty();
                       $(".route-length_travel").empty();
                       $(".route-length_route").empty();

                       // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                       // Данные о местоположении, определённом по IP.
                       var geolocation = ymaps.geolocation;
                       // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                       var coords_location = [geolocation.latitude, geolocation.longitude];
                       myMap.setCenter(coords_location, 8);

                       // Очищаем все данные маршрута, в блоке справа от карты
                       $(".route-length1").empty();
                       // Очищаем блок с данными по углеродному следу. Вверху над картой.
                       $(".result-co2").empty();
                       // Убираем открытый балун с карты
                       myMap.balloon.close();
                       // Завершаем удаление всего маршрута, по кнопке "Удалить маршрут".
                     });

                });

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

                var a1 = 10,
                b1 = way_m_first_1;

                var m = (b1/100*a1)*p; //масса топлива

                //углеродный след
                var co_auto = m*k;
                // округляем значение до одного знака после запятой
                var co_auto_1 = co_auto.toFixed(1);

                /*
                // МЕХАНИЗМ ВЫВОДА ДАННЫХ ПО АВТОМАРШРУТУ В МОДАЛЬНОМ ОКНЕ. ПРИ ПОСТРОЕНИИ МАРШРУТА КЛИКОМ ПО КАРТЕ.
                // Очищаем блок с данными модального окна, после каждого передобавления маршрута.
                $(".route-modal-length").empty();

                // Объявляем переменные для вывода данных в модальном окне. По типу поездки, маршрута, топлива. Также переменная для подсчета общего пробега за год, в зависимости от типа поездки.
                var type_travel_type;
                var type_marshrut;
                var type_travel_fuel;
                var type_travel_route;

                // Определяем тип маршрута, для вывода его в модальном окне.
                if(type_route == "Сonversely")
                {
                  type_marshrut = 'Тип маршрута: <small class="text-warning">Туда и обратно</small>';
                }
                else if(type_route == "Forwards")
                {
                  type_marshrut = 'Тип маршрута: <small class="text-warning">Только в одну сторону</small>';
                }

                // Определяем тип топлива, для вывода его в модальном окне.
                if(type_fuel == "Gazoline")
                {
                  type_travel_fuel = 'Выбран тип топлива: <small class="text-warning">Бензин</small>';
                }
                else if(type_fuel == "Diesel")
                {
                  type_travel_fuel = 'Выбран тип топлива: <small class="text-warning">Дизель</small>';
                }

                // Определяем значение общего пробега за год, в зависимости от типа поездки: на работу или на дачу. Определяем тип поездки, на работу или на дачу. Выводим полученные данные в модальном окне.
                if(type_travel == "Work"){
                   type_travel_route = way_m_car_11;
                   type_travel_type = 'Выбрана поездка: <small class="text-warning">До работы</small>';
                }
                else
                {
                  type_travel_route = way_m_home_11;
                  type_travel_type = 'Выбрана поездка: <small class="text-warning">До дачи</small>';
                }

                // Добавляем всплывающее, модальное окно, для вывода в нем основной информации по маршруту.
                $(".route-modal-length").append('<div id="myModalBox" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h4 class="modal-title">Данные маршрута</h4></div><div class="modal-body"><p>' + type_travel_type + '</p><p>' + type_marshrut + '</p><p>' + type_travel_fuel + '</p><br /><p>Общая длина маршрута: <small class="text-warning">' + route.getHumanLength() + '</small></p><p>Время в пути: <small class="text-warning">' + route.getHumanTime() + '</small></p><p>Углеродный след: <small class="text-warning">' + co_auto_1 + ' кгСО2/л.</small></p><p>За год вы проедете примерно: <small class="text-warning">' + type_travel_route + ' км.</small></p></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">Закрыть</button></div></div></div></div>');
                // Вызываем метод, показа модального окна с данными по маршруту.
                $("#myModalBox").modal('show');
                // ЗАВЕРШЕНИЕ МЕХАНИЗМА ВЫВОДА ДАННЫХ ПО МАРШРУТУ В МОДАЛЬНОМ ОКНЕ.
                */

                // Вывод выделенного, большого результата по углеродному следу, над картой.
                $(".result-co2").append('<p>Углеродный след: <strong>' + co_auto_1 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                // Вывод данных по маршруту в блоке справа от карты. Пока скрыты.
                // Выводим данные по маршруту, в блоке справа от карты. Первоначальная длина, время и углеродный след.
                $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength() + '</strong></h3>');
			    $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime() + '</strong></h3>');
                $(".route-length1").append('<h3>Углеродный след: <strong>' + co_auto_1 + ' кгСО2/л.</strong></h3>');

                // Выводим значение общего пробега за год, в зависимости от типа поездки: на работу или на дачу.
                if(type_travel == "Work"){
                  $(".route-length1").append('<h3>За год вы проедете примерно: <strong>' + way_m_car_11 + ' км</strong></h3>');
                }
                else
                {
                  $(".route-length1").append('<h3>В дачный сезон вы проедете примерно: <strong>' + way_m_home_11 + ' км</strong></h3>');
                }
                // ЗАВЕРШЕНИЕ ОБРАБОТКИ И ВЫВОДА ДАННЫХ ПО НОВОМУ МАРШРУТУ.

                // ОТСЛЕЖИВАЕМ СОБЫТИЕ ОБНОВЛЕНИЯ МАРШРУТА. ПРИ ДОБАВЛЕНИИ НОВЫХ ПУТЕВЫХ ТОЧЕК. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА.
                route.events.add("update",function () {

                // Получаем коллекцию путей, из которых состоит маршрут.
                //console.log(router.getPaths());

                 // очищаем блок с данными построенного маршрута, до события обновления маршрута. Т.к. здесь будут добавляться свои данные, в зависимости от события маршрута.
                 $(".route-length1").empty();
                 // Очищаем блок с данными по углеродному следу. Вверху над картой.
                 $(".result-co2").empty();

                 // С помощью метода getWayPoints() получаем массив точек маршрута. После события обновления маршрута, добавления новых точек.
                 var wayPoints = route.getWayPoints();
                 wayPoints.get(wayPoints.getLength() - 1).options.set({
                 //'preset': 'twirl#carIcon',
                 // делаем путевую точку ввиде картинки машинки. Настриаваем ее размеры.
                 'iconLayout': 'default#image',
                 'iconImageHref': '/f/min/images/car.png',
                 'iconImageSize': [35, 34],
                 'iconImageOffset': [-(35 / 2), -34]
                 });

                 // Делаем путевые точки маршрута, в режиме редактирования, видимыми.
                 wayPoints.options.set('visible', true);

                 // Находим первую, путевую точку маршрута
                 var lastPoint_first =  route.getWayPoints().get(1);
                 // Определяем ее координаты.
                 var lastPoint_coord_first = lastPoint_first.geometry.getCoordinates();

                 // Производим геокодирование первой путевой точки
                 ymaps.geocode(lastPoint_coord_first).then(function (res) {
                    var firstGeoObject_route = res.geoObjects.get(0);
                    firstGeoObject_text_route_first = firstGeoObject_route.properties.get('text');
                 });

                 // Находим крайнюю, добавленную точку к маршруту.
                 var lastPoint = wayPoints.get(wayPoints.getLength() - 1);
                 // Определяем ее координаты.
                 var lastPoint_coord = lastPoint.geometry.getCoordinates();

                 // Производим геокодирование последующих путевых точек
                 ymaps.geocode(lastPoint_coord).then(function (res) {
                    var firstGeoObject_route = res.geoObjects.get(0);
                    firstGeoObject_text_route = firstGeoObject_route.properties.get('text');
                 });

                 //Если геокодировали путевые точки маршрута, выводим их в балуне меток. Если нет, выводим геокодированую пред. точку.
                 var text_route;
                 if((typeof firstGeoObject_text_route != "undefined")) {
                    text_route = firstGeoObject_text_route;
                 }
                 else {
                    text_route = firstGeoObject_text;
                 }

                 // Закрываем открытый балун, второй метки маршрута.
                 myMap.balloon.close();

                 var link_route = '<a href="#" class="btn btn-warning" id="switch_1">Удалить маршрут</a>';

                 // Добавляем новый балун на карту, по координатам новой точки. С данными о точке и ссылкой "Удалить маршрут".
                 myMap.balloon.open(lastPoint_coord, {
                 content: text_route + '<br />' + link_route
                 }, {
                 closeButton: true
                 });

                 // Создаем механизм удаления всего маршрута, по ссылке "Удалить маршрут". Через открытый балун, крайней метки маршрута.
                 //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                 var d = document.getElementById('switch_1');
                 //Вешаем на него событие onclick. По нему удаляем весь маршрут с карты.
                 d.onclick = function() {
                 // Удаляем маршрут и метки.
                 route && myMap.geoObjects.remove(route);
                 for(var i = 0, l = markers.length; i < l; i++) {
		           myMap.geoObjects.remove(markers[i]);
		         }

                 // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                 myMap.geoObjects.remove(car);
                 for(var j = 0, k = markers_route.length; j < k; j++) {
		           myMap.geoObjects.remove(markers_route[j]);
		         }
                 markers_route = [];

                 // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                 markers = [];
        	     point = [];
                 // Счетчик id меток, выставляем равным 1.
                 ch = 1;

                 // очищаем данные о типе топлива, типе поездки и типе маршрута.
                 $(".route-length_fuel").empty();
                 $(".route-length_travel").empty();
                 $(".route-length_route").empty();

                 // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                 // Данные о местоположении, определённом по IP.
                 var geolocation = ymaps.geolocation;
                 // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                 var coords_location = [geolocation.latitude, geolocation.longitude];
                 myMap.setCenter(coords_location, 8);

                 // Очищаем все данные маршрута, в блоке справа от карты
                 $(".route-length1").empty();
                 // Очищаем блок с данными по углеродному следу. Вверху над картой.
                 $(".result-co2").empty();
                 // Убираем открытый балун с карты
                 myMap.balloon.close();
                 };
                 // Завершаем удаление всего маршрута, по ссылке "Удалить маршрут".

                  // При клике на любую из путевых точек маршрута, добавляем балун с кнопками удаления - "Удалить маршрут", "Удалить метку".
                  wayPoints.events.add('click', function (e) {
                     // если 'e' не событие, то берем window.event
                     e = e || event;

                     // получаем координаты точки маршрута, по которой кликнули
                     var coords_route_point = e.get('coordPosition');

                     // получаем метку по которой кликнули
                     var target = e.get('target');

                     var markers_route = [];

                     markers_route.push(target);

                     // Выводим ее свойства в консоли
                     //console.log(target.properties.getAll());

                     // Открываем балун с кнопками удаления над объектом, по которому кликнули
                     myMap.balloon.open(coords_route_point, {contentBody: text_route + '<div id="menu_delete"><button type="submit" class="btn btn-warning" id="delete_route">Удалить маршрут</button> &nbsp; <button type="submit" class="btn btn-warning" id="delete_point">Удалить метку</button></div>'});

                     // Механизм удаления выбранной точки маршрута, по кнопке "Удалить метку".
                     $('#menu_delete button[id=delete_point]').bind('click', function () {

                        // Удаляем картинку атобуса, с карты.
                        myMap.geoObjects.remove(car);

                        // Удаление точки маршрута по которой кликнули, с карты и из коллекции GeoObjectArray, с точками маршрута.
                        wayPoints.remove(target);

                        // Проверяем кол-во точек маршрута, после удаления выбранной точки
                        //console.log(wayPoints.getLength());

                        // Перебираем все оставшиеся точки, присваиваем их координаты массиву point
                        wayPoints.each(function (el, i) {
                          point[i] = el.geometry.getCoordinates();
                        });

                        // Бросаем на маршрут через его редактор, событие обновления routeupdate.
                        route.editor.events.fire('routeupdate', e.originalEvent);

                        // При удалении выбранной метки из группы GeoObjectArray, с точками маршрута. Удаляем предыдущий маршрут и добавляем новый. Включаем редактор маршрута, добавляем к нему опции.
                        wayPoints.events.add(["remove"], function () {
                        if(route) myMap.geoObjects.remove(route);
                        myMap.geoObjects.add(route);

                        // Включаем редактор маршрута.
                        route.editor.start({
                        addWayPoints: true,
                        removeWayPoints: true,
                        editWayPoints: true
                        });
                        });

                         // Закрываем открытый балун метки, с кнопками "Удалить метку", "Удалить маршрут".
                         myMap.balloon.close();

                         // Удаляем все добавленные метки на карту. Чтобы не оставалась первая метка, после удаления всего маршрута по кнопке "Удалить маршрут".
                         for(var i = 0, l = markers.length; i < l; i++) {
		                   myMap.geoObjects.remove(markers[i]);
                           route.getWayPoints().get(i);
		                 }

                         // После каждого пересчета точек после удаления метки, обнуляем массивы с пред. кол-вом точек.
                         markers = [];
                         point = [];
                     });

                     // Механизм удаления всего маршрута, по кнопке "Удалить маршрут".
                     $('#menu_delete button[id=delete_route]').click(function () {
                       // Создаем механизм удаления всего маршрута, по кнопке "Удалить маршрут". Через открытый балун, крайней метки маршрута.
                       //Получаем идентификатор 'switch', ссылки "Удалить маршрут".
                       // Удаляем маршрут и метки.
                       route && myMap.geoObjects.remove(route);
                       for(var i = 0, l = markers.length; i < l; i++) {
		                 myMap.geoObjects.remove(markers[i]);
                         route.getWayPoints().get(i);
		               }

                       // Удаляем картинку атобуса, с карты. И очищаем массив 'markers_route', с добавленными в него картинками автобуса.
                       myMap.geoObjects.remove(car);
                       for(var j = 0, k = markers_route.length; j < k; j++) {
		                 myMap.geoObjects.remove(markers_route[j]);
		               }
                       markers_route = [];

                       // Обнуляем массивы с точками и координатами точек, всех меток маршрута.
                       markers = [];
        	           point = [];
                       // Счетчик id меток, выставляем равным 1.
                       ch = 1;

                       // очищаем данные о типе топлива, типе поездки и типе маршрута.
                       $(".route-length_fuel").empty();
                       $(".route-length_travel").empty();
                       $(".route-length_route").empty();

                       // Устанавливаем после удаления маршрута, новый центр и zoom карты по местоположению пользователя.
                       // Данные о местоположении, определённом по IP.
                       var geolocation = ymaps.geolocation;
                       // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
                       var coords_location = [geolocation.latitude, geolocation.longitude];
                       myMap.setCenter(coords_location, 8);

                       // Очищаем все данные маршрута, в блоке справа от карты
                       $(".route-length1").empty();
                       // Очищаем блок с данными по углеродному следу. Вверху над картой.
                       $(".result-co2").empty();
                       // Убираем открытый балун с карты
                       myMap.balloon.close();
                       // Завершаем удаление всего маршрута, по кнопке "Удалить маршрут".
                     });

                  });

                 // Если выбрана вторая точка маршрута, после события обновления маршрута, добавляем к ней ссылку "Удалить метку".
                 if(markers.length == 2)
                 {
                    myPlacemark.properties.set({'balloonContentBody': firstGeoObject_text + '<br /><a href="#" class="btn btn-warning" id="switch">Удалить метку</a>'});
                 }

                 // Длина обновленнного маршрута в м
                 way_m = route.getLength();
                 // округленная длина маршрута, без цифр после запятой. В зависимости от типа маршрута, прямой маршрут или туда и обратно.
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

                var a = 10,
                b = way_m_1;

                var m1 = (b/100*a)*p1; //масса топлива

                //углеродный след
                var co_auto1 = m1*k1;
                // округляем значение до одного знака после запятой
                var co_auto_11 = co_auto1.toFixed(1);

                // Вывод выделенного, большого результата по углеродному следу, над картой.
                $(".result-co2").append('<p>Углеродный след: <strong>' + co_auto_11 + ' <small>кгСО<sub>2</sub></small></strong></p>');

                // Вывод данных по маршруту в блоке справа от карты. Пока скрыты.
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

                // ОТСЛЕЖИВАЕМ 4 СОБЫТИЯ СВЯЗАННЫХ С ПУТЕВЫМИ ТОЧКАМИ МАРШРУТА: ДОБАВЛЕНИЕ/УДАЛЕНИЕ/ПЕРЕТАСКИВАНИЕ. ПРИ ВКЛЮЧЕННОМ РЕДАКТОРЕ МАРШРУТА. ПО КАЖДОМУ ИЗ НИХ ОЧИЩАЕМ БЛОК С ДАННЫМИ.
                  route.editor.events.add('waypointadd', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointremove', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointdragstart', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                  route.editor.events.add('waypointdragend', function (e) {
                  // очищаем блок с данными построенного маршрута.
                  $(".route-length1").empty();
                  // Очищаем блок с данными по углеродному следу. Вверху над картой.
                  $(".result-co2").empty();
                  });

                });
                // ЗАВЕРШЕНИЕ ОТСЛЕЖИВАНИЯ СОБЫТИЯ ОБНОВЛЕНИЯ МАРШРУТА.

                // Отправляем машинку по полученному маршруту простым способом
                // car.moveTo(route.getPaths().get(0).getSegments());
                // или чуть усложненным: с указанием скорости,
                car.moveTo(route.getPaths().get(0).getSegments(), {
                   speed: 50,
                   directions: 8
                }, function (geoObject, coords, direction) { // тик движения
                   // перемещаем машинку
                   geoObject.geometry.setCoordinates(coords);
                   // ставим машинке правильное направление - в данном случае меняем ей текст
                   geoObject.properties.set('direction', direction.t);

                }, function (geoObject) { // приехали
                geoObject.properties.set('balloonContent', "Приехали!");
                geoObject.balloon.open();
                });

                });
                });
                }

    }, this);
    // ЗАВЕРШЕНИЕ ПОСТРОЕНИЯ АВТОМАРШРУТА ПО КЛИКАМ, ПО КАРТЕ

    /*
      //Удаление маршрута, геокодированной коллекции координат и добавленных меток, с карты и очистка данных. По красной кнопке "Очистить маршрут".
        button1.click(function () {
        // Если на карте остался открытый балун от автомаршрута, убираем его.
        myMap.balloon.close();

        // Удаляем маршрут и его метки с карты
        route && myMap.geoObjects.remove(route);
		 for(var i = 0, l = markers.length; i < l; i++) {
		     myMap.geoObjects.remove(markers[i]);
		 }

         // Удаляем картинку атобуса, с карты.
         myMap.geoObjects.remove(car);

         // Удаление всех точек авиамаршрута, добавленных в массив distance_aero.
         for(var j = 0, h = distance_aero.length; j < h; j++) {
		   myMap.geoObjects.remove(distance_aero[j]);
		 }
         // обнуляем переменную счетчик меток и массивы.
		 markers = [];
		 point = [];
         geo_points = [];
         point_geo = [];
         distance_aero = [];
         point_aero = [];
         ch = 1;
         coord_aero = 0;
         // Очищаем блок с данными построенного маршрута. Справа от карты.
         $(".route-length1").empty();
         // Очищаем блок с данными по углеродному следу. Вверху над картой.
         $(".result-co2").empty();
         // Очищаем блок с данными о всех точках перелета, по авиамаршруту.
         $(".route-length2").empty();
         // Очищаем данные о типе топлива, типе поездки и типе маршрута.
         $(".route-length_fuel").empty();
         $(".route-length_travel").empty();
         $(".route-length_route").empty();
         type_fuel = "undefined";
         type_travel = "undefined";
         type_route = "undefined";

         // Создаем механизм удаления геокодированной выше, коллекции координат автомаршрута.
         // создаем новую коллекцию ymaps.GeoObjectCollection, добавляем ее на карту.
         var collection = new ymaps.GeoObjectCollection();
         myMap.geoObjects.add(collection);
         // заполняем ее метками из геокодированной коллекции geoObjects_coll.
         collection.add(geoObjects_coll);
         //делаем этой коллекции removeAll(). Т.е. удаляем все объекты с карты, при клике по кнопке "Очистить маршрут по картинкам".
         collection.removeAll();
         // устанавливаем после удаления маршрута, новый центр и zoom карты.
         myMap.setCenter([55.752078, 37.621147], 8);
         // удаление ломаной авиамаршрута с карты
         var result1 = myMap.geoObjects.remove(myGeoObject);
   });
   */

/*
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
  */

  };

  /*
  //Создание новой метки на карте
    Map.prototype.createPlacemark = function (coords) {

    var placemark;
    // Данные о местоположении, определённом по IP.
    var geolocation = ymaps.geolocation;
    // Координаты местопложения пользователя. По ним будем добавлять точку на карту.
    var coords_location = [geolocation.latitude, geolocation.longitude];

    placemark = new ymaps.Placemark(coords_location_1, {
      iconContent: "H"}, {
      draggable: true,
      visible: false
    });

    //Добавляем метки на карту
    //this.placemarks.push(placemark);
    //this.yMap.geoObjects.add(placemark);
  };
  */

  // При инициализации карты, создаем новый класс 'ymap-ready' и добавляем его к странице
  Map.prototype.init = function () {
    this.root.addClass('ymap-ready');
  };

  //возвращаем результат функции 'Map' в билд проекта, в файл main.build.js.
  als.Map = Map;
  return Map;
});