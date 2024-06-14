<?php

/*
 * ==========================================================
 * TWITTER POST.PHP
 * ==========================================================
 *
 * Twitter response listener. This file receive the messages from Twitter. This file requires the Twitter App.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

require('../../include/functions.php');
sb_cloud_load_by_url();

if (isset($_REQUEST['crc_token'])) {
    $token = $_REQUEST['crc_token'];
    $hash = hash_hmac('sha256', $token, sb_get_multi_setting('twitter', 'twitter-consumer-secret'), true);
    echo json_encode(['response_token' => 'sha256=' . base64_encode($hash)]);
    die();
}

$raw = file_get_contents('php://input');
$response = json_decode($raw, true);
$signature = sb_isset($_SERVER, 'HTTP_X_TWITTER_WEBHOOKS_SIGNATURE');
if (!$signature)
    die();
if ($signature !== 'sha256=' . base64_encode(hash_hmac('sha256', $raw, sb_get_multi_setting('twitter', 'twitter-consumer-secret'), true))) {
    header('HTTP/1.1 403 Forbidden');
    die('Invalid signature');
}

if (isset($response['direct_message_events'])) {
    $GLOBALS['SB_FORCE_ADMIN'] = true;
    $message_create = $response['direct_message_events'][0]['message_create'];
    $message = $message_create['message_data']['text'];

    // User and conversation
    $user_id = false;
    $sender_id = $message_create['sender_id'];
    $twitter_user = $response['users'][$sender_id];
    $is_agent = str_replace('@', '', sb_get_multi_setting('twitter', 'twitter-username')) == $twitter_user['screen_name'];
    $user = sb_get_user_by('twitter-id', $is_agent ? $message_create['target']['recipient_id'] : $sender_id);
    $conversation_id = $user ? sb_isset(sb_db_get('SELECT id FROM sb_conversations WHERE source = "tw" AND user_id = ' . $user['id'] . ' ORDER BY id DESC LIMIT 1'), 'id') : false;
    if ($is_agent) {
        $user_id = sb_get_bot_id();
        if (!$user_id || !$conversation_id)
            return;
        $GLOBALS['SB_LOGIN'] = $agent;
    } else {
        if (!$user) {
            $extra = ['twitter-id' => [$sender_id, 'Twitter ID']];
            $first_name = $twitter_user['name'];
            $profile_image = sb_download_file(str_replace('_normal', '_bigger', $twitter_user['profile_image_url']));
            $last_name = '';
            $space = mb_strpos($first_name, ' ');
            if ($space) {
                $last_name = mb_substr($first_name, $space);
                $first_name = mb_substr($first_name, 0, $space);
            }
            if (defined('SB_DIALOGFLOW'))
                $extra['language'] = sb_google_language_detection_get_user_extra($message);
            $user_id = sb_add_user(['first_name' => $first_name, 'last_name' => $last_name, 'profile_image' => $profile_image, 'user_type' => 'lead'], $extra);
            $user = sb_get_user($user_id);
        } else {
            $user_id = $user['id'];
        }
        $GLOBALS['SB_LOGIN'] = $user;
        if (!$conversation_id) {
            $conversation_id = sb_new_conversation($user_id, 2, '', sb_get_setting('twitter-department'), -1, 'tw')['details']['id'];
        }
    }

    // Attachments
    $attachments = sb_isset($message_create['message_data'], 'attachment', []);
    if ($attachments) {
        $twitter = new TwitterAPIExchange(sb_get_setting('twitter'));
        $url = $attachments['media']['media_url'];
        $file = $twitter->buildOauth($url, 'GET')->performRequest();
        $date = date('d-m-y');
        $file_name = basename($url);
        $path = sb_upload_path() . '/' . $date . '/' . $file_name;
        $message = trim(str_replace($attachments['media']['url'], '', $message));
        if (sb_file($path, $file)) {
            $attachments = [[$file_name, sb_upload_path(true) . '/' . $date . '/' . $file_name]];
        } else
            $attachments = [];
    }

    // Send message
    if ($is_agent) {
        $last_agent = sb_get_last_agent_in_conversation($conversation_id);
        $last_message = sb_db_get('SELECT message, attachments FROM sb_messages WHERE (message <> "" || attachments <> "") AND conversation_id = ' . sb_db_escape($conversation_id, true) . ' AND (user_id = ' . sb_get_bot_id() . ($last_agent ? ' OR user_id = ' . $last_agent : '') . ') ORDER BY id DESC LIMIT 1');
        $response = !$last_message || $last_message['message'] != $message || json_encode(sb_isset($last_message, 'attachments', [])) != json_encode($attachments) ? sb_send_message($user_id, $conversation_id, $message, $attachments, false) : false;
    } else {
        $response = sb_send_message($user_id, $conversation_id, $message, $attachments, false);

        // Dialogflow, Notifications, Bot messages
        $response_extarnal = sb_messaging_platforms_functions($conversation_id, $message, $attachments, $user, ['source' => 'tw', 'platform_value' => $sender_id]);

        // Queue
        if (sb_get_multi_setting('queue', 'queue-active')) {
            sb_queue($conversation_id, sb_get_setting('twitter-department'));
        }

        // Online status
        sb_update_users_last_activity($user_id);
    }

    $GLOBALS['SB_FORCE_ADMIN'] = false;
} else if (isset($response['direct_message_indicate_typing_events'])) {
    $user = sb_get_user_by('twitter-id', $response['direct_message_indicate_typing_events'][0]['sender_id']);
    if ($user) {
        $GLOBALS['SB_LOGIN'] = $user;
        sb_set_typing($user['id'], sb_db_get('SELECT id FROM sb_conversations WHERE source = "tw" AND user_id = ' . $user['id'] . ' ORDER BY id DESC LIMIT 1')['id']);
    }
}

die();

?>