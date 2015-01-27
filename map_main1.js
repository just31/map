/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-08-18 by dryzhov (Ryzhov Dmitry) */

define('map_main1', ['jquery', 'als'], function ($, als) {
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
    require(['http://webmap-blog.ru/examples/add-users-ymapsapi2/js/bootstrap.min.js']);
    require(['http://intranet.russiancarbon.org/f/min/drag-scroll-behavior.js']);
    // Сделаем броузеры ES5 friendly текущему.
    require(['http://intranet.russiancarbon.org/f/min/es5-shim.js']);
    // Файлы для множественного геокодирования координат в адреса. Нужны для геокодирования массивов с точками автомаршрута, первого вида маршрутизации.
    require(['http://intranet.russiancarbon.org/f/min/multi-geocoder.js']);
    require(['http://dimik.github.io/ymaps/examples/multi-geocoder/list-collection.js']);
  };

  Map.prototype.createMap = function () {

    var route, icon, distance, myGeoObject, placemark, visibleObjects, mGeocoder, geoObjects_coll, firstGeoObject_1, ballon_aero, result, ch = 1;
	var markers = [];
    var markers_1 = [];
	var point = [];
    var geo_points = [];
    var point_geo = [];
    var distance_aero = [];
    var point_aero = [];
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
    button = $('#editor'),
    button1 = $('#delete'),
    button2 = $('#editor1'),
    button3 = $('#delete1'),
    // DOM-контейнер карты. Начало функционала перетаскивания картинок из тулбара, на карту. Продолжение функционала перетаскивания, начинается ниже в коде со строки: ymaps.behavior.storage.add('dragScroll', DragScrollBehavior);
    // После определения myMap и добавления геоколлекции аэропортов на карту.
    $mapContainer = $(this.yMap.container.getElement());

    // Сохраняем значение this.yMap в переменнную myMap. Чтобы передать ее значение в функции скрипта.
    // Иначе this.yMap, не будет доступен внутри них.
    myMap = this.yMap;

    // Изменяем свойство поведения с помощью опции:
    // изменение масштаба колесом прокрутки будет происходить медленно,
    // на 1/2 уровня масштабирования в секунду.
    // myMap.options.set('scrollZoomSpeed', 0.5);

    // Добавляем геоколллекцию меток аэропортов на карту
    // Создание пустой геоколллекции myCollection, для добавления в нее списка аэропортов из файла aero1.csv.
    myCollection = new ymaps.GeoObjectCollection();
    /*
    // список аэропортов России
    var path = 'http://intranet.russiancarbon.org/f/min/aero1.csv';
    */
    // список аэропортов Мира
    var path = 'http://intranet.russiancarbon.org/f/min/aero3.csv';
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
                        // не работает в FF =) поэтому делаем return false вконце
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
                                'visible': true
                            };

                        // Создаем метку и добавляем ее на карту.
                        if(markers_1.length < 100)
			            {
                         // добавляем основную метку на карту
                         myMap.geoObjects.add(createPlacemark(coordinates, options));
                         // делаем ее видимой
                         placemark.options.set('visible', true);
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
                         // делаем ее видимой
                         placemark.options.set('visible', true);
                         // добавляем выбранные точки в массив distance_aero
                         distance_aero.push(placemark);
                         for(var i = 0, l = distance_aero.length; i < l; i++) {
                            // получаем их координаты, для дальнейшего использования в построении ломаной авиамаршрута
			            	point_aero[i] = distance_aero[i].geometry.getCoordinates();
			             }
                         // console.log('init object', point_aero);

                         // в балуне показываем координаты новой метки
                         ymaps.geocode(coord_aero_main).then(function (res) {
                           firstGeoObject_1 = res.geoObjects.get(0);
                           var firstGeoObject_text_1 = firstGeoObject_1.properties.get('text');
                           // собираем информацию о точках авиамаршрута, добавленного по картинкам из тулбара.
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
                           //placemark.properties.set('balloonContentBody', firstGeoObject_text_1);
                           placemark.properties
                           .set({
                             balloonContent: firstGeoObject_text_1
                           });
                         });
                         //placemark.properties.set('balloonContentBody', coord_aero);
                         }
                         // добавляем новые метки по всем маршрутам в массив markers_1.
                         markers_1.push(placemark);
                         // Выключаем скролл карты при перетаскивании.
                         ymaps.behavior.storage.remove('dragScroll', DragScrollBehavior);
                         myMap.behaviors.disable('dragScroll');
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
                            placemark.properties.set('balloonContentBody', text);
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
             myPlacemark = new ymaps.Placemark([position[0].toPrecision(6), position[1].toPrecision(6)], {
                    // Свойства
                    // Текст метки
                    iconContent: ch
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#carIcon',
                    // Метку можно перемещать.
                    draggable: true
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
             myPlacemark.properties.set('balloonContentBody', firstGeoObject_text);
             });
    }, this);

    //Прокладываем маршрут по отмеченным точкам(Вариант1):
    button.click(function () {
		for(var i = 0, l = markers.length; i < l; i++) {
				point[i] = markers[i].geometry.getCoordinates();
			}
            ymaps.route(point, {
                // Опции маршрутизатора
                avoidTrafficJams: true, // строить маршрут с учетом пробок
                mapStateAutoApply: true // автоматически позиционировать карту
            }).then(function (router) {

              route = router;
              myMap.geoObjects.add(route);

              // С помощью метода getWayPoints() получаем массив точек маршрута
              var points = route.getWayPoints();
              points.options.set('visible', false);

              // Множественное геокодирование точек автомаршрута, координат в адреса:
              mGeocoder = new MultiGeocoder({ boundedBy : myMap.getBounds() });
              // Геокодирование массива координат.
              mGeocoder.geocode(point)
              .then(function (res) {
              // Асинхронно получаем коллекцию найденных геообъектов.
              // Перебираем все полученные точки автомаршрута.
              res.geoObjects.each(function (geoObject) {
                // Находим и устанавливаем свойство значка для маршрута, ввиде машинки.
                geoObject.options.set('preset', 'twirl#carIcon');
              });
              // Добавляем полученную коллекцию геокодированных точек маршрута, на карту.
              myMap.geoObjects.add(res.geoObjects);
              // Присваиваем полученную коллекцию, переменной - geoObjects_coll. Для дальнейшего ее использования, при удалении коллекции. По кнопке "Очистить маршрут по картинкам".
              geoObjects_coll = res.geoObjects;
              },
              function (err) {
                console.log(err);
              });

              //console.log('init object', mGeocoder);

              // Задаем стиль метки - иконки будут красного цвета, и
              // их изображения будут растягиваться под контент
              points.options.set('preset', 'twirl#carIcon');
              //points.get(0).properties.set('balloonContentBody', 'Точка отправления');
              //points.get(1).properties.set('balloonContentBody', 'Точка прибытия');

              // Задаем контент меток в начальной и конечной точках
              //points.get(0).properties.set('iconContent', 'Точка отправления');
              //points.get(1).properties.set('iconContent', 'Точка прибытия');

              // длина маршрута в м
              var way_m = route.getLength();
              // округленная длина маршрута, без цифр, после запятой
              var way_m_1 = way_m.toFixed(0);

              var way_m_car = (way_m_1 * 2 * 22 * 12)/1000; // получения значения пробега за год. Если маршрут используется для поездок на работу, в км.
              var way_m_car_1 = way_m_car.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

              var way_m_home = (way_m_1 * 2 * 14)/1000; // получения значения пробега за год. Если маршрут используется для поездок на дачу, в км.
              var way_m_home_1 = way_m_home.toFixed(0); // округление пробега, до 0 цифр после запяфтой.

              //формула вычисления углеродного следа, при поездке на машине
              var k_diesel = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
              var k_gasoline = 0.002664; //количество тонн со2 на 1 кг газового топлива

              var p_diesel = 0.84; //плотность дизельного топлива
              var p_gasoline = 0.71; //плотность газового топлива

              var a = 10,
              b = way_m_1;

              var m_diesel = (b/100*a)*p_diesel; //масса дизельного топлива
              var m_gasoline = (b/100*a)*p_gasoline; //масса газового топлива

              var co_auto_diesel = m_diesel*k_diesel; //углеродный след, дизельное топливо
              // округляем значение до одного знака после запятой
              var co_auto_1_diesel = co_auto_diesel.toFixed(1);

              var co_auto_gasoline = m_gasoline*k_gasoline; //углеродный след, газовое топливо
              // округляем значение до одного знака после запятой
              var co_auto_1_gasoline = co_auto_gasoline.toFixed(1);

              $(".route-length1").append('<H2>Автомаршрут:</H2> <strong>');
              $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength()+ '</strong></h3>');
			  $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
              $(".route-length1").append('<h3>Углеродный след составит:</h3> Если Вы используете дизельное топливо - <strong>' + co_auto_1_diesel + ' кгСО2/л.</strong><br />Если Вы используете бензин - <strong>' + co_auto_1_gasoline + ' кгСО2/л.</strong><br /><br />');

              $(".route-length1").append('Если указанный маршрут используется для поездок на работу, то за год вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong><br />');
              $(".route-length1").append('Если указанный маршрут используется для поездок на дачу, то в дачный сезон вы проедете примерно: <strong>' + way_m_home_1 + ' км</strong><br /><br />');
              $(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');

            }, function (error) {
                alert("Возникла ошибка: " + error.message);
            }, this);
   }
   );

   //Удаление маршрута, геокодированной коллекции координат и добавленных меток, с карты и очистка данных.
        button1.click(function () {
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

   //Прокладываем маршрут по перемещенным из тулбрара меткам(Вариант2):
   button2.click(function () {
		for(var i = 0, l = markers_1.length; i < l; i++) {
				point[i] = markers_1[i].geometry.getCoordinates();
			}

            ymaps.route(point, {
                // Опции маршрутизатора
                avoidTrafficJams: true, // строить маршрут с учетом пробок
                mapStateAutoApply: true // автоматически позиционировать карту
            }).then(function (router) {

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
             //если выбраны картинки: машинки или домика
             //прокладываем обычный маршрут по дорогам
             if (placemark.options.get('iconImageHref') == '/f/min/images/car.png' || placemark.options.get('iconImageHref') == '/f/min/images/house.png'){
              myMap.geoObjects.add(route);

              // С помощью метода getWayPoints() получаем массив точек маршрута
              var points = route.getWayPoints();
              points.options.set('visible', false);

              //console.log('init object', points);

              // Задаем стиль метки - иконки будут красного цвета, и
              // их изображения будут растягиваться под контент
              points.options.set('preset', 'twirl#carIcon');
              // Задаем контент меток в начальной и конечной точках
              //points.get(0).properties.set('iconContent', 'Точка отправления');
              //points.get(1).properties.set('iconContent', 'Точка прибытия');

              //формула вычисления углеродного следа, при поездке на машине
              var k_diesel = 0.002322; //количество тонн со2 на 1 кг дизельного топлива
              var k_gasoline = 0.002664; //количество тонн со2 на 1 кг газового топлива

              var p_diesel = 0.84; //плотность дизельного топлива
              var p_gasoline = 0.71; //плотность газового топлива

              var a = 10,
              b = way_m_1;

              var m_diesel = (b/100*a)*p_diesel; //масса дизельного топлива
              var m_gasoline = (b/100*a)*p_gasoline; //масса газового топлива

              var co_auto_diesel = m_diesel*k_diesel; //углеродный след, дизельное топливо
              // округляем значение до одного знака после запятой
              var co_auto_1_diesel = co_auto_diesel.toFixed(1);

              var co_auto_gasoline = m_gasoline*k_gasoline; //углеродный след, газовое топливо
              // округляем значение до одного знака после запятой
              var co_auto_1_gasoline = co_auto_gasoline.toFixed(1);

              //$(".route-length1").append('В качестве конечной метки, выбрана картинка машинки. <strong><br /><br />');
              $(".route-length1").append('<H2>Автомаршрут:</H2> <strong>');
              $(".route-length1").append('<h3>Общая длина маршрута: <strong>' + route.getHumanLength()+ '</strong></h3>');
			  $(".route-length1").append('<h3>Время в пути: <strong>' + route.getHumanTime()+ '</strong></h3>');
              $(".route-length1").append('<h3>Углеродный след составит:</h3> Если Вы используете дизельное топливо - <strong>' + co_auto_1_diesel + ' кгСО2/л.</strong><br />Если Вы используете бензин - <strong>' + co_auto_1_gasoline + ' кгСО2/л.</strong><br /><br />');

              $(".route-length1").append('Если указанный маршрут используется для поездок на работу, то за год вы проедете примерно: <strong>' + way_m_car_1 + ' км</strong><br />');
              $(".route-length1").append('Если указанный маршрут используется для поездок на дачу, то в дачный сезон вы проедете примерно: <strong>' + way_m_home_1 + ' км</strong><br /><br />');
              $(".route-length2").append('<h3>Все точки автомаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');
             }

             //если выбрана картинка самолета
             // прокладываем авиамаршрут с помощью ломаной(прямой)
             if (placemark.options.get('iconImageHref') == '/f/min/images/airplane.png'){

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
                balloonContent: 'Авиамаршрут, общее расстояния: '+ distance_main +' км'
             }
             }, {
            // Задаем опции геообъекта.
            // Выключаем возможность перетаскивания ломаной.
            draggable: false,
            // Цвет линии.
            strokeColor: "#336699",
            // Ширина линии.
            strokeWidth: 5,
            }
            );
            // Добавляем линию авиамаршрута на карту.
            myMap.geoObjects.add(myGeoObject);

            // создаем механизм получения длины всей ломаной маршрута
            // узнаем тип системы координат
            var coordSystem = myMap.options.get('projection').getCoordSystem(),
            distance_aero = 0;
            // вычисляем общую длину ломаной, через кол-во ее точек
            for (var i = 0, k = myGeoObject.geometry.getLength() - 1; i < k; i++) {
              distance_aero += Math.round(coordSystem.getDistance(point_aero[i], point_aero[i + 1]))/1000;
            }

            //console.log(distance_aero.toFixed(0) + "км");

            // Удаление геоколлекции аэропортов(myCollection) с карты.
            //myMap.geoObjects.remove(myCollection);

            // Устанавливаем центр и масштаб карты так, чтобы отобразить всю прямую авиамаршрута целиком. Устанавливаем на карте границы линии авиамаршрута.
            myMap.setBounds(myGeoObject.geometry.getBounds());

             //var distance1;
             //var distance2;
             //var distance3;

             // получаем координаты первой точки авиамаршрута.
             var point_1 = point[0];

             // получаем значения широты и долготоы первой точки. Оставляем 4 знака после запятой в них.
             var point_1_lat = point[0][0];
             //var point_1_lat = point_1_lat_m.toFixed(4);
             var point_1_lon = point[0][1];
             //var point_1_lon = point_1_lon_m.toFixed(4);
             //console.log('init object', point_1_lon);

             // получаем координаты второй точки авиамаршрута.
             var point_2 = point[1];

             // получаем значения широты и долготоы второй точки. Оставляем 4 знака после запятой в них.
             var point_2_lat = point[1][0];
             //var point_2_lat = point_2_lat_m.toFixed(4);
             var point_2_lon = point[1][1];
             //var point_2_lon = point_2_lon_m.toFixed(4);

             // функция split разбиения строки, по разделителю ', '.
             //var point_1_1 = point_1.split(', ');
             //console.log('init object', point_1_1);

             // получаем координаты промежуточных точек для постройки авиамаршрута
             // получаем координаты третьей точки
             var point_3 = point[2];
             // если координаты получены, присваиваем их
             if((typeof point_3 != "undefined")) {
                point_3 = point[2];
                //point_2 = point_3;
                distance1 = Math.round(ymaps.coordSystem.geo.getDistance(point_2, point_3) / 1000);
             }
             else // если нет, присваиваем координаты предыдущей точки.
             {
                point_3 = point[1];
                distance1 = 0;
             }

             // то же самое делаем по двум другим промежуточным точкам ломаной авиамаршрута

             var point_4 = point[3];
             // если координаты получены, присваиваем их
             if((typeof point_4 != "undefined")) {
                point_4 = point[3];
                //point_2 = point_4;
                distance2 = Math.round(ymaps.coordSystem.geo.getDistance(point_3, point_4) / 1000);
             }
             else // если нет, присваиваем координаты предыдущей точки.
             {
                point_4 = point[1];
                distance2 = 0;
             }

             var point_5 = point[4];
             // если координаты получены, присваиваем их
             if((typeof point_5 != "undefined")) {
                point_5 = point[4];
                //point_2 = point_5;
                distance3 = Math.round(ymaps.coordSystem.geo.getDistance(point_4, point_5) / 1000);
             }
             else // если нет, присваиваем координаты предыдущей точки.
             {
                point_5 = point[1];
                distance3 = 0;
             }

              // перевести координаты в радианы
              var lat1 = point_1_lat * Math.PI / 180;
              var lat2 = point_2_lat * Math.PI / 180;
              var long1 = point_1_lon * Math.PI / 180;
              var long2 = point_2_lon * Math.PI / 180;

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

              var points_aero_num = myGeoObject.geometry.getLength();

              var ad = Math.atan2(y, x) * points_aero_num;

             // получение расстояния по прямой, между двумя выбранными точками на карте. Можно также использовать, для вычисления расстояния авиаперелета.
             //var distance_last = point_aero[point_aero.length-1];
             //console.log('init object', distance_last);
             //distance = Math.round(ymaps.coordSystem.geo.getDistance(point_aero[0], distance_last) / 1000);
             //distance = Math.round(ymaps.coordSystem.geo.getDistance(point_1, point_2) / 1000);

             // общее расстояние ломаной авиамаршрута
             var distance_main = distance_aero.toFixed(0);
             // var distance_main = distance + distance1 + distance2 + distance3;

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

             var num_people = 250;

             // основная формула вычисления следа:
             var co = (((distance_main_co/1000) * massa * 3.157) / 1000000)*1*2.7*num_people;
             // округляем значение до одной цифры, после запятой.
             var co_1 = co.toFixed(1);

             //формула перевода часов и десятичных долей часа, в часы, минуты и секунды
             var nTime = (distance_main/840)+0.5;
             nTime=Number(nTime);
	         nTime+=1/7200000;  //коррекция на половинку тысячной секунды

	         var h= Math.floor(nTime);
	         var mT=(nTime-h)*60;
	         var m=Math.floor(mT);
	         var s=((mT-m)*60);

             $(".route-length1").append('<H2>Выбран авиамаршрут</H2> <h3>Расстояние авиаперелета: <strong>' + distance_main + ' км.</strong></h3><small>Расстояние между выбранными точками, производится через вычисление длины большого круга(то есть это расстояние авиаперелета). Оно равно '+ distance_main +' км.</small>');
             $(".route-length1").append('<h3>Время авиаперелета: <strong>'+ h +'ч. ' + m +' мин.</strong></h3><small>Скорость самолета принята за 840 км/час. Приняты следующие допущения: учтены добавочные 15 минут на взлет и посадку, в среднем маршрут самолета длиннее расчетного на 10%.</small>');
             $(".route-length1").append('<h3>Длина углеродного следа: <strong>' + co_1 + ' кгСО2</strong> на одного пассажира.</h3><small>При полете на самолете, на выбранную дистанцию ' + distance_main + ' км.</small>');
             $(".route-length2").append('<h3>Все точки авиамаршрута: <div style="margin: -20px 0 0 15px;"><strong>' + point_geo + '.</strong></div></h3>');
            }
            //закончили прокладывание авиамаршрута

            }, function (error) {
                alert("Возникла ошибка: " + error.message);
            }, this);
   }
   );

   //Удаление маршрута и перемещенных меток, с карты и очистка данных.
   button3.click(function () {
         route && myMap.geoObjects.remove(route);
		 for(var i = 0, l = markers_1.length; i < l; i++) {
		     myMap.geoObjects.remove(markers_1[i]);
		 }
         // очищаем блок с данными построенного маршрута.
         $(".route-length1").empty();
         // очищаем блок с данными о всех точках перелета, по авиамаршруту.
         $(".route-length2").empty();
         // обнуляем переменную счетчик меток и массивы.
		 markers_1 = [];
		 point = [];
         geo_points = [];
         point_geo = [];
         distance_aero = [];
         point_aero = [];
         ch = 1;
         coord_aero = 0;
         // устанавливаем после удаления маршрута, новый центр и zoom карты
         myMap.setCenter([55.752078, 37.621147], 8);
         // удаление ломаной авиамаршрута с карты
         var result1 = myMap.geoObjects.remove(myGeoObject);
         // удаление меток аэропортов с карты, добавленных с помощью ymaps.geoQuery.
         // очищаем коллекцию
         var result2 = arPlacemarksRez.remove(myCollection);
         // удаляем метки с карты
         // пока закомментируем, чтобы метки коллекции всегда оставались на карте, при загрузке страницы. И можно было бы найти ближ. аэропорт к выбранной точке.
         //var result3 = arPlacemarksRez.removeFromMap(myMap);

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