<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'ApisController@index');
Route::get('/getrestaurants', 'ApisController@getRestaurants');
Route::get('/getbytype/{lat}/{lng}/{type}', 'ApisController@getByType');
Route::get('/getbyspecific/{lat}/{lng}', 'ApisController@getBySpecific');
Route::get('/getplaces', 'ApisController@getPlaces');


