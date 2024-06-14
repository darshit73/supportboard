<?php

/*
 * ==========================================================
 * LINE POST.PHP
 * ==========================================================
 *
 * Line response listener. This file receive the messages sent to the Line bot. This file requires the Line App.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

$raw = file_get_contents('php://input');
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
$response = json_decode($raw, true);
if ($response && isset($response['events']) && isset($_SERVER['HTTP_X_LINE_SIGNATURE'])) {
    require('../../include/functions.php');
    sb_cloud_load_by_url();
    if ($_SERVER['HTTP_X_LINE_SIGNATURE'] === base64_encode(hash_hmac('sha256', $raw, sb_get_multi_setting('line', 'line-channel-secret'), true))) {
        $GLOBALS['SB_FORCE_ADMIN'] = true;
        $response = $response['events'][0];
        if (!isset($response['source']) || $response['source']['type'] !== 'user') die('Source is not user');
        $line_id = $response['source']['userId'];
        $message = $response['message'];
        $message_text = sb_isset($message, 'text', '');
        $attachments = [];
        $token = sb_get_multi_setting('line', 'line-token');
        $user_id = false;

        // User and conversation
        $user = sb_get_user_by('line-id', $line_id);
        if (!$user) {
            $extra = ['line-id' => [$line_id, 'LINE ID']];
            $sender = sb_line_curl('profile/' . $line_id, '', 'GET');
            if (!empty($sender['language'])) {
                $extra['language'] = [sb_language_code($sender['language']), 'Language'];
            } else if ($message_text && defined('SB_DIALOGFLOW')) {
                $extra['language'] = sb_google_language_detection_get_user_extra($message_text);
            }
            $name = sb_split_name($sender['displayName']);
            $user_id = sb_add_user(['first_name' => $name[0], 'last_name' => $name[1], 'profile_image' => empty($sender['pictureUrl']) ? '' : sb_download_file($sender['pictureUrl']), 'user_type' => 'lead'], $extra);
            $user = sb_get_user($user_id);
        } else {
            $user_id = $user['id'];
            $conversation_id = sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "ln" AND user_id = ' . $user_id . ' ORDER BY id DESC LIMIT 1'), 'id');
        }
        $GLOBALS['SB_LOGIN'] = $user;
        if (!$conversation_id) {
            $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', sb_get_setting('line-department'), -1, 'ln', $line_id), 'details', [])['id'];
        }

        // Attachments
        switch ($message['type']) {
            case 'image':
            case 'file':
            case 'audio':
            case 'video':
                $url = sb_download_file('https://api-data.line.me/v2/bot/message/' . $message['id'] . '/content', $message['id'], true, ['Authorization: Bearer ' . sb_get_multi_setting('line', 'line-token')]);
                array_push($attachments, [basename($url), $url]);
                break;
            case 'sticker':
                $message_text .= ($message_text ? PHP_EOL : '') . '[sticker]';
                break;
            case 'location':
                $message_text .= ($message_text ? PHP_EOL : '') . 'https://www.google.com/maps/search/?api=1&query=' . $message['latitude'] . ',' . $message['longitude'];
                break;
        }

        // Send message
        $response = sb_send_message($user_id, $conversation_id, $message_text, $attachments, false, json_encode(['message_token' => $response['replyToken']]));

        // Dialogflow, Notifications, Bot messages
        $response_external = sb_messaging_platforms_functions($conversation_id, $message_text, $attachments, $user, ['source' => 'ln', 'line_id' => $line_id]);

        // Queue
        if (sb_get_multi_setting('queue', 'queue-active')) {
            sb_queue($conversation_id, sb_get_setting('line-department'));
        }

        // Online status
        sb_update_users_last_activity($user_id);

        $GLOBALS['SB_FORCE_ADMIN'] = false;
    }
    die('Invalid signature');
}
?>