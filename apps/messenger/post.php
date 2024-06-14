<?php

/*
 * ==========================================================
 * POST.PHP
 * ==========================================================
 *
 * Messenger response listener. This file receive the Facebook Messenger messages of the agents forwarded by board.support. This file requires the Messenger App.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

$raw = file_get_contents('php://input');
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
if ($raw) {
    require('../../include/functions.php');
    $response = json_decode($raw, true);
    $message = false;
    $sender_id = false;
    $page_id = false;
    $attachments = [];
    $response_messaging = isset($response['messaging']) ? $response['messaging'] : (isset($response['object']) && isset($response['entry'][0]['messaging']) ? $response['entry'][0]['messaging'] : false);
    $response_message = $response_messaging && isset($response_messaging[0]['message']) ? $response_messaging[0]['message'] : [];
    $is_echo = isset($response_message['is_echo']);
    $postback = sb_isset($response_messaging, 'postback');
    $instagram = sb_isset($response, 'object') == 'instagram';
    $platform_code = $instagram ? 'ig' : 'fb';
    $user = false;
    $is_deleted = $response_message && !empty($response_message['is_deleted']);

    if ($response_message) {
        $sender_id = $response_messaging[0]['sender']['id'];
        $message = sb_isset($response_message, 'text');
        $attachments = sb_isset($response_message, 'attachments', []);
    } else if (isset($response['sender'])) {
        $sender_id = $response['sender']['id'];
        $message = sb_isset($response['message'], 'text');
        $attachments = sb_isset($response['attachments'], 'attachments', []);
    } else if ($postback) {
        $sender_id = $response_messaging[0]['sender']['id'];
        $message = sb_isset($postback, 'title', '');
    }

    if ($sender_id && ($message || $attachments || $is_deleted)) {
        $GLOBALS['SB_FORCE_ADMIN'] = true;
        sb_cloud_load_by_url();

        // Page ID
        $page_sender = false;
        if (isset($response['object']) && isset($response['entry'])) {
            $page_id = $response['entry'][0]['id'];
        } else if (isset($response['recipient'])) {
            $page_id = $response['recipient']['id'];
        } else if ($response_messaging) {
            $page_id = $response_messaging[0]['recipient']['id'];
        }
        if ($page_id == $sender_id) {
            $page_id = $sender_id;
            $sender_id = $response_messaging[0]['recipient']['id'];
            $page_sender = sb_db_get('SELECT id FROM sb_users WHERE user_type = "agent" OR user_type = "admin" ORDER BY user_type, creation_time LIMIT 1')['id'];
        }
        $sender_id = sb_db_escape($sender_id);
        $page_id = sb_db_escape($page_id);

        // User
        $user = sb_db_get('SELECT A.id, A.first_name, A.last_name, A.profile_image, A.email, A.user_type FROM sb_users A, sb_users_data B WHERE A.user_type <> "agent" AND A.user_type <> "admin" AND A.id = B.user_id AND B.slug = "facebook-id" AND B.value = "' . sb_db_escape($sender_id) . '" LIMIT 1');
        if (!$user) {
            $user_id = sb_messenger_add_user($sender_id, sb_messenger_get_page($page_id)['messenger-page-token'], 'lead', $instagram, $message);
            $user = sb_get_user($user_id);
        } else $user_id = $user['id'];

        if ($user_id) {

            // Get user and conversation information
            $GLOBALS['SB_LOGIN'] = $user;
            $conversation = sb_db_get('SELECT id, status_code FROM sb_conversations WHERE source = "' . $platform_code . '" AND user_id = ' . $user_id . ' LIMIT 1');
            $conversation_id = sb_isset($conversation, 'id');
            $department = sb_isset(sb_messenger_get_page($page_id), 'messenger-page-department', -1);
            $count_attachments = count($attachments);

            // Message deleted
            if ($conversation_id && $is_deleted) {
                $message_id = sb_db_get('SELECT id FROM sb_messages WHERE conversation_id = ' . $conversation_id . ' AND payload LIKE "%' . sb_db_escape($response_message['mid']) . '%"');
                return $message_id ? sb_delete_message($message_id['id']) : false;
            }

            if (!$conversation_id) {
                $conversation_id = sb_isset(sb_new_conversation($user_id, 2, '', $department, -1, $platform_code, $page_id), 'details', [])['id'];
            } else if ($is_echo && $page_sender && $response_message) {
                if ((isset($response_message['metadata']) && sb_isset(sb_db_get('SELECT COUNT(*) AS `count` FROM sb_messages WHERE id = ' . explode('|', $response_message['metadata'])[0]), 'count') != 0) || ($message && sb_isset(sb_db_get('SELECT message FROM sb_messages WHERE conversation_id = ' . $conversation_id . ' ORDER BY id DESC LIMIT 1'), 'message') == $message)) {
                    $GLOBALS['SB_FORCE_ADMIN'] = false;
                    return false;
                }
                if ($count_attachments) {
                    $previous_message = sb_db_get('SELECT attachments, creation_time FROM sb_messages WHERE conversation_id = ' . $conversation_id . ' ORDER BY id DESC LIMIT 1');
                    $previous_message_count = count(json_decode($previous_message['attachments'], true));
                    if ($previous_message && ($count_attachments == $previous_message_count || $previous_message_count > 1) && sb_get_timestamp($previous_message['creation_time']) > (time() - 60)) {
                        $GLOBALS['SB_FORCE_ADMIN'] = false;
                        return false;
                    }
                } else if (empty($message)) {
                    $GLOBALS['SB_FORCE_ADMIN'] = false;
                    return false;
                }
            }

            // Attachments
            $attachments_2 = [];
            for ($i = 0; $i < $count_attachments; $i++) {
                $type = $attachments[$i]['type'];
                if ($type == 'image' && sb_isset($attachments[$i]['payload'], 'sticker_id') == '369239263222822' && !$message) {
                    $message = "👍";
                } else {
                    $url = sb_isset($attachments[$i]['payload'], 'url');
                    if ($url) {
                        $file_name = basename(strpos($url, '?') ? substr($url, 0, strpos($url, '?')) : $url);
                        $mime = !strpos($file_name, '.');
                        if (!$file_name || $file_name == 'ig_messaging_cdn') {
                            $file_name = rand(99999, 999999999);
                        }
                        if ($mime) {
                            if ($type == 'audio') {
                                $file_name .= '.mp3';
                                $mime = false;
                            }
                        }
                        $url = sb_download_file($url, $file_name, $mime);

                        array_push($attachments_2, [$mime ? pathinfo($url)['basename'] : $file_name, $url]);
                    } else if ($type == 'fallback') {
                        $message_id = sb_isset($response, 'id', $response['entry'][0]['id']);
                        $message .= sb_('Attachment unavailable.') . ($message_id ? ' ' . sb_('View it on Messenger.') . PHP_EOL . 'https://www.facebook.com/messages/t/' . $message_id : '');
                    }
                }
            }

            // Send message
            $response = sb_send_message($page_sender ? $page_sender : $user_id, $conversation_id, $message, $attachments_2, false, ['mid' => sb_db_escape(sb_isset($response_message, 'mid'))]);

            // Dialogflow and bot messages
            if (!$is_echo) {
                sb_messaging_platforms_functions($conversation_id, $message, $attachments_2, $user, ['source' => $platform_code, 'platform_value' => $sender_id, 'page_id' => $page_id, 'conversation_id' => $conversation_id]);
            }

            // Queue
            if (sb_get_multi_setting('queue', 'queue-active')) {
                sb_queue($conversation_id, $department);
            }

            // Online status
            if (!$page_sender) sb_update_users_last_activity($user_id);
        }
    }

    $GLOBALS['SB_FORCE_ADMIN'] = false;
    return $response;
}
die();

?>