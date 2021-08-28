<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Message;

class MessageController extends Controller{

    private $mock;
    private $page_size = 10;
    private $mock_items = 20;

    public function __construct(){
        $mock = [];

        for($i = 1; $i <= $this->mock_items; $i++){
            $days_between = 2;
            $offset = 500;
            $substract = $offset - $i * $days_between;
            $msg = new Message();
            $msg->id = $i;
            $msg->subject = 'onderwerp '.$i;
            $msg->types = ['group', 'important', 'personal'];
            $msg->sender = 'Sportcentrum ' . ($i % 4 == 0 ? 1 : $i % 4);
            $msg->received_on = Carbon::now()->subDays($substract);
            $msg->html_content = '<!DOCTYPE html><html><head></head><body><p><strong style="font-size: 10pt">Corona 3&nbsp;&nbsp;d.d. 15-12-2020&nbsp;&nbsp;i.vm. lock down&nbsp;keuze 100%&nbsp;vergoeding&nbsp;nr. 11</strong></p><p><strong style="font-size: 10pt">was 01-05-2021 wordt 01-06-2021</strong></p><p><br></p><p><strong>Corona 3</strong>&nbsp;&nbsp;d.d. 19-01-2021&nbsp;&nbsp;i.vm. lock down&nbsp;keuze 100%&nbsp;vergoeding&nbsp;</p><p>was 01-06-2021 wordt 22-06-2021&nbsp;</p><p><span style="color: rgba(217, 50, 50, 1); font-family: &quot;Segeo UI&quot;">Elly belde maandag 08-02-2021 dat eer nog werd afgeschreven</span>. Uitgelegd vvan de korting op de jaarkaaart en</p><p>het achter haar jaarkaart was gezet per 01=05-2021 en dat ze daarvoor nog moest betalen.&nbsp;Willy</p><p><br></p><p><strong>Corona 3</strong>&nbsp;&nbsp;d.d. 09-02-2021&nbsp;&nbsp;i.vm. lock down&nbsp;keuze 100%&nbsp;vergoeding&nbsp;</p><p>was 22-06-2021 wordt 13-07-2021&nbsp;</p><p><br></p><p>Corona 3&nbsp;&nbsp;d.d. 02-03-2021&nbsp;&nbsp;i.vm. lock down&nbsp;keuze 100%&nbsp;vergoeding&nbsp;</p><p>was 13-07-2021 wordt 09-08-2021&nbsp;</p><p><br></p><p>Corona 3&nbsp;&nbsp;d.d. 23-03-2021&nbsp;&nbsp;i.vm. lock down&nbsp;keuze 100%&nbsp;vergoeding&nbsp;</p><p>was 09-08-2021 wordt 09-09-2021</p><p>Elly heeft betaalde tot&nbsp;06-05-2021 daarna de vergoeding</p></body></html>';
            $msg->read = false;
            $mock[] = $msg;
        }
        $this->mock = collect($mock);
        $this->mock = $this->mock->sortByDesc('received_on');
        // fake server response time
        usleep(1500000);
    }

    public function page(Request $request, $page){
        $older_than = new Carbon($request->input('olderThan'));
        $chunk = $this->mock->where('received_on', '<', $older_than)
            ->skip($this->page_size * $page)
            ->take($this->page_size);
        return response()->json( $chunk->values()->toArray());
    }

    public function content($message_id){
        $message = $this->mock->firstWhere('id', $message_id);
        return response()->json($message->content);
    }

    public function single($message_id){
        $message = $this->mock->firstWhere('id', $message_id);
        //set content from magic get
        $message->content = $message->content;
        return response()->json($message);
    }

    public function delete($message_id){
        return response()->json(true);
    }
}
