<?php

/*
 * ==========================================================
 * WECHAT APP POST FILE
 * ==========================================================
 *
 * WeChat app post file to receive messages sent by WeChat. © 2017-2023 board.support. All rights reserved.
 *
 */

require('../../include/functions.php');
$response = file_get_contents('php://input');

ob_start();
if (isset($_GET['echostr']))
    die($_GET['echostr']);
else
    echo 'success';
header('Connection: close');
header('Content-Length: ' . ob_get_length());
ob_end_flush();
@ob_flush();
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
sb_cloud_load_by_url();

$token = sb_get_multi_setting('wechat', 'wechat-token');
$signature = check_signature($token);
if (!$signature)
    die();


$response = simplexml_load_string($response) or die();
$wechat_open_id = (string) $response->FromUserName;
$message_type = trim((string) $response->MsgType);
$message_id = (string) $response->MsgId;
$message = trim((string) $response->Content);
$user_id = false;
if (!$message_id)
    die('missing-msgid');
$GLOBALS['SB_FORCE_ADMIN'] = true;
$user = sb_get_user_by('wechat-id', $wechat_open_id);
if (!$user) {
    $keys = ['city', 'province', 'country'];
    $extra = ['wechat-id' => [$wechat_open_id, 'WeChat ID']];
    $user_details = sb_get('https://api.weixin.qq.com/cgi-bin/user/info?access_token=' . sb_wechat_get_access_token() . '&openid=' . $wechat_open_id, true);
    if (!empty($user_details['headimgurl'])) {
        $user_details['headimgurl'] = sb_download_file($user_details['headimgurl'], $wechat_open_id . '.png');
    }
    if (defined('SB_DIALOGFLOW'))
        $extra['language'] = sb_google_language_detection_get_user_extra($message);
    for ($i = 0; $i < count($keys); $i++) {
        $key = $keys[$i];
        if (!empty($user_details[$key])) {
            $extra[$key] = [$user_details[$key], sb_string_slug($key, 'string')];
        }
    }
    $user_id = sb_add_user(['first_name' => sb_isset($user_details, 'nickname', ''), 'last_name' => '', 'profile_image' => sb_isset($user_details, 'headimgurl', ''), 'user_type' => 'lead'], $extra);
    $user = sb_get_user($user_id);
} else {
    $user_id = $user['id'];
    $conversation_id = sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "wc" AND user_id = ' . $user_id . ' ORDER BY id DESC LIMIT 1'), 'id');
}
$GLOBALS['SB_LOGIN'] = $user;
if (!$conversation_id) {
    $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', sb_get_setting('wechat-department'), -1, 'wc'), 'details', [])['id'];
}

// Emoji
if (strpos($message, '/:') !== false) {
    $emojis = json_decode(file_get_contents(SB_PATH . '/apps/wechat/emoji.json'), true);
    for ($i = 0; $i < count($emojis); $i++) {
        if (strpos($message, $emojis[$i][0]) !== false) {
            $message = str_replace($emojis[$i][0], $emojis[$i][1], $message);
            if (strpos($message, '/:') === false)
                break;
        }
    }
}

// Attachments
$attachments = [];
$attachment_url = false;
switch ($message_type) {
    case 'image':
        $attachment_url = sb_download_file($response->PicUrl, $message_id, true);
        break;
    case 'video':
        $attachment_url = sb_download_file('https://api.weixin.qq.com/cgi-bin/media/get?access_token=' . sb_wechat_get_access_token() . '&media_id=' . $response->MediaId, $message_id, true);
        break;
}
if ($attachment_url)
    array_push($attachments, [basename($attachment_url), $attachment_url]);

// Send message
$response = sb_send_message($user_id, $conversation_id, $message, $attachments, false, ['id' => $message_id]);

// Dialogflow, Notifications, Bot messages
$response_extarnal = sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, ['source' => 'wc', 'platform_value' => $wechat_open_id]);

// Queue
if (sb_get_multi_setting('queue', 'queue-active')) {
    sb_queue($conversation_id, sb_get_setting('wechat-department'));
}

// Online status
sb_update_users_last_activity($user_id);

$GLOBALS['SB_FORCE_ADMIN'] = false;
die();

function check_signature($token) {
    $signature = $_GET['signature'];
    $timestamp = $_GET['timestamp'];
    $nonce = $_GET['nonce'];
    $check = [$token, $timestamp, $nonce];
    sort($check, SORT_STRING);
    $check = implode($check);
    $check = sha1($check);
    return $check == $signature;
}

?>