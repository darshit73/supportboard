<?php

/*
 * ==========================================================
 * TELEGRAM POST.PHP
 * ==========================================================
 *
 * Telegram response listener. This file receive the messages sent to the Telegram bot. This file requires the Telegram App.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

$raw = file_get_contents('php://input');
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
$response = json_decode($raw, true);
if ($response) {
    if (isset($response['message'])) {
        require('../../include/functions.php');
        $GLOBALS['SB_FORCE_ADMIN'] = true;
        sb_cloud_load_by_url();
        $response_message = $response['message'];
        $from = $response_message['from'];
        $chat_id = $response_message['chat']['id'];
        $telegram_message_id = sb_isset($response_message, 'message_id', '');
        $message = isset($response_message['text']) ? $response_message['text'] : $response_message['caption'];
        $attachments = [];
        $token = sb_get_multi_setting('telegram', 'telegram-token');
        $user_id = false;

        // User and conversation
        $username = isset($from['username']) ? $from['username'] : $from['id'];
        $user = sb_get_user_by('telegram-id', $username);
        if (!$user) {
            $extra = ['telegram-id' => [$username, 'Telegram ID']];
            $profile_image = sb_get('https://api.telegram.org/bot' . $token . '/getUserProfilePhotos?user_id=' . $from['id'], true);
            if (!empty($profile_image['ok']) && count($profile_image['result']['photos'])) {
                $photos = $profile_image['result']['photos'][0];
                $profile_image = sb_telegram_download_file($photos[count($photos) - 1]['file_id'], $token);
            } else $profile_image = '';
            if (isset($from['language_code'])) {
                $extra['language'] = [$from['language_code'], 'Language'];
            } else {
                if (defined('SB_DIALOGFLOW')) $extra['language'] = sb_google_language_detection_get_user_extra($message);
            }
            $user_id = sb_add_user(['first_name' => sb_isset($from, 'first_name', ''), 'last_name' => sb_isset($from, 'last_name', ''), 'profile_image' => sb_is_error($profile_image) || empty($profile_image) ? '' : $profile_image, 'user_type' => 'lead'], $extra);
            $user = sb_get_user($user_id);
        } else {
            $user_id = $user['id'];
            $conversation_id = sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "tg" AND user_id = ' . $user_id . ' ORDER BY id DESC LIMIT 1'), 'id');
        }
        $GLOBALS['SB_LOGIN'] = $user;
        if (!$conversation_id) {
            $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', sb_get_setting('telegram-department'), false, 'tg', $chat_id), 'details', [])['id'];
        } else if ($telegram_message_id && sb_isset(sb_db_get('SELECT COUNT(*) AS `count` FROM sb_messages WHERE conversation_id =  ' . $conversation_id . ' AND payload LIKE "%' . sb_db_escape($telegram_message_id) . '%"'), 'count') != 0) {
            die();
        }
        // Attachments
        $document = sb_isset($response_message, 'document');
        $photos = sb_isset($response_message, 'photo');
        $voice = sb_isset($response_message, 'voice');
        if ($document) {
            array_push($attachments, [$document['file_name'], sb_telegram_download_file($document['file_id'], $token)]);
        }
        if ($voice) {
            array_push($attachments, [sb_('Audio'), sb_telegram_download_file($voice['file_id'], $token)]);
        }
        if ($photos) {
            $url = sb_telegram_download_file($photos[count($photos) - 1]['file_id'], $token);
            array_push($attachments, [substr($url, strripos($url, '/') + 1), $url]);
        }

        // Send message
        $response = sb_send_message($user_id, $conversation_id, $message, $attachments, false, $telegram_message_id ? json_encode(['tgid' => $telegram_message_id]) : '');

        // Dialogflow, Notifications, Bot messages
        $response_external = sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, ['source' => 'tg', 'platform_value' => $chat_id]);

        // Queue
        if (sb_get_multi_setting('queue', 'queue-active')) {
            sb_queue($conversation_id, sb_get_setting('telegram-department'));
        }

        // Online status
        sb_update_users_last_activity($user_id);

        $GLOBALS['SB_FORCE_ADMIN'] = false;
    }
}
die();

?>