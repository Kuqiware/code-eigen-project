<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\CompanyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['as' => 'api.'], function(){
    Route::group(['prefix'=>'subscriptions','as' => 'subscriptions.'], function(){
        Route::get('/page/{page}', [SubscriptionController::class, 'page'])->name('page')->whereNumber('page');
        Route::get('/subscription/{id}', [SubscriptionController::class, 'page'])->name('subscription');
    });
    Route::group(['prefix'=>'messages','as' => 'messages.'], function(){
        Route::get('/page/{page}', [MessageController::class,'page'])
            ->middleware('validate.isodatetime:olderThan')
            ->name('page')
            ->whereNumber('page');
        Route::get('{message_id}', [MessageController::class, 'single'])
            ->name('single')
            ->whereNumber('message_id');
        Route::get('{message_id}/content', [MessageController::class, 'content'])
            ->name('content')
            ->whereNumber('message_id');
        Route::get('{message_id}/delete', [MessageController::class, 'delete'])
            ->name('delete')
            ->whereNumber('message_id');
    });
    Route::group(['prefix' => 'companies', 'as' => 'companies.'], function(){
        Route::get('/all', [CompanyController::class, 'all'])->name('all');
    });
    Route::group(['prefix' => 'subscriptions', 'as' => 'subscriptions.'], function(){
        Route::get('/page/{page}', [SubscriptionController::class,'page'])
            ->name('page')
            ->whereNumber('page');
        Route::get('{subscription_id}', [SubscriptionController::class, 'single'])
            ->name('single')
            ->whereNumber('subscription_id');
    });
});
