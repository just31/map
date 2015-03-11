<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xsl:stylesheet[ <!ENTITY % core SYSTEM "_entities.ent"> %core; ]>

<!--
 Copyright (c) Art. Lebedev | http://www.artlebedev.ru/
 Updated 2014-11-05 by Rie
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="main.xsl" />
  <xsl:output method="html" encoding="utf-8" indent="yes" omit-xml-declaration="yes" />

    <xsl:template match="/&root_element;">
    <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html></xsl:text>
        <xsl:call-template name="main_code_copyright" />
        <html>
            <head>
                <title>
                    <xsl:value-of select="&current_document;/window-title" />
                </title>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <link rel="stylesheet" href="/f/min/bootstrap/bootstrap.css"/>
                <link rel="stylesheet" href="/f/min/map/car.css"/>
                <script type="text/javascript" src="/f/min/main.build.js"></script>
                <script type="text/javascript" src="/f/min/bootstrap/bootstrap.js"></script>
                <style type="text/css">
                  @font-face {
                    font-family: OpenSans-Regular; /* Гарнитура шрифта */
                    src: url(http://intranet.russiancarbon.org/f/min/map/OpenSans-Regular.ttf); /* Путь к файлу со шрифтом */
                  }
                  body {
                    background-color: #333;
                    color: #fff;
                    text-align: justify;
                    text-shadow: 0 1px 1px rgba(0,0,0,.1);
                  }
                  h1 {margin-left: 10px !important; font-size: 24px; font-family: OpenSans-Regular; color: #B0BEA4;}
                  .main {
                    margin-left: 10px;
                  }
                  .main p {margin: 5px 0 -5px 0; font-family: OpenSans-Regular;}
                  .route-length1 {
                     text-align: left;
                     font-size: 15px; color: Grey !important;
                     font-family: Verdana;
                     margin: -5px 0 0 10px;
                  }
                  .route-length1 strong {font-size: 12px; color: #ddb505;}
                  .route-length1 h3 {font-size: 13px;}
                  .route-length_travel {
                     text-align: left;
                     font-size: 15px; color: Grey !important;
                     font-family: Verdana;
                     margin: -5px 0 0 10px;
                  }
                  .route-length_travel strong {font-size: 12px; color: #ddb505;}
                  .route-length_travel h3 {font-size: 13px;}
                  .route-length_route {
                     text-align: left;
                     font-size: 15px; color: Grey !important;
                     font-family: Verdana;
                     margin: -15px 0 0 10px;
                  }
                  .route-length_route strong {font-size: 12px; color: #ddb505;}
                  .route-length_route h3 {font-size: 13px;}
                  .route-length_fuel {
                     text-align: left;
                     font-size: 15px; color: Grey !important;
                     font-family: Verdana;
                     margin: -15px 0 0 10px;
                  }
                  .route-length_fuel strong {font-size: 12px; color: #ddb505;}
                  .route-length_fuel h3 {font-size: 13px;}
                  .head_info {font-size: 16px; text-align: left; color: #B0BEA4; font-family: OpenSans-Regular; margin-left: 10px !important;}
                  .route-length2 {
                     text-align: justify;
                     font-size: 14px; color: Grey !important;
                     font-family: Verdana;
                  }
                  .route-length2 h3 {font-size: 13px; color: color: #FEFFF9;}
                  .route-length2 strong {font-size: 11px; color: #ddb505; font-weight: normal;}
                  .route-modal-length {
                     text-align: left;
                     font-size: 15px; color: Grey !important;
                     font-family: Verdana;
                     margin: -5px 0 0 10px;
                  }
                  .content_map3 {
                     margin: -10px 0 0 0;
                     overflow:hidden;
                     border: 0px solid #E8CCA3;
                     text-align: justify;
                     background-color: #65757b;
                     padding: 10px;
                     border-radius: 2px;
                     font-size: 16px;
                     color: #FEFFF9 !important;
                     width: auto;
                  }
                  #map_main {
                     width: 100%;
                     height: 890px;
                     margin-top: 7px; ]
                     margin-right: 5px;
                     background-color: #eee;
                     border-radius: 7px;
                     padding: 5px;
                  }
                  #marker_main{
                     margin: 0;
                     padding: 0;
                  }
                  .button{
                     height:30px;
                     border-color: #ECEEC9;
                     border-style:solid;
                     border-width:1px;
                     background:#B22222;
                     cursor:pointer;
                     color: white;
                     -moz-border-radius:  5px; /* Firefox */
                     -webkit-border-radius:  5px; /* Safari 4 */
                     border-radius:  5px; /* IE 9, Safari 5, Chrome */
                  }
                  .submit {
	                 width: 90px;
                     height: 90px;
	                 padding: 0 0 2px;
                     margin-bottom: 5px;
	                 font: 16px "Trebuchet MS", Tahoma, Arial, sans-serif;
	                 outline: none;
	                 position: relative;
	                 cursor: pointer;
	                 border-radius: 100px;
	                 color: #913944;
	                 border: 1px solid #D16573;
	                 border-top: 1px solid #EE8090;
	                 border-bottom: 1px solid #B84D5A;
	                 text-shadow: 1px 1px #F9A0AD;
	                 box-shadow:
		                 inset 0 1px #FBC1D0,
		                 inset 1px 0 #F99AAB,
		                 inset -1px 0 #F99AAB,
		                 inset 0 -1px #F68391,
		                 0 4px #CB5462,
		                 0 5px #B84D5A,
		                 0 6px 4px rgba(0,0,0,0.4)
	                 ;
	                 background: -moz-linear-gradient(top,  #f997b0 0%, #f56778 100%); /* FF3.6+ */
                     background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#f997b0), color-stop(100%,#f56778)); /* Chrome,Safari4+ */
                     background: -webkit-linear-gradient(top,  #f997b0 0%,#f56778 100%); /* Chrome10+,Safari5.1+ */
	                 background: -o-linear-gradient(top,  #f997b0 0%,#f56778 100%); /* Opera 11.10+ */
	                 background: -ms-linear-gradient(top,  #f997b0 0%,#f56778 100%); /* IE10+ */
	                 background: linear-gradient(top,  #f997b0 0%,#f56778 100%); /* W3C */
	                 filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f997b0', endColorstr='#f56778',GradientType=0 ); /* IE6-9 */
	                 background-color: #F77E94;
                  }
                  .submit::-moz-focus-inner{border:0}
                     .submit:hover {
	                 border-top: 1px solid #E26272;
	                 box-shadow:
		                 inset 0 1px #F9AAB5,
		                 inset 1px 0 #F99AAB,
		                 inset -1px 0 #F99AAB,
		                 inset 0 -1px #F99BAC,
		                 0 2px #CB5462,
		                 0 3px #B84D5A,
		                 0 4px 2px rgba(0,0,0,0.4)
	                 ;
                     top: 2px;
                  }
                  .submit:active {
	                 top: 6px;
	                 border: 1px solid #C13345;
	                 border-top: 0px solid #A14753;
	                 border-bottom: 0px solid #DA6070;
	                 background: #F56C7E;
	                 box-shadow: inset 0 0 0 #C13345;
                  }
                  }
                  #content_map1 {
                     margin: -10px 0 0 0; overflow:hidden; border: 0px solid #E8CCA3;
                     text-align: justify; background-color: @carbon-gray;
                     padding: 10px; border-radius: 2px; font-size: 13px; color: #000000 !important;
                  }
                  #content_map1 strong {font-size: 14px; color: @carbon-orange;}
                  .toolbar{width:100% !important;}
                  .toolbar td, th {
                     padding: 0px;
                     border: 1px solid #333;
                  }
                  table {
                     width: 100%;

                     margin: 0 0 5px 0;
                  }
                  tr, td, th {
                     padding: 0px;
                     border: 1px solid #333;
                  }
                  .result-co2 p {
                     font-family: OpenSans-Regular;
                     font-size: 24px;
                     color: #B0BEA4;
                     margin-right: 5px;
                  }
                  .result-co2 small{
                     font-size: 14px;
                  }
                  .row-fluid{
                     margin-left: 5px !important;
                  }
                </style>
            </head>
            <body>
                <h1>
                    <xsl:call-template name="main_h1" />
                </h1>
                <xsl:apply-templates select="&content;/map_main/node()" mode="html" />
            </body>
        </html>

    </xsl:template>


</xsl:stylesheet>
