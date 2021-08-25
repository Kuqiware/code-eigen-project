<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Message extends Model
{
    /**
    * @property int id
    * @property Carbon received_on
    * @property string subject
    * @property string sender
    * @property string html_content
    * @property string content
    * @property bool read
    * @property array types
    */

    protected $fillable = ['id', 'html_content', 'subject', 'sender', 'received_on', 'read', 'types'];
    protected $guarded = [];
    protected $hidden = ['html_content'];

    // Gets the content between the body opening and closing tag of html_content
    public function getContentAttribute(){
        if(!Str::contains($this->html_content, '<body>')
        || !Str::contains($this->html_content, '</body>'))
            return $this->html_content;
        return explode("<body>", explode("</body>", $this->html_content)[0])[1];
    }
}
