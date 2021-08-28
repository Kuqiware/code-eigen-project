<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;

class ValidateISODateTime
{
    /**
     * Validates the given ISO date formatted property.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $property)
    {
        try{
            new Carbon($request->input($property));
        }
        catch(Exception $e){
            abort(400, 'Invalid ISO DateTime');
        }

        return $next($request);
    }
}
