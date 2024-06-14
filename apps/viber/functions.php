<?php

/*
 * ==========================================================
 * VIBER APP
 * ==========================================================
 *
 * Viber app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to Viber
 * 2. Convert Support Board rich messages to Viber rich messages
 * 3. Synchronize Viber with Support Board
 * 4. Viber curl
 *
 */

define('SB_VIBER', '1.0.0');

function sb_viber_send_message($viber_id, $message = '', $attachments = []) {
    if (empty($message) && empty($attachments)) return false;
    $response = ['status_message' => 'ok'];
    $user_id = defined('SB_DIALOGFLOW') ? sb_get_user_by('viber-id', $viber_id)['id'] : false;

    // Send the message
    $query = ['receiver' => $viber_id, 'sender' => ['name' => sb_get_user_name(), 'avatar' => sb_get_active_user()['profile_image']]];
    $message = sb_viber_rich_messages($message, ['user_id' => $user_id]);
    $attachments = array_merge($attachments, $message[1]);
    if ($message[0] || $message[2]){
        $query = array_merge($query, $message[2]);
        $response = sb_viber_curl('send_message', $message[0] ? array_merge($query, ['text' => $message[0], 'type' => 'text']) : $query);
    }

    // Attachments
    $responses = [];
    for ($i = 0; $i < count($attachments); $i++) {
        $url = $attachments[$i][1];
        $extension = substr($url, strripos($url, '.') + 1);
        switch ($extension) {
            case 'gif':
            case 'jpg':
            case 'jpeg':
            case 'png':
                array_push($responses, sb_viber_curl('send_message', array_merge($query, ['media' => $url, 'type' => 'picture', 'text' => ''])));
                break;
            default:
                $name = basename($url);
                $path = sb_upload_path(false, true) . '/' . $name;
                $query_2 = ['media' => $url, 'type' => 'video', 'size' => filesize($path)];
                if ($extension != 'mp4') {
                    $query_2['type'] = 'file';
                    $query_2['file_name'] = $name;
                }
                array_push($responses, sb_viber_curl('send_message', array_merge($query, file_exists($path) ? $query_2 : ['text' => $url, 'type' => 'text'])));
        }
    }
    $response['attachments'] = $responses;

    return $response;
}

function sb_viber_rich_messages($message, $extra = false) {
    $viber_payload = [];
    $shortcode = sb_get_shortcode($message);
    $attachments = [];
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ? ' *' . sb_($shortcode['title']) . '*' : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'slider-images':
            case 'slider':
            case 'card':
                $buttons = [];
                if ($shortcode_name == 'slider-images') {
                    $images = explode(',', $shortcode['images']);
                    for ($i = 0; $i < count($images); $i++) {
                        array_push($buttons, ['Columns' => 6, 'Rows' => 5, 'ActionType' => 'reply', 'ActionBody' => '', 'Image' => $images[$i]]);
                    }
                } else {
                    $index = $shortcode_name == 'slider' ? 1 : 0;
                    while (isset($shortcode['image' . ($index ? '-' . $index : '')])) {
                        $suffix = $index ? '-' . $index : '';
                        $link = sb_isset($shortcode, 'link' . $suffix);
                        array_push($buttons, ['Columns' => 6, 'Rows' => 3, 'ActionType' => $link ? 'open-url' : 'reply', 'ActionBody' => $link, 'Image' => $shortcode['image' . $suffix]]);
                        array_push($buttons, ['Columns' => 6, 'Rows' => 2, 'ActionType' => $link ? 'open-url' : 'reply', 'ActionBody' => $link, 'Text' => '<font><b>' . $shortcode['header' . $suffix] . '</b></font>' . (isset($shortcode['extra'. $suffix]) ? '<br><font color=#7e7e7e><b>' . $shortcode['extra'. $suffix] . '</b></font>' : '') . (isset($shortcode['description'. $suffix]) ? '<br><font color=#7e7e7e>' . $shortcode['description'. $suffix] . '</font>' : ''), 'TextSize'=> 'medium', 'TextVAlign'=> 'bottom', 'TextHAlign'=> 'left']);
                        $index++;
                    }
                }
                $viber_payload = ['min_api_version' => 7, 'type' => 'rich_media','rich_media' => ['Type' => 'rich_media', 'ButtonsGroupColumns' => 6, 'ButtonsGroupRows' => 5, 'BgColor' => '#FFFFFF', 'Buttons' => $buttons]];
                break;
            case 'list-image':
            case 'list':
                $index = 0;
                if ($shortcode_name == 'list-image') {
                    $shortcode['values'] = str_replace('://', '', $shortcode['values']);
                    $index = 1;
                }
                $values = explode(',', $shortcode['values']);
                if (strpos($values[0], ':')) {
                    for ($i = 0; $i < count($values); $i++) {
                        $value = explode(':', $values[$i]);
                        $message .= PHP_EOL . '• *' . trim($value[$index]) . '* ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . '• ' . trim($values[$i]);
                    }
                }
                $message = trim($message);
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                $buttons = [];
                for ($i = 0; $i < count($values); $i++) {
                    array_push($buttons, ['ActionType' => 'reply', 'ActionBody' => $values[$i], 'Text' => $values[$i], 'TextSize' => 'regular', 'Columns' => 3, 'Rows' => 1]);
                }
                $viber_payload = ['min_api_versison' => 7, 'keyboard' => ['BgColor' => '#DBDBDB', 'DefaultHeight' => false, 'Type' => 'keyboard', 'Buttons' => $buttons]];
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'share':
            case 'button':
                $message .= ($message ? PHP_EOL  : '') . $shortcode['link'];
                break;
            case 'video':
                $message .= ($message ? PHP_EOL  : '') . ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                break;
            case 'image':
                $attachments = [[$shortcode['url'], $shortcode['url']]];
                break;
            case 'rating':
                if (defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'articles':
                if (isset($shortcode['link'])) $message = $shortcode['link'];
                break;
        }
    }
    return [$message, $attachments, $viber_payload];
}

function sb_viber_synchronization($token, $cloud = '') {
    return sb_viber_curl('set_webhook', ['url' => SB_URL . '/apps/viber/post.php' . str_replace(['&', '='], ['%3F', '%3D'], $cloud), 'send_name' => true, 'send_photo' => true], $token);
}

function sb_viber_curl($url_part, $query, $token = false) {
    return sb_curl('https://chatapi.viber.com/pa/' . $url_part, json_encode($query), ['X-Viber-Auth-Token: ' . ($token ? $token : sb_get_multi_setting('viber', 'viber-token'))]);
}
?>