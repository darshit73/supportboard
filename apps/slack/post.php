<?php

/*
 * ==========================================================
 * POST.PHP
 * ==========================================================
 *
 * Slack response listener. This file receive the Slack messages of the agents forwarded by board.support. This file requires the Slack App.
 * © 2017-2023 board.support. All rights reserved.
 *
 */

$raw = file_get_contents('php://input');
flush();
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}
if ($raw) {
    $response = json_decode($raw, true);
    if (isset($response['event'])) {
        require('../../include/functions.php');
        $response = $response['event'];
        $subtype = isset($response['subtype']) ? $response['subtype'] : '';
        $GLOBALS['SB_FORCE_ADMIN'] = true;
        if (sb_is_cloud()) {
            sb_cloud_load_by_url();
            sb_cloud_membership_validation(true);
        }
        if (isset($response['type']) && $response['type'] == 'message' && $subtype != 'channel_join' && (!$subtype || $subtype == 'file_share') && ($response['text'] != '' || (is_array($response['files']) && count($response['files']) > 0))) {

            // Get the user id of the slack message
            $user_id = sb_slack_api_user_id($response['channel']);

            // Elaborate the Slack message
            if ($user_id) {
                $last_message = sb_slack_last_user_message($user_id);
                $message = $response['text'];
                $conversation_id = $last_message['conversation_id'];

                // Check for duplicated message
                if (strpos(sb_isset(sb_db_get('SELECT payload FROM sb_messages WHERE conversation_id = ' . $conversation_id . ' ORDER BY creation_time DESC LIMIT 1'), 'payload'), sb_isset($response, 'event_ts'))) {
                    $GLOBALS['SB_FORCE_ADMIN'] = false;
                    return;
                }

                // Emoji
                $emoji = explode(':', $message);
                if (count($emoji)) {
                    $emoji_slack = json_decode(file_get_contents(SB_PATH . '/apps/slack/emoji.json'), true);
                    for ($i = 0; $i < count($emoji); $i++) {
                        if ($emoji[$i]) {
                            $emoji_code = ':' . $emoji[$i] . ':';
                            if (isset($emoji_slack[$emoji_code])) {
                                $message = str_replace($emoji_code, $emoji_slack[$emoji_code], $message);
                            }
                        }
                    }
                }

                // Message
                $message = sb_slack_response_message_text($message);

                // Attachments
                $attachments = $subtype == 'file_share' ? sb_slack_response_message_attachments($response['files']) : [];

                // Set the user login
                global $SB_LOGIN;
                $SB_LOGIN = ['id' => $user_id,  'user_type' => 'user'];

                // Get the agent id
                $agent_id = sb_db_escape(sb_slack_api_agent_id($response['user']));

                // Send the message
                $response_message = sb_send_message($agent_id, $conversation_id, $message, $attachments, 1, $response);

                // Messaging apps
                $conversation_details = defined('SB_MESSENGER') || defined('SB_WHATSAPP') || defined('SB_TWITTER') || defined('SB_VIBER') || defined('SB_LINE') || defined('SB_TELEGRAM') || defined('SB_WECHAT') ? sb_db_get('SELECT source, extra FROM sb_conversations WHERE id = ' . $conversation_id) : false;
                if ($conversation_details) {
                    sb_messaging_platforms_send_message($message, $conversation_id, $response_message['id'], $attachments);
                }

                // Pusher online status
                if (sb_pusher_active()) {
                    sb_pusher_trigger('private-user-' . $user_id, 'add-user-presence', [ 'agent_id' => $agent_id]);
                }

                // Slack notification message
                if (!empty($response_message['notifications'])) {
                    sb_send_slack_message(sb_get_bot_id(), sb_get_setting('bot-name'), sb_get_setting('bot-image'), '_' . sb_('The user has been notified by email' . (in_array('sms', $response_message['notifications']) ? ' and text message' : '') . '.') . '_', [], $conversation_id, $response['channel']);
                }
            }
        }
        switch ($subtype) {
            case 'message_deleted':
                $user_id = sb_db_escape(sb_slack_api_user_id($response['channel']));
                $agent_id = sb_slack_api_agent_id($response['previous_message']['user']);
                $last_message = sb_slack_last_user_message($user_id);
                $online = sb_update_users_last_activity(-1, $user_id) === 'online';
                $previous_message = sb_db_escape($response['previous_message']['text']);
                sb_db_query(($online ? 'UPDATE sb_messages SET message = "", attachments = "", payload = "{ \"event\": \"delete-message\" }", creation_time = "' . gmdate('Y-m-d H:i:s') . '"' : 'DELETE FROM sb_messages') . ' WHERE (user_id = ' . $agent_id . ' OR user_id = ' . $user_id . ') AND conversation_id = "' . $last_message['conversation_id'] . '" AND ' . ($previous_message ?  'message = "' . $previous_message . '"' : 'attachments LIKE "%' . sb_db_escape($response['previous_message']['attachments'][0]['title']) . '%"') .' LIMIT 1');
                break;
            case 'message_changed':
                $agent_id = sb_db_escape(sb_slack_api_agent_id($response['previous_message']['user']));
                sb_db_query('UPDATE sb_messages SET message = "' . sb_db_escape(sb_slack_response_message_text($response['message']['text'])) . '", creation_time = "' . gmdate('Y-m-d H:i:s') . '" WHERE user_id = ' . $agent_id . ' AND payload LIKE "%' .  sb_db_escape($response['message']['ts']) . '%" LIMIT 1');
                break;
            case 'channel_archive':
                $conversation_id = sb_slack_last_user_message(sb_slack_api_user_id($response['channel']))['conversation_id'];
                sb_update_conversation_status($conversation_id, 3);
                break;
        }
        $GLOBALS['SB_FORCE_ADMIN'] = false;
    }
}
die();

?>