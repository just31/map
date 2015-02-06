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

    var route, icon, distance, myGeoObject, placemark, myBalloonContentBodyLayout, type_fuel, type_travel, aero_num_people, type_aero, type_rad,
    num, rad, type_route, way_m, way_m_upd, visibleObjects, mGeocoder, geoObjects_coll, firstGeoObject_1, ballon_aero, result, ch = 1, distance_aero_length;
    var markers = [];
    var markers_1 = [];
	var point = [];
    var geo_points = [];
    var point_geo = [];
    var distance_aero = [];
    var point_aero = [];
    var way_m_paths = [];
    var model_point = [];
    var model_point_aero = [];
    var model_point_coord = [];
    var model_point2 = [];
    var model_coord;
    var myCollection;
    // делаем переменную myCollection, глобальной, чтобы можно было ее значение передавать из ajaх запроса. При получении списка аэропортов из aero1.csv.
    window.globalvar = myCollection;
    // создаем глобальную переменную для GeoQueryResult, со списком аэропортов.
    var arPlacemarksRez;
    window.globalvar = arPlacemarksRez;
    var i, ii,
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
          "balloonContent": 'Аэропорт: '+ ballon_aero
          }, {
          // Опции
          preset: 'twirl#airplaneIcon',
          visible: false
          });
          //if(markers_1.length === 0 ) {
          myCollection.add(myPlacemark_1);
          //}
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
                                preset: 'twirl#airplaneIcon',
                                balloonContentBodyLayout: myBalloonContentBodyLayout
                            };

                        // Создаем метку и добавляем ее на карту.
                        if(markers.length < 100)
			            {
                         // добавляем основную метку на карту
                         myMap.geoObjects.add(createPlacemark(coordinates, options));
                         // делаем ее видимой, передаем далее в скрипте, вывод меток маршрута, механизму маршрутизатизации route().
                         placemark.options.set('visible', true);

                         // Если строится автомаршрут, по клику или из тулбара, то добавляем его точки в массив markers
                         if (placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                           markers.push(placemark);
                         }

                         // НАЧИНАЕМ СТРОИТЬ АВИАМАРШРУТ
                         // если выбран значок самолета, подгружаем список аэропортов
                         if (placemark.options.get('iconImageHref') == '/f/min/images/airplane.png'){
                         // добавляем геоколлекцию меток аэропортов из файла aero1.csv, на карту
                         //myMap.geoObjects.add(myCollection);
                         /*
                         // Создание GeoQueryResult, со списком аэропортов, из файла data_aero1.js.
                         $.ajax({
                           url: "http://intranet.russiancarbon.org/f/min/data_aero1.js",
                           dataType: "script",
                           async: false,
                         });

                         // добавляем данные аэропортов из массива objects1, делаем его невидимым
                         var arPlacemarksRez = ymaps.geoQuery(objects1).addToMap(myMap).setOptions('visible', false);
                         */

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

                         // удаляем основную метку, добавленную выше myMap.geoObjects.add(createPlacemark(coordinates, options));. Чтобы заменить ее новой по координатам найденного аэропорта.
                         myMap.geoObjects.remove(placemark);

                         // устанавливаем приближение карты, равное 5.
                         myMap.setZoom(5);
                         // добавляем новую метку на карту, с координатами ближайшего аэропорта.
                         myMap.geoObjects.add(createPlacemark(coord_aero_main, options));
                         // делаем ее невидимой. Чтобы метка была заменена на значок вершины ломаной авиамаршрута.
                         placemark.options.set('visible', false);
                         // добавляем выбранные точки в массив distance_aero
                         distance_aero.push(placemark);
                         for(var i = 0, l = distance_aero.length; i < l; i++) {
                            // получаем их координаты, для дальнейшего использования в построении ломаной авиамаршрута
			            	point_aero[i] = distance_aero[i].geometry.getCoordinates();
			             }

                         //myMap.geoObjects.remove(placemark);

                         // Логика по балуну первой метки авиамаршрута.
                         // Через проверку длины массива 'distance_aero', определяем первую точку и в ней открываем балун. Обрабатываем данные от html-формы из балуна.
                         if(distance_aero.length == 1)
                         {
                           // Вначале создаем сам балун - placemark.properties.set("balloonContentBody", ...
                           placemark.properties.set("balloonContentBody",
'<div id="menu">Прежде чем начать строить авиамаршрут, выберите необходимые данные по нему. И после, перетащите следующую точку на карте.<br /><br /><small style="color: #1D3B3B;">Укажите кол-во пассажиров:</small><br /> <input type="text" class="input-medium" id="col_text" name="col_text" style="width: 145px !important;" /><br /></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип полета:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 200px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" value="Сonversely">Перелет туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/V_fA6Nuj14hNeUGwuyPT9j6UBcU.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Количество радиации в атмосфере:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/qKhPY0P5zQRTChD09SLAfjK__yQ.png" style="height: 20px" /></span><select name="rad_select" id="rad_select" class="span2" style="width: 200px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="middle">Среднее</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="small">Небольшое</option></select></div><div id="menu">');

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
                           });

                         }
                         // Иначе, если точка не первая, открываем балун с названием аэропорта
                         else
                         {
                           var closestObject_2 = arPlacemarksRez.getClosestTo(coordinates).balloon.open();
                           //myMap.balloon.close();
                           //placemark.properties.set({"balloonContentBody": "Координаты точки: " + coord_aero_main + '<br />'});
                         }

                         // console.log('init object', point_aero);

                         // производим геокодирование установленной на карте, метки
                         ymaps.geocode(coord_aero_main).then(function (res) {
                           firstGeoObject_1 = res.geoObjects.get(0);
                           var firstGeoObject_text_1 = firstGeoObject_1.properties.get('text');
                           // собираем информацию о точках авиамаршрута, добавленного по картинкам из тулбара.
                           // добавляем текстовую информацию(firstGeoObject_1.properties.get('text')), о всех точках маршрута в массив geo_points. Для вывода их в блоке общей информации по маршруту, на странице /map/.
                           geo_points.push(firstGeoObject_text_1);
                           //console.log('init object', geo_points);
                           // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                           for(var i = 0, l = geo_points.length; i < l; i++) {
                             // два варианта нахождения последнего символа, в строке описания каждой точки маршрута
                             // var point_geo_l = geo_points[i].slice(0, -1);
                             // var point_geo_l = geo_points[i].substring(0, geo_points[i].length - 1);

				             point_geo[i] = '<br />&bull; ' + geo_points[i];
                             //console.log('init object', point_geo[i]);
                             //console.log('init object', geo_points);
			               }
                           //placemark.properties.set('balloonContentBody', firstGeoObject_text_1);
                           placemark.properties
                           .set({
                             balloonContent: firstGeoObject_text_1
                           });
                           if(point_geo.length > 1){
                            //console.log('init object', point_geo);
                            $(".route-length2").empty();
                            $(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');
                           }
                         });
                         //placemark.properties.set('balloonContentBody', coord_aero);
                         // Перед построением ломаной авиамаршрута проверяем, были ли уже проложены старые и удаляем их, если да.
                         if(myGeoObject) myMap.geoObjects.remove(myGeoObject);

                         // Очищаем блок данных, для вывода информации по авиамаршрута. При перетягивании следующей метки из тулбара.
                         $(".route-length1").empty();
                         // Создаем ломаную(прямую), используя класс GeoObject. Для графического отображения линии авиамаршрута на карте. По полученным ранее координатам point_aero, при перетаскивании меток самолетиков на карту.
                         myGeoObject = new ymaps.GeoObject({
                         // Описываем геометрию геообъекта.
                         geometry: {
                         // Тип геометрии - "Ломаная линия".
                         type: "LineString",
                         // Указываем координаты вершин ломаной.
                         coordinates: point_aero
                         /*
                         [
                           point_1,
                           point_2,
                           point_3,
                           point_4,
                           point_5
                         ]
                         */
                         },
                         // Описываем свойства геообъекта.
                         properties:{
                           // Содержимое балуна.
                           //balloonContent: 'Авиамаршрут, общее расстояния: '+ distance_aero_main +' км'
                           balloonContent: 'Продолжаем перелет'
                         }
                         }, {
                         // Задаем опции геообъекта.
                         // Цвет с прозрачностью.
                         strokeColor: "#336699",
                         // Ширину линии.
                         strokeWidth: 5,
                         /*
                         // Редактируем контекстное меню, вершин ломаной
                         editorMenuManager: function (editorItems, model) {
                         //Добавляем в контекстное меню новый пункт, позволяющий выводить данные о расстоянии маршрута в консоль.
                         items.push({
                         id: 'addStation',
                         title: "Вывести дистанцию маршрута в консоль",
                         onClick: function() {
                           // узнаем тип системы координат
                           var coordSystem_1 = myMap.options.get('projection').getCoordSystem(),
                           distance_aero_length_1 = 0;
                           // получаем массив пиксельных координат, моделей вершин ломаной
                           model_point = myGeoObject.editor.getModel().getPixels();
                           // получаем из глобальных пикс. координат, гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                           for(var i = 0, l = model_point.length; i < l; i++) {
                             model_point_coord[i] = myMap.options.get('projection').fromGlobalPixels(model_point[i], myMap.getZoom());
			               }
                           // вычисляем общую длину ломаной, через кол-во ее точек
                           for (var f = 0, n = myGeoObject.geometry.getLength() - 1; f < n; f++) {
                             distance_aero_length_1 += Math.round(coordSystem_1.getDistance(model_point_coord[f], model_point_coord[f + 1]))/1000;
                           }
                           // округленное, общее расстояние ломаной авиамаршрута
                           var distance_aero_main_1 = Math.ceil(distance_aero_length_1);
                           //console.log(model.geometry.getCoordinates(), model.getPixels());
                           //console.log(myGeoObject.editor.getModel().getVertexModels());
                           console.log('Расстояние авиаперелета:' + distance_aero_main_1 + 'км');
                         }
                         });
                         //Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
                         editorItems.push({
                           id: "routedelete",
                           title: "Удалить маршрут",
                           onClick: function () {
                           // Очищаем блоки данных, с информацией по авиамаршруту. При нажатии на кнопку "Удалить маршрут". В контекстном меню метки.
                           $(".route-length1").empty();
                           $(".route-length2").empty();
                           $(".route-length_fuel").empty();
                           $(".route-length_travel").empty();
                           $(".route-length_route").empty();
                           myMap.geoObjects.remove(myGeoObject);
                           // Удаление всех точек авиамаршрута, добавленных в массив distance_aero.
                           for(var j = 0, h = distance_aero.length; j < h; j++) {
		                   myMap.geoObjects.remove(distance_aero[j]);
		                   }
                           distance_aero = [];
                           point_aero = [];
                           // устанавливаем после удаления маршрута, новый центр и zoom карты.
                           myMap.setCenter([55.752078, 37.621147], 8);
                         }
                         });
                         return editorItems;
                         },*/
                         //editorVertexLayout: ymaps.templateLayoutFactory.createClass('<div style="height:12px;width:12px;background-color:red;opacity:0.2;margin: -4px 0px 0px -4px;"></div>')
                         // Cоздадим собственный макет для вершин ломаной.
                         editorVertexLayout: ymaps.templateLayoutFactory.createClass('<div style="height:34px;width:35px;background: url(/f/min/images/airplane.png);margin: 0px 0px 0px -17px;"></div>'),
                         // Cоздадим собственный макет для промежуточных точек ломаной.
                         //editorEdgeLayout: ymaps.templateLayoutFactory.createClass('<div style="height:34px;width:35px;background: url(/f/min/images/airplane.png);margin: 0px 0px 0px -17px;"></div>')
                         });

                         // Редактируем контекстное меню, вершин ломаной. Получаем значения 'id' стандартных пунктов меню.
                         myGeoObject.editor.options.set({
                          menuManager:function(editorItems, model){
                            //console.log(editorItems);
                            //console.log(model);
                            for(var i=0; i<editorItems.length; i++){
                            console.log(editorItems[i].id);
                            //if(editorItems[i].id==='removeVertex') editorItems[i].title='Удалить вершину';
                            if(editorItems[i].id==='startDrawing') editorItems[i].title='Продолжить маршрут';
                            if(editorItems[i].id==='stopDrawing') editorItems[i].title='Завершить маршрут';
                            //if(editorItems[i].id==='addInterior') editorItems.splice(i, 1);
                            }
                            // Если выбран пункт "Удалить", заменяем его 'title', на "Удалить метку". Переопределяем функцию обработчик, по событию 'onClick'. Делаем перерасчет длины ломаной авиамаршрута.
                            if(editorItems[0].id==='removeVertex'){
                              editorItems[0].title='Удалить метку';

                              editorItems[0].onClick = function() {
                              // Очищаем блок данных маршрута, справа от карты. Для обновления информации в нем, по каждому клику "Удалить вершину".
                              $(".route-length1").empty();
                              // закрываем открытые балуны на карте
                              myMap.balloon.close();
                              // Определяем индекс удаляемой вершины
                              var vertexIndex = model.getIndex();
                              //console.log(vertexIndex);
                              // Удаляем вершину по полученному индексу.
                              //myGeoObject.geometry.splice(myGeoObject.geometry.getLength() - 1, 1); // удаление последней вершины ломаной
                              myGeoObject.geometry.remove(vertexIndex);
                              //editorItems[0].onClick = function(event) {
                              //event = event || window.event;
                              //var target = event.target || event.srcElement; // (1 корневой элемент на котором произошло событие)
                              //if(target == this){
                              // узнаем тип системы координат
                              var coordSystem_1 = myMap.options.get('projection').getCoordSystem(),
                              distance_aero_length_1 = 0;
                              // // получаем массив пиксельных данных модели ломаной, из объекта-обещания
                              model_point = myGeoObject.editor.getModel().getPixels();
                              // получаем из глобальных пикс. координат, гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                              for(var w = 0, d = model_point.length; w < d; w++) {
                                model_point_coord[w] = myMap.options.get('projection').fromGlobalPixels(model_point[w], myMap.getZoom());
			                  }

                              // Удаление из массивов 'geo_points' и 'point_geo', содержащих информацию о точках маршрута, метки маршрута по ее индексу. Удаленной с карты по кнопке "Удалить", в контекстном меню выршины.
                              // Удаление из массива 'geo_points', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete geo_points[vertexIndex];
                              // Пересчет длины массива 'geo_points', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              geo_points.slice(0, geo_points.length-1);
                              // Удаление из массива 'point_geo', удаленной с карты точки, с индексом 'vertexIndex'.
                              delete point_geo[vertexIndex];
                              // Пересчет длины массива 'point_geo', и смещения его индексов, после удаления выбранной метки маршрута. Чтобы в нем не оставалось пустых значений "undefined".
                              point_geo.slice(0, point_geo.length-1);

                              //console.log('init object', geo_points);
                              //console.log('init object', point_geo);
                              // Вывод обновленных значений массива 'point_geo', в блоке справа от карты.
                              $(".route-length2").empty();
                              $(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');

                              // вычисляем общую длину ломаной, через кол-во ее точек
                              for (var f = 0, n = myGeoObject.geometry.getLength() - 1; f < n; f++) {
                                distance_aero_length_1 += Math.round(coordSystem_1.getDistance(model_point_coord[f], model_point_coord[f + 1]))/1000;
                              }
                              // округленное, общее расстояние ломаной авиамаршрута
                              var distance_aero_main_1 = Math.ceil(distance_aero_length_1);
                              //console.log(model.geometry.getCoordinates(), model.getPixels());
                              //console.log(myGeoObject.editor.getModel().getVertexModels());
                              //console.log('Расстояние авиаперелета:' + distance_aero_main_1 + 'км');

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

                              $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main_1 + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main_1 +' км.</small>');
                              $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                              $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main_1 + ' км.</small>');

                            //}
                            //}
                            };
                            }
                            //Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
                            editorItems.push({
                              id: "routedelete",
                              title: "Удалить маршрут",
                              onClick: function () {
                              // Очищаем блоки данных, с информацией по авиамаршруту. При нажатии на кнопку "Удалить маршрут". В контекстном меню метки.
                              $(".route-length1").empty();
                              $(".route-length2").empty();
                              $(".route-length_fuel").empty();
                              $(".route-length_travel").empty();
                              $(".route-length_route").empty();
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
                              // устанавливаем после удаления маршрута, новый центр и zoom карты.
                              myMap.setCenter([55.752078, 37.621147], 8);
                            }
                            });
                          return editorItems;
                          },

                         });

                         // создаем монитор, отслеживающий включение режима рисования, новой вершины ломаной.
                         var stateMonitor = new ymaps.Monitor(myGeoObject.editor.state);

                         // Начинаем наблюдать за изменением поля 'drawing', при начале рисования/добавления новой вершины ломаной. В редакторе вершин. При совершении события, вычисляем длину авиамаршрута, выводим ее в консоль.
                         stateMonitor.add("drawing", function (newValue, oldValue) {
                           // получаем массив пиксельных координат, моделей вершин ломаной
                           model_point1 = myGeoObject.editor.getModel().getPixels();

                           // получаем массив гео координат, моделей вершин ломаной
                           for(var j = 0, k = model_point1.length; j < k; j++) {
                              model_point_coord[j] = myMap.options.get('projection').fromGlobalPixels(model_point1[j], myMap.getZoom());
                              //point_aero[j] = myMap.options.get('projection').fromGlobalPixels(model_point1[j], myMap.getZoom());
			               }
                           // вычисляем общую длину ломаной, через кол-во ее точек
                           for (var w = 0, d = myGeoObject.geometry.getLength() - 1; w < d; w++) {
                              distance_aero_length += Math.round(coordSystem.getDistance(model_point_coord[w], model_point_coord[w + 1]))/1000;
                           }

                           // Округленное, общее расстояние ломаной авиамаршрута. Делим на 2, т.к. при включении режима рисования вершины(изменение myGeoObject.editor.state).
                           // Будет браться уже подсчитанное до этого расстояние, при перетягивании меток из тулбара, и умножаться на 2.
                           var distance_aero_main = Math.ceil(distance_aero_length)/2 + 'км';
                           //console.log('init object', distance_aero_main);
                           //console.log('init object', myGeoObject.editorMenuManager);
                         });

                         // Добавляем линию авиамаршрута на карту.
                         myMap.geoObjects.add(myGeoObject);

                         // Включаем режим редактирования ломаной.
                         myGeoObject.editor.startEditing();
                         // Включаем режим добавления новых вершин в ломаную линию.
                         //myGeoObject.editor.startDrawing();

                         // получаем значение поля 'drawing' редактора. Для передачи его в отслеживающий монитор 'stateMonitor'.
                         myGeoObject.editor.state.get('drawing');

                         // Отслеживаем событие добавления новой вершины ломаной, через редактор контекстного меню
                         myGeoObject.editor.events.add(["vertexadd", "vertexdragend"], function () {
                           $(".route-length1").empty();
                           // узнаем тип системы координат
                           var coordSystem_2 = myMap.options.get('projection').getCoordSystem(),
                           distance_aero_length_2 = 0;
                           // получаем массив пиксельных координат, моделей вершин ломаной
                           model_point1 = myGeoObject.editor.getModel().getPixels();
                           // переводим глобальные пикс. координаты, в гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                           for(var i = 0, l = model_point1.length; i < l; i++) {
                             model_point_coord[i] = myMap.options.get('projection').fromGlobalPixels(model_point1[i], myMap.getZoom());
                             //point_aero[i] = myMap.options.get('projection').fromGlobalPixels(model_point1[i], myMap.getZoom());
			               }

                           //СОЗДАЕМ МЕХАНИЗМ ОПРЕДЕЛЕНИЯ БЛИЖ. АЭРОПОРТА К ДОБАВЛЕННОЙ ВЕРШИНЕ ЛОМАНОЙ. И ГЕОКОДИРОВАНИЯ ПОЛУЧЕННЫХ ТОЧЕК ВЕРШИН. В РЕЖИМЕ РЕДАКТИРОВАНИЯ ЛОМАНОЙ ПО СОБЫТИЮ 'VERTEXADD'.
                           var lastItem = model_point_coord[model_point_coord.length-1];
                           //console.log(lastItem);
                           // Находим ближайший объект(аэропорт) из геоколлекции myCollection. К выбранной вершине.
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
                           // перебираем информацию по каждой отдельной точке и присваиваем ее индексу point_geo[i]. Далее используя point_geo, выводим информацию по каждой точке маршрута, в блоке "Все точки авиамаршрута:".
                           for(var i = 0, l = geo_points.length; i < l; i++) {
                             // два варианта нахождения последнего символа, в строке описания каждой точки маршрута
                             // var point_geo_l = geo_points[i].slice(0, -1);
                             // var point_geo_l = geo_points[i].substring(0, geo_points[i].length - 1);
				             point_geo[i] = '<br />&bull; ' + geo_points[i];
                             //console.log('init object', point_geo[i]);
                             //console.log('init object', geo_points);
			                }

                            // Фильтрация данных массива 'point_geo' с точками о местах маршрута. Убираем из него undefined и null.
                            point_geo = point_geo.filter(function(x) { return x !== "<br />&bull; undefined" && x !== null; });

                            // Вывод обновленных значений массива 'point_geo', в блоке справа от карты.
                            //console.log('init object', geo_points.length);
                            //console.log('init object', point_geo.filter(function(x) { return x !== "<br />&bull; undefined" && x !== null; }));
                            $(".route-length2").empty();
                            $(".route-length2").append('<h3>Все точки авиамаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');
                            });

                           //$(".route-length2").empty();
                           //$(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');

                           // устанавливаем приближение карты, равное 5.
                           myMap.setZoom(5);
                           // добавляем новую метку на карту, с координатами ближайшего аэропорта.
                           myMap.geoObjects.add(createPlacemark(coord_aero_main, options));
                           // делаем ее невидимой. Чтобы метка была заменена на значок вершины ломаной авиамаршрута.
                           placemark.options.set('visible', false);
                           // добавляем выбранные точки в массив distance_aero
                           distance_aero.push(placemark);
                           for(var q = 0, a = distance_aero.length; q < a; q++) {
                              // получаем их координаты, для дальнейшего использования в построении ломаной авиамаршрута
			            	  point_aero[q] = distance_aero[q].geometry.getCoordinates();
			               }
                           //ЗАВЕРШЕНИЕ МЕХАНИЗМА ОПРЕДЕЛЕНИЯ БЛИЖ. АЭРОПОРТА К ДОБАВЛЕННОЙ ВЕРШИНЕ ЛОМАНОЙ. И ГЕОКОДИРОВАНИЯ ПОЛУЧЕННЫХ ТОЧЕК ВЕРШИН. В РЕЖИМЕ РЕДАКТИРОВАНИЯ ЛОМАНОЙ ПО СОБЫТИЮ 'VERTEXADD'.


                           //console.log(model_point_coord);
                           // вычисляем общую длину ломаной, через кол-во ее точек
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

                          $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main_2 + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main_2 +' км.</small>');
                          $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                          $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main_2 + ' км.</small>');
                          //$(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -28px 0 0 15px; text-align: left; line-height: 1.8"><strong style="font-size: 12px !important;">' + point_geo + '.</strong></div></h3>');
                          //console.log('Расстояние авиаперелета!:' + distance_aero_main_2 + 'км');
                          //console.log('Расстояние авиаперелета - примерно ...км');
                          //console.log(model_point_coord);
                         });

                         if(point_aero.length > 1){
                          // Устанавливаем центр и масштаб карты так, чтобы отобразить всю прямую авиамаршрута целиком. Устанавливаем на карте границы линии авиамаршрута.
                          myMap.setBounds(myGeoObject.geometry.getBounds());
                         }

                         // создаем механизм получения длины всей ломаной маршрута
                         // узнаем тип системы координат
                         var coordSystem = myMap.options.get('projection').getCoordSystem(),
                         distance_aero_length = 0;
                         /*
                         // вычисляем общую длину ломаной, через кол-во ее точек
                         for (var j = 0, k = myGeoObject.geometry.getLength() - 1; j < k; j++) {
                           distance_aero_length += Math.round(coordSystem.getDistance(point_aero[j], point_aero[j + 1]))/1000;
                         }

                         // общее расстояние ломаной авиамаршрута
                         var distance_aero_main = distance_aero_length.toFixed(0);
                         */

                         // получаем массив пиксельных координат, моделей вершин ломаной
                         model_point1 = myGeoObject.editor.getModel().getPixels();
                         // переводим глобальные пикс. координаты, в гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута

                         /*
                         // получаем массив пиксельных координат, моделей вершин ломаной
                         myGeoObject.events.add("geometrychange", function (event) {
                            model_point2 = myGeoObject.editor.getModel().getPixels();
                            //console.log('init object', model_point2);
                         }, this);
                         console.log('init object', model_point2);
                         */

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
                          // Проверяем события: изменения состояния редактора ломаной и изменения в опциях геообъекта. На основе его изменяем информацию в блоке справа от карты. Пока под вопросом..?
                          //myGeoObject.editor.events.add(["optionschange", "statechange"], function () {
                          // Очищаем данные после каждого совершения событий.
                          $(".route-length1").empty();
                          $(".route-length1").append('<h3>Расстояние авиаперелета: <strong>' + distance_aero_main + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_aero_main +' км.</small>');
                          $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
                          $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При перелете на выбранную дистанцию ' + distance_aero_main + ' км.</small>');
                        //});
                        }
                         /*
                         // Отслеживаем событие изменения геометрии всей ломаной авиамаршрута. При удалении вершин.
                         myGeoObject.events.add("geometrychange", function () {
                           // узнаем тип системы координат
                           var coordSystem_3 = myMap.options.get('projection').getCoordSystem(),
                           distance_aero_length_3 = 0;
                           // получаем массив пиксельных координат, моделей вершин ломаной
                           model_point2 = myGeoObject.editor.getModel().getPixels();
                           // переводим глобальные пикс. координаты, в гео координаты, для дальнейшего их использования в построении ломаной авиамаршрута
                           for(var i = 0, l = model_point2.length; i < l; i++) {
                             model_point_coord[i] = myMap.options.get('projection').fromGlobalPixels(model_point2[i], myMap.getZoom());
			               }
                           // вычисляем общую длину ломаной, через кол-во ее точек
                           for (var b = 0, v = myGeoObject.geometry.getLength() - 1; b < v; b++) {
                             distance_aero_length_3 += Math.round(coordSystem_3.getDistance(model_point_coord[b], model_point_coord[b + 1]))/1000;
                           }
                           // округленное, общее расстояние ломаной авиамаршрута
                           var distance_aero_main_3 = Math.ceil(distance_aero_length_3);
                           console.log('Расстояние авиаперелета!:' + distance_aero_main_3 + 'км');
                           //console.log('Расстояние авиаперелета - примерно ...км');
                           //console.log(model_point_coord);
                         });
                         */

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

                         //console.log('init object', markers.length);
                         // Перед построением нового маршрута проверяем, были ли уже проложены старые и удаляем их, если да.
                         if(route) myMap.geoObjects.remove(route);

                         // Перед построением маршрута, если в тулбаре выбран значок не 'самолетика', а 'машинки', проверяем выбраны ли все значения из выпадающего списка.

                           // Если не выбран тип топлива, добавляем в блок справа от карты предупреждающий текст.
                           if((typeof type_fuel == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                           // Или, если не выбран тип поездки, добавляем в блок справа от карты предупреждающий текст.
                           else if((typeof type_travel == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                           // Или, если не выбран тип маршрута, добавляем в блок справа от карты предупреждающий текст.
                           else if((typeof type_route == "undefined") && placemark.options.get('iconImageHref') != '/f/min/images/airplane.png')
                           {$(".route-length_fuel").append('<h3><small>Выберите пожалуйста все данные</small></h3>');}
                           // Если все селекторы выбраны, то начинаем строить маршрут, по двум первым, отмеченным точкам.
                         // Если все значения выбраны, начинаем исходя из них, строить автомаршрут.
                         else
                         {
                         ymaps.route(point, {
                            // Опции маршрутизатора
                            avoidTrafficJams: true, // строить маршрут с учетом пробок
                            mapStateAutoApply: true // автоматически позиционировать карту
                         }).then(function (router) {

                         // Если выбран значок не 'самолетика', очищаем блок для вывода данных.
                         if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                          $(".route-length1").empty();
                         }

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
                // ЗАКАНЧИВАЕМ ПРОКЛАДЫВАТЬ АВТОМАРШРУТ ПО ПЕРЕНЕСЕННЫМ МЕТКАМ ИЗ ТУЛБАРА

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

    // Геокодирование координат метки перенесенной из тулбара.
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

                            // если выбран значок не 'самолетик', в балуне первой метки, отмеченной на карте, выводим html-форму, с тремя списками select, с данными маршрута(типп: топлива, поездки, маршрута).
                            if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png') {
                            placemark.properties.set("balloonContentBody",
'<div id="menu">Прежде чем начать строить автомаршрут, выберите необходимые данные по нему. И после, перетащите следующую точку на карте.<br /><br /> <small style="color: #1D3B3B;">Выберите тип поездки по указанному маршруту:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" style="height: 20px" /></span><select name="travel_select" id="travel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Work">В рабочие дни, до работы</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/g27LNtBATnbpbUsxVjoEkRgLDdQ.png" value="Dacha">В выходные дни, до дачи</option></select></div><div id="menu"> <small style="color: #1D3B3B;">Выберите тип маршрута:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" style="height: 20px" /></span><select name="route_select" id="route_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Сonversely">Туда и обратно</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/5GcLGXMVoNYUF6dEyopffU2WsMw.png" value="Forwards">Только в одну сторону</option></select></div><small style="color: #1D3B3B;">Выберите тип топлива вашего автомобиля:</small></div><div class="input-prepend"><span class="add-on"><img src="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" style="height: 20px" /></span><select name="fuel_select" id="fuel_select" class="span2" style="width: 211px !important;"><option data-path="" value="">...</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Gazoline">Бензин</option><option data-path="https://yastatic.net/doccenter/images/tech-ru/maps/doc/freeze/pVcsNFLAjNAt-xM_b5tqoqwkG2Y.png" value="Diesel">Дизель</option></select></div><div id="menu">');
                            }
                            //console.log('init object', markers.length);
                            // Если выбран значок не 'самолетик', а 'машинка', обрабатываем данные из формы балуна первой точки, по автомаршрутизации.
                            if(placemark.options.get('iconImageHref') != '/f/min/images/airplane.png'){
                            if(markers.length == 1)
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

    // ПОСТРОЕНИЕ АВТОМАРШРУТА ПО КЛИКАМ, ПО КАРТЕ
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

             //console.log('init object', markers.length);
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

             //console.log('init object', type_fuel);

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
    // ЗАВЕРШЕНИЕ ПОСТРОЕНИЯ АВТОМАРШРУТА ПО КЛИКАМ, ПО КАРТЕ


      //Удаление маршрута, геокодированной коллекции координат и добавленных меток, с карты и очистка данных.
        button1.click(function () {
        // Выключаем редактор маршрута.
        //route.editor.stop();

         route && myMap.geoObjects.remove(route);
		 for(var i = 0, l = markers.length; i < l; i++) {
		     myMap.geoObjects.remove(markers[i]);
		 }

         // Удаление всех точек авиамаршрута, добавленных в массив distance_aero.
         for(var j = 0, h = distance_aero.length; j < h; j++) {
		   myMap.geoObjects.remove(distance_aero[j]);
		 }
         // обнуляем переменную счетчик меток и массивы.
		 markers = [];
         //console.log('init object', markers.length);
		 point = [];
         geo_points = [];
         point_geo = [];
         distance_aero = [];
         point_aero = [];
         ch = 1;
         coord_aero = 0;
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
         // устанавливаем после удаления маршрута, новый центр и zoom карты.
         myMap.setCenter([55.752078, 37.621147], 8);
         // удаление ломаной авиамаршрута с карты
         var result1 = myMap.geoObjects.remove(myGeoObject);
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