<?php

/*
 * ==========================================================
 * SLACK APP
 * ==========================================================
 *
 * Slack app main file. © 2017-2023 board.support. All rights reserved.
 *
 */

define('SB_SLACK', '1.2.3');

/*
 * -----------------------------------------------------------
 * MESSAGES
 * -----------------------------------------------------------
 *
 * 1. Send a message to Slack
 * 2. Convert Support Board rich messages to Slack rich messages
 * 3. Check if the message can be sent to Slack
 *
 */

function sb_send_slack_message($user_id, $full_name, $profile_image = SB_URL . '/media/user.png', $message = '', $attachments = [], $conversation_id = false, $channel = false) {
    $conversation = $conversation_id ? sb_db_get('SELECT department, agent_id FROM sb_conversations WHERE id = ' . sb_db_escape($conversation_id)) : [];
    $department_id = sb_isset($conversation, 'department');

    // Channel ID
    $token = sb_get_setting('slack-token');
    if (!$token) {
        return ['status' => 'error', 'response' => 'Slack token not found'];
    }
    $full_name = str_replace(['#', '\''], ['', ' '], $full_name);
    if (!$channel) {
        $channel = sb_get_slack_channel($user_id, $token, 0, false, $department_id);
        if (!$channel[0] || $user_id == -1 || !$user_id) {
            $channel = [sb_get_setting('slack-channel'), false];
        }
    } else {
        $channel = [$channel, false];
    }

    // Attachments
    $slack_attachments = [];
    for ($i = 0; $i < count($attachments); $i++) {
        $link = $attachments[$i][1];
        $item = ['title' => $attachments[$i][0]];
        $item[in_array(pathinfo($link, PATHINFO_EXTENSION), ['jpeg', 'jpg', 'png', 'gif']) ? 'image_url' : 'title_link'] = $link;
        array_push($slack_attachments, $item);
    }

    // Send message to Slack
    $message = sb_slack_rich_messages($message);
    $slack_attachments = array_merge($slack_attachments, $message[2]);
    $data = ['token' => $token, 'channel' => $channel[0], 'text' => $message[0], 'username' => $full_name, 'bot_id' => 'support-board', 'icon_url' => strpos($profile_image, '.svg') ? SB_URL . '/media/user.png' : $profile_image, 'attachments' => json_encode($slack_attachments)];
    if ($message[1]) $data['blocks'] = json_encode($message[1], JSON_INVALID_UTF8_IGNORE | JSON_UNESCAPED_UNICODE);
    $response = sb_curl('https://slack.com/api/chat.postMessage', $data);

    // New channel
    if ($channel[1] && sb_isset($response, 'ok')) {
        $user = sb_get_active_user();
        $user_extra = sb_get_user_extra($user_id);
        $channel_link = 'https://' . sb_get_setting('slack-workspace') . '.slack.com/archives/' . $channel[0];
        $data['text'] = '';
        $data['channel'] = sb_get_setting('slack-channel');
        $slack_departments = sb_get_setting('slack-departments');
        if ($conversation_id && $slack_departments && count($slack_departments)) {
            for ($i = 0; $i < count($slack_departments); $i++) {
                if ($slack_departments[$i]['slack-departments-id'] == $department_id) {
                    $data['channel'] = $slack_departments[$i]['slack-departments-channel'];
                    break;
                }
            }
        }

        // Fields
        $fields_custom = sb_get_setting('slack-user-details');
        $fields_include = $fields_custom ? explode(',', str_replace(' ', '', $fields_custom)) : ['email', 'location', 'browser', 'browser_language'];
        $fields = [['title' => sb_('Message'), 'value' => sb_json_escape($message[0]), 'short' => false]];
        foreach ($user as $key => $value) {
            if (in_array($key, $fields_include) && $value) {
                array_push($fields, ['title' => sb_string_slug($key, 'string'), 'value' => $value, 'short' => true]);
            }
        }
        if (is_array($user_extra)) {
            for ($i = 0; $i < count($user_extra); $i++) {
                if (in_array($user_extra[$i]['slug'], $fields_include)) {
                    array_push($fields, ['title' => $user_extra[$i]['name'], 'value' => $user_extra[$i]['value'], 'short' => true]);
                }
            }
        }
        array_push($fields, ['title' => '', 'value' => '*<' . $channel_link . '|Reply in channel>*', 'short' => false]);
        $data['attachments'] = json_encode([['fallback' => 'A conversation was started by' . ' ' . sb_json_escape($full_name) . '. *<' . $channel_link . '|Reply in channel>*"', 'text' => '*' . sb_('A conversation was started by') . ' ' . sb_db_escape($full_name) . '*', 'color' => '#028be5', 'fields' => $fields]]);

        //Send message to slack
        $response = sb_curl('https://slack.com/api/chat.postMessage', $data);
    }
    if (isset($response['ok'])) {
        if ($response['ok']) {
            return ['success', $channel[0]];
        } else if (isset($response['error'])) {

            // Unarchive or create new channel and send the message again
            if ($response['error'] == 'is_archived') {
                $response = sb_curl('https://slack.com/api/conversations.unarchive', ['token' => sb_get_setting('slack-token-user'), 'channel' => $channel[0]]);
                sb_curl('https://slack.com/api/conversations.join', ['token' => $token, 'channel' => $channel[0]]);
                sb_slack_invite($token,  $channel[0], $department_id, sb_isset($conversation, 'agent_id'));
            } else if ($response['error'] == 'channel_not_found') {
                $response = sb_get_slack_channel($user_id, $token, 0, true);
            }
            if (sb_isset($response, 'ok')) {
                return sb_send_slack_message($user_id, $full_name, $profile_image, $message[0], $attachments, $conversation_id);
            }
        }
    }
    return $response;
}

function sb_slack_rich_messages($message) {
    $shortcode = sb_get_shortcode($message);
    $attachments = [];
    $payload = [];
    if ($shortcode) {
        $elements = [];
        if (isset($shortcode['title'])) {
            array_push($payload, ['type' => 'header', 'text' => ['type' => 'plain_text', 'text' => $shortcode['title'], 'emoji' => true]]);
        }
        if (isset($shortcode['message'])) {
            array_push($payload, ['type' => 'section', 'text' => ['type' => 'plain_text', 'text' => $shortcode['message'], 'emoji' => true]]);
        }
        switch ($shortcode['shortcode_name']) {
            case 'slider-images':
                $images = explode(',', $shortcode['images']);
                for ($i = 0; $i < count($images); $i++) {
                    array_push($attachments, ['title' => $images[$i], 'image_url' => $images[$i]]);
                }
                break;
            case 'slider':
                $index = 1;
                while ($index) {
                    if (isset($shortcode['header-' . $index])) {
                        $description = sb_isset($shortcode, 'description-' . $index);
                        $extra = sb_isset($shortcode, 'extra-' . $index);
                        $button = sb_isset($shortcode, 'link-text-' . $index);
                        $element = ['type' => 'section', 'text' => ['type' => 'mrkdwn', 'text' => '*' . $shortcode['header-' . $index] . '*' . ($description ? PHP_EOL . $description : '') . ($extra ? PHP_EOL . '`' . $extra . '`': '')], 'accessory' => ['type' => 'image', 'image_url' => $shortcode['image-' . $index], 'alt_text' => 'image']];
                        array_push($payload, $element);
                        if ($button) {
                            array_push($payload, ['type' => 'actions', 'elements' => [['type' => 'button', 'text' => ['type' => 'plain_text', 'text' => $button, 'emoji' => true]]]]);
                        }
                        $index++;
                    } else $index = false;
                }
                break;
            case 'card':
                $description = sb_isset($shortcode, 'description');
                $extra = sb_isset($shortcode, 'extra');
                $button = sb_isset($shortcode, 'link-text');
                array_push($payload, ['type' => 'image', 'image_url' => $shortcode['image'], 'alt_text' => 'image'], ['type' => 'header', 'text' => ['type' => 'plain_text', 'text' => $shortcode['header'], 'emoji' => true]]);
                if ($description) {
                    array_push($payload, ['type' => 'section', 'text' => ['type' => 'plain_text', 'text' => $description, 'emoji' => true]]);
                }
                if ($extra) {
                    array_push($payload, ['type' => 'context', 'elements' => [['type' => 'mrkdwn', 'text' => '`' . $extra . '`']]]);
                }
                if ($button) {
                    array_push($payload, ['type' => 'actions', 'elements' => [['type' => 'button', 'text' => ['type' => 'plain_text', 'text' => $button, 'emoji' => true]]]]);
                }
                break;
            case 'select':
                $values = explode(',', $shortcode['options']);
                for ($i = 0; $i < count($values); $i++) {
                    array_push($elements, ['text' => ['type' => 'plain_text', 'text' => $values[$i], 'emoji' => true], 'value' => $values[$i]]);
                }
                array_push($payload, ['type' => 'actions', 'elements' => [['type' => 'static_select', 'placeholder' => ['type' => 'plain_text', 'text' => $values[0]], 'options' => $elements]]]);
                break;
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                for ($i = 0; $i < count($values); $i++) {
                    array_push($elements, ['type' => 'button', 'text' => ['type' => 'plain_text', 'text' => $values[$i], 'emoji' => true]]);
                }
                array_push($payload, ['type' => 'actions', 'elements' => $elements]);
                break;
            case 'inputs':
                $values = explode(',', $shortcode['values']);
                for ($i = 0; $i < count($values); $i++) {
                    array_push($payload, ['type' => 'input', 'element' => ['type' => 'plain_text_input'], 'label' => ['type' => 'plain_text', 'text' => ' ']]);
                }
                  break;
            case 'email':
                array_push($payload, ['type' => 'input', 'element' => ['type' => 'plain_text_input'], 'label' => ['type' => 'plain_text', 'text' => ' ']]);
                break;
            case 'button':
                array_push($payload, ['type' => 'actions', 'elements' => [['type' => 'button', 'text' => ['type' => 'plain_text', 'text' => $shortcode['name'], 'emoji' => true]]]]);
                break;
            case 'video':
                $message = ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $message = $shortcode['url'];
                break;
            case 'list-image':
                $values = explode(',', $shortcode['values']);
                for ($i = 0; $i < count($values); $i++) {
                    $value = explode(':', str_replace('://', '||', $values[$i]));
                    array_push($payload, ['type' => 'context', 'elements' => [['type' => 'image', 'image_url' => str_replace('||', '://', $value[0]), 'alt_text' => 'image'], ['type' => 'mrkdwn', 'text' => $value[1] . (count($value) == 2 ? ' *' . $value[2] . '*' : '')]]]);
                }
                break;
            case 'list':
                $values = explode(',', $shortcode['values']);
                if (strpos($values[0], ':')) {
                    for ($i = 0; $i < count($values); $i++) {
                        $value = explode(':', $values[$i]);
                        $message .= '• *' . trim($value[0]) . '* ' . trim($value[1]) . PHP_EOL;
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= '• ' . trim($values[$i]) . PHP_EOL;
                    }
                }
                break;
            case 'rating':
                $message .= '`[rating]`';
                break;
            case 'articles':
                $message .= '`[articles]`';
                break;
        }
        $message = str_replace($shortcode['shortcode'], '', $message);
    }
    return [$message, count($payload) ? $payload : '', $attachments];
}

function sb_slack_can_send($conversation_id) {
    // Deprecated: sb_get_setting('dialogflow-active')
    return sb_get_setting('slack-active') && (!defined('SB_DIALOGFLOW') || (!sb_get_setting('dialogflow-active') && !sb_get_multi_setting('google', 'dialogflow-active')) || !sb_get_multi_setting('dialogflow-human-takeover', 'dialogflow-human-takeover-active') || sb_dialogflow_is_human_takeover($conversation_id));
}

/*
 * -----------------------------------------------------------
 * CHANNELS
 * -----------------------------------------------------------
 *
 * 1. Return the correct Slack channel of the user to send the messages to
 * 2. Rename a channel
 * 3. Archive all Slack channels
 * 4. Get channels
 *
 */

function sb_get_slack_channel($user_id, $token, $index = 0, $force_creation = false, $department_id = false, $agent_id = false) {
    $channels = sb_get_external_setting('slack-channels');
    if (isset($channels[$user_id]) && !$force_creation) {
        return [$channels[$user_id]['id'], false];
    } else {
        $active_user = sb_get_user($user_id);
        $username = mb_strtolower(str_replace(['#', ' ', '\''], ['', '_', ''], $active_user['first_name'] . (empty($active_user['last_name']) ? '' : ('_' . $active_user['last_name'])) . ($index > 0 ? ('_' . $index) : '')));
        $response = sb_curl('https://slack.com/api/conversations.create', ['token' => $token, 'name' => $username]);
        if (isset($response['channel'])) {
            $channel_id = $response['channel']['id'];
            $channels[$user_id] = ['id' => $channel_id, 'name' => $response['channel']['name']];
            $json = sb_db_json_escape($channels);
            sb_db_query('INSERT INTO sb_settings(name, value) VALUES (\'slack-channels\', \'' . $json . '\') ON DUPLICATE KEY UPDATE value = \'' . $json . '\'');
            sb_slack_invite($token, $channel_id, $department_id, $agent_id);
            return [$channel_id, true];
        } else if (isset($response['error']) && $response['error'] === 'name_taken') {
            return sb_get_slack_channel($user_id, $token, $index + 1);
        }
    }
    return false;
}

function sb_slack_rename_channel($user_id, $channel_name) {
    $channels = sb_get_external_setting('slack-channels');
    if (isset($channels[$user_id]) && $channels[$user_id]['name'] != $channel_name) {
        $token = sb_get_setting('slack-token');
        if ($token) {
            $channel_name = mb_strtolower(str_replace(['#', ' '], ['', '_'], $channel_name));
            $response = sb_curl('https://slack.com/api/conversations.rename', ['token' => $token, 'channel' => $channels[$user_id]['id'], 'name' => $channel_name]);
            if ($response['ok']) {
                $channels[$user_id]['name'] = $channel_name;
                $json = sb_db_json_escape($channels);
                sb_db_query('INSERT INTO sb_settings(name, value) VALUES (\'slack-channels\', \'' . $json . '\') ON DUPLICATE KEY UPDATE value = \'' . $json . '\'');
                return true;
            }
        }
    }
    return false;
}

function sb_archive_slack_channels($user_id = false) {
    $token = sb_get_setting('slack-token-user');
    if ($user_id) {
        $channels = sb_get_external_setting('slack-channels');
        if (isset($channels[$user_id])) {
            sb_curl('https://slack.com/api/conversations.archive', ['token' => $token, 'channel' => $channels[$user_id]['id']]);
        }
    } else {
        $channels = sb_slack_get_channels();
        if ($channels) {
            $slack_departments = sb_get_setting('slack-departments', []);
            $exclude = [];
            set_time_limit(3000);
            for ($i = 0; $i < count($slack_departments); $i++) {
                array_push($exclude, $slack_departments[$i]['slack-departments-channel']);
            }
            for ($i = 0; $i < count($channels); $i++) {
                if (!in_array($channels[$i]['id'], $exclude)) {
                    sb_curl('https://slack.com/api/conversations.archive', ['token' => $token, 'channel' => $channels[$i]['id']]);
                }
            }
            return true;
        }
    }
    return false;
}

function sb_slack_get_channels($code = false) {
    $channels = sb_isset(sb_curl('https://slack.com/api/conversations.list', ['token' => sb_get_setting('slack-token'), 'exclude_archived' => true, 'limit' => 999]), 'channels');
    if ($code) {
        $code = '<table class="sb-table"><thead><tr><th>Name</th><th data-field="first_name">ID</th></tr></thead><tbody>';
        for ($i = 0; $i < count($channels); $i++) {
            $code .= '<tr><td>' . $channels[$i]['name'] . '</td><td>' . $channels[$i]['id'] . '</td></tr>';
        }
        return $code . '</tbody></table>';
    }
    return $channels;
}

/*
 * -----------------------------------------------------------
 * USERS
 * -----------------------------------------------------------
 *
 * 1. Return the Slack users ID and name
 * 2. Return all slack members
 *
 */

function sb_slack_users() {
    $token = sb_get_setting('slack-token');
    $users = ['slack_users' => [], 'agents' => [], 'saved' => sb_get_setting('slack-agents')];
    if ($token) {
        $slack_users = sb_slack_get_users($token);
        for ($i = 0; $i < count($slack_users); $i++) {
            array_push($users['slack_users'], $slack_users[$i]);
        }
        $agents = sb_db_get('SELECT id, first_name, last_name FROM sb_users WHERE user_type = "agent" OR user_type = "admin"', false);
        for ($i = 0; $i < count($agents); $i++) {
            array_push($users['agents'], ['id' => $agents[$i]['id'], 'name' => sb_get_user_name($agents[$i])]);
        }
        return $users;
    } else {
        return new SBValidationError('slack-token-not-found');
    }
}

function sb_slack_get_users($token = false) {
    $response = sb_curl('https://slack.com/api/users.list', ['token' => $token === false ? sb_get_setting('slack-token') : $token]);
    $users = [];
    if ($response['members']) {
        for ($i = 0; $i < count($response['members']); $i++) {
            $id = $response['members'][$i]['id'];
            $name = sb_isset($response['members'][$i], 'real_name');
            if (!empty($name) && $name != 'Slackbot' && $name != 'Support Board') {
                array_push($users, ['id' => $id, 'name' => $name]);
            }
        }
    }
    return $users;
}

function sb_slack_invite($token, $channel_id, $agent_id = false, $department_id = false) {
    if (!sb_get_setting('slack-disable-invitation')) {
        $exclude_agents = [];
        $include_agent = false;
        if ($agent_id) {
            $agents_linking = sb_get_setting('slack-agents');
            foreach ($agents_linking as $key => $id) {
                if ($id == $agent_id) {
                    $include_agent = $key;
                }
            }
        } else if ($department_id) {
            $agents_linking = sb_get_setting('slack-agents');
            $agents = array_column(sb_db_get('SELECT id FROM sb_users WHERE (user_type = "agent" OR user_type = "admin") AND (department IS NULL OR department = "" OR department = ' . sb_db_escape($department_id) . ')', false), 'id');
            foreach ($agents_linking as $key => $id) {
                if (!in_array($id, $agents)) {
                    array_push($exclude_agents, $key);
                }
            }
        }
        $slack_users = sb_slack_get_users($token);
        $slack_users_string = '';
        for ($i = 0; $i < count($slack_users); $i++) {
            $id = $slack_users[$i]['id'];
            if (($include_agent && $include_agent == $id) || (!$include_agent && !in_array($id, $exclude_agents))) {
                $slack_users_string .= $id . ',';
            }
        }
        return sb_curl('https://slack.com/api/conversations.invite', ['token' => $token, 'channel' => $channel_id, 'users' => substr($slack_users_string, 0, -1)]);
    }
    return false;
}

/*
 * -----------------------------------------------------------
 * SLACK PRESENCE
 * -----------------------------------------------------------
 *
 * Check if a Slack agent is online, or if at least one agent is online, or returns all the online users
 *
 */

function sb_slack_presence($agent_id = false, $list = false) {
    $online_users = [];
    $token = sb_get_setting('slack-token');
    if (!empty($token)) {
        $slack_agents = sb_get_setting('slack-agents');
        if ($agent_id === false && !$list) {
            $slack_users = sb_slack_get_users();
            $slack_agents = [];
            for ($i = 0; $i < count($slack_users); $i++) {
                $slack_agents[$slack_users[$i]['id']] = false;
            }
        }
        if ($slack_agents != false && !is_string($slack_agents)) {
            foreach ($slack_agents as $slack_id => $id) {
                if ($id == $agent_id || ($list && !empty($id))) {
                    $response = json_decode(sb_download('https://slack.com/api/users.getPresence?token=' . $token . '&user=' . $slack_id), true);
                    $response = (isset($response['ok']) && sb_isset($response, 'presence') == 'active') || sb_isset($response, 'online');
                    if ($list) {
                        if ($response) {
                            array_push($online_users, $id);
                        }
                    } else if ($agent_id !== false || $response) {
                        return $response ? 'online' : 'offline';
                    }
                }
            }
        }
    }
    return $list ? $online_users : 'offline';
}

function sb_slack_response_message_text($message) {

    // Links
    $links = [];
    if (preg_match_all('/<https(\s*?.*?)*?\>/', $message, $links)) {
        for ($i = 0; $i < count($links); $i++){
            $link = $links[$i][0];
            if (substr($link, 0, 5) == '<http') {
                $link = ' ' . substr($link, 1, strpos($link, '|') - 1) . ' ';
                $message = str_replace($links[$i][0], $link, $message);
            }
        }
    }

    // Formatting
    $message = preg_replace('/\<([^\<>]+)\>/', ' $1', $message);
    if (strpos($message, '`') === false) {
        $message = str_replace('_', '__', $message);
    }

    return $message;
}

function sb_slack_response_message_attachments($slack_files) {
    $attachments = [];
    $token = sb_get_setting('slack-token');
    for ($i = 0; $i < count($slack_files); $i++) {
        array_push($attachments, [$slack_files[$i]['name'], sb_curl($slack_files[$i]['url_private'], '', ['Authorization: Bearer ' . $token], 'FILE')]);
    }
    return $attachments;
}

/*
 * -----------------------------------------------------------
 * SLACK.PHP
 * -----------------------------------------------------------
 *
 * 1. Get the user id of the slack message
 * 2. Get the agent id
 * 3. Get the last message sent by the user
 *
 */

function sb_slack_api_user_id($channel_id) {
    $user_id = false;
    $channels = sb_get_external_setting('slack-channels');
    foreach ($channels as $key => $channel) {
        if ($channel['id'] == $channel_id) {
            $user_id = $key;
            break;
        }
    }
    return $user_id;
}

function sb_slack_api_agent_id($user) {
    $slack_agents = sb_get_setting('slack-agents');
    if (isset($slack_agents[$user])) {
        return $slack_agents[$user];
    } else {
        return sb_db_get('SELECT id FROM sb_users WHERE user_type = "admin" LIMIT 1')['id'];
    }
}

function sb_slack_last_user_message($user_id) {
    $last_message = sb_db_get('SELECT conversation_id, creation_time FROM sb_messages WHERE user_id = ' . sb_db_escape($user_id, true) . ' ORDER BY creation_time DESC LIMIT 1');
    return [ 'conversation_id' => (isset($last_message['conversation_id']) ? $last_message['conversation_id'] : -1), 'message_time' => (isset($last_message['creation_time']) ? $last_message['creation_time'] : '')];
}

?>