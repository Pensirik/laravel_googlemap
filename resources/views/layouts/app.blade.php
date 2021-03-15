<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <meta http-equiv='cache-control' content='no-cache'>
    <meta http-equiv='expires' content='0'>
    <meta http-equiv='pragma' content='no-cache'>

    <title>Find Restaurants</title>
    
    <link rel="icon" type="image/png" href="favicon-16x16.png" sizes="16x16" />

    <link rel="stylesheet" href="./css/bootstrap.min.css">
    <link rel="stylesheet" href="./css/jquery.ui.css">
    <link rel="stylesheet" href="./css/custom.css">
    <script src="./js/jquery.min.js"></script>
    <script src="./js/jquery.ui.js"></script>
    <script src="./js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
     <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>
</head>
<body scroll="no" style="overflow: hidden">
    @yield('content')
    <div class="panel panel-primary" id="layer">
        <!--start header-->
        @include('inc.menu')
        <!--end header-->
        @include('inc.panel')
    </div>
    @include('inc.stats')
    <script src="./js/api.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key={{ Config::get('googleapikey.GoogleAPIKey') }}&libraries=places&callback=initMap"
        async defer></script>
</body>
</html>